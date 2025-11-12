// Simple in-memory rate limiting
// In production, use Redis or database

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  isAuthenticated: boolean;
}

interface SpamDetectionEntry {
  attempts: number;
  lastAttempt: number;
  blocked: boolean;
}

// Store rate limits in memory (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();
const spamDetectionStore = new Map<string, SpamDetectionEntry>();

const ANONYMOUS_LIMIT = 1; // Anonymous users: 1 message per session
const AUTHENTICATED_LIMIT = 5; // Authenticated users: 5 messages per day
const ANONYMOUS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours for anonymous
const AUTHENTICATED_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours for authenticated

// Spam detection settings
const MAX_ATTEMPTS_PER_MINUTE = 10; // Max 10 attempts per minute
const SPAM_BLOCK_DURATION_MS = 60 * 60 * 1000; // Block for 1 hour if spamming
const ATTEMPT_WINDOW_MS = 60 * 1000; // 1 minute window

export function checkRateLimit(
  identifier: string, 
  isAuthenticated: boolean = false
): { allowed: boolean; remaining: number; resetIn?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  const limit = isAuthenticated ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT;
  const cooldown = isAuthenticated ? AUTHENTICATED_COOLDOWN_MS : ANONYMOUS_COOLDOWN_MS;

  // No previous entry - first message allowed
  if (!entry) {
    return { allowed: true, remaining: limit - 1 };
  }

  // Check if cooldown has passed (reset daily)
  const timePassed = now - entry.firstAttempt;
  if (timePassed > cooldown) {
    // Cooldown expired, allow message
    return { allowed: true, remaining: limit - 1 };
  }

  // User exceeded their limit
  if (entry.count >= limit) {
    const resetIn = cooldown - timePassed;
    return { 
      allowed: false, 
      remaining: 0,
      resetIn 
    };
  }

  // Under limit - allow
  return { 
    allowed: true, 
    remaining: limit - entry.count 
  };
}

export function incrementRateLimit(
  identifier: string,
  isAuthenticated: boolean = false
): void {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  const cooldown = isAuthenticated ? AUTHENTICATED_COOLDOWN_MS : ANONYMOUS_COOLDOWN_MS;

  // No previous entry - create first entry
  if (!entry) {
    rateLimitStore.set(identifier, {
      count: 1,
      firstAttempt: now,
      isAuthenticated,
    });
    return;
  }

  // Check if cooldown has passed
  const timePassed = now - entry.firstAttempt;
  if (timePassed > cooldown) {
    // Reset the counter
    rateLimitStore.set(identifier, {
      count: 1,
      firstAttempt: now,
      isAuthenticated,
    });
    return;
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(identifier, entry);
}

export function getRemainingMessages(
  identifier: string,
  isAuthenticated: boolean = false
): number {
  const limit = isAuthenticated ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT;
  const cooldown = isAuthenticated ? AUTHENTICATED_COOLDOWN_MS : ANONYMOUS_COOLDOWN_MS;
  
  const entry = rateLimitStore.get(identifier);
  if (!entry) return limit;
  
  const now = Date.now();
  const timePassed = now - entry.firstAttempt;
  
  if (timePassed > cooldown) {
    return limit;
  }
  
  return Math.max(0, limit - entry.count);
}

export function checkSpamAttempt(identifier: string): { 
  allowed: boolean; 
  reason?: string;
  blockedUntil?: number;
} {
  const now = Date.now();
  const entry = spamDetectionStore.get(identifier);

  // No previous entry
  if (!entry) {
    spamDetectionStore.set(identifier, {
      attempts: 1,
      lastAttempt: now,
      blocked: false,
    });
    return { allowed: true };
  }

  // Check if currently blocked
  if (entry.blocked) {
    const blockExpiry = entry.lastAttempt + SPAM_BLOCK_DURATION_MS;
    if (now < blockExpiry) {
      return {
        allowed: false,
        reason: 'Spam detected - temporarily blocked',
        blockedUntil: blockExpiry,
      };
    }
    // Block expired, reset
    entry.blocked = false;
    entry.attempts = 1;
    entry.lastAttempt = now;
    spamDetectionStore.set(identifier, entry);
    return { allowed: true };
  }

  // Check if within attempt window
  const timeSinceLastAttempt = now - entry.lastAttempt;
  
  if (timeSinceLastAttempt < ATTEMPT_WINDOW_MS) {
    // Within window, increment attempts
    entry.attempts++;
    entry.lastAttempt = now;

    // Too many attempts - block!
    if (entry.attempts > MAX_ATTEMPTS_PER_MINUTE) {
      entry.blocked = true;
      spamDetectionStore.set(identifier, entry);
      
      console.warn(`🚨 Spam detected from: ${identifier}`);
      
      return {
        allowed: false,
        reason: 'Too many requests - blocked for spam',
        blockedUntil: now + SPAM_BLOCK_DURATION_MS,
      };
    }

    spamDetectionStore.set(identifier, entry);
    return { allowed: true };
  }

  // Outside window, reset counter
  entry.attempts = 1;
  entry.lastAttempt = now;
  spamDetectionStore.set(identifier, entry);
  return { allowed: true };
}
