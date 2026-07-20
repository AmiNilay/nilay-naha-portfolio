import type { Metadata } from "next";
import ProjectDetailsClient from "./ProjectDetailsClient";

const SITE_URL = "https://nilay-naha-portfolio.vercel.app";

async function getProject(slug: string) {
  try {
    const res = await fetch(`${SITE_URL}/api/projects?slug=${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.project || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProject(params.slug);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "This project could not be found.",
    };
  }

  const description = project.description
    ? project.description.replace(/<[^>]+>/g, "").slice(0, 155)
    : `Learn about ${project.title} by Nilay Naha.`;

  return {
    title: project.title,
    description,
    openGraph: {
      title: project.title,
      description,
      type: "article",
      url: `/projects/${params.slug}`,
      images: [
        {
          url: project.image || "/og-image.png",
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [project.image || "/og-image.png"],
    },
  };
}

export default function Page() {
  return <ProjectDetailsClient />;
}