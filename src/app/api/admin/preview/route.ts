import { NextResponse } from "next/server";
import { processContent } from "@/lib/markdownProcessor";

export const dynamic = "force-dynamic";

// Admin-only (POST is guarded by middleware): renders editor content exactly
// as the public site will — Markdown/HTML, Drive media lines, sanitization.
export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    return NextResponse.json({ html: await processContent(typeof content === "string" ? content : "") });
  } catch (error) {
    console.error("Preview render error:", error);
    return NextResponse.json({ error: "Preview failed" }, { status: 500 });
  }
}
