import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/chatEngine";

export const dynamic = "force-dynamic";

// Per-IP rate limit (in-memory; resets per server instance — fine for a portfolio).
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, { count: number; start: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  return ++entry.count > RATE_LIMIT;
}

// Public: answers visitor questions from live portfolio content (src/lib/chatEngine.ts).
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many questions — please try again later." }, { status: 429 });
  }
  try {
    const { question, context } = await req.json();
    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "A question is required" }, { status: 400 });
    }
    const answer = await answerQuestion(question, typeof context === "string" ? context : undefined);
    return NextResponse.json(answer);
  } catch (error) {
    console.error("Chat engine error:", error);
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}
