import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentLayer, BABEL_THRESHOLD } from '@/lib/layers';

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

    // Count total messages
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
    const babelMoment = messageCount >= BABEL_THRESHOLD;

    return NextResponse.json({
      epoch: activeEpoch.name,
      layer: currentLayer,
      totalMessages: messageCount,
      babelMoment,
    });

  } catch (error) {
    console.error('Error getting state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
