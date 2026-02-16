/**
 * Simple in-memory rate limiter for login brute force protection.
 * No external dependencies required.
 */

interface RateLimitEntry {
  count: number
  firstAttempt: number
}

const attempts = new Map<string, RateLimitEntry>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000 // Clean up every 5 minutes

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of attempts.entries()) {
    if (now - entry.firstAttempt > WINDOW_MS) {
      attempts.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry) {
    return { allowed: true }
  }

  // Window expired — reset
  if (now - entry.firstAttempt > WINDOW_MS) {
    attempts.delete(ip)
    return { allowed: true }
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.firstAttempt)) / 1000)
    return { allowed: false, retryAfter }
  }

  return { allowed: true }
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    entry.count++
  }
}

export function resetAttempts(ip: string): void {
  attempts.delete(ip)
}
