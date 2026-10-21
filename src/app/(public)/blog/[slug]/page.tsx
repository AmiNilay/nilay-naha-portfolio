import type { Metadata } from "next";
import { cache } from "react";
import BlogPostClient from "./BlogPostClient";
import { connectToDB } from "@/lib/connectToDB";
import { getHeroData } from "@/lib/publicData";
import Post from "@/models/Post";

// Cached and regenerated at most once a minute; CMS saves purge it immediately
// via revalidatePublicPages().
export const revalidate = 60;

// Pre-render every existing post at build time; new slugs are rendered on
// first visit and cached (dynamicParams defaults to true).
export async function generateStaticParams() {
  try {
    await connectToDB();
    const posts = await Post.find({}, { slug: 1 }).lean();
    return posts.filter((p: any) => p.slug).map((p: any) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

// Shared by generateMetadata and the page so each render queries once.
const getPost = cache(async (slug: string) => {
  try {
    await connectToDB();
    const post = await Post.findOne({ slug }).lean();
    return post ? JSON.parse(JSON.stringify(post)) : null;
  } catch (error) {
    console.error("Metadata post lookup error:", error);
    return null;
  }
});

async function getHeroAuthor() {
  const hero = await getHeroData();
  if (!hero) return null;
  return {
    profilePic: hero.profilePic || "",
    gDriveProfilePic: hero.gDriveProfilePic || "",
  };
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

export default async function Page({ params }: { params: { slug: string } }) {
  const [initialPost, initialHero] = await Promise.all([
    getPost(params.slug),
    getHeroAuthor(),
  ]);

  return <BlogPostClient initialPost={initialPost} initialHeroAuthor={initialHero} />;
}