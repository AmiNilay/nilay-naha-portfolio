import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Post from "@/models/Post";
import { uploadToGithub, deleteFromGithub } from "@/lib/githubUpload";

// 1. GET Single Blog Post
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

// 2. PUT (Update) Blog Post
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const formData = await request.formData();
    
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("description") as string; // Check if your form sends 'description' or 'excerpt'
    const imageFile = formData.get("image") as File;
    let coverImage = formData.get("coverImage") as string; // Changed from 'existingImage' to match typical form data

    // Automated GitHub Upload
    if (imageFile && typeof imageFile !== "string" && imageFile.name !== "undefined") {
      const uploadedUrl = await uploadToGithub(imageFile);
      if (uploadedUrl) {
        // Optional: Delete old image if replacing
        // const oldPost = await Post.findById(params.id);
        // if (oldPost?.coverImage) await deleteFromGithub(oldPost.coverImage);
        
        coverImage = uploadedUrl;
      }
    }

    const updateData = {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      readTime: content ? Math.ceil(content.split(/\s+/).length / 200) : 1,
    };

    const updatedPost = await Post.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ message: "Blog post updated", post: updatedPost });

  } catch (error) {
    console.error("UPDATE Blog Error:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

// 3. DELETE Single Blog Post (FIXED)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    // STEP 1: Find the post first (so we can get the image URL)
    const postToDelete = await Post.findById(params.id);

    if (!postToDelete) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // STEP 2: Delete the Cover Image from GitHub
    if (postToDelete.coverImage && postToDelete.coverImage.includes("githubusercontent")) {
      await deleteFromGithub(postToDelete.coverImage);
    }

    // STEP 3: Delete from Database
    await Post.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Blog post and image deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Blog Error:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}