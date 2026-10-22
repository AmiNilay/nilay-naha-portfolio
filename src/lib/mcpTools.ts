import { connectToDB } from "@/lib/connectToDB";
import { revalidatePublicPages } from "@/lib/revalidate";
import Project from "@/models/Project";
import Post from "@/models/Post";
import About from "@/models/About";
import Hero from "@/models/Hero";

/**
 * Admin tools exposed over MCP (see src/app/api/mcp/route.ts).
 * Each tool mirrors an admin-panel action and revalidates public pages on writes.
 */

type Json = Record<string, any>;

interface McpTool {
  name: string;
  description: string;
  inputSchema: Json;
  annotations?: Json;
  run: (args: Json) => Promise<unknown>;
}

const str = (description: string) => ({ type: "string", description });

const PROJECT_FIELDS: Json = {
  title: str("Project title"),
  slug: str("URL slug, e.g. speed-test-app"),
  description: str("Markdown description / case study"),
  tags: { type: "array", items: { type: "string" }, description: "Tech stack / tags" },
  githubLink: str("Source code URL"),
  liveLink: str("Live demo URL"),
  appLink: str("App store / download URL"),
  role: str("Nilay's role on the project"),
  status: str('"Published" or "Draft"'),
  image: str("Cover image URL"),
  gDriveImage: str("Google Drive share link for the cover image"),
  featured: { type: "boolean" },
  publishDate: str("ISO date"),
  relatedBlog: str("Slug of a related blog post"),
};

