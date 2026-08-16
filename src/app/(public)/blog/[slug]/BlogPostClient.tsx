"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Eye, Maximize, Minimize, RefreshCw } from "lucide-react";

export default function BlogPostClient() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [viewCount, setViewCount] = useState<number>(0);

  // 1. Fetch Post Data & Increment Views
  useEffect(() => {
    if (!params?.slug) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog?slug=${params.slug}`);
        const data = await res.json();
        if (data.post) {
          setPost(data.post);
          setViewCount(data.post.views || 0);
          
          // Increment view count in the background
          fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: params.slug }),
          })
            .then((res) => res.json())
            .then((viewData) => {
              if (viewData.views) setViewCount(viewData.views);
            });
        }
      } catch (error) {
        console.error("Failed to fetch post", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params?.slug]);

  // 2. Inject "Copy Code" Buttons into all <pre> blocks
  useEffect(() => {
    if (!post?.content) return;

    const preElements = document.querySelectorAll(".prose pre");
    preElements.forEach((preNode) => {
      const pre = preNode as HTMLElement; // ✅ FIX: Tell TypeScript this is an HTMLElement

      // Prevent adding multiple buttons if component re-renders
      if (pre.querySelector(".copy-button")) return;

      pre.style.position = "relative";
      pre.classList.add("group"); // For hover effects

      const button = document.createElement("button");
      button.className =
        "copy-button absolute top-3 right-3 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs px-2.5 py-1.5 rounded-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5 border border-gray-600";
      button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`;

      button.addEventListener("click", async () => {
        const code = pre.querySelector("code")?.innerText || pre.innerText;
        await navigator.clipboard.writeText(code);

        button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span class="text-green-400">Copied!</span>`;
        button.classList.add("border-green-500/50");

        setTimeout(() => {
          button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`;
          button.classList.remove("border-green-500/50");
        }, 2000);
      });

      pre.appendChild(button);
    });
  }, [post?.content]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Post Not Found</h1>
        <button onClick={() => router.push("/blog")} className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>
      </div>
    );
  }

  // Format Dates
  const publishedDate = new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  
  // Format Last Updated (Date + Time)
  const updatedDate = new Date(post.updatedAt);
  const formattedLastUpdated = `${updatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${updatedDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <article className="min-h-screen pt-24 pb-20 transition-colors duration-300">
      {/* Header Section */}
      <header className="max-w-4xl mx-auto px-6 mb-12 text-center">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to all posts
        </Link>

        {post.category && (
          <div className="mb-6">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full">
              {post.category}
            </span>
          </div>
        )}

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 text-balance">
          {post.title}
        </h1>

        {/* Metadata Row (Date, Read Time, Views, Last Updated) */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {publishedDate}
          </div>
          {post.readTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> {post.readTime}
            </div>
          )}
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Eye className="w-4 h-4" /> {viewCount} Views
          </div>
        </div>
        
        {/* Last Updated Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <RefreshCw className="w-3 h-3" /> Last updated: {formattedLastUpdated}
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          </motion.div>
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 relative">
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-500 ${focusMode ? "max-w-3xl mx-auto" : "max-w-3xl"}`}>
          
          {/* Focus Mode Toggle */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"
            >
              {focusMode ? <><Minimize className="w-4 h-4" /> Exit Focus Mode</> : <><Maximize className="w-4 h-4" /> Focus Mode</>}
            </button>
          </div>

          {/* Prose Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-800 prose-a:text-primary hover:prose-a:text-primary/80"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Sidebar (Hidden in Focus Mode) */}
        {!focusMode && (
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Author Card */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Written by</h3>
                <p className="text-primary font-medium">Nilay Naha</p>
                <p className="text-sm text-gray-500 mt-2">Software Developer specializing in Python, FastAPI, and modern backend systems.</p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
