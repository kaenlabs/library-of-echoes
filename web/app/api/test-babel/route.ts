import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { BABEL_THRESHOLD } from '@/lib/layers';

/**
 * TEST ENDPOINT - Force complete current epoch and trigger Babel Moment
 * Only works in test mode
 */
export async function POST() {
  // Check if test mode is enabled
  if (process.env.NEXT_PUBLIC_TEST_MODE !== 'true') {
    return NextResponse.json(
      { error: 'Test mode is not enabled' },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();

    // Get active epoch
    const { data: activeEpoch, error: epochError } = await supabase
      .from('epochs')
      .select('*')
      .eq('is_active', true)
      .single();

    if (epochError || !activeEpoch) {
      return NextResponse.json(
        { error: 'No active epoch found' },
        { status: 404 }
      );
    }

    // Get total messages
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', activeEpoch.id);

    const messageCount = totalMessages || 0;

    // Check if we can force close
    if (messageCount < 5) {
      return NextResponse.json({
        error: 'At least 5 messages required to test Babel Moment',
        currentMessages: messageCount,
        threshold: BABEL_THRESHOLD,
      }, { status: 400 });
    }

    // Calculate full stats (import the calculation logic from babel-moment)
    console.log(`🔄 Calculating Babel Moment stats for ${activeEpoch.name}...`);
    
    // Trigger babel-moment calculation (it will cache the result)
    const babelResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/babel-moment`);
    const babelData = await babelResponse.json();
    
    if (!babelData.reached) {
      return NextResponse.json(
        { error: 'Failed to generate Babel Moment data' },
        { status: 500 }
      );
    }

    // Prepare stats for database (exclude epochName/epochId as they're redundant)
    const { epochName, epochId, ...statsToSave } = babelData;
    
    console.log(`✅ Babel Moment stats calculated, saving to database...`);

    // Close current epoch WITH full Babel Moment data
    const { error: closeError } = await supabase
      .from('epochs')
      .update({
        is_active: false,
        closed_at: new Date().toISOString(),
        stats: statsToSave, // Save full Babel Moment data
      })
      .eq('id', activeEpoch.id);

    if (closeError) {
      return NextResponse.json(
        { error: 'Failed to close epoch' },
        { status: 500 }
      );
    }

    // Create new epoch
    const newEpochNumber = activeEpoch.id + 1;
    const { data: newEpoch, error: createError } = await supabase
      .from('epochs')
      .insert({
        name: `Age ${newEpochNumber}`,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to create new epoch' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '✅ Epoch manually closed for testing',
      closedEpoch: {
        id: activeEpoch.id,
        name: activeEpoch.name,
        messages: messageCount,
      },
      newEpoch: {
        id: newEpoch.id,
        name: newEpoch.name,
      },
      note: 'Refresh the homepage to see Babel Moment animation',
    });
  } catch (error) {
    console.error('Error forcing epoch closure:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get test mode status
 */
export async function GET() {
  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true';
  
  if (!isTestMode) {
    return NextResponse.json({
      testMode: false,
      message: 'Test mode is disabled',
    });
  }

  const supabase = await createClient();

  const { data: activeEpoch } = await supabase
    .from('epochs')
    .select('*')
    .eq('is_active', true)
    .single();

  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('epoch_id', activeEpoch?.id || 0);

  return NextResponse.json({
    testMode: true,
    threshold: BABEL_THRESHOLD,
    currentEpoch: activeEpoch?.name || 'None',
    currentMessages: totalMessages || 0,
    canForceClose: (totalMessages || 0) >= 5,
    instructions: {
      1: 'Send at least 5 messages',
      2: 'POST to /api/test-babel to force close epoch',
      3: 'Refresh homepage to see Babel Moment',
    }
  });
}
