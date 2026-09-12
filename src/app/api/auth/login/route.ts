import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { Admin } from "@/models/Admin";
import { decryptSecret, validateTOTP } from "@/lib/totp";
import { createSessionToken } from "@/lib/auth";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req);
    const rateLimit = checkRateLimit(`login:${ip}`);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many attempts. Try again in ${rateLimit.retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

    let email: string;
    let code: string;

    try {
      const body = await req.json();
      email = body?.email;
      code = body?.code;
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required." },
        { status: 400 }
      );
    }

    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Email or code is entered wrong." },
        { status: 401 }
      );
    }

    await connectToDB();

    const admin = await Admin.findOne({ email });

    if (!admin || !admin.totpSecret) {
      return NextResponse.json(
        { error: "Account not set up. Go back and enter your email." },
        { status: 401 }
      );
    }

    let decryptedSecret: string;
    try {
      decryptedSecret = decryptSecret(admin.totpSecret);
    } catch {
      return NextResponse.json(
        {
          error: "Authentication failed. Go back and re-enter your email to reset.",
        },
        { status: 401 }
      );
    }

    const trimmedCode = code.toString().trim();

    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit code." },
        { status: 401 }
      );
    }

    const delta = validateTOTP(decryptedSecret, trimmedCode, 1);

    if (delta === null) {
      return NextResponse.json(
        { error: "Invalid code. Check your authenticator app and try again." },
        { status: 401 }
      );
    }

    if (!admin.setupComplete) {
      admin.setupComplete = true;
      await admin.save();
    }

    const sessionToken = await createSessionToken(email);

    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: "admin_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}