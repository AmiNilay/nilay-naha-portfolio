import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/adminAuth";

export async function POST() {
  try {
    cookies().set({ name: SESSION_COOKIE, value: "", maxAge: 0, path: "/", httpOnly: true, sameSite: "strict" });
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
