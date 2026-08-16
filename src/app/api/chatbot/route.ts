import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import mongoose from "mongoose";

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

export async function POST(req: NextRequest) {
  await connectToDB();
  const { keywords, answer, quickReplies, links } = await req.json();
  
  const keywordArray = keywords.split(",").map((k: string) => k.trim().toLowerCase()).filter(Boolean);
  const repliesArray = quickReplies ? quickReplies.split(",").map((k: string) => k.trim()).filter(Boolean) : [];
  
  const rule = await Chatbot.create({ keywords: keywordArray, answer, quickReplies: repliesArray, links: links || [] });
  return NextResponse.json({ success: true, rule });
}

export async function PUT(req: NextRequest) {
  await connectToDB();
  const { id, keywords, answer, quickReplies, links } = await req.json();
  
  const keywordArray = keywords.split(",").map((k: string) => k.trim().toLowerCase()).filter(Boolean);
  const repliesArray = quickReplies ? quickReplies.split(",").map((k: string) => k.trim()).filter(Boolean) : [];
  
  const rule = await Chatbot.findByIdAndUpdate(id, { keywords: keywordArray, answer, quickReplies: repliesArray, links: links || [] }, { new: true });
  return NextResponse.json({ success: true, rule });
}

export async function DELETE(req: NextRequest) {
  await connectToDB();
  const id = req.nextUrl.searchParams.get("id");
  await Chatbot.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
