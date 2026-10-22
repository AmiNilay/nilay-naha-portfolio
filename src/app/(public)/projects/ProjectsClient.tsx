"use client";

import { useState, useEffect, useMemo } from "react";
import { driveImageUrl } from "@/lib/driveMedia";
import Link from "next/link";
import { fetchWithSessionCache } from "@/lib/clientCache";
import { 
  Loader2, ArrowRight, ArrowUpRight, Github, ExternalLink, 
  Search, X, Layers, Sparkles, Monitor, Calendar, Laptop
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  gDriveImage?: string;
  githubLink?: string;
  liveLink?: string;
  appLink?: string;
  role?: string;
  status?: string;
  featured?: boolean;
  frameStyle?: string;
  publishDate?: string;
  createdAt?: string;
  tags?: string[];
  techStack?: string[] | string;
}

// Apple WWDC critically damped spring
const appleSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 32,
};

// Safe image resolver supporting direct GitHub URLs and Google Drive thumbnails
export const getCleanImageUrl = (image?: string, gDriveImage?: string) => {
  if (image && image.trim()) return image.trim();
  if (!gDriveImage || !gDriveImage.trim()) return "";
  if (gDriveImage.includes("<iframe")) return gDriveImage;
  return driveImageUrl(gDriveImage, 1600);
};

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const data = await fetchWithSessionCache<{ projects: Project[] }>("projects_catalog", "/api/projects");
        if (isMounted) {
          setProjects(data.projects || []);
        }
      } catch (err) {
        console.error("Fetch projects failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const stripHtml = (html: string) => {
    if (!html) return "";
    let text = html;
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<\/(p|div|h[1-6]|li|ul|ol|table|tr|td|th)>/gi, " ");
    text = text.replace(/<br\s*\/?>/gi, " ");
    text = text.replace(/<[^>]*>?/gm, "");
    text = text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    text = text.replace(/\s+/g, " ").trim();
    return text;
  };

  // Extract unique tags and build intelligent filter categories
  const filterTabs = useMemo(() => {
    const counts: Record<string, number> = { All: projects.length };
    
    projects.forEach((p) => {
      const tags = p.tags || (typeof p.techStack === "string" ? p.techStack.split(",") : p.techStack) || [];
      tags.forEach((t) => {
        const clean = t.trim();
        if (!clean) return;
        counts[clean] = (counts[clean] || 0) + 1;
      });
    });

    const popularTags = Object.entries(counts)
      .filter(([k]) => k !== "All")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k]) => k);

    return ["All", ...popularTags];
  }, [projects]);

  // Filtered list based on search and selected tab
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const plainTextDesc = stripHtml(p.description);
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plainTextDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.role && p.role.toLowerCase().includes(searchQuery.toLowerCase()));

      const pTags = p.tags || (typeof p.techStack === "string" ? p.techStack.split(",") : p.techStack) || [];
      const matchesFilter =
        activeFilter === "All" ||
        pTags.some((t: string) => t.trim().toLowerCase() === activeFilter.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [projects, searchQuery, activeFilter]);

  // Primary featured showcase (first featured project or first project)
  const featuredProject = useMemo(() => {
    return projects.find((p) => p.featured) || (projects.length > 0 ? projects[0] : null);
  }, [projects]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        <span className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
          Loading Portfolio Case Studies...
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-7xl space-y-16">
      
      {/* HEADER SECTION */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                Works & Architecture Showcase
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {projects.length} Total Deliverables
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Selected Projects
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              An engineering archive of full-stack web platforms, machine learning systems, distributed backend tools, and interactive case studies.
            </p>
          </div>

          {/* SPOTLIGHT SEARCH INPUT */}
          <div className="relative w-full md:w-80 shrink-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 text-zinc-400 dark:text-zinc-500 w-4 h-4 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search systems, stack, role..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors"
                  title="Clear Search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SEGMENTED FILTER PILLS (Apple Recessed Segmented Track) */}
        {filterTabs.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 overflow-x-auto no-scrollbar w-fit max-w-full">
            {filterTabs.map((tab) => {
              const isActive = activeFilter.toLowerCase() === tab.toLowerCase();
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`relative px-4 py-2 rounded-xl text-xs select-none transition-all duration-200 whitespace-nowrap active:scale-95 ${
                    isActive
                      ? "text-zinc-950 dark:text-white font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-semibold"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="projectActiveFilter"
                      className="absolute inset-0 rounded-xl bg-white dark:bg-zinc-700 border border-zinc-200/90 dark:border-zinc-600/90 shadow-sm z-0"
                      transition={appleSpring}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FEATURED MARQUEE HERO SPOTLIGHT */}
      {!searchQuery && activeFilter === "All" && featuredProject && (() => {
        const featuredImg = getCleanImageUrl(featuredProject.image, featuredProject.gDriveImage);
        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={appleSpring}
            className="relative rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl overflow-hidden group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
              {/* Left Column: Narrative Details */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      <Sparkles size={12} /> Spotlight Case Study
                    </span>
                    {featuredProject.role && (
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                        • {featuredProject.role}
                      </span>
                    )}
                  </div>
                  <Link href={`/projects/${featuredProject.slug}`}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {featuredProject.title}
                    </h2>
                  </Link>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                    {stripHtml(featuredProject.description)}
                  </p>
                </div>

                {/* Technologies */}
                {featuredProject.tags && featuredProject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {featuredProject.tags.slice(0, 5).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons with High Dual-Mode Contrast */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`/projects/${featuredProject.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-md active:scale-[0.98] transition-all"
                  >
                    <span>Explore Case Study</span>
                    <ArrowRight size={14} />
                  </Link>

                  {featuredProject.liveLink && (
                    <a
                      href={featuredProject.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-xs active:scale-[0.98] transition-all"
                    >
                      <ExternalLink size={13} /> Live Preview
                    </a>
                  )}

                  {featuredProject.githubLink && (
                    <a
                      href={featuredProject.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-xs active:scale-[0.98] transition-all"
                      title="Source Repository"
                    >
                      <Github size={15} />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Visual Frame with 100% UN-CUT Fitted Image */}
              <div className="lg:col-span-7">
                <Link href={`/projects/${featuredProject.slug}`} prefetch={true} className="block">
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
                    {/* macOS Browser Header */}
                    <div className="h-8 bg-zinc-200/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700/60 flex items-center px-3 gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <div className="mx-auto text-[10px] font-mono text-zinc-600 dark:text-zinc-400 px-3 py-0.5 bg-white/70 dark:bg-zinc-900/70 rounded-md truncate max-w-[240px]">
                        {featuredProject.liveLink || "https://case-study.nilaynaha.dev"}
                      </div>
                    </div>

                    {/* Fitted Image Stage - Fits ANY aspect ratio without cut */}
                    <div className="relative h-[280px] sm:h-[340px] md:h-[380px] w-full bg-zinc-100/90 dark:bg-zinc-950/90 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
                      {featuredImg ? (
                        featuredImg.includes("<iframe") ? (
                          <div
                            className="w-full aspect-[16/9] [&>iframe]:w-full [&>iframe]:h-full pointer-events-none"
                            dangerouslySetInnerHTML={{ __html: featuredImg }}
                          />
                        ) : (
                          <>
                            {/* Ambient soft glow backdrop */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={featuredImg}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 dark:opacity-15 scale-110 pointer-events-none select-none"
                            />
                            {/* Crisp Fitted Foreground - Never cut */}
                            <div className="relative z-10 w-full h-full flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={featuredImg}
                                alt={featuredProject.title}
                                className="w-full h-full object-contain rounded-xl drop-shadow-md group-hover:scale-[1.02] transition-transform duration-500 ease-out select-none"
                              />
                            </div>
                          </>
                        )
                      ) : (
                        <div className="w-full h-48 flex flex-col items-center justify-center text-zinc-400 gap-2">
                          <Monitor className="w-10 h-10 opacity-30" />
                          <span className="text-xs font-semibold">Interactive Prototype</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* ALL PROJECTS GRID */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {activeFilter === "All" ? "All Engineering Archives" : `${activeFilter} Deliverables`}
          </h2>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Showing {filteredProjects.length} of {projects.length}
          </span>
        </div>

        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-16 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Search size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No matching projects found</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                No case studies matched your filter criteria or search query. Try searching for different keywords or reset filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-colors shadow-sm"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence>
              {filteredProjects.map((project, idx) => {
                const plainTextDesc = stripHtml(project.description);
                const tags = project.tags || (typeof project.techStack === "string" ? project.techStack.split(",") : project.techStack) || [];
                const displayTags = tags.slice(0, 3);
                const displayImage = getCleanImageUrl(project.image, project.gDriveImage);

                return (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ ...appleSpring, delay: idx * 0.04 }}
                    className="flex flex-col h-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 group overflow-hidden active:scale-[0.99]"
                  >
                    {/* Visual Media Frame with Fitted Aspect Ratio (No Cut) */}
                    <Link
                      href={`/projects/${project.slug}`}
                      prefetch={true}
                      className="relative w-full aspect-[16/10] bg-zinc-100 dark:bg-zinc-950 overflow-hidden block border-b border-zinc-200/80 dark:border-zinc-800/80 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 transition-colors"
                    >
                      {/* Mini Window Controls if FrameStyle is Browser */}
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
                          <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 relative">
                            {/* Ambient blurred backdrop for letterboxing */}
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
                          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Case Study</span>
                        </div>
                      )}
                    </Link>

                    {/* Content Body */}
                    <div className="p-6 flex flex-col flex-1 space-y-4">
                      {/* Meta chips */}
                      <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1 font-semibold">
                          <Calendar size={11} />
                          {project.publishDate 
                            ? new Date(project.publishDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                            : "Archived"}
                        </span>
                        {project.role && (
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold truncate max-w-[140px] border border-zinc-200/80 dark:border-zinc-700/80">
                            {project.role}
                          </span>
                        )}
                      </div>

                      <Link href={`/projects/${project.slug}`} className="block group/title">
                        <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3 flex-1">
                        {plainTextDesc || "Detailed architectural case study and source analysis."}
                      </p>

                      {/* Tags */}
                      {displayTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {displayTags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <Link
                          href={`/projects/${project.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group/cta"
                        >
                          <span>Read Case Study</span>
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
