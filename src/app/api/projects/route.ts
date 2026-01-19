import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Project from "@/models/Project";
import { uploadToGithub } from "@/lib/githubUpload";

// 1. GET: Fetch All Projects or a Single Project by Slug
export async function GET(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    // Case A: Fetch by Slug (Used for Public Details Page)
    if (slug) {
      const project = await Project.findOne({ slug });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json({ project });
    }

    // Case B: Fetch by ID (Used for Admin Editing)
    if (id) {
      const project = await Project.findById(id);
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json({ project });
    }

    // Case C: Fetch All Projects (Sorted by newest)
    const projects = await Project.find().sort({ createdAt: -1 });
    return NextResponse.json({ projects: projects || [] });

  } catch (error: any) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}

// 2. POST: Create a New Project with GitHub Image Upload
export async function POST(req: Request) {
  try {
    await connectToDB();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const githubLink = formData.get("githubLink") as string;
    const liveLink = formData.get("liveLink") as string;
    const tagsString = formData.get("tags") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = "";

    // Automated GitHub Upload if an image is provided
    if (imageFile && imageFile.name !== "undefined" && typeof imageFile !== "string") {
      const uploadedUrl = await uploadToGithub(imageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    if (!title || !description || !slug) {
      return NextResponse.json({ error: "Required fields missing: Title, Description, or Slug" }, { status: 400 });
    }

    const tags = tagsString ? tagsString.split(",").map(t => t.trim()) : [];

    const newProject = await Project.create({
      title,
      slug,
      description,
      image: imageUrl, 
      githubLink,
      liveLink,
      tags
    });

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error: any) {
    console.error("POST ERROR:", error);
    
    // Handle Duplicate Slug Error (MongoDB Error Code 11000)
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug already exists. Please choose a unique URL name." }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to save project", details: error.message }, { status: 500 });
  }
}

// 3. DELETE: Remove a Project by ID
export async function DELETE(req: Request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete project", details: error.message }, { status: 500 });
  }
}