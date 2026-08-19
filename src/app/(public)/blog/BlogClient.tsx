"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Search, Tag, AlertTriangle, RefreshCw } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerContainer";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  gDriveImage?: string;
  createdAt: string;
  readTime?: number;
  tags?: string[];
}

export default function BlogClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Topics");

  const fetchPosts = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // 1. CACHING LOGIC
      if (!forceRefresh) {
        const cachedData = sessionStorage.getItem("portfolio_blog_cache");
        const cacheTime = sessionStorage.getItem("portfolio_blog_cache_time");
        
        if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime) < 3600000)) {
          setPosts(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      // 2. API CALL
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error("Server error");
      
      const data = await res.json();
      const fetchedPosts = Array.isArray(data) ? data : (data.posts || []);
      
      setPosts(fetchedPosts);
      sessionStorage.setItem("portfolio_blog_cache", JSON.stringify(fetchedPosts));
      sessionStorage.setItem("portfolio_blog_cache_time", Date.now().toString());

    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else {
        setError("Failed to load articles. The server might be busy or experiencing issues.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []).map((t) => t.trim()))
  ).filter(Boolean);
  
  const filterTabs = ["All Topics", ...allTags.slice(0, 5)];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const pTags = post.tags || [];
    const matchesFilter = activeFilter === "All Topics" || pTags.some((t) => t.trim() === activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen max-w-7xl">

      <AnimatedSection direction="up">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white">
            Thoughts & Insights
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10">
            Tutorials, tech deep-dives, and updates on my journey in AI & Web Dev.
          </p>
          
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm text-gray-900 dark:text-white"
            />
          </div>

          {filterTabs.length > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeFilter === tab 
                      ? "bg-primary text-white shadow-md" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* ERROR STATE */}
      {error && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Oops! Something went wrong</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-lg">{error}</p>
          <button 
            onClick={() => fetchPosts(true)} 
            className="px-8 py-3.5 bg-primary text-white rounded-full font-bold hover:scale-105 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" /> Try Again
          </button>
        </div>
      )}

      {/* SKELETON LOADER */}
      {loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col h-[420px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm animate-pulse">
              <div className="w-full aspect-[16/9] bg-gray-200 dark:bg-gray-800"></div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex gap-2 mb-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-16"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 mb-6"></div>
                <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-800">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredPosts.length === 0 && (
        <AnimatedSection direction="fade">
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 max-w-3xl mx-auto">
            <p className="text-xl text-gray-500 font-medium mb-2">No articles found.</p>
            <p className="text-gray-400 text-sm mb-4">
              {searchQuery || activeFilter !== "All Topics" ? "Try adjusting your search or filters." : "Check back later for updates!"}
            </p>
            {(searchQuery || activeFilter !== "All Topics") && (
              <button onClick={() => { setSearchQuery(""); setActiveFilter("All Topics"); }} className="text-primary font-bold hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        </AnimatedSection>
      )}

      {/* ACTUAL CONTENT */}
      {!loading && !error && filteredPosts.length > 0 && (
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.12}>
          {filteredPosts.map((post) => {
            const displayTags = post.tags ? post.tags.slice(0, 2) : [];

            return (
              <StaggerItem key={post._id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800 overflow-hidden border-b border-gray-100 dark:border-gray-800">
                    {(post.coverImage || post.gDriveImage) ? (
                      <img
                        src={post.coverImage || post.gDriveImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                        onError={(e) => {
                          if (post.gDriveImage && e.currentTarget.src !== post.gDriveImage) {
                            e.currentTarget.src = post.gDriveImage;
                          } else {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                            e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<span class="text-gray-400 flex flex-col items-center gap-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg> Image Unavailable</span>');
                          }
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium bg-gray-100 dark:bg-gray-800">
                        <Tag className="w-8 h-8 opacity-20" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    {displayTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {displayTags.map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Date N/A"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime || 3} min read
                      </div>
                    </div>

                    <h2 className="text-xl font-extrabold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center text-primary font-bold text-sm group/link">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover/link:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
