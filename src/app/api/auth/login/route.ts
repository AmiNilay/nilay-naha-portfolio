import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_S, clientIp, createSessionToken, safeEqual } from "@/lib/adminAuth";
import { hit, resetHits, tooManyRequests, MINUTE } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const FAIL = "Invalid credentials";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const ip = clientIp(req);
  // Brute-force throttle: 5 attempts per IP per 15 min, 30 per instance per 15 min overall.
  const wait = Math.max(hit("login-ip", ip, 5, 15 * MINUTE), hit("login-all", "global", 30, 15 * MINUTE));
  if (wait) {
    await audit(req, { actor: "visitor", action: "login.throttled", ok: false });
    return tooManyRequests(wait, "Too many login attempts. Try again later.");
  }

  try {
    const { email, password } = await req.json();
    const expectedEmail = process.env.ADMIN_EMAIL;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    // Fail closed when the server isn't configured.
    const ok =
      !!expectedEmail &&
      !!expectedPassword &&
      typeof email === "string" &&
      typeof password === "string" &&
      // Evaluate both comparisons (no short-circuit) to keep timing uniform.
      [safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase()), safeEqual(password, expectedPassword)].every(Boolean);

    const token = ok ? await createSessionToken() : null;
    if (!token) {
      await audit(req, { actor: "visitor", action: "login.failed", ok: false });
      await delay(400 + Math.random() * 400);
      return NextResponse.json({ error: FAIL }, { status: 401 });
    }

    resetHits("login-ip", ip);
    cookies().set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_TTL_S,
      path: "/",
    });
    await audit(req, { actor: "admin", action: "login.success" });
    return NextResponse.json({ success: true });
  } catch {
    await delay(300);
    return NextResponse.json({ error: FAIL }, { status: 401 });
  }
}
