import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import mongoose from "mongoose";

const ChatbotSchema = new mongoose.Schema(
  {
    keywords: { type: [String], default: [] },
    suggestedQuestion: { type: String, default: "" },
    answer: { type: String, required: true },
    quickReplies: { type: [String], default: [] },
    links: {
      type: [
        {
          label: String,
          url: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Chatbot =
  mongoose.models.Chatbot || mongoose.model("Chatbot", ChatbotSchema);

const normalizeKeywords = (
  keywords: unknown,
  suggestedQuestion: unknown
): string[] => {
  const keywordValues = Array.isArray(keywords)
    ? keywords
    : typeof keywords === "string"
      ? keywords.split(",")
      : [];

  const normalizedKeywords = keywordValues
    .filter((keyword): keyword is string => typeof keyword === "string")
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);

  if (typeof suggestedQuestion === "string" && suggestedQuestion.trim()) {
    normalizedKeywords.push(suggestedQuestion.trim().toLowerCase());
  }

  return Array.from(new Set(normalizedKeywords));
};

const normalizeQuickReplies = (quickReplies: unknown): string[] => {
  const replyValues = Array.isArray(quickReplies)
    ? quickReplies
    : typeof quickReplies === "string"
      ? quickReplies.split(",")
      : [];

  return replyValues
    .filter((reply): reply is string => typeof reply === "string")
    .map((reply) => reply.trim())
    .filter(Boolean);
};

const normalizeSuggestedQuestion = (suggestedQuestion: unknown): string =>
  typeof suggestedQuestion === "string" ? suggestedQuestion.trim() : "";

const normalizeLinks = (links: unknown) =>
  Array.isArray(links)
    ? links.filter(
        (link): link is { label: string; url: string } =>
          Boolean(
            link &&
              typeof link === "object" &&
              typeof (link as { label?: unknown }).label === "string" &&
              typeof (link as { url?: unknown }).url === "string"
          )
      )
    : [];

export async function GET() {
  try {
    await connectToDB();
    const rules = await Chatbot.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("GET Chatbot Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chatbot rules" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const body = await req.json();
    const suggestedQuestion = normalizeSuggestedQuestion(body.suggestedQuestion);
    const keywordArray = normalizeKeywords(body.keywords, suggestedQuestion);

    if (!keywordArray.length || typeof body.answer !== "string" || !body.answer.trim()) {
      return NextResponse.json(
        { error: "Add at least one trigger phrase or suggested question, plus an answer." },
        { status: 400 }
      );
    }

    const rule = await Chatbot.create({
      keywords: keywordArray,
      suggestedQuestion,
      answer: body.answer.trim(),
      quickReplies: normalizeQuickReplies(body.quickReplies),
      links: normalizeLinks(body.links),
    });

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    console.error("POST Chatbot Error:", error);
    return NextResponse.json(
      { error: "Failed to create chatbot rule" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    const body = await req.json();
    const suggestedQuestion = normalizeSuggestedQuestion(body.suggestedQuestion);
    const keywordArray = normalizeKeywords(body.keywords, suggestedQuestion);

    if (!body.id) {
      return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
    }

    if (!keywordArray.length || typeof body.answer !== "string" || !body.answer.trim()) {
      return NextResponse.json(
        { error: "Add at least one trigger phrase or suggested question, plus an answer." },
        { status: 400 }
      );
    }

    const rule = await Chatbot.findByIdAndUpdate(
      body.id,
      {
        keywords: keywordArray,
        suggestedQuestion,
        answer: body.answer.trim(),
        quickReplies: normalizeQuickReplies(body.quickReplies),
        links: normalizeLinks(body.links),
      },
      { new: true, runValidators: true }
    );

    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    console.error("PUT Chatbot Error:", error);
    return NextResponse.json(
      { error: "Failed to update chatbot rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDB();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
    }

    const deletedRule = await Chatbot.findByIdAndDelete(id);

    if (!deletedRule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Chatbot Error:", error);
    return NextResponse.json(
      { error: "Failed to delete chatbot rule" },
      { status: 500 }
    );
  }
}
