"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Loader2, Sparkles, Github, ExternalLink, Laptop } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerContainer";

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  tags?: string[];
  techStack?: string[] | string;
  image?: string;
  gDriveImage?: string;
  githubLink?: string;
  liveLink?: string;
  role?: string;
  frameStyle?: string;
  featured?: boolean;
}

const getCleanImageUrl = (image?: string, gDriveImage?: string) => {
  if (image && image.trim()) return image.trim();
  if (!gDriveImage || !gDriveImage.trim()) return "";
  if (gDriveImage.includes("<iframe")) return gDriveImage;
  const match = gDriveImage.match(/[-\w]{25,}/);
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000`;
  }
  return gDriveImage;
};

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) return;
        const data = await res.json();
        const allProjects: Project[] = Array.isArray(data) ? data : data.projects || [];
        if (isMounted) {
          // Prioritize featured projects, then slice top 3
          const sorted = [...allProjects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          setProjects(sorted.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load featured projects", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl h-full flex flex-col justify-center py-12">
      <AnimatedSection direction="up">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles size={12} /> Curated Showcase
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Featured Systems
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Highlighted full-stack platforms, developer utilities, and machine learning architectures.
          </p>
        </div>
      </AnimatedSection>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      )}

      {!loading && projects.length === 0 && (
        <AnimatedSection direction="fade">
          <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40">
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">No projects added yet.</p>
          </div>
        </AnimatedSection>
      )}

      <StaggerContainer
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        staggerDelay={0.1}
      >
        {projects.map((project) => {
          const displayImage = getCleanImageUrl(project.image, project.gDriveImage);
          const tags = project.tags || (typeof project.techStack === "string" ? project.techStack.split(",") : project.techStack) || [];

          return (
            <StaggerItem key={project._id}>
              <div className="group rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col h-full overflow-hidden active:scale-[0.99]">
                {/* Media frame with fitted image - No crop */}
                <Link
                  href={`/projects/${project.slug}`}
                  prefetch={true}
                  className="relative w-full aspect-[16/10] bg-zinc-100 dark:bg-zinc-950 overflow-hidden block border-b border-zinc-200/80 dark:border-zinc-800/80 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 transition-colors"
                >
                  {project.frameStyle === "Browser" && (
                    <div className="absolute top-0 left-0 w-full h-6 bg-zinc-200/80 dark:bg-zinc-900/80 backdrop-blur-sm z-20 flex items-center px-2.5 gap-1 border-b border-zinc-200 dark:border-zinc-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500/80" />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                    </div>
                  )}

                  {displayImage ? (
                    displayImage.includes("<iframe") ? (
                      <div
                        className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full pointer-events-none"
                        dangerouslySetInnerHTML={{ __html: displayImage }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3 relative">
                        {/* Ambient subtle blur to smoothly fill letterboxing */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={displayImage}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20 dark:opacity-10 scale-110 pointer-events-none select-none"
                        />
                        {/* 100% UN-CUT Fitted Image */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={displayImage}
                            alt={project.title}
                            className="w-full h-full object-contain drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-500 ease-out select-none"
                          />
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1.5">
                      <Laptop className="w-8 h-8 opacity-30" />
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Featured</span>
                    </div>
                  )}
                </Link>

                <div className="p-6 flex flex-col flex-1 space-y-3">
                  {tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link href={`/projects/${project.slug}`} prefetch={true} className="block group/link">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed flex-1">
                    {stripHtml(project.description)}
                  </p>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <Link
                      href={`/projects/${project.slug}`}
                      prefetch={true}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group/cta"
                    >
                      <span>Explore Case Study</span>
                      <ArrowUpRight size={13} className="group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform" />
                    </Link>

                    <div className="flex items-center gap-2">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-colors"
                          title="GitHub Repository"
                        >
                          <Github size={14} />
                        </a>
                      )}
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-colors"
                          title="Live Demo"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {!loading && projects.length > 0 && (
        <AnimatedSection direction="up" delay={0.2}>
          <div className="text-center mt-10">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-zinc-900 dark:border-zinc-100 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>View All Projects</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}