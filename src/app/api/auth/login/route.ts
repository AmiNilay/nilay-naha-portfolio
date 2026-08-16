import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Check BOTH email and password against your .env.local
    if (
      email === process.env.ADMIN_EMAIL && 
      password === process.env.ADMIN_PASSWORD
    ) {
      // Use your ADMIN_SECRET as the secure cookie token
      cookies().set("admin_token", process.env.ADMIN_SECRET || "fallback_secret", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
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
