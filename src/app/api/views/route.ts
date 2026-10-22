import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Post from "@/models/Post";
import { clientIp } from "@/lib/adminAuth";
import { hit, rateLimit, HOUR, MINUTE } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // One view per post per IP per 30 min keeps counters honest.
  const limited = rateLimit(req, "views", 60, HOUR);
  if (limited) return limited;
  try {
    const body = await req.json();
    // String-only slug: an object like {"$ne": null} would otherwise match any post.
    const slug = typeof body?.slug === "string" ? body.slug.slice(0, 200) : "";
    if (hit("view-slug", `${clientIp(req)}:${slug}`, 1, 30 * MINUTE)) return NextResponse.json({ success: true });
    await connectToDB();

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
