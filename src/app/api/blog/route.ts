import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Post from "@/models/Post";
import { uploadToGithub } from "@/lib/githubUpload";

// 1. GET
export async function GET(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (id) {
      const post = await Post.findById(id);
      return post ? NextResponse.json({ post }) : NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (slug) {
      const post = await Post.findOne({ slug });
      return post ? NextResponse.json({ post }) : NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const posts = await Post.find().sort({ publishDate: -1, createdAt: -1 });
    return NextResponse.json({ posts: posts || [] });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

// 2. POST (Create)
export async function POST(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const publishDate = formData.get("publishDate") as string; // 🟢 Get Date
    const imageFile = formData.get("image") as File;

    let coverImage = "";
    if (imageFile && typeof imageFile !== "string" && imageFile.name !== "undefined") {
      const uploadedUrl = await uploadToGithub(imageFile);
      if (uploadedUrl) coverImage = uploadedUrl;
    }

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Title, Slug, and Content are required" }, { status: 400 });
    }

    const newPost = await Post.create({
      title, slug, excerpt, content, coverImage,
      publishDate: publishDate ? new Date(publishDate) : new Date(), // 🟢 Save Date
      readTime: Math.ceil(content.split(/\s+/).length / 200) || 5,
    });

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: "Slug already exists." }, { status: 400 });
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}

// 3. PUT (Update) - 🟢 Added missing PUT route for Blog Editor
export async function PUT(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();
    const id = formData.get("id") as string;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    post.title = formData.get("title") || post.title;
    post.slug = formData.get("slug") || post.slug;
    post.excerpt = formData.get("excerpt") || post.excerpt;
    post.content = formData.get("content") || post.content;

    const publishDate = formData.get("publishDate") as string;
    if (publishDate) post.publishDate = new Date(publishDate); // 🟢 Update Date

    const imageFile = formData.get("image") as File;
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      const newImageUrl = await uploadToGithub(imageFile);
      if (newImageUrl) post.coverImage = newImageUrl;
    }

    await post.save();
    return NextResponse.json({ post }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. DELETE
export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await Post.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}