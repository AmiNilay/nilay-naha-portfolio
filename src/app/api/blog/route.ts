import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import { revalidatePublicPages } from "@/lib/revalidate";
import { cachedPublic } from "@/lib/publicCache";
import { audit } from "@/lib/audit";
import Post from "@/models/Post";
import { uploadToGithub } from "@/lib/githubUpload";
import { driveImageUrl } from "@/lib/driveMedia";
import { includeDrafts, PUBLISHED_POST } from "@/lib/visibility";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Drive share links → lh3 image URLs (deprecated uc?export=view no longer renders).
const formatGDriveUrl = (url: string | null) => (url ? driveImageUrl(url) : "");

// Public post list, served from the data cache. Omits the full article body —
// list views only need the card fields (fetch ?slug= / ?id= for content).
const getPublicPosts = cachedPublic("posts", async () => {
  await connectToDB();
  return Post.find(PUBLISHED_POST).select("-content").sort({ publishDate: -1, createdAt: -1 }).lean();
});

export async function GET(req: Request  ) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    // Drafts only for admin screens (?all=1 + admin cookie).
    const drafts = await includeDrafts(req);
    if (!id && !slug && !drafts) return NextResponse.json({ posts: await getPublicPosts() });

    await connectToDB();
    const scope = drafts ? {} : PUBLISHED_POST;

    if (id) {
      const post = /^[0-9a-fA-F]{24}$/.test(id) ? await Post.findOne({ _id: id, ...scope }) : null;
      return post ? NextResponse.json({ post }) : NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (slug) {
      const post = await Post.findOne({ slug, ...scope });
      return post ? NextResponse.json({ post }) : NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const posts = await Post.find(scope).sort({ publishDate: -1, createdAt: -1 });
    return NextResponse.json({ posts: posts || [] });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const publishDate = formData.get("publishDate") as string;
    const gDriveImage = formData.get("gDriveImage") as string;
    const relatedProject = formData.get("relatedProject") as string; // ✅ Extract
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
      gDriveImage: formatGDriveUrl(gDriveImage),
      relatedProject: relatedProject || "", // ✅ Save
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      readTime: Math.ceil(content.split(/\s+/).length / 200) || 5,
    });

    revalidatePublicPages();
    await audit(req, { actor: "admin", action: "post.create" });
    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) return NextResponse.json({ error: "Slug already exists." }, { status: 400 });
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}

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

    if (formData.has("relatedProject")) post.relatedProject = formData.get("relatedProject") as string; // ✅ Update

    const gDriveImage = formData.get("gDriveImage") as string;
    if (gDriveImage !== null) post.gDriveImage = formatGDriveUrl(gDriveImage);

    const publishDate = formData.get("publishDate") as string;
    if (publishDate) post.publishDate = new Date(publishDate);

    const imageFile = formData.get("image") as File;
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      const newImageUrl = await uploadToGithub(imageFile);
      if (newImageUrl) post.coverImage = newImageUrl;
    }

    await post.save();
    revalidatePublicPages();
    await audit(req, { actor: "admin", action: "post.update" });
    return NextResponse.json({ post }, { status: 200 });
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
    await Post.findByIdAndDelete(id);

    revalidatePublicPages();
    await audit(req, { actor: "admin", action: "post.delete" });
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
