import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { answerQuestion, type ChatReply } from "@/lib/chatEngine";
import ChatLog from "@/models/ChatLog";

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

/** Fire-and-forget log for Admin → Insights; never delays or fails the reply. */
function logQuestion(question: string, answer: ChatReply, ip: string, body: any) {
  const text = question.trim().slice(0, 500);
  const salt = process.env.ADMIN_SECRET || "portfolio";
  ChatLog.create({
    question: text,
    normalized: text.toLowerCase().replace(/[^\w\sÀ-￿]/g, "").replace(/\s+/g, " ").trim(),
    context: answer.context || "",
    unanswered: answer.emotion === "confused",
    language: typeof body?.language === "string" ? body.language.slice(0, 10) : "",
    path: typeof body?.path === "string" ? body.path.slice(0, 200) : "",
    ipHash: createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16),
  }).catch(() => {});
}

// Public: answers visitor questions from live portfolio content (src/lib/chatEngine.ts).
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many questions — please try again later." }, { status: 429 });
  }
  try {
    const body = await req.json();
    const { question, context } = body;
    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "A question is required" }, { status: 400 });
    }
    const answer = await answerQuestion(question, typeof context === "string" ? context : undefined);
    logQuestion(question, answer, ip, body);
    return NextResponse.json(answer);
  } catch (error) {
    console.error("Chat engine error:", error);
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}
