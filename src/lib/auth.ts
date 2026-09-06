import type { NextRequest } from "next/server";

/**
 * Verifies a signed session token using Web Crypto API (Edge-compatible).
 * Token format: base64(email:timestamp:hmac_hex)
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const decoded = atob(token);
    const lastColonIndex = decoded.lastIndexOf(":");

    if (lastColonIndex === -1) return false;

    const payload = decoded.substring(0, lastColonIndex);
    const receivedSignature = decoded.substring(lastColonIndex + 1);

    const secret = process.env.ADMIN_SECRET || "";
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const expectedSigBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(expectedSigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison to prevent timing attacks
    if (receivedSignature.length !== expectedSignature.length) return false;

    let result = 0;
    for (let i = 0; i < receivedSignature.length; i++) {
      result |= receivedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }

    return result === 0;
  } catch {
    return false;
  }
}

/**
 * Checks if the request has a valid admin session cookie.
 */
export async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  return verifySessionToken(token);
}