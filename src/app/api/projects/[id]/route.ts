import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Project from "@/models/Project";
import { deleteFromGithub } from "@/lib/githubUpload";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDB();
  const project = await Project.findById(params.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const body = await req.json();
    const updatedProject = await Project.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    
    // 1. Find the project first
    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Delete Images from GitHub
    if (project.images && project.images.length > 0) {
      for (const imageUrl of project.images) {
        if (imageUrl.includes("githubusercontent")) {
          await deleteFromGithub(imageUrl);
        }
      }
    }

    // 3. Delete from Database
    await Project.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Project and images deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}