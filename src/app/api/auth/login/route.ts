import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (
      email === process.env.ADMIN_EMAIL && 
      password === process.env.ADMIN_PASSWORD
    ) {
      const secret = process.env.ADMIN_SECRET || "fallback_secret";

      cookies().set({
        name: "admin_token",
        value: secret,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // 🔥 CRITICAL FIX: Allows cookie to work immediately after redirect
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      } );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
