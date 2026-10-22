import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { isAdminRequest } from "@/lib/adminAuth";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";

// Admin-only (middleware guards /api/admin/**; re-checked here as defence in depth):
// latest 200 security events — logins, admin + MCP writes, blocked attempts.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
  }
  try {
    await connectToDB();
    const logs = await AuditLog.find().sort({ at: -1 }).limit(200).lean();
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Audit log read failed:", error);
    return NextResponse.json({ error: "Failed to load audit log" }, { status: 500 });
  }
}