const POST_FIELDS: Json = {
  title: str("Article title"),
  slug: str("URL slug"),
  excerpt: str("Short summary"),
  content: str("Markdown body (KaTeX supported)"),
  coverImage: str("Cover image URL"),
  gDriveImage: str("Google Drive share link for the cover image"),
  category: str("Category"),
  tags: { type: "array", items: { type: "string" } },
  published: { type: "boolean", description: "true makes it public" },
  readTime: str('e.g. "5 min read"'),
  relatedProject: str("Slug of a related project"),
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const driveThumb = (url?: string) => {
  if (!url || url.includes("<iframe")) return url || "";
  const id = url.match(/[-\w]{25,}/)?.[0];
  return id && url.includes("drive.google.com") ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000` : url;
};

const pick = (args: Json, fields: Json) =>
  Object.fromEntries(Object.keys(fields).filter((k) => args[k] !== undefined).map((k) => [k, args[k]]));

const byIdOrSlug = (id: string) => (/^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { slug: id });

const idArg = { id: str("MongoDB _id or slug") };

async function write<T>(fn: () => Promise<T>): Promise<T> {
  const result = await fn();
  revalidatePublicPages();
  return result;
}

export const MCP_TOOLS: McpTool[] = [
  {
    name: "list_projects",
    description: "List all portfolio projects (drafts included) with id, title, slug, status and tags.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    run: async () =>
      Project.find({}, "title slug status tags featured publishDate").sort({ publishDate: -1 }).lean(),
  },
  {
    name: "get_project",
    description: "Get one project in full.",
    inputSchema: { type: "object", properties: idArg, required: ["id"] },
    annotations: { readOnlyHint: true },
    run: async ({ id }) => Project.findOne(byIdOrSlug(id)).lean(),
  },
  {
    name: "create_project",
    description: "Create a project. Slug is derived from the title if omitted. Status defaults to Published.",
    inputSchema: { type: "object", properties: PROJECT_FIELDS, required: ["title", "description"] },
    run: (args) =>
      write(() => {
        const data = pick(args, PROJECT_FIELDS);
        data.slug = data.slug || slugify(data.title);
        if (data.gDriveImage) data.gDriveImage = driveThumb(data.gDriveImage);
        if (data.publishDate) data.publishDate = new Date(data.publishDate);
        return Project.create(data);
      }),
  },
  {
    name: "update_project",
    description: "Update fields of an existing project. Only the fields you pass change.",
    inputSchema: { type: "object", properties: { ...idArg, ...PROJECT_FIELDS }, required: ["id"] },
    run: (args) =>
      write(() => {
        const data = pick(args, PROJECT_FIELDS);
        if (data.gDriveImage) data.gDriveImage = driveThumb(data.gDriveImage);
        if (data.publishDate) data.publishDate = new Date(data.publishDate);
        return Project.findOneAndUpdate(byIdOrSlug(args.id), data, { new: true }).lean();
      }),
  },
  {
    name: "delete_project",
    description: "Permanently delete a project.",
    inputSchema: { type: "object", properties: idArg, required: ["id"] },
    annotations: { destructiveHint: true },
    run: (args) => write(() => Project.findOneAndDelete(byIdOrSlug(args.id)).lean()),
  },
  {
    name: "list_posts",
    description: "List all blog posts (drafts included) with id, title, slug and published flag.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    run: async () => Post.find({}, "title slug published category tags createdAt").sort({ createdAt: -1 }).lean(),
  },
  {
    name: "get_post",
    description: "Get one blog post in full.",
    inputSchema: { type: "object", properties: idArg, required: ["id"] },
    annotations: { readOnlyHint: true },
    run: async ({ id }) => Post.findOne(byIdOrSlug(id)).lean(),
  },
  {
    name: "create_post",
    description: "Create a blog post. Saved as a draft unless published is true.",
    inputSchema: { type: "object", properties: POST_FIELDS, required: ["title", "content"] },
    run: (args) =>
      write(() => {
        const data = pick(args, POST_FIELDS);
        data.slug = data.slug || slugify(data.title);
        if (data.gDriveImage) data.gDriveImage = driveThumb(data.gDriveImage);
        return Post.create(data);
      }),
  },
  {
    name: "update_post",
    description: "Update fields of a blog post (set published: true to publish it).",
    inputSchema: { type: "object", properties: { ...idArg, ...POST_FIELDS }, required: ["id"] },
    run: (args) =>
      write(() => {
        const data = pick(args, POST_FIELDS);
        if (data.gDriveImage) data.gDriveImage = driveThumb(data.gDriveImage);
        return Post.findOneAndUpdate(byIdOrSlug(args.id), data, { new: true }).lean();
      }),
  },
  {
    name: "delete_post",
    description: "Permanently delete a blog post.",
    inputSchema: { type: "object", properties: idArg, required: ["id"] },
    annotations: { destructiveHint: true },
    run: (args) => write(() => Post.findOneAndDelete(byIdOrSlug(args.id)).lean()),
  },
  {
    name: "get_about",
    description: "Get the About page document (bio, skills, experience, education, certifications).",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    run: async () => About.findOne({}).lean(),
  },
  {
    name: "update_about",
    description:
      "Update top-level fields of the About document. Array fields (experience, skills, …) are replaced whole, so read with get_about first.",
    inputSchema: { type: "object", properties: { fields: { type: "object", description: "Fields to set" } }, required: ["fields"] },
    run: (args) => write(() => About.findOneAndUpdate({}, args.fields || {}, { new: true, upsert: true }).lean()),
  },
  {
    name: "get_hero",
    description: "Get the home page hero (headline, intro, social links, résumé).",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    run: async () => Hero.findOne({}).lean(),
  },
  {
    name: "update_hero",
    description: "Update top-level fields of the home page hero. Read with get_hero first.",
    inputSchema: { type: "object", properties: { fields: { type: "object", description: "Fields to set" } }, required: ["fields"] },
    run: (args) => write(() => Hero.findOneAndUpdate({}, args.fields || {}, { new: true, upsert: true }).lean()),
  },
];

export async function callTool(name: string, args: Json) {
  const tool = MCP_TOOLS.find((t) => t.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  await connectToDB();
  return tool.run(args || {});
}
