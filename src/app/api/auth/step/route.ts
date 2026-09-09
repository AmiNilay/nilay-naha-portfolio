import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { Admin } from "@/models/Admin";
import {
  encryptSecret,
  decryptSecret,
  generateBase32Secret,
  generateQRCodeDataURL,
} from "@/lib/totp";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
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

    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Email or code is entered wrong." },
        { status: 401 }
      );
    }

    await connectToDB();

    let admin = await Admin.findOne({ email });

    // Check if existing admin's secret is still valid
    let needsNewSecret = false;

    if (admin && admin.totpSecret) {
      try {
        const testDecrypt = decryptSecret(admin.totpSecret);
        if (!testDecrypt || testDecrypt.length < 10) {
          needsNewSecret = true;
        }
      } catch {
        console.warn("Stored TOTP secret is corrupted, regenerating...");
        needsNewSecret = true;
      }
    }

    // Decide if we need setup
    const requiresSetup = !admin || !admin.setupComplete || needsNewSecret || !admin.totpSecret;

    if (requiresSetup) {
      // Generate a fresh TOTP secret
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
        admin.setupComplete = false;
        await admin.save();
      }

      return NextResponse.json({
        needsSetup: true,
        qrCode,
        secret: secretBase32,
      });
    }

    // Admin is fully set up with a valid secret
    return NextResponse.json({ needsSetup: false });
  } catch (error) {
    console.error("Auth step error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}