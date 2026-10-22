import type { NextRequest } from "next/server";

/**
 * Per-IP fixed-window limiter (in-memory; resets per server instance — fine for a portfolio).
 * Each caller gets its own bucket map via createRateLimiter().
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; start: number }>();
  return (req: NextRequest) => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || now - entry.start > windowMs) {
      hits.set(ip, { count: 1, start: now });
      return false;
    }
    return ++entry.count > limit;
  };
}
