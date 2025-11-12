import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * TEST ENDPOINT - Reset to a specific epoch for testing
 * Only works in test mode
 */
export async function POST(request: Request) {
  // Check if test mode is enabled
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') {
    return NextResponse.json(
      { error: 'Test mode is not enabled' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { targetEpochId } = body;

    const supabase = await createClient();

    // If no target specified, reset to epoch 1
    const resetToId = targetEpochId || 1;

    // Get target epoch
    const { data: targetEpoch, error: epochError } = await supabase
      .from('epochs')
      .select('*')
      .eq('id', resetToId)
      .single();

    if (epochError || !targetEpoch) {
      return NextResponse.json(
        { error: `Epoch ${resetToId} not found` },
        { status: 404 }
      );
    }

    // Delete all epochs after target
    const { error: deleteEpochsError } = await supabase
      .from('epochs')
      .delete()
      .gt('id', resetToId);

    if (deleteEpochsError) {
      console.error('Failed to delete future epochs:', deleteEpochsError);
    }

    // Delete ALL messages from target epoch and future epochs (hard reset)
    const { error: deleteMessagesError } = await supabase
      .from('messages')
      .delete()
      .gte('epoch_id', resetToId);

    if (deleteMessagesError) {
      console.error('Failed to delete messages:', deleteMessagesError);
    }

    // Reactivate target epoch
    const { error: updateError } = await supabase
      .from('epochs')
      .update({
        is_active: true,
        closed_at: null,
        stats: null,
      })
      .eq('id', resetToId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to reactivate epoch' },
        { status: 500 }
      );
    }

    // Count remaining messages
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', resetToId);

    return NextResponse.json({
      success: true,
      message: `✅ Reset to ${targetEpoch.name}`,
      epoch: {
        id: targetEpoch.id,
        name: targetEpoch.name,
        messages: messageCount || 0,
      },
      note: 'Refresh the page to see changes',
    });
  } catch (error) {
    console.error('Error resetting epoch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get available epochs
 */
export async function GET() {
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') {
    return NextResponse.json(
      { error: 'Test mode is not enabled' },
      { status: 403 }
    );
  }

  const supabase = await createClient();

  const { data: epochs } = await supabase
    .from('epochs')
    .select('id, name, is_active, created_at, closed_at')
    .order('id', { ascending: true });

  return NextResponse.json({
    epochs: epochs || [],
    instructions: 'POST with { "targetEpochId": 1 } to reset to that epoch',
  });
}
