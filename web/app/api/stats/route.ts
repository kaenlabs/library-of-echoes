import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentLayer, LAYER_CONFIG, BABEL_THRESHOLD } from '@/lib/layers';

export async function GET() {
  try {
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

    // Get total message count
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
    const currentLayer = getCurrentLayer(messageCount);
    const layerConfig = LAYER_CONFIG.find(l => l.index === currentLayer);

    // Count unique messages (normalized)
    const { data: uniqueMessages, error: uniqueError } = await supabase
      .from('messages')
      .select('normalized_text')
      .eq('epoch_id', activeEpoch.id);

    if (uniqueError) {
      return NextResponse.json(
        { error: 'Failed to fetch unique messages' },
        { status: 500 }
      );
    }

    const uniqueSet = new Set(uniqueMessages?.map(m => m.normalized_text) || []);
    const uniqueCount = uniqueSet.size;

    // Calculate progress for current layer
    const layerMin = layerConfig?.min || 0;
    const layerMax = layerConfig?.max || 100;
    const layerRange = layerMax - layerMin;
    const layerProgress = Math.min(100, Math.max(0, 
      ((messageCount - layerMin) / layerRange) * 100
    ));

    // Calculate messages in current layer
    const { count: layerMessageCount, error: layerCountError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', activeEpoch.id)
      .eq('layer_index', currentLayer);

    if (layerCountError) {
      return NextResponse.json(
        { error: 'Failed to count layer messages' },
        { status: 500 }
      );
    }

    const messagesInLayer = layerMessageCount || 0;

    // Calculate active rooms (rooms that have messages)
    const { data: activeRooms, error: roomError } = await supabase
      .from('messages')
      .select('room_index')
      .eq('epoch_id', activeEpoch.id)
      .eq('layer_index', currentLayer);

    if (roomError) {
      return NextResponse.json(
        { error: 'Failed to fetch rooms' },
        { status: 500 }
      );
    }

    const activeRoomSet = new Set(activeRooms?.map(r => r.room_index) || []);
    const activeRoomCount = activeRoomSet.size;
    const totalRoomsInLayer = layerConfig?.rooms || 10;

    // Calculate echo rate (how many messages are duplicates)
    const echoRate = messageCount > 0 
      ? parseFloat(((messageCount - uniqueCount) / messageCount * 100).toFixed(1))
      : 0;

    // Get epoch start time
    const epochAge = Math.floor(
      (Date.now() - new Date(activeEpoch.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      epoch: {
        name: activeEpoch.name,
        age: epochAge,
        isActive: activeEpoch.is_active,
      },
      currentLayer: {
        index: currentLayer,
        name: layerConfig?.name || 'Unknown',
        roman: layerConfig?.roman || 'I',
        progress: Math.round(layerProgress),
        messagesInLayer,
        activeRooms: activeRoomCount,
        totalRooms: totalRoomsInLayer,
      },
      messages: {
        total: messageCount,
        unique: uniqueCount,
        echoes: messageCount - uniqueCount,
        echoRate: echoRate,
      },
      progress: {
        current: messageCount,
        nextLayer: layerMax,
        babel: BABEL_THRESHOLD,
        toNextLayer: Math.max(0, layerMax - messageCount),
        toBabel: Math.max(0, BABEL_THRESHOLD - messageCount),
      },
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
