import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Project from "@/models/Project";
import { uploadToGithub } from "@/lib/githubUpload";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const formatGDriveUrl = (url: string | null) => {
  if (!url) return "";
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
};

export async function GET(req: Request  ) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (slug) {
      const project = await Project.findOne({ slug });
      return project ? NextResponse.json({ project }) : NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (id) {
      const project = id.match(/^[0-9a-fA-F]{24}$/) 
        ? await Project.findById(id) 
        : await Project.findOne({ slug: id });
      return project ? NextResponse.json({ project }) : NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const projects = await Project.find().sort({ publishDate: -1, createdAt: -1 });
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
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      tags: tagsString ? tagsString.split(",").map(t => t.trim()) : []
    });

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
    
    const gDriveImage = formData.get("gDriveImage") as string;
    if (gDriveImage !== null) project.gDriveImage = formatGDriveUrl(gDriveImage);

    const publishDate = formData.get("publishDate") as string;
    if (publishDate) project.publishDate = new Date(publishDate);
    
    const tagsString = formData.get("tags") as string;
    if (tagsString) project.tags = tagsString.split(",").map((t: string) => t.trim());

    const imageFile = formData.get("image") as File;
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      const newImageUrl = await uploadToGithub(imageFile);
      if (newImageUrl) project.image = newImageUrl;
    }

    await project.save();
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
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
