import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { normalizeMessage, validateMessage, getCurrentLayer, getRoomIndex } from '@/lib/layers';
import { getOrCreateSession } from '@/lib/session';
import { checkRateLimitDB, checkSpamAttempt, incrementRateLimitDB } from '@/lib/rateLimitDB';
import { getClientIp, hashIp } from '@/lib/ipUtils';
import { checkSpamContent } from '@/lib/contentModeration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    
    // Get client IP for spam detection
    const clientIp = getClientIp(request);
    const ipHash = hashIp(clientIp);
    
    // Check for spam attempts (IP-based)
    const spamCheck = checkSpamAttempt(ipHash);
    if (!spamCheck.allowed) {
      const minutesLeft = spamCheck.blockedUntil 
        ? Math.ceil((spamCheck.blockedUntil - Date.now()) / 60000)
        : 60;
      
      console.warn(`🚨 Blocked spam attempt from IP: ${ipHash}`);
      
      return NextResponse.json(
        { 
          error: `Çok fazla istek gönderildi. ${minutesLeft} dakika bekleyin.`,
          blocked: true
        },
        { status: 429 }
      );
    }
    
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Check if user is authenticated using the token
    let user = null;
    if (token) {
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }
    
    const isAuthenticated = !!user;
    
    console.log('Auth check:', { isAuthenticated, userEmail: user?.email, hasToken: !!token, ipHash });
    
    // Get identifier for rate limiting
    // Use IP hash for anonymous users (more strict), user ID for authenticated
    const sessionId = await getOrCreateSession();
    const identifier = isAuthenticated ? user!.id : ipHash;
    const userId = user?.id;
    
    // Check rate limit (Database-backed)
    const rateCheck = await checkRateLimitDB(identifier, isAuthenticated, userId);
    
    if (!rateCheck.allowed) {
      const hours = Math.ceil((rateCheck.resetIn || 0) / 3600000);
      const errorMessage = isAuthenticated
        ? `Günlük mesaj limitiniz doldu (5/5). ${hours} saat sonra tekrar deneyin.`
        : `Anonim kullanıcılar günde sadece 1 mesaj gönderebilir. ${hours} saat sonra tekrar deneyin veya üye olun.`;
      
      return NextResponse.json(
        { 
          error: errorMessage,
          requiresAuth: !isAuthenticated 
        },
        { status: 429 }
      );
    }

    // Validate message format
    const validation = validateMessage(text);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Content moderation - spam/abuse detection
    const contentCheck = checkSpamContent(text);
    if (!contentCheck.valid) {
      console.warn(`❌ Content rejected from ${ipHash}: ${contentCheck.reason}`);
      return NextResponse.json(
        { error: `İçerik uygun değil: ${contentCheck.reason}` },
        { status: 400 }
      );
    }

    // Get active epoch
    const { data: activeEpoch, error: epochError } = await supabase
      .from('epochs')
      .select('*')
      .eq('is_active', true)
      .single();

    if (epochError || !activeEpoch) {
      return NextResponse.json(
        { error: 'No active epoch found' },
        { status: 500 }
      );
    }

    // Count total messages in this epoch
    const { count: totalMessages, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', activeEpoch.id);

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count messages' },
        { status: 500 }
      );
    }

    const messageCount = totalMessages || 0;

    // Determine layer and room
    const layerIndex = getCurrentLayer(messageCount);

    // Count messages in this layer
    const { count: layerMessageCount, error: layerCountError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', activeEpoch.id)
      .eq('layer_index', layerIndex);

    if (layerCountError) {
      return NextResponse.json(
        { error: 'Failed to count layer messages' },
        { status: 500 }
      );
    }

    const messagesInLayer = layerMessageCount || 0;
    const roomIndex = getRoomIndex(messagesInLayer, layerIndex);

    // Normalize message for duplicate detection
    const normalizedText = normalizeMessage(text);

    // Check for exact duplicates
    const { count: exactCount, error: duplicateError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', activeEpoch.id)
      .eq('normalized_text', normalizedText);

    if (duplicateError) {
      return NextResponse.json(
        { error: 'Failed to check duplicates' },
        { status: 500 }
      );
    }

    // Insert message (remove any line breaks just in case)
    const cleanText = text.trim().replace(/[\r\n]+/g, ' ');
    
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        epoch_id: activeEpoch.id,
        layer_index: layerIndex,
        room_index: roomIndex,
        text: cleanText,
        normalized_text: normalizedText,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: `Failed to insert message: ${insertError.message}` },
        { status: 500 }
      );
    }

    // ✅ Message successfully inserted - NOW increment rate limit
    await incrementRateLimitDB(identifier, isAuthenticated, userId);
    
    // Calculate remaining messages
    const { getRemainingMessagesDB } = await import('@/lib/rateLimitDB');
    const remaining = await getRemainingMessagesDB(identifier, isAuthenticated, userId);
    
    console.log(`✅ Message accepted from ${isAuthenticated ? 'authenticated user' : 'anonymous'}: ${identifier}, remaining: ${remaining}`);

    // Return response
    return NextResponse.json({
      epoch: activeEpoch.name,
      layer: layerIndex,
      room: roomIndex,
      exactCount: (exactCount || 0) + 1, // Include the message we just inserted
      remainingMessages: remaining,
    });

  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
