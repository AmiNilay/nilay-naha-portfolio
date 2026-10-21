import { cache } from "react";
import { connectToDB } from "@/lib/connectToDB";
import About from "@/models/About";
import Project from "@/models/Project";
import Post from "@/models/Post";
import { getHeroData } from "@/lib/publicData";

export const SITE_URL = "https://nilay-naha-portfolio.vercel.app";

// Project descriptions embed <style> blocks; drop their contents, not just the tags.
const stripHtml = (s: unknown) =>
  String(s ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/** Public profile facts shared by JSON-LD and /llms.txt. One query set per request. */
export const getProfile = cache(async () => {
  try {
    await connectToDB();
    const [hero, about, projects, posts]: any[] = await Promise.all([
      getHeroData(),
      About.findOne({}).lean(),
      Project.find({}, { title: 1, slug: 1, description: 1, tags: 1, githubLink: 1, liveLink: 1 })
        .sort({ featured: -1, publishDate: -1 }).lean(),
      Post.find({}, { title: 1, slug: 1, excerpt: 1 }).sort({ publishDate: -1, createdAt: -1 }).lean(),
    ]);
    const experience: any[] = about?.experience || [];
    return {
      hero: hero || {},
      bio: stripHtml(about?.bio),
      location: about?.location || "",
      availability: String(about?.availability || "").trim().replace(/\.+$/, ""),
      skills: (about?.skills || []) as string[],
      education: (about?.education || []) as any[],
      experience,
      current: experience.find((e) => /present|current/i.test(e.duration || "")) || null,
      projects: (projects || []).map((p: any) => ({ ...p, summary: stripHtml(p.description).slice(0, 220) })),
      posts: posts || [],
    };
  } catch (error) {
    console.error("Failed to load profile:", error);
    return null;
  }
});
