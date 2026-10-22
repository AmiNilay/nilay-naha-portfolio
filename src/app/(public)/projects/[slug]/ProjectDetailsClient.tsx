"use client";

import { useState, useEffect, useCallback } from "react";
import { driveImageUrl } from "@/lib/driveMedia";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Github, ExternalLink, 
  Loader2, Download, Calendar, Share2, Twitter, Linkedin, 
  Copy, Check, Layers, AlertTriangle, RefreshCw, Maximize2, 
  Minimize2, Monitor, Sparkles, BookOpen, Clock, FileCode,
  ShieldCheck, CheckCircle2, ChevronRight
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TableOfContents from "@/components/blog/TableOfContents";
import { motion, AnimatePresence } from "framer-motion";
import ProjectDemo from "@/components/projects/ProjectDemo";
import ProjectCaseStudy, {
  type CaseStudyHTML,
  type ProjectEvaluation,
  type ProjectMetric,
} from "@/components/projects/ProjectCaseStudy";

// Apple WWDC critically damped spring
const appleSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
};

// Safe image resolver supporting direct GitHub URLs and Google Drive thumbnails
export const getCleanImageUrl = (image?: string, gDriveImage?: string) => {
  if (image && image.trim()) return image.trim();
  if (!gDriveImage || !gDriveImage.trim()) return "";
  if (gDriveImage.includes("<iframe")) return gDriveImage;
  return driveImageUrl(gDriveImage, 1600);
};

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
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
  relatedBlog?: string;
  demoEmbed?: string;
  tags?: string[];
  metrics?: ProjectMetric[];
  evaluation?: ProjectEvaluation;
  techStack?: string[] | string;
}

interface LinkedBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  gDriveImage?: string;
  readTime?: number | string;
}

interface ProjectDetailsClientProps {
  initialData?: {
    project: Project;
    prevProject: Project | null;
    nextProject: Project | null;
    processedHTML: string;
    caseStudyHTML?: CaseStudyHTML;
    linkedBlog: LinkedBlog | null;
  } | null;
}

