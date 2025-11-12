import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { LAYER_CONFIG } from '@/lib/layers';

export async function GET() {
  try {
    // Fetch all epochs ordered by creation date (newest first)
    const { data: epochs, error } = await supabase
      .from('epochs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch epochs' },
        { status: 500 }
      );
    }

    // Enrich each epoch with statistics
    const enrichedEpochs = await Promise.all(
      (epochs || []).map(async (epoch) => {
        // If epoch is active, calculate live stats
        if (epoch.is_active) {
          const { count: totalMessages } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('epoch_id', epoch.id);

          return {
            id: epoch.id,
            name: epoch.name,
            isActive: epoch.is_active,
            createdAt: epoch.created_at,
            closedAt: epoch.closed_at,
            stats: null, // Active epochs don't have final stats yet
          };
        }

        // For closed epochs, use stored stats or calculate if missing
        let stats = epoch.stats;

        if (!stats) {
          // Calculate stats if not stored
          const { count: totalMessages } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('epoch_id', epoch.id);

          const { data: uniqueMessages } = await supabase
            .from('messages')
            .select('normalized_text')
            .eq('epoch_id', epoch.id);

          const uniqueSet = new Set(uniqueMessages?.map((m) => m.normalized_text) || []);

          // Find final layer
          let finalLayer = 1;
          for (const layer of LAYER_CONFIG) {
            if ((totalMessages || 0) >= layer.min) {
              finalLayer = layer.index;
            }
          }

          const layerInfo = LAYER_CONFIG.find((l) => l.index === finalLayer);

          // Calculate duration
          const startDate = new Date(epoch.created_at);
          const endDate = epoch.closed_at ? new Date(epoch.closed_at) : new Date();
          const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

          stats = {
            totalMessages: totalMessages || 0,
            uniqueMessages: uniqueSet.size,
            finalLayer,
            layerName: layerInfo?.name || 'Unknown',
            duration,
          };
        }

        // Get layer transitions (stored in epoch.stats.layerTransitions)
        const layerTransitions = epoch.stats?.layerTransitions || [];

        return {
          id: epoch.id,
          name: epoch.name,
          isActive: epoch.is_active,
          createdAt: epoch.created_at,
          closedAt: epoch.closed_at,
          stats,
          layerTransitions, // Add layer transitions data
        };
      })
    );

    return NextResponse.json({
      epochs: enrichedEpochs,
    });
  } catch (error) {
    console.error('Error fetching epochs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
