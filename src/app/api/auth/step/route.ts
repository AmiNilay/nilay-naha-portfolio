import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { Admin } from "@/models/Admin";
import {
  encryptSecret,
  generateBase32Secret,
  generateQRCodeDataURL,
} from "@/lib/totp";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

// Ensure this runs on Node.js runtime, NOT Edge
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIP(req);
    const rateLimit = checkRateLimit(`step:${ip}`);

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

    const { email } = await req.json();

    // Always return the same error to prevent email enumeration
    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Email or code is entered wrong." },
        { status: 401 }
      );
    }

    await connectToDB();

    let admin = await Admin.findOne({ email });

    if (!admin || !admin.setupComplete) {
      // First time or incomplete setup: generate TOTP secret
      const secretBase32 = generateBase32Secret();
      const encryptedSecret = encryptSecret(secretBase32);
      const qrCode = await generateQRCodeDataURL(email, secretBase32);

      if (!admin) {
        admin = await Admin.create({
          email,
          totpSecret: encryptedSecret,
          setupComplete: false,
        });
      } else {
        admin.totpSecret = encryptedSecret;
        await admin.save();
      }

      return NextResponse.json({
        needsSetup: true,
        qrCode,
        secret: secretBase32,
      });
    }

    // Admin is fully set up, just needs the TOTP code
    return NextResponse.json({ needsSetup: false });
  } catch (error) {
    console.error("Auth step error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}