/**
 * Session token creation and verification.
 * Uses crypto.subtle (Web Crypto API) for BOTH creation and verification.
 * Works identically in Node.js runtime (API routes) and Edge runtime (middleware).
 */

const textEncoder = new TextEncoder();

function toBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  if (typeof Buffer !== "undefined") {
    return Buffer.from(s, "base64").toString("utf8");
  }
  return atob(s);
}

async function importSignKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Creates a signed session token.
 * Format: base64url(json_payload).hmac_hex
 * Payload: { email, iat, exp }
 */
export async function createSessionToken(
  email: string
): Promise<string> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET environment variable is not set");
  }

  const now = Date.now();
  const exp = now + 7 * 24 * 60 * 60 * 1000; // 7 days

  const payload = JSON.stringify({ email, iat: now, exp });
  const payloadB64 = toBase64Url(payload);

  const key = await importSignKey(secret);
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(payloadB64)
  );
  const sig = bufferToHex(sigBuffer);

  return `${payloadB64}.${sig}`;
}

/**
 * Verifies a session token.
 * Returns true if the token is valid and not expired.
 */
export async function verifySessionToken(
  token: string
): Promise<boolean> {
  try {
    if (!token || typeof token !== "string") return false;

    const dotIndex = token.indexOf(".");
    if (dotIndex === -1) return false;

    const payloadB64 = token.substring(0, dotIndex);
    const sig = token.substring(dotIndex + 1);

    if (!payloadB64 || !sig) return false;

    const secret = process.env.ADMIN_SECRET;
    if (!secret) return false;

    // Verify signature using the same crypto.subtle API as creation
    const key = await importSignKey(secret);
    const expectedBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      textEncoder.encode(payloadB64)
    );
    const expected = bufferToHex(expectedBuffer);

    if (!constantTimeCompare(sig, expected)) return false;

    // Parse and check expiry
    const payloadJson = fromBase64Url(payloadB64);
    const payload = JSON.parse(payloadJson);

    if (!payload.email || !payload.exp) return false;
    if (typeof payload.exp !== "number") return false;

    return Date.now() < payload.exp;
  } catch {
    return false;
  }
}

/**
 * Checks if the request has a valid admin session.
 * Used by middleware and server components.
 */
export async function isAuthenticated(
  cookies: { get: (name: string) => { value: string } | undefined }
): Promise<boolean> {
  const token = cookies.get("admin_token")?.value;
  if (!token) return false;
  return verifySessionToken(token);
}