export default function ProjectDetailsClient({ initialData = null }: ProjectDetailsClientProps) {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [project, setProject] = useState<Project | null>(initialData?.project || null);
  const [prevProject, setPrevProject] = useState<Project | null>(initialData?.prevProject || null);
  const [nextProject, setNextProject] = useState<Project | null>(initialData?.nextProject || null);
  const [linkedBlog, setLinkedBlog] = useState<LinkedBlog | null>(initialData?.linkedBlog || null);
  const [processedHTML, setProcessedHTML] = useState(initialData?.processedHTML || "");
  const [loading, setLoading] = useState(!initialData?.project);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copied, setCopied] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showNavDock, setShowNavDock] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  // Fetch project data if not already provided by server
  const fetchProjectData = useCallback(async () => {
    if (!slug || initialData?.project) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects`);
      if (!res.ok) throw new Error("Failed to load project database");
      
      const data = await res.json();
      const projects: Project[] = data.projects || [];
      const currentIndex = projects.findIndex((p) => p.slug === slug);

      if (currentIndex !== -1) {
        const currentProject = projects[currentIndex];
        setProject(currentProject);
        setPrevProject(currentIndex > 0 ? projects[currentIndex - 1] : null);
        setNextProject(currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null);

        // Fallback path (server-side rendering normally already supplies
        // `initialData.processedHTML` for every request — this only runs if
        // that's missing). Markdown-to-HTML processing (unified/remark/
        // rehype/katex/highlight.js) is deliberately kept server-only: that
        // pipeline is large (~100KB+) and must never ship in this client
        // bundle, so raw content is shown as-is here rather than reprocessed
        // in the browser.
        const rawContent = currentProject.description || currentProject.content || "";
        setProcessedHTML(rawContent);

        // Fetch linked blog publication if available
        if (currentProject.relatedBlog) {
          fetch(`/api/blog?id=${currentProject.relatedBlog}`)
            .then((r) => r.json())
            .then((bData) => {
              if (bData.post) setLinkedBlog(bData.post);
            })
            .catch((err) => console.error("Linked blog lookup failed:", err));
        }
      } else {
        setProject(null);
      }
    } catch (err: any) {
      console.error("Error loading project:", err);
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setError("Network connection offline. Please check your internet connection.");
      } else {
        setError("Unable to load case study. The server might be momentarily unavailable.");
      }
    } finally {
      setLoading(false);
    }
  }, [slug, initialData?.project]);

  useEffect(() => {
    if (!initialData?.project) {
      fetchProjectData();
    } else {
      setLoading(false);
    }
  }, [fetchProjectData, initialData?.project]);

  // Heading slug injection for TableOfContents
  useEffect(() => {
    if (!processedHTML) return;
    const timer = setTimeout(() => {
      const container = document.querySelector(".project-content");
      if (!container) return;
      const headings = container.querySelectorAll("h2, h3, h4");
      headings.forEach((el, i) => {
        if (!el.id) {
          const headingSlug = (el.textContent || `section-${i}`)
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
          el.id = headingSlug;
        }
      });
      setContentReady(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [processedHTML]);

  // Scroll listener for sticky floating top action bar
  useEffect(() => {
    const handleScroll = () => {
      setShowNavDock(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhance code blocks with macOS Terminal headers & one-click copy buttons
  useEffect(() => {
    if (!processedHTML) return;

    const preElements = document.querySelectorAll(".project-content pre");
    preElements.forEach((preNode) => {
      const pre = preNode as HTMLElement;

      if (pre.querySelector(".mac-code-header")) return;

      pre.style.position = "relative";
      pre.classList.add("group", "pt-10", "rounded-2xl", "overflow-hidden");

      // macOS Window Header
      const headerBar = document.createElement("div");
      headerBar.className =
        "mac-code-header absolute top-0 left-0 right-0 h-9 px-4 bg-zinc-900/90 dark:bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between select-none z-10";

      // Traffic Light Dots
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "flex items-center gap-1.5 pointer-events-none";

      const redDot = document.createElement("div");
      redDot.className = "w-2.5 h-2.5 rounded-full bg-rose-500/80";
      const yellowDot = document.createElement("div");
      yellowDot.className = "w-2.5 h-2.5 rounded-full bg-amber-500/80";
      const greenDot = document.createElement("div");
      greenDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500/80";

      dotsContainer.appendChild(redDot);
      dotsContainer.appendChild(yellowDot);
      dotsContainer.appendChild(greenDot);

      // Terminal label
      const terminalLabel = document.createElement("span");
      terminalLabel.className = "text-[11px] font-mono text-zinc-400 font-medium";
      const codeElement = pre.querySelector("code");
      const langClass = codeElement?.className.match(/language-(\w+)/);
      terminalLabel.textContent = langClass ? langClass[1] : "bash";

      // Copy Action Button
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className =
        "px-2 py-0.5 rounded-md text-[11px] font-medium text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition-colors pointer-events-auto cursor-pointer";
      copyBtn.textContent = "Copy";

      copyBtn.onclick = (e) => {
        e.stopPropagation();
        const codeText = pre.querySelector("code")?.innerText || pre.innerText;
        navigator.clipboard.writeText(codeText).then(() => {
          copyBtn.textContent = "Copied!";
          copyBtn.classList.add("text-emerald-400");
          setTimeout(() => {
            copyBtn.textContent = "Copy";
            copyBtn.classList.remove("text-emerald-400");
          }, 2000);
        });
      };

      headerBar.appendChild(dotsContainer);
      headerBar.appendChild(terminalLabel);
      headerBar.appendChild(copyBtn);

      pre.insertBefore(headerBar, pre.firstChild);
    });
  }, [processedHTML]);

  // Social and Clipboard Sharing
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setToast({ message: "Case study link copied to clipboard!", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast({ message: "Failed to copy link.", type: "error" });
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Architecture & Case Study: ${project?.title}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "width=600,height=500");
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "width=600,height=500");
  };

  // Keyboard shortcut listener (Esc exits Focus Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusMode) {
        setFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusMode]);

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-6 shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
          Unable to Load Case Study
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
          {error}
        </p>
        <button 
          onClick={fetchProjectData} 
          className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Reload Case Study
        </button>
      </div>
    );
  }

  // ==========================================
  // SKELETON LOADER (Apple Tactile Hierarchy)
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen pb-20 pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Pill Skeleton */}
        <div className="w-32 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.04] dark:via-white/[0.08] to-transparent animate-apple-shimmer" />
        </div>

        {/* Header Metadata Stage */}
        <div className="space-y-4">
          <div className="w-3/4 h-11 rounded-2xl bg-black/[0.05] dark:bg-white/[0.06] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.04] dark:via-white/[0.08] to-transparent animate-apple-shimmer" />
          </div>
          <div className="w-1/2 h-5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.04] dark:via-white/[0.08] to-transparent animate-apple-shimmer" />
          </div>
        </div>

        {/* Hero Media Stage Skeleton with Apple Rounded Glass Frame */}
        <div className="w-full aspect-[16/9] max-h-[460px] rounded-3xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] border-t-white/80 dark:border-t-white/15 shadow-sm relative overflow-hidden flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-zinc-400">
            <Layers className="w-6 h-6 stroke-1" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.03] dark:via-white/[0.06] to-transparent animate-apple-shimmer" />
        </div>

        {/* Content Lines */}
        <div className="space-y-3 pt-4 max-w-3xl">
          <div className="w-full h-4 rounded-lg bg-black/[0.04] dark:bg-white/[0.04]" />
          <div className="w-5/6 h-4 rounded-lg bg-black/[0.04] dark:bg-white/[0.04]" />
          <div className="w-4/6 h-4 rounded-lg bg-black/[0.04] dark:bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  // ==========================================
  // NOT FOUND STATE
  // ==========================================
  if (!project) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-14 h-14 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
          <Layers size={24} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Case Study Not Found
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          The requested project might have been moved or archived.
        </p>
        <Link 
          href="/projects" 
          className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft size={14} /> Back to Projects
        </Link>
      </div>
    );
  }

  const techStack = project.tags || (typeof project.techStack === "string" ? project.techStack.split(",") : project.techStack) || [];
  const displayImage = getCleanImageUrl(project.image, project.gDriveImage);

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${focusMode ? "bg-zinc-50 dark:bg-zinc-950" : "bg-transparent"}`}>
      {/* Top Scroll Depth Progress Line */}
      <ReadingProgress />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* FLOATING TOP READING DOCK (Reveals on Scroll) */}
      <AnimatePresence>
        {showNavDock && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={appleSpring}
            className="fixed top-16 left-0 right-0 z-40 px-4 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-xl pointer-events-auto">
              <div className="flex items-center gap-3">
                <Link
                  href="/projects"
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 transition-colors"
                  title="Return to Projects"
                >
                  <ArrowLeft size={14} />
                </Link>
                <div className="hidden sm:block">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[280px]">
                    {project.title}
                  </h4>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                    {project.role || "Engineering Case Study"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFocusMode(!focusMode)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    focusMode
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                  }`}
                  title={focusMode ? "Exit Focus Mode (Esc)" : "Focus Reading Mode"}
                >
                  {focusMode ? <Minimize2 size={14} className="text-white" /> : <Maximize2 size={14} className="text-zinc-800 dark:text-zinc-200" />}
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
                  title="Copy Link"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-zinc-800 dark:text-zinc-200" />}
                </button>

                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                  >
                    <span>Launch</span>
                    <ArrowUpRight size={13} className="text-white" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        
        {/* BACK LINK & BREADCRUMBS */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-sm group-hover:-translate-x-1 transition-transform">
              <ArrowLeft size={13} />
            </div>
            <span>Back to All Projects</span>
          </Link>
        </div>

        {/* HERO TITLE & METADATA SECTION */}
        <header className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {project.status || "Production Release"}
              </span>
              {project.role && (
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80">
                  {project.role}
                </span>
              )}
              {project.featured && (
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Sparkles size={11} /> Featured
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.12]">
              {project.title}
            </h1>
          </div>

          {/* Social Share & Meta Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={13} />
                {new Date(project.publishDate || project.createdAt || Date.now()).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Share Buttons with High Contrast */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={shareOnTwitter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold transition-colors"
                title="Share on X"
              >
                <Twitter size={13} className="text-zinc-800 dark:text-zinc-200" />
                <span className="hidden sm:inline">Post</span>
              </button>
              <button
                type="button"
                onClick={shareOnLinkedIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#095196] text-white text-xs font-bold shadow-xs transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin size={13} className="text-white" />
                <span className="hidden sm:inline">LinkedIn</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold transition-colors"
                title="Copy Case Study URL"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="text-zinc-800 dark:text-zinc-200" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* MOCKUP SHOWCASE FRAME: 100% UN-CUT FITTED IMAGE */}
          {displayImage && (
            <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 shadow-2xl">
              {project.frameStyle !== "None" && (
                <div className="h-9 bg-zinc-200/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700/60 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <div className="mx-auto text-[11px] font-mono text-zinc-600 dark:text-zinc-400 px-4 py-0.5 bg-white/70 dark:bg-zinc-900/70 rounded-md truncate max-w-[280px]">
                    {project.liveLink || "https://case-study.nilaynaha.dev"}
                  </div>
                </div>
              )}

              {/* Fitted Showcase Container: Any aspect ratio fits 100% without cut */}
              <div className="relative h-[320px] sm:h-[440px] md:h-[580px] w-full bg-zinc-100/90 dark:bg-zinc-950/90 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
                {displayImage.includes("<iframe") ? (
                  <div
                    className="w-full aspect-[16/9] [&>iframe]:w-full [&>iframe]:h-full"
                    dangerouslySetInnerHTML={{ __html: displayImage }}
                  />
                ) : (
                  <>
                    {/* Ambient subtle blur to smoothly fill letterboxing */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayImage}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 dark:opacity-10 scale-110 pointer-events-none select-none"
                    />
                    {/* Crisp fitted image - Full aspect ratio without crop */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displayImage}
                        alt={project.title}
                        className="w-full h-full object-contain rounded-xl drop-shadow-2xl select-none"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* AT-A-GLANCE EXECUTIVE BENTO METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">Position / Role</span>
              <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {project.role || "Lead Architect"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">Deployment</span>
              <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> {project.status || "Production"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">Timeline</span>
              <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {new Date(project.publishDate || project.createdAt || Date.now()).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric"
                })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">Primary Artifact</span>
              <div className="flex items-center gap-2 pt-0.5">
                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    Site <ArrowUpRight size={11} />
                  </a>
                )}
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:underline flex items-center gap-0.5"
                  >
                    Repo <ArrowUpRight size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN 2-COLUMN ARCHITECTURAL BREAKDOWN */}
        <div className={`mt-14 grid gap-12 transition-all ${focusMode ? "max-w-3xl mx-auto grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_320px]"}`}>
          
          {/* ARTICLE PROSE CONTENT */}
          <article className="w-full min-w-0">
            <div
              className="project-content rich-content prose prose-zinc dark:prose-invert max-w-none w-full
                prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100
                prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-zinc-200/80 dark:prose-h2:border-zinc-800/80 prose-h2:pb-2
                prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed prose-p:text-zinc-700 dark:prose-p:text-zinc-300
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                prose-li:text-zinc-700 dark:prose-li:text-zinc-300 prose-li:text-sm sm:prose-li:text-base
                prose-img:rounded-3xl prose-img:shadow-xl prose-img:border prose-img:border-zinc-200 dark:prose-img:border-zinc-800
                prose-table:w-full prose-table:border-collapse prose-table:text-xs sm:prose-table:text-sm
                prose-th:p-3 prose-th:bg-zinc-100/80 dark:prose-th:bg-zinc-900/80 prose-th:text-zinc-900 dark:prose-th:text-zinc-100 prose-th:border prose-th:border-zinc-200 dark:prose-th:border-zinc-800
                prose-td:p-3 prose-td:text-zinc-700 dark:prose-td:text-zinc-300 prose-td:border prose-td:border-zinc-200 dark:prose-td:border-zinc-800"
              dangerouslySetInnerHTML={{ __html: processedHTML }}
            />

            <ProjectDemo url={project.demoEmbed} title={project.title} />

            {/* Markdown is rendered server-side; only trust it for the server-supplied project */}
            <ProjectCaseStudy
              html={initialData?.project?.slug === project.slug ? initialData?.caseStudyHTML : undefined}
              metrics={project.metrics}
              evaluation={project.evaluation}
            />

            {/* PREVIOUS & NEXT PROJECT SWITCHER */}
            <div className="mt-16 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevProject ? (
                <Link
                  href={`/projects/${prevProject.slug}`}
                  className="flex flex-col p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group active:scale-[0.99] shadow-xs"
                >
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1 group-hover:-translate-x-0.5 transition-transform">
                    <ArrowLeft size={13} /> Previous Case Study
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {prevProject.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextProject ? (
                <Link
                  href={`/projects/${nextProject.slug}`}
                  className="flex flex-col items-end text-right p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group active:scale-[0.99] shadow-xs"
                >
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1 group-hover:translate-x-0.5 transition-transform">
                    Next Case Study <ArrowRight size={13} />
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {nextProject.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* RETURN BUTTON */}
            <div className="mt-12 flex justify-center">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold shadow-lg active:scale-95 transition-all"
              >
                <Layers size={14} className="text-white dark:text-zinc-900" />
                <span className="text-white dark:text-zinc-900">View All Projects</span>
              </Link>
            </div>
          </article>

          {/* SIDEBAR (Hidden in Focus Mode) */}
          {!focusMode && (
            <aside className="space-y-6">
              <div className="sticky top-28 space-y-6">
                
                {/* DELIVERABLES RESOURCE DOCK */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
                  <h3 className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
                    Live Deliverables
                  </h3>

                  <div className="space-y-2.5">
                    {project.liveLink && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all group"
                      >
                        <span className="flex items-center gap-2 text-white">
                          <ExternalLink size={14} className="text-white" /> Production Site
                        </span>
                        <ArrowUpRight size={14} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    )}

                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-4 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-xs font-bold border border-zinc-900 dark:border-zinc-200 shadow-sm active:scale-[0.98] transition-all group"
                      >
                        <span className="flex items-center gap-2 text-white dark:text-zinc-900">
                          <Github size={14} className="text-white dark:text-zinc-900" /> Source Repository
                        </span>
                        <ArrowUpRight size={14} className="text-white dark:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    )}

                    {project.appLink && (
                      <a
                        href={project.appLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all group"
                      >
                        <span className="flex items-center gap-2 text-white">
                          <Download size={14} className="text-white" /> Download Application
                        </span>
                        <ArrowUpRight size={14} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    )}

                    {!project.liveLink && !project.githubLink && !project.appLink && (
                      <p className="text-xs text-zinc-500 italic">No external deliverables available for this internal research case study.</p>
                    )}
                  </div>
                </div>

                {/* LINKED TECHNICAL ARTICLE (If available) */}
                {linkedBlog && (
                  <div className="p-6 rounded-3xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 shadow-sm space-y-3">
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[10px] font-semibold tracking-wider uppercase">
                      <BookOpen size={12} /> Technical Publication
                    </div>
                    <Link href={`/blog/${linkedBlog.slug}`} className="block group">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {linkedBlog.title}
                      </h4>
                    </Link>
                    {linkedBlog.excerpt && (
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {linkedBlog.excerpt}
                      </p>
                    )}
                    <Link
                      href={`/blog/${linkedBlog.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                    >
                      Read Deep Dive Article <ChevronRight size={12} />
                    </Link>
                  </div>
                )}

                {/* TECH ARSENAL STACK */}
                {techStack.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
                    <h3 className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
                      Technologies & Tools
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {techStack.map((tech: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* TABLE OF CONTENTS */}
                {contentReady && (
                  <TableOfContents contentSelector=".project-content" />
                )}

              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}
