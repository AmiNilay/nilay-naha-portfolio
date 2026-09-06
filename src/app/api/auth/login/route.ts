import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { connectToDB } from "@/lib/connectToDB";
import { Admin } from "@/models/Admin";
import { decryptSecret, createTOTP } from "@/lib/totp";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

function createSessionToken(email: string): string {
  const secret = process.env.ADMIN_SECRET || "";
  const timestamp = Date.now();
  const payload = `${email}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req);
    const rateLimit = checkRateLimit(`login:${ip}`);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rateLimit.retryAfter} seconds.` },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

    const { email, code } = await req.json();

    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Email or code is entered wrong." },
        { status: 401 }
      );
    }

    await connectToDB();

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return NextResponse.json(
        { error: "Email or code is entered wrong." },
        { status: 401 }
      );
    }

    const decryptedSecret = decryptSecret(admin.totpSecret);
    const { totp } = createTOTP(email, decryptedSecret);
    const delta = totp.validate({ token: code?.trim(), window: 1 });

    if (delta === null) {
      return NextResponse.json(
        { error: "Email or code is entered wrong." },
        { status: 401 }
      );
    }

    if (!admin.setupComplete) {
      admin.setupComplete = true;
      await admin.save();
    }

    const sessionToken = createSessionToken(email);

    // SESSION COOKIE: No maxAge means the cookie is deleted when the browser closes.
    // The session persists across page refreshes within the same browser session.
    cookies().set({
      name: "admin_token",
      value: sessionToken,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      // No maxAge — session cookie only
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}