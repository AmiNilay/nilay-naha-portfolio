import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { connectToDB } from "@/lib/connectToDB";
import { Admin } from "@/models/Admin";
import { decryptSecret, validateTOTP } from "@/lib/totp";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

// Ensure this runs on Node.js runtime, NOT Edge
export const runtime = "nodejs";

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
    // Rate limiting
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

    // Parse request body
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

    // Validate email matches admin
    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Email or code is entered wrong." },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDB();

    const admin = await Admin.findOne({ email });

    if (!admin || !admin.totpSecret) {
      return NextResponse.json(
        { error: "Email or code is entered wrong." },
        { status: 401 }
      );
    }

    // Decrypt the stored TOTP secret
    let decryptedSecret: string;
    try {
      decryptedSecret = decryptSecret(admin.totpSecret);
    } catch (decryptError) {
      console.error("Secret decryption failed:", decryptError);
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    // Validate the TOTP code using native crypto
    const trimmedCode = code.toString().trim();
    const delta = validateTOTP(decryptedSecret, trimmedCode, 1);

    if (delta === null) {
      return NextResponse.json(
        { error: "Email or code is entered wrong." },
        { status: 401 }
      );
    }

    // Mark setup as complete if first login
    if (!admin.setupComplete) {
      admin.setupComplete = true;
      await admin.save();
    }

    // Create session token
    const sessionToken = createSessionToken(email);

    // Set session cookie
    cookies().set({
      name: "admin_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}