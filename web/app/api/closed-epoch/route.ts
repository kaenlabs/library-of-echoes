import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Get a closed epoch's manifesto
 * Query params:
 * - epochId: Get specific epoch by ID
 * - If no params: Get most recently closed epoch
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const epochId = searchParams.get('epochId');

    let closedEpoch;
    let error;

    if (epochId) {
      // Get specific epoch by ID
      const result = await supabase
        .from('epochs')
        .select('*')
        .eq('id', parseInt(epochId))
        .eq('is_active', false)
        .single();
      
      closedEpoch = result.data;
      error = result.error;
    } else {
      // Get most recently closed epoch
      const result = await supabase
        .from('epochs')
        .select('*')
        .eq('is_active', false)
        .order('closed_at', { ascending: false })
        .limit(1)
        .single();
      
      closedEpoch = result.data;
      error = result.error;
    }

    if (error || !closedEpoch) {
      return NextResponse.json(
        { error: 'No closed epoch found' },
        { status: 404 }
      );
    }

    // Extract manifesto data from stats
    const stats = closedEpoch.stats || {};
    const manifestoData = stats.manifestoData || {};

    // Calculate totals
    const totalMessages = stats.totalMessages || 0;
    const uniqueMessages = stats.uniqueMessages || 0;
    const echoCount = totalMessages - uniqueMessages;

    // Get duration
    const startDate = new Date(closedEpoch.created_at);
    const endDate = closedEpoch.closed_at ? new Date(closedEpoch.closed_at) : new Date();
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      epochId: closedEpoch.id,
      epochName: closedEpoch.name,
      closedAt: closedEpoch.closed_at,
      duration,
      totalMessages,
      uniqueMessages,
      echoCount,
      finalLayer: stats.finalLayer || 1,
      layerName: stats.layerName || 'Unknown',
      
      // Manifesto data from ChatGPT
      manifesto: {
        shortSummary: manifestoData.shortSummary || 'Çağ kapandı.',
        detailedManifesto: manifestoData.detailedManifesto || 'Manifesto bulunamadı.',
        emotionalTone: manifestoData.emotionalTone || 'nötr',
        keyThemes: manifestoData.keyThemes || [],
        metaphor: manifestoData.metaphor || '',
        closingVerse: manifestoData.closingVerse || '',
        historicalSignificance: manifestoData.historicalSignificance || '',
      },
      
      // Top words and sentences from stats
      topWords: stats.topWords || [],
      topSentences: stats.topSentences || [],
      
      // Layer transitions
      layerTransitions: stats.layerTransitions || [],
    });
  } catch (error) {
    console.error('Error fetching closed epoch manifesto:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
