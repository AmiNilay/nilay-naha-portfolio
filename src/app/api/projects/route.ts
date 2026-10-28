import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { revalidatePublicPages } from "@/lib/revalidate";
import { cachedPublic } from "@/lib/publicCache";
import { audit } from "@/lib/audit";
import { includeDrafts, PUBLISHED_PROJECT } from "@/lib/visibility";
import Project from "@/models/Project";
import { uploadToGithub } from "@/lib/githubUpload";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const formatGDriveUrl = (url: string | null) => {
  if (!url) return "";
  if (url.includes("<iframe")) return url;
  const match = url.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000` : url;
};

// Case-study / evaluation fields. Text fields arrive as strings; metrics and
// evaluation arrive as JSON strings. Only keys present in the form are returned,
// so a PUT that omits them leaves stored values untouched.
const CASE_STUDY_TEXT = ["problem", "approach", "results"] as const;

const parseJson = (raw: FormDataEntryValue | null) => {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

function caseStudyFields(formData: FormData) {
  const out: Record<string, unknown> = {};
  for (const key of CASE_STUDY_TEXT) {
    if (formData.has(key)) out[key] = (formData.get(key) as string) || "";
  }
  if (formData.has("metrics")) {
    const metrics = parseJson(formData.get("metrics"));
    out.metrics = Array.isArray(metrics)
      ? metrics
          .filter((m) => m && (m.label || m.value))
          .map((m) => ({ label: String(m.label || ""), value: String(m.value || ""), hint: String(m.hint || "") }))
      : [];
  }
  if (formData.has("evaluation")) {
    const e = parseJson(formData.get("evaluation")) || {};
    out.evaluation = {
      dataset: String(e.dataset || ""),
      method: String(e.method || ""),
      results: String(e.results || ""),
      benchmarks: Array.isArray(e.benchmarks)
        ? e.benchmarks
            .filter((b: any) => b && b.name && Number.isFinite(Number(b.score)))
            .map((b: any) => ({
              name: String(b.name),
              score: Number(b.score),
              ...(b.baseline !== "" && b.baseline != null && Number.isFinite(Number(b.baseline)) && { baseline: Number(b.baseline) }),
            }))
        : [],
    };
  }
  return out;
}

// Public catalog (no drafts), served from the data cache.
const getPublicProjects = cachedPublic("projects", async () => {
  await connectToDB();
  return Project.find(PUBLISHED_PROJECT).sort({ publishDate: -1, createdAt: -1 }).lean();
});

export async function GET(req: Request  ) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");
    // Drafts only for admin screens (?all=1 + admin cookie).
    const drafts = await includeDrafts(req);
    if (!slug && !id && !drafts) return NextResponse.json({ projects: await getPublicProjects() });

    await connectToDB();
    const scope = drafts ? {} : PUBLISHED_PROJECT;

    if (slug) {
      const project = await Project.findOne({ slug, ...scope });
      return project ? NextResponse.json({ project }) : NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (id) {
      const project = id.match(/^[0-9a-fA-F]{24}$/) 
        ? await Project.findOne({ _id: id, ...scope }) 
        : await Project.findOne({ slug: id, ...scope });
      return project ? NextResponse.json({ project }) : NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const projects = await Project.find(scope).sort({ publishDate: -1, createdAt: -1 });
    return NextResponse.json({ projects: projects || [] });
  } catch (error: any) {
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const githubLink = formData.get("githubLink") as string;
    const liveLink = formData.get("liveLink") as string;
    const appLink = formData.get("appLink") as string;
    const tagsString = formData.get("tags") as string;
    const publishDate = formData.get("publishDate") as string;
    const role = formData.get("role") as string;
    const status = formData.get("status") as string;
    const frameStyle = formData.get("frameStyle") as string;
    const featured = formData.get("featured") === "true";
    const gDriveImage = formData.get("gDriveImage") as string;
    const relatedBlog = formData.get("relatedBlog") as string; // ✅ Extract
    const demoEmbed = formData.get("demoEmbed") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = "";
    if (imageFile && typeof imageFile !== "string") {
      const uploaded = await uploadToGithub(imageFile);
      if (uploaded) imageUrl = uploaded;
    }

    const newProject = await Project.create({
      title, slug, description, image: imageUrl, githubLink, liveLink, appLink,
      role, status, frameStyle, featured,
      gDriveImage: formatGDriveUrl(gDriveImage),
      relatedBlog: relatedBlog || "", // ✅ Save
      demoEmbed: demoEmbed || "",
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      tags: tagsString ? tagsString.split(",").map(t => t.trim()) : [],
      ...caseStudyFields(formData),
    });

    revalidatePublicPages();
    await audit(req, { actor: "admin", action: "project.create" });
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();
    const id = formData.get("id") as string;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const project = id.match(/^[0-9a-fA-F]{24}$/) 
      ? await Project.findById(id) 
      : await Project.findOne({ slug: id });

    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    project.title = formData.get("title") || project.title;
    project.slug = formData.get("slug") || project.slug;
    project.description = formData.get("description") || project.description;
    project.githubLink = formData.get("githubLink") || project.githubLink;
    project.liveLink = formData.get("liveLink") || project.liveLink;
    project.appLink = formData.get("appLink") || project.appLink;
    project.role = formData.get("role") || project.role;
    project.status = formData.get("status") || project.status;
    project.frameStyle = formData.get("frameStyle") || project.frameStyle;
    
    if (formData.has("featured")) project.featured = formData.get("featured") === "true";
    if (formData.has("relatedBlog")) project.relatedBlog = formData.get("relatedBlog") as string; // ✅ Update
    if (formData.has("demoEmbed")) project.demoEmbed = formData.get("demoEmbed") as string;
    
    const gDriveImage = formData.get("gDriveImage") as string;
    if (gDriveImage !== null) project.gDriveImage = formatGDriveUrl(gDriveImage);

    const publishDate = formData.get("publishDate") as string;
    if (publishDate) project.publishDate = new Date(publishDate);
    
    const tagsString = formData.get("tags") as string;
    if (tagsString) project.tags = tagsString.split(",").map((t: string) => t.trim());

    project.set(caseStudyFields(formData));

    const imageFile = formData.get("image") as File;
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      const newImageUrl = await uploadToGithub(imageFile);
      if (newImageUrl) project.image = newImageUrl;
    }

    await project.save();
    revalidatePublicPages();
    await audit(req, { actor: "admin", action: "project.update" });
    return NextResponse.json({ project }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    if (id.match(/^[0-9a-fA-F]{24}$/)) await Project.findByIdAndDelete(id);
    else await Project.findOneAndDelete({ slug: id });
    revalidatePublicPages();
    await audit(req, { actor: "admin", action: "project.delete" });
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
