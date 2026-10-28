import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { revalidatePublicPages } from "@/lib/revalidate";
import { cachedPublic } from "@/lib/publicCache";
import About from "@/models/About";
import { audit, pickFields } from "@/lib/audit";
import { processContent } from "@/lib/markdownProcessor";

// Cached (incl. the rendered bio) so visitors skip the DB query and Markdown pipeline.
const getPublicAbout = cachedPublic("about", async () => {
  await connectToDB();
  const about: any = await About.findOne({}).lean();
  if (!about) return {};
  // bioHtml: the bio rendered like blog content (Markdown/HTML, Drive media, sanitized).
  return { ...about, bioHtml: await processContent(about.bio || "") };
});

export async function GET() {
  try {
    return NextResponse.json(await getPublicAbout());
  } catch (error) {
    console.error("GET About Error:", error);
    return NextResponse.json({ error: "Failed to fetch about data" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDB();
    // Only schema fields, with Mongo operators / dotted keys stripped (NoSQL-injection guard).
    const allowed = Object.keys(About.schema.paths)
      .map((p) => p.split(".")[0])
      .filter((p) => !["_id", "__v", "createdAt", "updatedAt"].includes(p));
    const body = pickFields(await req.json(), allowed);
    const updated = await About.findOneAndUpdate({}, { $set: body }, { new: true, upsert: true, runValidators: true });
    revalidatePublicPages();
    await audit(req, { actor: "admin", action: "about.update", target: Object.keys(body).join(",") });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT About Error:", error);
    return NextResponse.json({ error: "Failed to update about data" }, { status: 500 });
  }
}
