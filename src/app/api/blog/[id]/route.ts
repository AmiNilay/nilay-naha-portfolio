import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Post from "@/models/Post";
import { uploadToGithub } from "@/lib/githubUpload";

// 1. GET Single Blog Post by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const post = await Post.findById(params.id);

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("GET Blog Error:", error);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}

// 2. PUT (Update) Blog Post with GitHub Image Automation
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    
    // Using formData to handle potential image file uploads
    const formData = await request.formData();
    
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const imageFile = formData.get("image") as File;
    let coverImage = formData.get("existingImage") as string;

    // Automated GitHub Upload for new images
    // If a file is provided and it's not a string (existing URL)
    if (imageFile && typeof imageFile !== "string" && imageFile.name !== "undefined") {
      const uploadedUrl = await uploadToGithub(imageFile);
      if (uploadedUrl) {
        coverImage = uploadedUrl;
      }
    }

    // Prepare update data
    const updateData = {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      // Recalculate read time based on new content length
      readTime: content ? Math.ceil(content.split(/\s+/).length / 200) : 1,
    };

    const updatedPost = await Post.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Blog post updated successfully", 
      post: updatedPost 
    }, { status: 200 });

  } catch (error) {
    console.error("UPDATE Blog Error:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

// 3. DELETE Single Blog Post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const deletedPost = await Post.findByIdAndDelete(params.id);

    if (!deletedPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog post deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Blog Error:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}