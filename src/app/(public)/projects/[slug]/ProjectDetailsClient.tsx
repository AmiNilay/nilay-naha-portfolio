"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Github, ExternalLink, Loader2, Download,
  Calendar, Share2, Twitter, Linkedin, Copy, Check
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TableOfContents from "@/components/blog/TableOfContents";
import { processContent } from "@/lib/markdownProcessor";

export default function ProjectDetails() {
  const params = useParams();
  const slug = params?.slug;

  const [project, setProject] = useState<any>(null);
  const [processedHTML, setProcessedHTML] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copied, setCopied] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/projects?slug=${slug}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.project) {
          setProject(data.project);
          const html = await processContent(data.project.description || "");
          setProcessedHTML(html);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [slug]);

  // Add IDs to headings after HTML renders (for TOC jumping)
  useEffect(() => {
    if (!processedHTML) return;
    const timer = setTimeout(() => {
      const container = document.querySelector(".blog-content");
      if (!container) return;
      const headings = container.querySelectorAll("h2, h3");
      headings.forEach((el, i) => {
        if (!el.id) {
          const slug = (el.textContent || `heading-${i}`)
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
          el.id = slug;
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
    const text = encodeURIComponent(project?.title || "");
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500"
    );
  };

  const shareOnLinkedIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading project...</p>
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

  return (
    <div className="min-h-screen pb-20 bg-background">
      <ReadingProgress />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Nav */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 mb-8">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors group">
          <div className="p-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          Back to Portfolio
        </Link>
      </div>

      {/* HEADER */}
      <header className="max-w-4xl mx-auto px-4 md:px-8">
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {project.tags.map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-6">
          {project.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-gray-200 dark:border-gray-800">
          <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            {new Date(project.publishDate || project.createdAt).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </span>

          <div className="flex items-center gap-1 relative z-20">
            <button type="button" onClick={shareOnTwitter} title="Twitter" className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
              <Twitter className="w-4 h-4 pointer-events-none" />
            </button>
            <button type="button" onClick={shareOnLinkedIn} title="LinkedIn" className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
              <Linkedin className="w-4 h-4 pointer-events-none" />
            </button>
            <button type="button" onClick={handleCopyLink} title="Copy" className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
              {copied ? <Check className="w-4 h-4 text-green-500 pointer-events-none" /> : <Copy className="w-4 h-4 pointer-events-none" />}
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {project.image && (
          <div className="w-full aspect-[16/9] bg-gray-200 dark:bg-gray-900 rounded-2xl overflow-hidden mt-8 shadow-2xl border border-gray-200 dark:border-gray-800 relative group">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
        )}
      </header>

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="grid gap-12 grid-cols-1 lg:grid-cols-[1fr_280px]">
          {/* Content */}
          <article className="lg:max-w-3xl w-full">
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: processedHTML }} />

            {/* Bottom Share */}
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 relative z-20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Like this project?</p>
                  <p className="font-semibold text-gray-900 dark:text-white">Share it with your network</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={shareOnTwitter} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                    <Twitter className="w-4 h-4 pointer-events-none" /> <span className="pointer-events-none">Twitter</span>
                  </button>
                  <button type="button" onClick={shareOnLinkedIn} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077B5] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                    <Linkedin className="w-4 h-4 pointer-events-none" /> <span className="pointer-events-none">LinkedIn</span>
                  </button>
                  <button type="button" onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    {copied ? <Check className="w-4 h-4 pointer-events-none" /> : <Share2 className="w-4 h-4 pointer-events-none" />}
                    <span className="pointer-events-none">{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="mt-10 flex justify-center">
              <Link href="/projects" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-gray-200 dark:border-gray-800 hover:border-primary hover:text-primary text-sm font-semibold transition-all hover:-translate-y-0.5">
                <ArrowLeft className="w-4 h-4" /> View All Projects
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-6">
              {/* Resources */}
              <div className="bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                  Resources
                </h3>
                <div className="space-y-2">
                  {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full px-4 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm group">
                      <span className="flex items-center gap-2"><ExternalLink size={16} /> Live Preview</span>
                      <ArrowLeft className="w-4 h-4 rotate-[135deg] group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full px-4 py-3 bg-gray-900 dark:bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-semibold text-sm group">
                      <span className="flex items-center gap-2"><Github size={16} /> Source Code</span>
                      <ArrowLeft className="w-4 h-4 rotate-[135deg] group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}
                  {project.appLink && (
                    <a href={project.appLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full px-4 py-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-950 transition-all font-semibold text-sm group">
                      <span className="flex items-center gap-2"><Download size={16} /> Download App</span>
                      <ArrowLeft className="w-4 h-4 rotate-[135deg] group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}
                  {!project.liveLink && !project.githubLink && !project.appLink && (
                    <p className="text-xs text-gray-400 italic">No external resources.</p>
                  )}
                </div>
              </div>

              {/* Table of Contents */}
              {contentReady && <TableOfContents contentSelector=".blog-content" />}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}