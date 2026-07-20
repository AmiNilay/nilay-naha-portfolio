"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Loader2, Share2, Twitter, Linkedin, Copy, Check } from "lucide-react";
import Toast from "@/components/ui/Toast";
import BlogControls from "@/components/blog/BlogControls";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TableOfContents from "@/components/blog/TableOfContents";
import { processContent } from "@/lib/markdownProcessor";

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  createdAt: string;
  readTime?: number;
  tags?: string[];
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [processedHTML, setProcessedHTML] = useState("");
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copied, setCopied] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog?slug=${slug}`);
        const data = await res.json();
        if (data && data.post) {
          setPost(data.post);
          const html = await processContent(data.post.content || "");
          setProcessedHTML(html);
        }
      } catch (error) {
        console.error("Failed to fetch blog post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  // Ensure headings have IDs after HTML render (for TOC jumping)
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
      setToast({ message: "Link copied to clipboard!", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast({ message: "Failed to copy link.", type: "error" });
    }
  };

  const shareOnTwitter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = encodeURIComponent(post?.title || "");
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <Link href="/blog" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${readingMode ? "bg-[#fafafa] dark:bg-[#0a0a0a]" : "bg-background"}`}>
      <ReadingProgress />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="pt-24 pb-20">
        {/* Top Nav */}
        <div className={`max-w-7xl mx-auto px-4 md:px-8 transition-opacity duration-300 ${readingMode ? "opacity-0 h-0 overflow-hidden pointer-events-none" : "opacity-100 mb-8"}`}>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors group">
            <div className="p-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 group-hover:-translate-x-1 transition-transform">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            Back to all articles
          </Link>
        </div>

        {/* HEADER */}
        <header className={`mx-auto px-4 md:px-8 transition-all duration-500 ${readingMode ? "max-w-2xl" : "max-w-4xl"}`}>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className={`font-bold text-gray-900 dark:text-white mb-6 leading-[1.15] tracking-tight ${readingMode ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl lg:text-6xl"}`}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <BlogControls content={post.content} onReadingModeChange={setReadingMode} />
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-1 relative z-20">
              <button type="button" onClick={shareOnTwitter} title="Share on Twitter" className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
                <Twitter className="w-4 h-4 pointer-events-none" />
              </button>
              <button type="button" onClick={shareOnLinkedIn} title="Share on LinkedIn" className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
                <Linkedin className="w-4 h-4 pointer-events-none" />
              </button>
              <button type="button" onClick={handleCopyLink} title="Copy link" className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
                {copied ? <Check className="w-4 h-4 text-green-500 pointer-events-none" /> : <Copy className="w-4 h-4 pointer-events-none" />}
              </button>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className={`relative w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 mt-8 mb-4 transition-all duration-500 ${readingMode ? "h-64 opacity-70" : "h-[300px] md:h-[450px] shadow-2xl"}`}>
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
        </header>

        {/* MAIN LAYOUT: Content + TOC */}
        <div className={`mx-auto px-4 md:px-8 mt-12 ${readingMode ? "max-w-2xl" : "max-w-7xl"}`}>
          <div className={`grid gap-12 ${readingMode ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_260px]"}`}>
            {/* Content */}
            <article className={`${readingMode ? "" : "lg:max-w-3xl mx-auto w-full"}`}>
              <div className={`blog-content ${readingMode ? "prose-xl font-serif" : ""}`} dangerouslySetInnerHTML={{ __html: processedHTML }} />

              {/* Bottom Share Section */}
              <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 relative z-20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Enjoyed this article?</p>
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

              {/* Back to Blog */}
              <div className="mt-10 flex justify-center">
                <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-gray-200 dark:border-gray-800 hover:border-primary hover:text-primary text-sm font-semibold transition-all hover:-translate-y-0.5">
                  <ArrowLeft className="w-4 h-4" /> Back to All Articles
                </Link>
              </div>
            </article>

            {/* Table of Contents */}
            {!readingMode && contentReady && (
              <aside className="hidden lg:block">
                <TableOfContents contentSelector=".blog-content" />
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}