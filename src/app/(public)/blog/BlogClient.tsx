"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Search, Loader2, Tag } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerContainer";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  createdAt: string;
  readTime?: number;
  tags?: string[];
}

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Topics");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/blog");
        const data = await res.json();
        if (Array.isArray(data)) setPosts(data);
        else if (data.posts && Array.isArray(data.posts)) setPosts(data.posts);
        else setPosts([]);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Extract unique tags for the Filter Bar
  const allTags = Array.from(
    new Set(
      posts.flatMap((p) => p.tags || []).map((t) => t.trim())
    )
  ).filter(Boolean);
  
  // Take top 5 tags for quick filters
  const filterTabs = ["All Topics", ...allTags.slice(0, 5)];

  // Filter Logic (Search + Category)
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
          
          {/* Search Bar */}
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

          {/* FILTER TABS */}
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

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-gray-500 font-medium animate-pulse">Loading articles...</p>
        </div>
      )}

      {!loading && filteredPosts.length === 0 && (
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

      <StaggerContainer
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        staggerDelay={0.12}
      >
        {filteredPosts.map((post) => {
          const displayTags = post.tags ? post.tags.slice(0, 2) : []; // Show max 2 tags

          return (
            <StaggerItem key={post._id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800 overflow-hidden border-b border-gray-100 dark:border-gray-800">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium bg-gray-100 dark:bg-gray-800">
                      <Tag className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  
                  {/* Topic Badges */}
                  {displayTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {displayTags.map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta Data */}
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

                  {/* Title & Excerpt */}
                  <h2 className="text-xl font-extrabold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Footer (Pinned to bottom) */}
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
    </div>
  );
}
