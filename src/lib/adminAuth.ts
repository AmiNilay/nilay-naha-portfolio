/**
 * Admin session tokens: HMAC-SHA256 signed, expiring, verified with Web Crypto
 * so the same code runs in Edge middleware and Node route handlers.
 * Token format: base64url(payload JSON) + "." + base64url(signature).
 * Fails closed: without ADMIN_SECRET no token can be created or verified.
 */

export const SESSION_COOKIE = "admin_token";
export const SESSION_TTL_S = 7 * 24 * 60 * 60;

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey | null> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 16) return null;
  return crypto.subtle.importKey("raw", enc.encode(`admin-session:${secret}`), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function createSessionToken(): Promise<string | null> {
  const key = await hmacKey();
  if (!key) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(enc.encode(JSON.stringify({ sub: "admin", iat: now, exp: now + SESSION_TTL_S })));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return `${payload}.${b64url(sig)}`;
}

export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token || token.length > 512) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const key = await hmacKey();
  if (!key) return false;
  try {
    const valid = await crypto.subtle.verify("HMAC", key, fromB64url(sig), enc.encode(payload));
    if (!valid) return false;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    return data?.sub === "admin" && typeof data.exp === "number" && data.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

function readCookie(req: Request, name: string): string | undefined {
  const anyReq = req as any;
  if (anyReq.cookies?.get) return anyReq.cookies.get(name)?.value;
  const header = req.headers.get("cookie") || "";
  const match = header.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export async function isAdminRequest(req: Request): Promise<boolean> {
  return verifySessionToken(readCookie(req, SESSION_COOKIE));
}

/** Constant-time string comparison (works in Edge and Node). */
export function safeEqual(a: string, b: string): boolean {
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/** Client IP: first x-forwarded-for hop (set by Vercel), else x-real-ip. */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Short, non-reversible IP fingerprint for logs (no raw IPs stored). */
export async function hashIp(ip: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(`ip:${process.env.ADMIN_SECRET || ""}:${ip}`)));
  return b64url(digest).slice(0, 16);
}
