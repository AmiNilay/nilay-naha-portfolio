import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { invalidateKnowledge } from "@/lib/chatEngine";
import mongoose from "mongoose";
import { audit, isObjectId } from "@/lib/audit";

const ChatbotSchema = new mongoose.Schema({
  keywords: [String],
  answer: String,
  quickReplies: [String],
  links: [{ label: String, url: String }]
});

const Chatbot = mongoose.models.Chatbot || mongoose.model("Chatbot", ChatbotSchema);

export async function GET() {
  await connectToDB();
  const rules = await Chatbot.find();
  return NextResponse.json({ rules });
}

/** Coerces untrusted rule input into plain strings (blocks NoSQL operator objects). */
function parseRule(body: any) {
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const keywords = str(body?.keywords, 2000).split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
  const quickReplies = str(body?.quickReplies, 2000).split(",").map((k) => k.trim()).filter(Boolean);
  const links = Array.isArray(body?.links)
    ? body.links.slice(0, 10).map((l: any) => ({ label: str(l?.label, 100), url: str(l?.url, 500) })).filter((l: any) => l.label && l.url)
    : [];
  return { keywords, answer: str(body?.answer, 5000), quickReplies, links };
}

export async function POST(req: NextRequest) {
  await connectToDB();
  const data = parseRule(await req.json().catch(() => ({})));
  if (!data.keywords.length || !data.answer) return NextResponse.json({ error: "Keywords and answer are required" }, { status: 400 });
  const rule = await Chatbot.create(data);
  invalidateKnowledge();
  await audit(req, { actor: "admin", action: "chatbot.create", target: String(rule._id) });
  return NextResponse.json({ success: true, rule });
}

export async function PUT(req: NextRequest) {
  await connectToDB();
  const body = await req.json().catch(() => ({}));
  if (!isObjectId(body?.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const rule = await Chatbot.findByIdAndUpdate(body.id, parseRule(body), { new: true });
  invalidateKnowledge();
  await audit(req, { actor: "admin", action: "chatbot.update", target: body.id });
  return NextResponse.json({ success: true, rule });
}

export async function DELETE(req: NextRequest) {
  await connectToDB();
  const id = req.nextUrl.searchParams.get("id");
  if (!isObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await Chatbot.findByIdAndDelete(id);
  invalidateKnowledge();
  await audit(req, { actor: "admin", action: "chatbot.delete", target: id });
  return NextResponse.json({ success: true });
}
