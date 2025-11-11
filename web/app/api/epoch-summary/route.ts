import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get the most recently closed epoch
    const { data: closedEpoch, error: epochError } = await supabase
      .from('epochs')
      .select('*')
      .eq('is_active', false)
      .order('closed_at', { ascending: false })
      .limit(1)
      .single();

    if (epochError || !closedEpoch) {
      return NextResponse.json(
        { error: 'No closed epoch found' },
        { status: 404 }
      );
    }

    // Return the stored stats
    return NextResponse.json(closedEpoch.stats || {
      totalMessages: 0,
      uniqueMessages: 0,
      topWords: [],
      emotions: {
        melancholy: 0,
        neutral: 0,
        hope: 0,
        nihilism: 0,
        joy: 0,
      },
      manifesto: 'No data available.',
      layerDistribution: {},
    });

  } catch (error) {
    console.error('Error getting epoch summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
