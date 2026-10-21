import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import PageVisit from "@/models/PageVisit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, path, referrerPath } = body ?? {};

    if (typeof sessionId !== "string" || !sessionId || typeof path !== "string" || !path) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDB();
    await PageVisit.create({
      sessionId: sessionId.slice(0, 64),
      path: path.slice(0, 200),
      referrerPath: typeof referrerPath === "string" && referrerPath ? referrerPath.slice(0, 200) : null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to record page visit:", err);
    return NextResponse.json({ error: "Failed to record visit" }, { status: 500 });
  }
}
