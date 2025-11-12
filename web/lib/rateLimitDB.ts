import { createClient } from '@/lib/supabase-server';

const DAILY_LIMIT_ANONYMOUS = 1;
const DAILY_LIMIT_AUTHENTICATED = 5;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn?: number;
  limit: number;
}

/**
 * Check if user/IP can send a message (Database-backed)
 */
export async function checkRateLimitDB(
  identifier: string,
  isAuthenticated: boolean,
  userId?: string
): Promise<RateLimitResult> {
  const supabase = await createClient();
  const limit = isAuthenticated ? DAILY_LIMIT_AUTHENTICATED : DAILY_LIMIT_ANONYMOUS;

  try {
    // Check if user is admin (unlimited messages)
    if (userId) {
      const { data: isAdmin } = await supabase
        .rpc('is_admin', { p_user_id: userId });
      
      if (isAdmin) {
        return { allowed: true, remaining: 999999, limit: 999999 };
      }
    }

    // First, reset if needed (24 hours passed)
    await supabase.rpc('reset_rate_limit_if_needed', { p_identifier: identifier });

    // Get current count
    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: limit, limit }; // Fail open
    }

    if (!data) {
      // First time user - create entry
      await supabase.from('rate_limits').insert({
        identifier,
        is_authenticated: isAuthenticated,
        message_count: 0,
      });

      return { allowed: true, remaining: limit, limit };
    }

    // Check if limit exceeded
    const currentCount = data.message_count || 0;
    const remaining = Math.max(0, limit - currentCount);

    if (currentCount >= limit) {
      // Calculate reset time
      const lastReset = new Date(data.last_reset);
      const resetTime = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
      const resetIn = resetTime.getTime() - Date.now();

      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.max(0, resetIn),
        limit,
      };
    }

    return { allowed: true, remaining, limit };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: limit, limit }; // Fail open
  }
}

/**
 * Increment message count after successful message insertion
 */
export async function incrementRateLimitDB(
  identifier: string,
  isAuthenticated: boolean,
  userId?: string
): Promise<void> {
  const supabase = await createClient();

  try {
    // Don't increment for admins
    if (userId) {
      const { data: isAdmin } = await supabase
        .rpc('is_admin', { p_user_id: userId });
      
      if (isAdmin) {
        return; // Skip increment for admins
      }
    }

    // Reset if needed first
    await supabase.rpc('reset_rate_limit_if_needed', { p_identifier: identifier });

    // Check if record exists
    const { data: existing } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .single();

    if (!existing) {
      // Create new record with count 1
      await supabase.from('rate_limits').insert({
        identifier,
        is_authenticated: isAuthenticated,
        message_count: 1,
      });
    } else {
      // Increment existing count
      await supabase
        .from('rate_limits')
        .update({ message_count: (existing.message_count || 0) + 1 })
        .eq('identifier', identifier);
    }
  } catch (error) {
    console.error('Failed to increment rate limit:', error);
  }
}

/**
 * Get remaining messages for user/IP
 */
export async function getRemainingMessagesDB(
  identifier: string,
  isAuthenticated: boolean,
  userId?: string
): Promise<number> {
  const supabase = await createClient();
  const limit = isAuthenticated ? DAILY_LIMIT_AUTHENTICATED : DAILY_LIMIT_ANONYMOUS;

  try {
    // Check if user is admin
    if (userId) {
      const { data: isAdmin } = await supabase
        .rpc('is_admin', { p_user_id: userId });
      
      if (isAdmin) {
        return 999999; // Unlimited for admins
      }
    }

    // Reset if needed
    await supabase.rpc('reset_rate_limit_if_needed', { p_identifier: identifier });

    const { data } = await supabase
      .from('rate_limits')
      .select('message_count')
      .eq('identifier', identifier)
      .single();

    if (!data) {
      return limit;
    }

    return Math.max(0, limit - (data.message_count || 0));
  } catch (error) {
    console.error('Failed to get remaining messages:', error);
    return limit;
  }
}

// Spam tracking still needs to be in-memory (temporary blocks)
const spamAttempts = new Map<string, { count: number; firstAttempt: number; blockedUntil?: number }>();

const SPAM_WINDOW = 60000; // 1 minute
const SPAM_THRESHOLD = 10; // 10 requests in 1 minute
const SPAM_BLOCK_DURATION = 3600000; // 1 hour block

export function checkSpamAttempt(ipHash: string): { allowed: boolean; blockedUntil?: number } {
  const now = Date.now();
  const record = spamAttempts.get(ipHash);

  if (!record) {
    spamAttempts.set(ipHash, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  // Check if currently blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    return { allowed: false, blockedUntil: record.blockedUntil };
  }

  // Reset if window expired
  if (now - record.firstAttempt > SPAM_WINDOW) {
    spamAttempts.set(ipHash, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  // Increment count
  record.count++;

  // Block if threshold exceeded
  if (record.count > SPAM_THRESHOLD) {
    record.blockedUntil = now + SPAM_BLOCK_DURATION;
    console.warn(`🚨 IP ${ipHash} blocked for spam (${record.count} requests in ${SPAM_WINDOW}ms)`);
    return { allowed: false, blockedUntil: record.blockedUntil };
  }

  return { allowed: true };
}
