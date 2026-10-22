import { NextRequest, NextResponse } from "next/server";
import { getPublicKnowledge, searchPortfolio, stripPortfolioHtml, portfolioProjectTech } from "@/lib/chatEngine";
import { matchJobDescription } from "@/lib/jobMatch";
import { handleMcpRequest, methodNotAllowed, rpcError, type McpTool } from "@/lib/mcpProtocol";
import { createRateLimiter } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Public, read-only MCP server: lets recruiters' AI agents query Nilay's
 * portfolio directly. No auth; published content only; rate-limited per IP.
 */

const SITE_URL = "https://nilay-naha-portfolio.vercel.app";
const rateLimited = createRateLimiter(120, 60 * 60 * 1000);

const str = (description: string) => ({ type: "string", description });
const read = { readOnlyHint: true };

const projectSummary = (p: any) => ({
  title: p.title,
  slug: p.slug,
  url: `${SITE_URL}/projects/${p.slug}`,
  role: p.role || undefined,
  tech: portfolioProjectTech(p),
  summary: stripPortfolioHtml(p.description).slice(0, 300),
  liveLink: p.liveLink || undefined,
  githubLink: p.githubLink || undefined,
  featured: !!p.featured,
});

const TOOLS: McpTool[] = [
  {
    name: "get_profile",
    description: "Nilay Naha's professional profile: role, location, bio, availability, socials, experience, education and skills.",
    inputSchema: { type: "object", properties: {} },
    annotations: read,
    run: async () => {
      const { hero, about } = await getPublicKnowledge();
      return {
        name: "Nilay Naha",
        website: SITE_URL,
        location: about.location || undefined,
        availability: about.availability || undefined,
        bio: stripPortfolioHtml(about.bio),
        socials: {
          email: hero.socialEmail, linkedin: hero.socialLinkedin, github: hero.socialGithub,
          twitter: hero.socialTwitter, instagram: hero.socialInstagram,
        },
        experience: (about.experience || []).map((e: any) => ({
          role: e.role, company: e.company, duration: e.duration, description: e.description, companyLinkedin: e.companyLinkedin || undefined,
        })),
        education: (about.education || []).map((e: any) => ({
          degree: e.degree, institution: e.institution, year: e.year, grade: e.grade || e.cgpa || undefined,
        })),
        skills: about.skills || [],
        certifications: (about.certifications || []).map((c: any) => ({ name: c.name, issuer: c.issuer })),
      };
    },
  },
  {
    name: "list_projects",
    description: "All published projects with tech stack, summary and links.",
    inputSchema: { type: "object", properties: {} },
    annotations: read,
    run: async () => (await getPublicKnowledge()).projects.map(projectSummary),
  },
  {
    name: "get_project",
    description: "Full details of one published project.",
    inputSchema: { type: "object", properties: { slug: str("Project slug (from list_projects)") }, required: ["slug"] },
    annotations: read,
    run: async ({ slug }) => {
      const p = (await getPublicKnowledge()).projects.find((x: any) => String(x.slug).toLowerCase() === String(slug).toLowerCase());
      if (!p) throw new Error(`No published project with slug "${slug}"`);
      return { ...projectSummary(p), description: stripPortfolioHtml(p.description), appLink: p.appLink || undefined };
    },
  },
  {
    name: "list_posts",
    description: "All published blog posts.",
    inputSchema: { type: "object", properties: {} },
    annotations: read,
    run: async () =>
      (await getPublicKnowledge()).posts.map((p: any) => ({
        title: p.title, slug: p.slug, url: `${SITE_URL}/blog/${p.slug}`, category: p.category, tags: p.tags, excerpt: p.excerpt,
      })),
  },
  {
    name: "get_post",
    description: "Full text (markdown) of one published blog post.",
    inputSchema: { type: "object", properties: { slug: str("Post slug (from list_posts)") }, required: ["slug"] },
    annotations: read,
    run: async ({ slug }) => {
      const p = (await getPublicKnowledge()).posts.find((x: any) => String(x.slug).toLowerCase() === String(slug).toLowerCase());
      if (!p) throw new Error(`No published post with slug "${slug}"`);
      return { title: p.title, url: `${SITE_URL}/blog/${p.slug}`, category: p.category, tags: p.tags, readTime: p.readTime, content: p.content };
    },
  },
  {
    name: "search_portfolio",
    description: "Ranked full-text search across published projects, posts, experience and education.",
    inputSchema: { type: "object", properties: { query: str("What to look for, e.g. 'computer vision'") }, required: ["query"] },
    annotations: read,
    run: async ({ query }) =>
      (await searchPortfolio(String(query || ""), 8)).map((h) => ({ ...h, url: h.url ? `${SITE_URL}${h.url}` : undefined })),
  },
  {
    name: "match_job_description",
    description:
      "Score how well Nilay's portfolio matches a job description (0–100), with evidence for matched skills, honestly listed missing skills and the most relevant work.",
    inputSchema: { type: "object", properties: { job_description: str("Full job description text") }, required: ["job_description"] },
    annotations: read,
    run: async ({ job_description }) => matchJobDescription(String(job_description || "")),
  },
];

const SERVER = {
  name: "nilay-naha-portfolio",
  instructions:
    "Read-only access to Nilay Naha's software engineering portfolio. Use get_profile for an overview, search_portfolio for specific topics, and match_job_description to evaluate fit for a role. All data is live from the portfolio CMS.",
  tools: TOOLS,
};

export async function POST(req: NextRequest) {
  if (rateLimited(req)) {
    return NextResponse.json(rpcError(null, -32002, "Too many requests — please try again later."), { status: 429 });
  }
  return handleMcpRequest(req, SERVER);
}

export const GET = methodNotAllowed;
