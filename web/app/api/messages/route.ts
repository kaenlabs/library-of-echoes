import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { normalizeMessage, validateMessage, getCurrentLayer, getRoomIndex } from '@/lib/layers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    // Validate message
    const validation = validateMessage(text);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
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
    const roomIndex = getRoomIndex(messagesInLayer);

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

    // Insert message
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        epoch_id: activeEpoch.id,
        layer_index: layerIndex,
        room_index: roomIndex,
        text: text.trim(),
        normalized_text: normalizedText,
      });

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to insert message' },
        { status: 500 }
      );
    }

    // Return response
    return NextResponse.json({
      epoch: activeEpoch.name,
      layer: layerIndex,
      room: roomIndex,
      exactCount: (exactCount || 0) + 1, // Include the message we just inserted
    });

  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
