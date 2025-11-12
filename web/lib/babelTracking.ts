import { cookies } from 'next/headers';

/**
 * Check if user has seen the Babel Moment for a specific epoch
 */
export async function hasSeenBabelMoment(epochId: number): Promise<boolean> {
  const cookieStore = await cookies();
  const seenEpochs = cookieStore.get('seen_babel_epochs');
  
  if (!seenEpochs) {
    return false;
  }

  try {
    const seenIds = JSON.parse(seenEpochs.value);
    return seenIds.includes(epochId);
  } catch {
    return false;
  }
}

/**
 * Mark an epoch's Babel Moment as seen
 */
export async function markBabelMomentAsSeen(epochId: number): Promise<void> {
  const cookieStore = await cookies();
  const seenEpochs = cookieStore.get('seen_babel_epochs');
  
  let seenIds: number[] = [];
  
  if (seenEpochs) {
    try {
      seenIds = JSON.parse(seenEpochs.value);
    } catch {
      seenIds = [];
    }
  }

  if (!seenIds.includes(epochId)) {
    seenIds.push(epochId);
  }

  // Keep only last 10 epochs to avoid cookie size issues
  if (seenIds.length > 10) {
    seenIds = seenIds.slice(-10);
  }

  cookieStore.set('seen_babel_epochs', JSON.stringify(seenIds), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

/**
 * Check if there's a completed epoch that user hasn't seen yet
 */
export async function getUnseenCompletedEpoch() {
  const { supabase } = await import('@/lib/supabase');
  
  // Get the most recently completed epoch
  const { data: completedEpoch } = await supabase
    .from('epochs')
    .select('*')
    .eq('is_active', false)
    .order('closed_at', { ascending: false })
    .limit(1)
    .single();

  if (!completedEpoch) {
    return null;
  }

  // Check if user has seen it
  const hasSeen = await hasSeenBabelMoment(completedEpoch.id);

  if (hasSeen) {
    return null;
  }

  return completedEpoch;
}
