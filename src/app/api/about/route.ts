import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { revalidatePublicPages } from "@/lib/revalidate";
import About from "@/models/About";
import { processContent } from "@/lib/markdownProcessor";

export async function GET() {
  try {
    await connectToDB();
    const about: any = await About.findOne({}).lean();
    if (!about) return NextResponse.json({});
    // bioHtml: the bio rendered like blog content (Markdown/HTML, Drive media, sanitized).
    return NextResponse.json({ ...about, bioHtml: await processContent(about.bio || "") });
  } catch (error) {
    console.error("GET About Error:", error);
    return NextResponse.json({ error: "Failed to fetch about data" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const updated = await About.findOneAndUpdate({}, body, { new: true, upsert: true });
    revalidatePublicPages();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT About Error:", error);
    return NextResponse.json({ error: "Failed to update about data" }, { status: 500 });
  }
}
