"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { fetchWithSessionCache, clearMemoryCache } from "@/lib/clientCache";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Calendar,
  Clock,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Eye,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  gDriveImage?: string;
  createdAt: string;
  publishDate?: string;
  readTime?: number | string;
  tags?: string[];
  views?: number;
  category?: string;
}

// Apple WWDC 2018 Fluid Spring parameters: critically damped for UI chrome, snappy & responsive
const appleSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
};

const appleSoftSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 24,
};

export default function BlogClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Topics");

  const fetchPosts = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        clearMemoryCache("blog_posts");
        setLoading(true);
      }

      const data = await fetchWithSessionCache<any>("blog_posts", "/api/blog");
      const fetchedPosts = Array.isArray(data) ? data : data.posts || [];
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Failed to load blog entries:", err);
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setError("You are currently offline. Please reconnect to view articles.");
      } else {
        setError("Unable to load articles right now. Please try again shortly.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Extract unique tags and build filter tabs
  const filterTabs = useMemo(() => {
    const tags = Array.from(
      new Set(
        posts
          .flatMap((p) => p.tags || [])
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );
    return ["All Topics", ...tags.slice(0, 6)];
  }, [posts]);

  // Filter posts based on active filter and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(q)));

      const pTags = post.tags || [];
      const matchesFilter =
        activeFilter === "All Topics" ||
        pTags.some((t) => t.trim().toLowerCase() === activeFilter.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [posts, searchQuery, activeFilter]);

  // Featured post: The latest post when not searching/filtering
  const isDefaultView = !searchQuery.trim() && activeFilter === "All Topics";
  const featuredPost = isDefaultView && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts = isDefaultView ? filteredPosts.slice(1) : filteredPosts;

  const totalReadMinutes = useMemo(() => {
    return posts.reduce((acc, p) => acc + (Number(p.readTime) || 4), 0);
  }, [posts]);

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground pb-28 pt-8">
      {/* Background Ambience: Subtle, Apple-style radial luminance */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60 dark:opacity-40"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* ========================================================================= */}
        {/* 1. EDITORIAL HEADER (Apple Newsroom / Developer Journal Typography) */}
        {/* ========================================================================= */}
        <header className="pt-12 pb-10 text-center max-w-3xl mx-auto">
          {/* Eyebrow Label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...appleSpring, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Articles & Technical Notes</span>
          </motion.div>

          {/* Display Heading: Tight optical tracking and balanced leading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...appleSpring, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.035em] text-foreground leading-[1.08] mb-6"
          >
            Thoughts, Architecture & Insights.
          </motion.h1>

          {/* Subheading with refined measure */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...appleSpring, delay: 0.15 }}
            className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            A curated collection of deep-dives, architectural case studies, backend design patterns,
            and software engineering reflections.
          </motion.p>

          {/* Micro Stat Badges */}
          {!loading && !error && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...appleSpring, delay: 0.2 }}
              className="mt-6 inline-flex items-center gap-4 text-xs font-medium text-muted-foreground bg-black/[0.03] dark:bg-white/[0.04] px-4 py-2 rounded-full border border-black/[0.05] dark:border-white/[0.08]"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <strong className="text-foreground font-semibold">{posts.length}</strong> publications
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <strong className="text-foreground font-semibold">~{totalReadMinutes}</strong> min total read
              </span>
            </motion.div>
          )}
        </header>

        {/* ========================================================================= */}
        {/* 2. FLOATING CONTROL CAPSULE (Apple Glassmorphic Toolbar) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...appleSpring, delay: 0.25 }}
          className="sticky top-20 z-30 mb-12 max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl p-2 sm:p-2.5 bg-white/75 dark:bg-[#12161f]/75 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] border-t-white/80 dark:border-t-white/20 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.5)] transition-all">
            <div className="flex flex-col md:flex-row items-center gap-2.5">
              {/* Search Field (Spotlight Style) */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by topic or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-sm bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus:bg-white dark:focus:bg-[#0b0f14] text-foreground placeholder:text-muted-foreground/70 rounded-2xl border border-transparent focus:border-primary/40 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Segmented Filter Pills (macOS / iOS segmented control) */}
              <div className="flex items-center gap-1 overflow-x-auto w-full py-1 px-0.5 no-scrollbar">
                {filterTabs.map((tab) => {
                  const isActive = activeFilter === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(tab)}
                      className={`relative px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap transition-colors duration-200 select-none active:scale-[0.96] ${
                        isActive
                          ? "text-primary-foreground dark:text-black font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeFilterPill"
                          transition={appleSpring}
                          className="absolute inset-0 bg-primary dark:bg-primary rounded-2xl shadow-sm z-0"
                        />
                      )}
                      <span className="relative z-10">{tab}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. ERROR STATE */}
        {/* ========================================================================= */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={appleSpring}
            className="my-16 max-w-lg mx-auto p-8 rounded-3xl bg-white/70 dark:bg-card/70 backdrop-blur-xl border border-red-500/20 shadow-xl text-center"
          >
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
              Unable to Display Articles
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{error}</p>
            <button
              onClick={() => fetchPosts(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 4. SKELETON PLACEHOLDERS (Apple Glass Shimmer) */}
        {/* ========================================================================= */}
        {loading && !error && (
          <div className="space-y-10">
            {/* Featured Skeleton */}
            <div className="w-full h-80 sm:h-96 rounded-3xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] animate-pulse p-8 flex flex-col justify-end" />

            {/* Grid Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white/50 dark:bg-card/40 border border-black/[0.05] dark:border-white/[0.08] p-4 flex flex-col h-[400px] animate-pulse"
                >
                  <div className="aspect-[16/10] w-full bg-black/[0.06] dark:bg-white/[0.06] rounded-2xl mb-5" />
                  <div className="h-4 w-24 bg-black/[0.06] dark:bg-white/[0.06] rounded-full mb-3" />
                  <div className="h-6 w-5/6 bg-black/[0.06] dark:bg-white/[0.06] rounded-lg mb-3" />
                  <div className="h-4 w-full bg-black/[0.06] dark:bg-white/[0.06] rounded-md mb-2" />
                  <div className="h-4 w-2/3 bg-black/[0.06] dark:bg-white/[0.06] rounded-md mb-auto" />
                  <div className="h-5 w-20 bg-black/[0.06] dark:bg-white/[0.06] rounded-md mt-4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. EMPTY SEARCH STATE */}
        {/* ========================================================================= */}
        {!loading && !error && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={appleSpring}
            className="py-20 max-w-md mx-auto text-center"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-3xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-muted-foreground">
              <SlidersHorizontal className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
              No matching publications
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              We couldn't find any articles matching &ldquo;{searchQuery || activeFilter}&rdquo;. Try
              adjusting your search terms or clearing current filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All Topics");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-foreground text-sm font-semibold transition-all active:scale-95"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 6. EDITORIAL CONTENT SHOWCASE */}
        {/* ========================================================================= */}
        {!loading && !error && filteredPosts.length > 0 && (
          <div className="space-y-12">
            {/* 6A. FEATURED EDITORIAL STORY (App Store "Today" Card Style) */}
            {featuredPost && (
              <motion.article
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={appleSpring}
                className="group relative rounded-3xl overflow-hidden bg-white/70 dark:bg-[#12161f]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.1] border-t-white/80 dark:border-t-white/20 shadow-[0_16px_50px_-15px_rgba(0,0,0,0.07)] dark:shadow-[0_16px_50px_-15px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.6)] transition-all duration-500"
              >
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  prefetch={true}
                  className="flex flex-col lg:flex-row items-stretch"
                >
                  {/* Left Column: Editorial Details */}
                  <div className="flex-1 p-6 sm:p-10 lg:p-12 flex flex-col justify-between z-10">
                    <div>
                      {/* Eyebrow & Tags */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                          Featured Story
                        </span>
                        {featuredPost.tags && featuredPost.tags[0] && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] text-muted-foreground">
                            {featuredPost.tags[0]}
                          </span>
                        )}
                      </div>

                      {/* Title: Display tracking */}
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.03em] text-foreground leading-[1.15] mb-4 group-hover:text-primary transition-colors duration-300">
                        {featuredPost.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    {/* Metadata & CTA Bar */}
                    <div className="pt-6 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {featuredPost.publishDate || featuredPost.createdAt
                            ? new Date(
                                featuredPost.publishDate || featuredPost.createdAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {featuredPost.readTime || 4} min read
                        </span>
                      </div>

                      {/* Apple-style circular action button */}
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform duration-300">
                        Read Story
                        <span className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: High-Res Editorial Artwork */}
                  <div className="relative lg:w-1/2 min-h-[260px] lg:min-h-full overflow-hidden bg-black/[0.03] dark:bg-white/[0.03]">
                    {featuredPost.coverImage || featuredPost.gDriveImage ? (
                      <img
                        src={featuredPost.coverImage || featuredPost.gDriveImage}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 p-8">
                        <BookOpen className="w-16 h-16 stroke-1 mb-2" />
                        <span className="text-xs uppercase tracking-widest font-semibold">
                          Nilay Naha Journal
                        </span>
                      </div>
                    )}
                    {/* Gradient Overlay for seamless integration */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                </Link>
              </motion.article>
            )}

            {/* 6B. CARD COLLECTION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <AnimatePresence mode="popLayout">
                {gridPosts.map((post, index) => {
                  const displayTags = post.tags ? post.tags.slice(0, 2) : [];
                  const displayDate = post.publishDate || post.createdAt;

                  return (
                    <motion.article
                      key={post._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ ...appleSoftSpring, delay: Math.min(index * 0.05, 0.3) }}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex flex-col h-full rounded-3xl overflow-hidden bg-white/70 dark:bg-[#12161f]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] border-t-white/80 dark:border-t-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.55)] transition-shadow duration-300"
                    >
                      <Link href={`/blog/${post.slug}`} prefetch={true} className="flex flex-col h-full">
                        {/* Media Container */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/[0.03] dark:bg-white/[0.03] border-b border-black/[0.05] dark:border-white/[0.06]">
                          {post.coverImage || post.gDriveImage ? (
                            <img
                              src={post.coverImage || post.gDriveImage}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out select-none"
                              onContextMenu={(e) => e.preventDefault()}
                              draggable={false}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                              <BookOpen className="w-10 h-10 stroke-1 mb-1" />
                              <span className="text-[10px] uppercase tracking-wider font-medium">
                                Insight
                              </span>
                            </div>
                          )}

                          {/* Top-Right Badge: Category / Primary Tag */}
                          {displayTags[0] && (
                            <div className="absolute top-3 left-3 z-10">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/90 dark:bg-black/80 backdrop-blur-md text-foreground shadow-sm border border-black/[0.05] dark:border-white/[0.1]">
                                {displayTags[0]}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Article Body */}
                        <div className="p-6 flex flex-col flex-grow">
                          {/* Micro Meta (Date & Reading Time) */}
                          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mb-3">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {displayDate
                                ? new Date(displayDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              {post.readTime || 4} min
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg sm:text-xl font-bold tracking-[-0.02em] text-foreground leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-200">
                            {post.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                            {post.excerpt}
                          </p>

                          {/* Card Footer: View Counts & Direct Link Indicator */}
                          <div className="mt-auto pt-4 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            {typeof post.views === "number" && post.views > 0 ? (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Eye className="w-3.5 h-3.5 text-primary" />
                                {post.views} {post.views === 1 ? "view" : "views"}
                              </span>
                            ) : (
                              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                                Engineering Note
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform duration-200">
                              Read
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
