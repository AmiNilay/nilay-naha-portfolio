import type { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";
import { connectToDB } from "@/lib/connectToDB";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  try {
    await connectToDB();
    const post = await Post.findOne({ slug }).lean();
    return post;
  } catch (error) {
    console.error("Metadata post lookup error:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post: any = await getPost(params.slug);

  if (!post) {
    return {
      title: "Article Not Found | Nilay Naha",
      description: "This publication could not be found.",
    };
  }

  const description =
    post.excerpt ||
    (post.content
      ? post.content.replace(/<[^>]+>/g, "").slice(0, 155)
      : "Read this technical publication by Nilay Naha.");

  const coverUrl = post.coverImage || post.gDriveImage || "/og-image.png";

  return {
    title: `${post.title} | Nilay Naha`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/blog/${params.slug}`,
      publishedTime: post.publishDate || post.createdAt,
      images: [
        {
          url: coverUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [coverUrl],
    },
  };
}

export default function Page() {
  return <BlogPostClient />;
}