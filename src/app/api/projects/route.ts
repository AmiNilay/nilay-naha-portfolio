import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Project from "@/models/Project";
import { uploadToGithub } from "@/lib/githubUpload";

// 1. GET: Fetch Projects
export async function GET(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (slug) {
      const project = await Project.findOne({ slug });
      return project 
        ? NextResponse.json({ project }) 
        : NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (id) {
      const project = await Project.findById(id);
      return project 
        ? NextResponse.json({ project }) 
        : NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projects = await Project.find().sort({ createdAt: -1 });
    return NextResponse.json({ projects: projects || [] });

  } catch (error: any) {
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}

// 2. POST: Create New Project
export async function POST(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();
    
    // Extract fields
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const githubLink = formData.get("githubLink") as string;
    const liveLink = formData.get("liveLink") as string;
    const tagsString = formData.get("tags") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = "";
    if (imageFile && typeof imageFile !== "string") {
      imageUrl = await uploadToGithub(imageFile) || "";
    }

    const newProject = await Project.create({
      title, slug, description, image: imageUrl, githubLink, liveLink,
      tags: tagsString ? tagsString.split(",").map(t => t.trim()) : []
    });

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create", details: error.message }, { status: 500 });
  }
}

// 3. PUT: Update Existing Project (THIS WAS MISSING)
export async function PUT(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();
    
    const id = formData.get("id") as string;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Update Text Fields
    project.title = formData.get("title") || project.title;
    project.slug = formData.get("slug") || project.slug;
    project.description = formData.get("description") || project.description;
    project.githubLink = formData.get("githubLink") || project.githubLink;
    project.liveLink = formData.get("liveLink") || project.liveLink;

    const tagsString = formData.get("tags") as string;
    if (tagsString) {
      project.tags = tagsString.split(",").map((t: string) => t.trim());
    }

    // Handle Image Update (Only if a new file is sent)
    const imageFile = formData.get("image") as File;
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      const newImageUrl = await uploadToGithub(imageFile);
      if (newImageUrl) project.image = newImageUrl;
    }

    await project.save();
    return NextResponse.json({ project }, { status: 200 });

  } catch (error: any) {
    console.error("PUT ERROR:", error);
    return NextResponse.json({ error: "Update failed", details: error.message }, { status: 500 });
  }
}

// 4. DELETE: Remove Project
export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await Project.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Delete failed", details: error.message }, { status: 500 });
  }
}