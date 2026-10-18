import type { Metadata } from "next";
import ProjectDetailsClient from "./ProjectDetailsClient";
import { connectToDB } from "@/lib/connectToDB";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

async function getProject(slug: string) {
  try {
    await connectToDB();
    const project = await Project.findOne({ slug }).lean();
    return project;
  } catch (error) {
    console.error("Project lookup error:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project: any = await getProject(params.slug);

  if (!project) {
    return {
      title: "Project Not Found | Nilay Naha",
      description: "The requested case study could not be found.",
    };
  }

  const description = project.description
    ? project.description.replace(/<[^>]+>/g, "").slice(0, 160)
    : `Explore the architecture and engineering behind ${project.title} by Nilay Naha.`;

  const coverUrl = project.image || project.gDriveImage || "/og-image.png";

  return {
    title: `${project.title} — Case Study | Nilay Naha`,
    description,
    openGraph: {
      title: `${project.title} — Engineering Case Study`,
      description,
      type: "article",
      url: `/projects/${params.slug}`,
      publishedTime: project.publishDate || project.createdAt,
      images: [
        {
          url: coverUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Nilay Naha`,
      description,
      images: [coverUrl],
    },
  };
}

export default function Page() {
  return <ProjectDetailsClient />;
}