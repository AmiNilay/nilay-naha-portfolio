interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Checks rate limit for a given identifier (typically IP address).
 * Allows MAX_ATTEMPTS per WINDOW_MS window.
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
} {
  // Lazy cleanup: randomly purge expired entries
  if (Math.random() < 0.1) {
    const now = Date.now();
    for (const [key, entry] of Array.from(store.entries())) {
      if (now > entry.resetTime) store.delete(key);
    }
  }

  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfter: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.count,
    retryAfter: 0,
  };
}

/**
 * Extracts client IP from request headers.
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}