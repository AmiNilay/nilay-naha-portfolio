import { NextResponse } from "next/server";
import { clientIp } from "@/lib/adminAuth";

/**
 * Sliding-window rate limiter keyed by limiter name + client IP.
 * In-memory: each Vercel serverless instance keeps its own counters, so limits
 * are per instance (a strong deterrent, not a global quota). Good enough for a
 * portfolio without a paid KV store.
 */

const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  buckets.forEach((hits, key) => {
    if (!hits.length || now - hits[hits.length - 1] > 24 * 60 * 60 * 1000) buckets.delete(key);
  });
}

/** Records a hit; returns seconds to wait when over the limit, else 0. */
export function hit(name: string, key: string, limit: number, windowMs: number): number {
  const now = Date.now();
  sweep(now);
  const id = `${name}:${key}`;
  const hits = (buckets.get(id) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(id, hits);
    return Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000));
  }
  hits.push(now);
  buckets.set(id, hits);
  return 0;
}

/** Returns seconds to wait if the key is already at its limit, without recording a hit. */
export function peek(name: string, key: string, limit: number, windowMs: number): number {
  const now = Date.now();
  const hits = (buckets.get(`${name}:${key}`) || []).filter((t) => now - t < windowMs);
  return hits.length >= limit ? Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) : 0;
}

/** Resets a key's counter (e.g. after a successful login). */
export function resetHits(name: string, key: string) {
  buckets.delete(`${name}:${key}`);
}

export function tooManyRequests(retryAfter: number, message = "Too many requests — please try again later.") {
  return NextResponse.json({ error: message }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
}

/**
 * Returns a checker for one endpoint: `const limited = createRateLimiter(30, HOUR)`;
 * `limited(req)` → true when the caller is over the limit.
 */
export function createRateLimiter(limit: number, windowMs: number, name = `rl${Math.random().toString(36).slice(2, 8)}`) {
  return (req: Request) => hit(name, clientIp(req), limit, windowMs) > 0;
}

/** Same as createRateLimiter but returns a ready 429 response (with Retry-After) or null. */
export function rateLimit(req: Request, name: string, limit: number, windowMs: number) {
  const wait = hit(name, clientIp(req), limit, windowMs);
  return wait ? tooManyRequests(wait) : null;
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
