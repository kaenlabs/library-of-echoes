import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { LAYER_CONFIG } from '@/lib/layers';

/**
 * Get message map - all epochs with their rooms and layers
 * Shows visual representation of where messages are stored
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get all epochs
    const { data: epochs, error: epochsError } = await supabase
      .from('epochs')
      .select('*')
      .order('id', { ascending: true });

    if (epochsError) {
      return NextResponse.json(
        { error: 'Failed to fetch epochs' },
        { status: 500 }
      );
    }

    // For each epoch, get room data from messages table
    const epochsWithRooms = await Promise.all(
      epochs.map(async (epoch) => {
        // Get total message count for this epoch
        const { count: totalMessagesInEpoch } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('epoch_id', epoch.id);

        // Get all unique room_index + layer_index combinations from messages
        const { data: messageRooms, error: messagesError } = await supabase
          .from('messages')
          .select('layer_index, room_index, created_at')
          .eq('epoch_id', epoch.id)
          .order('created_at', { ascending: true });

        if (messagesError || !messageRooms || messageRooms.length === 0) {
          return {
            epochId: epoch.id,
            epochName: epoch.name,
            isActive: epoch.is_active,
            totalMessages: totalMessagesInEpoch || 0,
            totalRooms: 0,
            createdAt: epoch.created_at,
            closedAt: epoch.closed_at,
            rooms: [],
          };
        }

        // Group messages by room (layer_index + room_index)
        const roomMap = new Map<string, {
          layerIndex: number;
          roomIndex: number;
          messages: typeof messageRooms;
        }>();

        messageRooms.forEach(msg => {
          const key = `${msg.layer_index}-${msg.room_index}`;
          if (!roomMap.has(key)) {
            roomMap.set(key, {
              layerIndex: msg.layer_index,
              roomIndex: msg.room_index,
              messages: [],
            });
          }
          roomMap.get(key)!.messages.push(msg);
        });

        // Convert to array and get details
        const roomsWithData = Array.from(roomMap.values()).map(room => {
          const layerInfo = LAYER_CONFIG.find(l => l.index === room.layerIndex);
          const firstMessage = room.messages[0]?.created_at;
          const lastMessage = room.messages[room.messages.length - 1]?.created_at;

          return {
            roomId: room.roomIndex, // Use room_index as ID
            messageCount: room.messages.length,
            layer: room.layerIndex,
            layerName: layerInfo?.name || 'Unknown',
            firstMessage: firstMessage || epoch.created_at,
            lastMessage: lastMessage || epoch.created_at,
          };
        });

        // Sort by layer and room index
        roomsWithData.sort((a, b) => {
          if (a.layer !== b.layer) return a.layer - b.layer;
          return a.roomId - b.roomId;
        });

        return {
          epochId: epoch.id,
          epochName: epoch.name,
          isActive: epoch.is_active,
          totalMessages: totalMessagesInEpoch || 0,
          totalRooms: roomsWithData.length,
          createdAt: epoch.created_at,
          closedAt: epoch.closed_at,
          rooms: roomsWithData,
        };
      })
    );

    return NextResponse.json({
      epochs: epochsWithRooms,
      totalEpochs: epochs.length,
      totalMessages: epochsWithRooms.reduce((sum, e) => sum + e.totalMessages, 0),
      totalRooms: epochsWithRooms.reduce((sum, e) => sum + e.totalRooms, 0),
    });
  } catch (error) {
    console.error('Error fetching message map:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
