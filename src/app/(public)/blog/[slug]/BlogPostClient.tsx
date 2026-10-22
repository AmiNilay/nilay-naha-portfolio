"use client";

import { useState, useEffect } from "react";
import { driveImageUrl } from "@/lib/driveMedia";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Eye,
  Maximize2,
  Minimize2,
  Share2,
  Check,
  FolderGit2,
  Sparkles,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  User,
} from "lucide-react";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TableOfContents from "@/components/blog/TableOfContents";

// Apple WWDC fluid spring physics
const appleSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
};

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  gDriveImage?: string;
  category?: string;
  tags?: string[];
  views?: number;
  readTime?: number | string;
  createdAt: string;
  updatedAt?: string;
  publishDate?: string;
  relatedProject?: string;
}

interface LinkedProject {
  _id: string;
  title: string;
  slug: string;
  description: string;
  tags?: string[];
}

interface BlogPostClientProps {
  initialPost?: BlogPost | null;
  initialHeroAuthor?: { profilePic?: string; gDriveProfilePic?: string } | null;
}

export default function BlogPostClient({ initialPost = null, initialHeroAuthor = null }: BlogPostClientProps) {
  const params = useParams();
  const router = useRouter();

  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [linkedProject, setLinkedProject] = useState<LinkedProject | null>(null);
  const [heroAuthor, setHeroAuthor] = useState<{ profilePic?: string; gDriveProfilePic?: string } | null>(initialHeroAuthor);
  const [loading, setLoading] = useState(!initialPost);
  const [focusMode, setFocusMode] = useState(false);
  const [viewCount, setViewCount] = useState<number>(initialPost?.views || 0);
  const [copied, setCopied] = useState(false);
  const [showReadingDock, setShowReadingDock] = useState(false);

  // Fetch article data if not provided by server, related project, author avatar, and increment view count
  useEffect(() => {
    if (!params?.slug) return;

    let isMounted = true;

    // Increment views atomically in the background without blocking render
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: params.slug }),
    })
      .then((r) => r.json())
      .then((vData) => {
        if (isMounted && vData.views) setViewCount(vData.views);
      })
      .catch(() => {});

    // If initialPost already has relatedProject, fetch that
    if (initialPost?.relatedProject) {
      fetch(`/api/projects?id=${initialPost.relatedProject}`)
        .then((r) => r.json())
        .then((projData) => {
          if (isMounted && projData.project) {
            setLinkedProject(projData.project);
          }
        })
        .catch(() => {});
    }

    // Only do full client fetch if we didn't receive initialPost from server
    if (!initialPost) {
      const fetchPost = async () => {
        try {
          const res = await fetch(`/api/blog?slug=${params.slug}`);
          const data = await res.json();

          if (isMounted && data.post) {
            setPost(data.post);
            setViewCount(data.post.views || 0);

            if (data.post.relatedProject) {
              fetch(`/api/projects?id=${data.post.relatedProject}`)
                .then((r) => r.json())
                .then((projData) => {
                  if (isMounted && projData.project) {
                    setLinkedProject(projData.project);
                  }
                })
                .catch((err) => console.error("Failed to load linked project:", err));
            }

            if (!heroAuthor) {
              fetch("/api/hero")
                .then((r) => r.json())
                .then((hero) => {
                  if (isMounted && hero) setHeroAuthor(hero);
                })
                .catch(() => {});
            }
          }
        } catch (error) {
          console.error("Failed to fetch article:", error);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      fetchPost();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [params?.slug, initialPost]);

  // Scroll listener to reveal the floating bottom reading dock when scrolled past hero
  useEffect(() => {
    const handleScroll = () => {
      setShowReadingDock(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhance code blocks with macOS Terminal styling & copy button
  useEffect(() => {
    if (!post?.content) return;

    const preElements = document.querySelectorAll(".blog-content pre");
    preElements.forEach((preNode) => {
      const pre = preNode as HTMLElement;

      if (pre.querySelector(".mac-code-header")) return;

      pre.style.position = "relative";
      pre.classList.add("group", "pt-10", "rounded-2xl", "overflow-hidden");

      // Create macOS Window Header Bar
      const headerBar = document.createElement("div");
      headerBar.className =
        "mac-code-header absolute top-0 left-0 right-0 h-9 px-4 bg-black/40 dark:bg-black/60 border-b border-white/10 flex items-center justify-between pointer-events-none select-none z-10";

      // Traffic Light Dots
      const dots = document.createElement("div");
      dots.className = "flex items-center gap-1.5";
      dots.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 border border-[#e0443e]/50 inline-block"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 border border-[#dea123]/50 inline-block"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 border border-[#1aab29]/50 inline-block"></span>
      `;
      headerBar.appendChild(dots);

      // Copy Action Button
      const button = document.createElement("button");
      button.className =
        "copy-button pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 active:scale-95";
      button.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copy</span>
      `;

      button.addEventListener("click", async () => {
        const code = pre.querySelector("code")?.innerText || pre.innerText;
        await navigator.clipboard.writeText(code);

        button.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span style="color:#34d399">Copied</span>
        `;

        setTimeout(() => {
          button.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
          `;
        }, 2000);
      });

      headerBar.appendChild(button);
      pre.prepend(headerBar);
    });
  }, [post?.content]);

  // Share handler
  const handleShare = async () => {
    if (typeof window === "undefined") return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || "Check out this article by Nilay Naha",
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading Screen (Apple Translucent Material + Fluid Indicator)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="relative z-10 flex flex-col items-center px-8 py-7 rounded-3xl bg-white/70 dark:bg-card/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] border-t-white/80 dark:border-t-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="w-11 h-11 mb-3 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
            <BookOpen className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-foreground mb-4">
            Opening Publication...
          </span>
          <div className="w-36 h-1 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 w-1/3 bg-primary rounded-full animate-apple-shimmer shadow-[0_0_8px_var(--primary)]" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found Screen
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-background">
        <div className="w-16 h-16 rounded-3xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center text-muted-foreground mb-6">
          <BookOpen className="w-8 h-8 stroke-1" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Article Not Found
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          The requested publication could not be located. It may have been renamed, archived, or removed.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Articles</span>
        </Link>
      </div>
    );
  }

  const formattedDate = post.publishDate || post.createdAt
    ? new Date(post.publishDate || post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  const authorAvatarUrl = heroAuthor?.profilePic || heroAuthor?.gDriveProfilePic || "";

  return (
    <article className="relative min-h-screen bg-background text-foreground pt-24 sm:pt-28 pb-28">
      {/* 1. Global Reading Progress Bar at the absolute top of viewport */}
      <ReadingProgress />

      {/* 2. Apple Ambient Glow Behind Header */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-50 dark:opacity-30"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* ========================================================================= */}
        {/* 3. INTEGRATED TOP ACTION BAR (Clean in-flow layout, never overlaps title) */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          {/* Back Navigation Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-primary" />
            <span>All Articles</span>
          </Link>

          {/* Right Action Suite: Category, Read time, Focus Mode, Share */}
          <div className="flex items-center gap-2">
            {post.category && (
              <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                {post.category}
              </span>
            )}

            {/* Focus Mode Toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all border ${
                focusMode
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08]"
              }`}
              title={focusMode ? "Exit Focus Mode" : "Distraction-free Focus Mode"}
              aria-label={focusMode ? "Exit Focus Mode" : "Distraction-free Focus Mode"}
            >
              {focusMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Exit Focus</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Focus</span>
                </>
              )}
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] active:scale-95 transition-all"
              title="Share article"
              aria-label="Share article"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. COMPACT ARTICLE HEADER (No text clipping, rapid scan) */}
        {/* ========================================================================= */}
        <header className="mb-6">
          {/* Mobile Category Pill (shown on small screens if hidden in top bar) */}
          {post.category && (
            <div className="sm:hidden mb-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                {post.category}
              </span>
            </div>
          )}

          {/* Article Title: Confident, crisp typography with optical tracking */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-foreground leading-[1.18] mb-3 text-balance">
            {post.title}
          </h1>

          {/* Subtitle / Excerpt: Clean single paragraph */}
          {post.excerpt && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
              {post.excerpt}
            </p>
          )}

          {/* Compact Inline Author & Meta Byline */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-2">
              {authorAvatarUrl ? (
                <img
                  src={authorAvatarUrl}
                  alt="Nilay Naha"
                  className="w-5 h-5 rounded-full object-cover border border-black/10 dark:border-white/10"
                  draggable={false}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                  NN
                </div>
              )}
              <span className="font-semibold text-foreground">Nilay Naha</span>
            </div>

            <span>•</span>

            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{formattedDate}</span>
            </span>

            {post.readTime && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{post.readTime} min read</span>
                </span>
              </>
            )}

            {typeof viewCount === "number" && viewCount > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>{viewCount} views</span>
                </span>
              </>
            )}
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 5. COMPACT COVER IMAGE (Constrained height to bring text immediately to view) */}
        {/* ========================================================================= */}
        {(post.coverImage || post.gDriveImage) && (
          <div className="mb-8">
            <div className="relative h-52 sm:h-64 md:h-72 w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] border-t-white/80 dark:border-t-white/20 shadow-md">
              <img
                src={driveImageUrl(post.coverImage || post.gDriveImage, 1600)}
                alt={post.title}
                className="w-full h-full object-cover select-none"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
                onError={(e) => {
                  if (post.gDriveImage && e.currentTarget.src !== driveImageUrl(post.gDriveImage, 1600)) {
                    e.currentTarget.src = driveImageUrl(post.gDriveImage, 1600);
                  } else {
                    e.currentTarget.style.display = "none";
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. MAIN READING BODY & STICKY SIDEBAR */}
        {/* ========================================================================= */}
        <div className={`flex flex-col lg:flex-row gap-10 lg:gap-14 items-start ${focusMode ? "justify-center" : ""}`}>
          
          {/* Main Reading Column (Strict 700px - 740px Line Length for Ergonomic Reading) */}
          <div className={`w-full min-w-0 transition-all duration-300 ${focusMode ? "max-w-2xl mx-auto" : "max-w-2xl lg:max-w-[680px] xl:max-w-[720px]"}`}>
            
            {/* The Markdown Content Container */}
            <div
              className="blog-content rich-content prose prose-base sm:prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-28 prose-headings:tracking-tight prose-headings:font-bold prose-h2:text-2xl prose-h2:sm:text-3xl prose-h3:text-xl prose-h3:sm:text-2xl prose-p:leading-[1.8] prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-code:text-primary dark:prose-code:text-primary prose-code:bg-black/[0.04] dark:prose-code:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-4 prose-blockquote:border-primary/80 prose-blockquote:bg-black/[0.02] dark:prose-blockquote:bg-white/[0.03] prose-blockquote:rounded-r-2xl prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:italic"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Article Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-black/[0.08] dark:border-white/[0.1]">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Topics Covered</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-foreground transition-colors"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-10 pt-6 border-t border-black/[0.08] dark:border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-sm font-semibold text-foreground transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-primary" />
                <span>Explore More Articles</span>
              </Link>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "Link Copied" : "Share This Article"}</span>
              </button>
            </div>
          </div>

          {/* Sticky Apple Sidebar (Table of Contents + Author + Project Link) */}
          <AnimatePresence>
            {!focusMode && (
              <motion.aside
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={appleSpring}
                className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-28 space-y-5"
              >
                {/* 1. Dynamic Table of Contents */}
                <TableOfContents contentSelector=".blog-content" />

                {/* 2. Apple Author Card */}
                <div className="rounded-2xl p-5 bg-white/70 dark:bg-[#12161f]/70 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] border-t-white/80 dark:border-t-white/20 shadow-sm">
                  <div className="flex items-center gap-3 mb-2.5">
                    {authorAvatarUrl ? (
                      <img
                        src={authorAvatarUrl}
                        alt="Nilay Naha"
                        className="w-9 h-9 rounded-full object-cover border border-black/10 dark:border-white/10"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        NN
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Nilay Naha</h4>
                      <p className="text-[11px] text-primary font-medium">Software Developer</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Specializing in Python, FastAPI, Next.js, and high-performance backend systems.
                  </p>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    About the Author <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 3. Linked Project Card */}
                {linkedProject && (
                  <div className="rounded-2xl p-5 bg-primary/[0.04] dark:bg-primary/[0.08] border border-primary/20 border-t-primary/30 shadow-sm">
                    <div className="flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-wider mb-2">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Featured Project</span>
                    </div>
                    <h5 className="font-bold text-foreground text-xs sm:text-sm mb-1.5 line-clamp-2">
                      {linkedProject.title}
                    </h5>
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                      {linkedProject.description?.replace(/<[^>]*>?/gm, "") ||
                        "Explore the full architecture and source code for this project."}
                    </p>
                    <Link
                      href={`/projects/${linkedProject.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      View Case Study <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. FLOATING APPLE DOCK (Appears smoothly when scrolling through article) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showReadingDock && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={appleSpring}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-full px-4 py-2 bg-white/85 dark:bg-[#12161f]/85 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] border-t-white/80 dark:border-t-white/20 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] flex items-center gap-3 text-xs max-w-[92vw] sm:max-w-md"
          >
            {/* Truncated Article Title */}
            <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-[200px]">
              {post.title}
            </span>

            <span className="text-muted-foreground/30">•</span>

            {/* Focus Mode Toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground active:scale-95 transition-all"
              title={focusMode ? "Exit Focus Mode" : "Focus Mode"}
            >
              {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{focusMode ? "Exit" : "Focus"}</span>
            </button>

            <span className="text-muted-foreground/30">•</span>

            {/* Share Action */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground active:scale-95 transition-all"
              title="Share"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
            </button>

            <span className="text-muted-foreground/30">•</span>

            {/* Scroll to Top Action */}
            <button
              onClick={scrollToTop}
              className="p-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary active:scale-95 transition-all"
              title="Scroll to top"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
