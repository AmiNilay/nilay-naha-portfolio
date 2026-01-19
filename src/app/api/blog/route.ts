import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Post from "@/models/Post";
import { uploadToGithub } from "@/lib/githubUpload";

// 1. GET: Fetch Blogs (All, Single by ID, or Single by Slug)
export async function GET(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    // Case A: Fetch single post by ID (Used in Admin Edit)
    if (id) {
      const post = await Post.findById(id);
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ post });
    }

    // Case B: Fetch single post by Slug (Used in Public Blog)
    if (slug) {
      const post = await Post.findOne({ slug });
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ post });
    }

    // Case C: Fetch ALL posts (Sorted by newest)
    const posts = await Post.find().sort({ createdAt: -1 });
    // Always return an object with a 'posts' array, even if empty
    return NextResponse.json({ posts: posts || [] });

  } catch (error: any) {
    console.error("BLOG GET Error:", error);
    // CRITICAL FIX: Return JSON error instead of crashing
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}

// 2. POST: Create New Blog Post (With GitHub Image Support)
export async function POST(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File;

    let coverImage = "";

    // Automated GitHub Upload
    if (imageFile && typeof imageFile !== "string" && imageFile.name !== "undefined") {
      const uploadedUrl = await uploadToGithub(imageFile);
      if (uploadedUrl) coverImage = uploadedUrl;
    }

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, Slug, and Content are required" }, 
        { status: 400 }
      );
    }

    const newPost = await Post.create({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      readTime: Math.ceil(content.split(/\s+/).length / 200) || 5,
    });

    return NextResponse.json({ post: newPost }, { status: 201 });

  } catch (error: any) {
    console.error("BLOG POST Error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug already exists. Choose a unique one." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}

// 3. DELETE: Remove Blog Post
export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const deleted = await Post.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}