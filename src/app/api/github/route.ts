import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Hero from "@/models/Hero";

export const dynamic = "force-dynamic";

/**
 * Public: recent GitHub activity for the "Currently building" panel on About.
 * Username comes from Hero.socialGithub (fallback AmiNilay). Cached in memory
 * for an hour; GITHUB_TOKEN (if set) only raises the rate limit and is never
 * returned to the client.
 */

const TTL_MS = 60 * 60 * 1000;
const FALLBACK_USER = "AmiNilay";
let cache: { at: number; data: unknown } | null = null;

async function githubUser(): Promise<string> {
  try {
    await connectToDB();
    const hero: any = await Hero.findOne({}, "socialGithub").lean();
    const match = String(hero?.socialGithub || "").match(/github\.com\/([A-Za-z0-9-]+)/i);
    if (match) return match[1];
  } catch {}
  return FALLBACK_USER;
}

async function gh(path: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "nilay-portfolio",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

function describe(e: any): { type: string; text: string } | null {
  const repo = e.repo?.name;
  switch (e.type) {
    case "PushEvent": {
      const n = e.payload?.size ?? e.payload?.commits?.length ?? 0;
      const msg = e.payload?.commits?.[e.payload.commits.length - 1]?.message?.split("\n")[0];
      return { type: "push", text: `Pushed ${n || ""} commit${n === 1 ? "" : "s"} to ${repo}${msg ? ` — “${msg.slice(0, 90)}”` : ""}`.replace("  ", " ") };
    }
    case "PullRequestEvent":
      return { type: "pr", text: `${e.payload?.action === "closed" && e.payload?.pull_request?.merged ? "Merged" : "Opened"} a pull request in ${repo}` };
    case "CreateEvent":
      return e.payload?.ref_type === "repository"
        ? { type: "create", text: `Created repository ${repo}` }
        : { type: "create", text: `Created ${e.payload?.ref_type} ${e.payload?.ref || ""} in ${repo}`.trim() };
    case "ReleaseEvent":
      return { type: "release", text: `Released ${e.payload?.release?.tag_name || "a new version"} of ${repo}` };
    default:
      return null;
  }
}

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) return NextResponse.json(cache.data);

  try {
    const user = await githubUser();
    const [events, repos] = await Promise.all([
      gh(`/users/${user}/events/public?per_page=50`),
      gh(`/users/${user}/repos?sort=pushed&per_page=10&type=owner`),
    ]);

    const activity = (events as any[])
      .map((e) => {
        const d = describe(e);
        return d && { ...d, repo: e.repo?.name, url: `https://github.com/${e.repo?.name}`, at: e.created_at };
      })
      .filter(Boolean)
      .slice(0, 5);

    const recentRepos = (repos as any[])
      .filter((r) => !r.fork && !r.private)
      .slice(0, 3)
      .map((r) => ({
        name: r.name,
        description: r.description || "",
        language: r.language || "",
        stars: r.stargazers_count || 0,
        url: r.html_url,
        updatedAt: r.pushed_at || r.updated_at,
      }));

    const data = { user, profileUrl: `https://github.com/${user}`, activity, repos: recentRepos };
    cache = { at: Date.now(), data };
    return NextResponse.json(data);
  } catch (error) {
    console.error("GitHub activity error:", error);
    // Serve stale data rather than nothing when GitHub is rate-limiting.
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ activity: [], repos: [], error: "GitHub activity unavailable" }, { status: 200 });
  }
}
