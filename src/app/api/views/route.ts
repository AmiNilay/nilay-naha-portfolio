import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const { slug } = await req.json();

    if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

    // Find the post and increment the views by 1
    const updatedPost = await Post.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    );

    return NextResponse.json({ success: true, views: updatedPost?.views || 0 });
  } catch (error) {
    console.error("Failed to update views:", error);
    return NextResponse.json({ error: "Failed to update views" }, { status: 500 });
  }
}
