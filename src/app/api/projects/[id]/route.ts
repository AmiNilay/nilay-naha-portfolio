import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Project from "@/models/Project";
import { uploadToGithub } from "@/lib/githubUpload";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const formData = await req.formData();
    
    const imageFile = formData.get("image") as File;
    let imageUrl = formData.get("existingImage") as string;

    // If a new image file was sent, upload it to GitHub
    if (imageFile && typeof imageFile !== "string") {
      const uploadedUrl = await uploadToGithub(imageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const updatedData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      githubLink: formData.get("githubLink"),
      liveLink: formData.get("liveLink"),
      tags: (formData.get("tags") as string)?.split(",").map(t => t.trim()) || [],
      image: imageUrl,
    };

    const updatedProject = await Project.findByIdAndUpdate(params.id, updatedData, { new: true });
    
    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}