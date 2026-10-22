import type { Metadata } from "next";
import { cache } from "react";
import ProjectDetailsClient from "./ProjectDetailsClient";
import { connectToDB } from "@/lib/connectToDB";
import Project from "@/models/Project";
import Post from "@/models/Post";
import { processContent } from "@/lib/markdownProcessor";

// Cached and regenerated at most once a minute; CMS saves purge it immediately
// via revalidatePublicPages().
export const revalidate = 60;

// Pre-render every existing case study at build time; new slugs are rendered
// on first visit and cached (dynamicParams defaults to true).
export async function generateStaticParams() {
  try {
    await connectToDB();
    const projects = await Project.find({}, { slug: 1 }).lean();
    return projects.filter((p: any) => p.slug).map((p: any) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

// Shared by generateMetadata and the page so each render queries once.
const getProjectWithContext = cache(async (slug: string) => {
  try {
    await connectToDB();
    const projects = await Project.find({}).sort({ publishDate: -1, createdAt: -1 }).lean();
    const allProjects: any[] = JSON.parse(JSON.stringify(projects));
    const currentIndex = allProjects.findIndex((p) => p.slug === slug);

    if (currentIndex === -1) return null;

    const currentProject = allProjects[currentIndex];
    const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
    const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

    // Process markdown on server
    const rawContent = currentProject.description || currentProject.content || "";
    const isRawHtml = /^\s*<style|^\s*<div|^\s*<h[1-6]|^\s*<p|^\s*<table/i.test(rawContent);
    const processedHTML = isRawHtml ? rawContent : await processContent(rawContent);

    // Case-study / evaluation markdown, rendered server-side like the description.
    const md = async (s?: string) => (s && s.trim() ? processContent(s) : "");
    const caseStudyHTML = {
      problem: await md(currentProject.problem),
      approach: await md(currentProject.approach),
      results: await md(currentProject.results),
      evaluation: await md(currentProject.evaluation?.results),
    };

    // Fetch linked blog if exists
    let linkedBlog = null;
    if (currentProject.relatedBlog) {
      try {
        const post = await Post.findById(currentProject.relatedBlog).lean();
        if (post) linkedBlog = JSON.parse(JSON.stringify(post));
      } catch {}
    }

    return {
      project: currentProject,
      prevProject,
      nextProject,
      processedHTML,
      caseStudyHTML,
      linkedBlog,
    };
  } catch (error) {
    console.error("Project lookup error:", error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const result = await getProjectWithContext(params.slug);
  const project = result?.project;

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

export default async function Page({ params }: { params: { slug: string } }) {
  const projectData = await getProjectWithContext(params.slug);
  return <ProjectDetailsClient initialData={projectData} />;
}