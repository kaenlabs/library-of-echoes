import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { headers } from 'next/headers';
import { LAYER_CONFIG } from '@/lib/layers';

/**
 * Manual Epoch Closure
 * Admin submits ChatGPT-generated manifesto JSON
 * Closes current epoch and starts new one
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication and admin status
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    const { data: isAdminData } = await supabase.rpc('is_admin', { p_user_id: user.id });
    if (!isAdminData) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { epochId, manifestoData } = body;

    if (!epochId || !manifestoData) {
      return NextResponse.json({ error: 'Missing epochId or manifestoData' }, { status: 400 });
    }

    // Validate manifesto data
    const required = ['shortSummary', 'detailedManifesto', 'emotionalTone', 'keyThemes'];
    const missing = required.filter(field => !manifestoData[field]);
    
    if (missing.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missing.join(', ')}` 
      }, { status: 400 });
    }

    // Get the epoch to close
    const { data: targetEpoch, error: epochError } = await supabase
      .from('epochs')
      .select('*')
      .eq('id', epochId)
      .eq('is_active', true)
      .single();

    if (epochError || !targetEpoch) {
      return NextResponse.json({ 
        error: 'Epoch not found or already closed' 
      }, { status: 404 });
    }

    // Calculate final stats
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', targetEpoch.id);

    const { data: allMessages } = await supabase
      .from('messages')
      .select('normalized_text')
      .eq('epoch_id', targetEpoch.id);

    const uniqueSet = new Set(allMessages?.map((m) => m.normalized_text) || []);
    
    let finalLayer = 1;
    for (const layer of LAYER_CONFIG) {
      if ((totalMessages || 0) >= layer.min) {
        finalLayer = layer.index;
      }
    }
    const layerInfo = LAYER_CONFIG.find((l) => l.index === finalLayer);

    const startDate = new Date(targetEpoch.created_at);
    const endDate = new Date();
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const stats = {
      totalMessages: totalMessages || 0,
      uniqueMessages: uniqueSet.size,
      finalLayer,
      layerName: layerInfo?.name || 'Unknown',
      duration,
      manifestoData, // Store the manual manifesto
      manuallyCreated: true,
      createdBy: user.email,
      createdAt: new Date().toISOString(),
    };

    // Close the epoch with manual manifesto
    const { error: closeError } = await supabase
      .from('epochs')
      .update({
        is_active: false,
        closed_at: endDate.toISOString(),
        stats,
      })
      .eq('id', targetEpoch.id);

    if (closeError) {
      return NextResponse.json({ 
        error: 'Failed to close epoch: ' + closeError.message 
      }, { status: 500 });
    }

    // Create new epoch
    const newEpochNumber = targetEpoch.id + 1;
    const { data: newEpoch, error: createError } = await supabase
      .from('epochs')
      .insert({
        name: `Age ${newEpochNumber}`,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ 
        error: 'Failed to create new epoch: ' + createError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      closedEpoch: {
        id: targetEpoch.id,
        name: targetEpoch.name,
        stats,
      },
      newEpoch: {
        id: newEpoch.id,
        name: newEpoch.name,
      },
      message: `${targetEpoch.name} successfully closed with manual manifesto. ${newEpoch.name} has begun.`,
    });
  } catch (error: any) {
    console.error('Manual epoch closure error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}
