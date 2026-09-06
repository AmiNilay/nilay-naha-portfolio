"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Github,
  ExternalLink,
  Loader2,
  Download,
  Calendar,
  Layers,
  AlertTriangle,
  RefreshCw,
  Star,
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TableOfContents from "@/components/blog/TableOfContents";
import ShareButtons from "@/components/blog/ShareButtons";
import { sanitizeRichText, htmlToPlainText } from "@/lib/sanitizeRichText";
import { processContent } from "@/lib/markdownProcessor";

const fetchWithTimeout = async (url: string, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
};

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [project, setProject] = useState<any>(null);
  const [prevProject, setPrevProject] = useState<any>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [cleanContent, setCleanContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [headingsReady, setHeadingsReady] = useState(false);

  const fetchProjectData = async () => {
    if (!slug) {
      setError("This project link is missing its slug.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setProject(null);
    setCleanContent("");
    setHeadingsReady(false);
    setPrevProject(null);
    setNextProject(null);

    try {
      const detailResponse = await fetchWithTimeout(
        `/api/projects?slug=${encodeURIComponent(slug)}`,
      );

      if (detailResponse.status === 404) {
        setProject(null);
        return;
      }
      if (!detailResponse.ok) throw new Error("Project request failed");

      const detailData = await detailResponse.json();
      const currentProject = detailData.project;
      if (!currentProject) {
        setProject(null);
        return;
      }

      setProject(currentProject);

      // Process and sanitize content
      const rawContent =
        currentProject.description || currentProject.content || "";
      const isRawHtml =
        /^\s*<style|^\s*<div|^\s*<h[1-6]|^\s*<p|^\s*<table/i.test(
          rawContent,
        );

      let html: string;
      if (isRawHtml) {
        html = rawContent;
      } else {
        html = await processContent(rawContent);
      }

      const sanitized = sanitizeRichText(html);
      setCleanContent(sanitized);

      // Fetch prev/next projects for navigation
      try {
        const listResponse = await fetchWithTimeout("/api/projects?public=1");
        if (listResponse.ok) {
          const listData = await listResponse.json();
          const projects = Array.isArray(listData.projects)
            ? listData.projects
            : [];
          const currentIndex = projects.findIndex(
            (item: any) => item.slug === slug,
          );
          setPrevProject(
            currentIndex > 0 ? projects[currentIndex - 1] : null,
          );
          setNextProject(
            currentIndex >= 0 && currentIndex < projects.length - 1
              ? projects[currentIndex + 1]
              : null,
          );
        }
      } catch (navError) {
        console.warn("Project navigation unavailable:", navError);
      }
    } catch (err) {
      console.error("Project detail fetch failed:", err);
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setError(
        offline
          ? "You appear to be offline. Please check your internet connection."
          : "This project is temporarily unavailable. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [slug]);

  // Auto-assign IDs to headings for ToC
  useEffect(() => {
    if (!cleanContent) return;

    const timer = setTimeout(() => {
      const container = document.querySelector(".project-content");
      if (!container) return;

      const headings = container.querySelectorAll(
        "h1, h2, h3, h4, h5, h6",
      );
      headings.forEach((el, i) => {
        const heading = el as HTMLElement;
        if (!heading.id) {
          const text = heading.textContent?.trim() || "";
          const generatedSlug = text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, "-")
            .replace(/(^-|-$)/g, "");
          heading.id = generatedSlug || `section-${i}`;
        }
        heading.style.scrollMarginTop = "120px";
      });

      setHeadingsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [cleanContent]);

  // Add copy buttons to code blocks
  useEffect(() => {
    if (!cleanContent) return;

    const timer = setTimeout(() => {
      const preElements = document.querySelectorAll(
        ".project-content pre",
      );
      preElements.forEach((preNode) => {
        const pre = preNode as HTMLElement;
        if (pre.querySelector(".code-toolbar")) return;

        pre.style.position = "relative";

        const toolbar = document.createElement("div");
        toolbar.className = "code-toolbar";
        toolbar.style.cssText =
          "position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:8px 14px;z-index:10;";

        const codeEl = pre.querySelector("code");
        const langClass =
          codeEl?.className?.match(/language-(\w+)/)?.[1] || "";

        const left = document.createElement("div");
        if (langClass) {
          const langLabel = document.createElement("span");
          langLabel.style.cssText =
            "font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-family:monospace;";
          langLabel.textContent = langClass;
          left.appendChild(langLabel);
        }
        toolbar.appendChild(left);

        const button = document.createElement("button");
        button.style.cssText =
          "display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#9ca3af;background:rgba(31,41,55,0.8);border:1px solid #374151;border-radius:6px;padding:4px 10px;cursor:pointer;backdrop-filter:blur(8px);transition:all 0.2s;font-family:inherit;";
        button.textContent = "Copy";

        button.addEventListener("click", async () => {
          const code = codeEl?.innerText || pre.innerText;
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
          button.style.color = "#4ade80";
          button.style.borderColor = "rgba(74,222,128,0.4)";
          setTimeout(() => {
            button.textContent = "Copy";
            button.style.color = "#9ca3af";
            button.style.borderColor = "#374151";
          }, 2000);
        });

        toolbar.appendChild(button);
        pre.insertBefore(toolbar, pre.firstChild);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [cleanContent]);

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center pt-20">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
          Unable to load project
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-lg">
          {error}
        </p>
        <button
          onClick={fetchProjectData}
          className="px-8 py-3.5 bg-primary text-white rounded-full font-bold hover:scale-105 hover:shadow-lg transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" /> Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Project Not Found
        </h1>
        <p className="text-gray-500 mb-4">
          The project you are looking for does not exist.
        </p>
        <Link
          href="/projects"
          className="bg-primary text-white px-6 py-3 rounded-full hover:opacity-90 font-bold transition-all flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft size={18} /> Back to Projects
        </Link>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  const techStack: string[] = project.techStack?.length
    ? project.techStack
    : project.tags || [];
  const displayImage = project.image || project.gDriveImage;

  const publishDate = new Date(
    project.publishDate || project.createdAt,
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const plainDescription =
    project.description || htmlToPlainText(cleanContent).slice(0, 200);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <ReadingProgress />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ==========================================
          BACK NAVIGATION
          ========================================== */}
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-24 mb-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <div className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:-translate-x-1 transition-transform shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          Back to Portfolio
        </Link>
      </div>

      {/* ==========================================
          HEADER
          ========================================== */}
      <header className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {project.featured && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
              <Star className="w-3 h-3 fill-current" /> Featured Project
            </span>
          </div>
        )}

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-4">
          {project.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-2 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
            <Calendar className="w-4 h-4" />
            {publishDate}
          </span>

          {project.category && (
            <span className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full">
              {project.category}
            </span>
          )}
        </div>

        {/* Hero Image */}
        {displayImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            {project.frameStyle !== "None" && (
              <div className="h-10 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>
            )}
            <div className="relative aspect-[16/9] group bg-gray-50 dark:bg-black">
              {displayImage.includes("<iframe") ? (
                <div
                  className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
                  dangerouslySetInnerHTML={{ __html: displayImage }}
                />
              ) : (
                <img
                  src={displayImage}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 select-none"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                  onError={(e) => {
                    if (
                      project.gDriveImage &&
                      !project.gDriveImage.includes("<iframe") &&
                      e.currentTarget.src !== project.gDriveImage
                    ) {
                      e.currentTarget.src = project.gDriveImage;
                    }
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </header>

      {/* ==========================================
          CONTENT + SIDEBAR
          ========================================== */}
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mt-16">
        <div className="flex flex-col lg:flex-row gap-12 relative">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            <div
              className="project-content blog-content prose prose-lg dark:prose-invert !max-w-none w-full"
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />

            {/* Share Section (bottom only) */}
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
              <ShareButtons
                title={project.title}
                slug={project.slug}
                description={plainDescription}
              />
            </div>

            {/* Previous / Next Navigation */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevProject ? (
                  <Link
                    href={`/projects/${prevProject.slug}`}
                    className="flex flex-col p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all group"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2 mb-2">
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      Previous Project
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white line-clamp-1">
                      {prevProject.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextProject ? (
                  <Link
                    href={`/projects/${nextProject.slug}`}
                    className="flex flex-col items-end text-right p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all group"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2 mb-2">
                      Next Project
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white line-clamp-1">
                      {nextProject.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>

            {/* View All Projects */}
            <div className="mt-12 flex justify-center">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold hover:scale-105 transition-transform shadow-lg"
              >
                <Layers className="w-4 h-4" /> View All Projects
              </Link>
            </div>
          </article>

          {/* ==========================================
              STICKY SIDEBAR
              ========================================== */}
          <aside className="hidden lg:block w-80 xl:w-96 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Resources Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                  Resources
                </h3>
                <div className="space-y-3">
                  {project.liveLink && (
                    <a
                      href={project.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm group shadow-md shadow-primary/20"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink size={16} /> Live Preview
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}

                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all font-semibold text-sm group"
                    >
                      <span className="flex items-center gap-2">
                        <Github size={16} /> Source Code
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}

                  {project.appLink && (
                    <a
                      href={project.appLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-950 transition-all font-semibold text-sm group"
                    >
                      <span className="flex items-center gap-2">
                        <Download size={16} /> Download App
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}

                  {!project.liveLink &&
                    !project.githubLink &&
                    !project.appLink && (
                      <p className="text-xs text-gray-400 italic">
                        No external resources available.
                      </p>
                    )}
                </div>
              </div>

              {/* Tech Stack Card */}
              {techStack.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary transition-colors"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Table of Contents */}
              {headingsReady && (
                <TableOfContents contentSelector=".project-content" />
              )}

              {/* Sidebar Share */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <ShareButtons
                  title={project.title}
                  slug={project.slug}
                  description={plainDescription}
                  compact
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}