"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Github, ExternalLink, Loader2, Download,
  Calendar, Share2, Twitter, Linkedin, Copy, Check, Layers, AlertTriangle, RefreshCw
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TableOfContents from "@/components/blog/TableOfContents";
import { processContent } from "@/lib/markdownProcessor";

export default function ProjectDetails() {
  const params = useParams();
  const slug = params?.slug;

  const [project, setProject] = useState<any>(null);
  const [prevProject, setPrevProject] = useState<any>(null);
  const [nextProject, setNextProject] = useState<any>(null);
  const [processedHTML, setProcessedHTML] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copied, setCopied] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  const fetchProjectData = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects`);
      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      const projects = data.projects || [];
      const currentIndex = projects.findIndex((p: any) => p.slug === slug);

      if (currentIndex !== -1) {
        const currentProject = projects[currentIndex];
        setProject(currentProject);
        setPrevProject(currentIndex > 0 ? projects[currentIndex - 1] : null);
        setNextProject(currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null);

        const rawContent = currentProject.description || currentProject.content || "";
        const isRawHtml = /^\s*<style|^\s*<div|^\s*<h[1-6]|^\s*<p|^\s*<table/i.test(rawContent);
        
        if (isRawHtml) {
          setProcessedHTML(rawContent);
        } else {
          const html = await processContent(rawContent);
          setProcessedHTML(html);
        }
      } else {
        setProject(null);
      }
    } catch (err) {
      console.error("Error:", err);
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else {
        setError("Failed to load project details. The server might be busy.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [slug]);

  useEffect(() => {
    if (!processedHTML) return;
    const timer = setTimeout(() => {
      const container = document.querySelector(".blog-content");
      if (!container) return;
      const headings = container.querySelectorAll("h2, h3");
      headings.forEach((el, i) => {
        if (!el.id) {
          const headingSlug = (el.textContent || `heading-${i}`)
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
          el.id = headingSlug;
        }
      });
      setContentReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [processedHTML]);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setToast({ message: "Link copied!", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast({ message: "Failed to copy.", type: "error" });
    }
  };

  const shareOnTwitter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = encodeURIComponent(`Check out this project: ${project?.title}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "width=600,height=500" );
  };

  const shareOnLinkedIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "width=600,height=500" );
  };

  const ShareButtons = () => (
    <div className="flex items-center gap-2 relative z-20">
      <button type="button" onClick={shareOnTwitter} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
        <Twitter className="w-4 h-4 pointer-events-none" /> <span className="pointer-events-none hidden sm:inline">Twitter</span>
      </button>
      <button type="button" onClick={shareOnLinkedIn} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077B5] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
        <Linkedin className="w-4 h-4 pointer-events-none" /> <span className="pointer-events-none hidden sm:inline">LinkedIn</span>
      </button>
      <button type="button" onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
        {copied ? <Check className="w-4 h-4 pointer-events-none text-green-500" /> : <Share2 className="w-4 h-4 pointer-events-none" />}
        <span className="pointer-events-none hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );

  // ==========================================
  // ERROR STATE UI
  // ==========================================
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center pt-20">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Oops! Something went wrong</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-lg">{error}</p>
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
  // SKELETON LOADER UI
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
          <div className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        <header className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="w-3/4 h-12 md:h-16 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mb-6"></div>
          <div className="flex justify-between pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="w-40 h-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
            <div className="w-48 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-full mt-10 aspect-[16/9] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
        </header>
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
          <div className="grid gap-12 grid-cols-1 lg:grid-cols-[1fr_320px]">
            <article className="w-full space-y-4">
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-8"></div>
              <div className="w-4/5 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </article>
            <aside className="hidden lg:block space-y-8">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Project Not Found</h1>
        <p className="text-gray-500 mb-4">The project you are looking for does not exist.</p>
        <Link href="/projects" className="bg-primary text-white px-6 py-3 rounded-full hover:opacity-90 font-bold transition-all flex items-center gap-2 shadow-lg">
          <ArrowLeft size={18} /> Back to Projects
        </Link>
      </div>
    );
  }

  const techStack = project.techStack?.length ? project.techStack : project.tags || [];
  const displayImage = project.image || project.gDriveImage;
    return (
    <div className="min-h-screen pb-20 bg-background">
      <ReadingProgress />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 🔥 BULLETPROOF DARK MODE OVERRIDE FOR CUSTOM HTML 🔥 */}
      <style dangerouslySetInnerHTML={{__html: `
        .dark .blog-content .portfolio-post {
          background-color: transparent !important;
          color: #e5e7eb !important;
          box-shadow: none !important;
        }
        .dark .blog-content [style*="background-color: #ffffff"],
        .dark .blog-content [style*="background-color: #fff"],
        .dark .blog-content [style*="background-color: white"],
        .dark .blog-content [style*="background-color: #f3f4f6"] {
          background-color: transparent !important;
        }
        .dark .blog-content [style*="color: #334155"],
        .dark .blog-content [style*="color: #000000"],
        .dark .blog-content [style*="color: black"] {
          color: #e5e7eb !important;
        }
        .dark .blog-content table,
        .dark .blog-content th,
        .dark .blog-content td {
          border-color: #374151 !important;
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 mb-8">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors group">
          <div className="p-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          Back to Portfolio
        </Link>
      </div>

      <header className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-6">
          {project.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-200 dark:border-gray-800">
          <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-full w-fit">
            <Calendar className="w-4 h-4" />
            {new Date(project.publishDate || project.createdAt).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </span>

          <ShareButtons />
        </div>

        {/* ✅ G-Drive Fallback & Iframe Support */}
        {displayImage && (
          <div className="w-full mt-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            {project.frameStyle !== "None" && (
              <div className="h-10 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
              </div>
            )}
            <div className="relative aspect-[16/9] group bg-gray-50 dark:bg-black">
              {displayImage.includes("<iframe") ? (
                <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: displayImage }} />
              ) : (
                <img 
                  src={displayImage} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 select-none" 
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                  onError={(e) => {
                    if (project.gDriveImage && !project.gDriveImage.includes("<iframe") && e.currentTarget.src !== project.gDriveImage) {
                      e.currentTarget.src = project.gDriveImage;
                    }
                  }}
                />
              )}
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
        <div className="grid gap-12 grid-cols-1 lg:grid-cols-[1fr_320px]">
          
          <article className="w-full min-w-0">
            <div 
              className="blog-content prose prose-slate dark:prose-invert max-w-none w-full
                prose-headings:font-bold prose-headings:tracking-tight 
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:pb-2 prose-h2:border-gray-200 dark:prose-h2:border-gray-800
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-md
                prose-li:marker:text-primary
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl" 
              dangerouslySetInnerHTML={{ __html: processedHTML }} 
            />

            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 relative z-20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Like this project?</p>
                  <p className="font-semibold text-gray-900 dark:text-white">Share it with your network</p>
                </div>
                <ShareButtons />
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevProject ? (
                <Link href={`/projects/${prevProject.slug}`} className="flex flex-col p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all group">
                  <span className="text-sm text-gray-500 flex items-center gap-2 mb-2"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Previous Project</span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{prevProject.title}</span>
                </Link>
              ) : <div />}

              {nextProject ? (
                <Link href={`/projects/${nextProject.slug}`} className="flex flex-col items-end text-right p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all group">
                  <span className="text-sm text-gray-500 flex items-center gap-2 mb-2">Next Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{nextProject.title}</span>
                </Link>
              ) : <div />}
            </div>

            <div className="mt-12 flex justify-center">
              <Link href="/projects" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold hover:scale-105 transition-transform shadow-lg">
                <Layers className="w-4 h-4" /> View All Projects
              </Link>
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-8">
              
              <div className="bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                  Resources
                </h3>
                <div className="space-y-3">
                  {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full px-4 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm group shadow-md shadow-primary/20">
                      <span className="flex items-center gap-2"><ExternalLink size={16} /> Live Preview</span>
                      <ArrowLeft className="w-4 h-4 rotate-[135deg] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full px-4 py-3 bg-gray-900 dark:bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-semibold text-sm group shadow-md">
                      <span className="flex items-center gap-2"><Github size={16} /> Source Code</span>
                      <ArrowLeft className="w-4 h-4 rotate-[135deg] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                  {project.appLink && (
                    <a href={project.appLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full px-4 py-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-950 transition-all font-semibold text-sm group">
                      <span className="flex items-center gap-2"><Download size={16} /> Download App</span>
                      <ArrowLeft className="w-4 h-4 rotate-[135deg] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                  {!project.liveLink && !project.githubLink && !project.appLink && (
                    <p className="text-xs text-gray-400 italic">No external resources available.</p>
                  )}
                </div>
              </div>

              {techStack.length > 0 && (
                <div className="bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {contentReady && (
                <div className="bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <TableOfContents contentSelector=".blog-content" />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

