import type { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";

const SITE_URL = "https://nilay-naha-portfolio.vercel.app";

async function getPost(slug: string) {
  try {
    const res = await fetch(`${SITE_URL}/api/blog?slug=${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Article Not Found",
      description: "This blog post could not be found.",
    };
  }

  const description =
    post.excerpt ||
    (post.content ? post.content.replace(/<[^>]+>/g, "").slice(0, 155) : "Read this article by Nilay Naha.");

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/blog/${params.slug}`,
      publishedTime: post.createdAt,
      images: [
        {
          url: post.coverImage || "/og-image.png",
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
      images: [post.coverImage || "/og-image.png"],
    },
  };
}

export default function Page() {
  return <BlogPostClient />;
}