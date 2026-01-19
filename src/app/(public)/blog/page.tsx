"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Ensure you have configured domains in next.config.mjs if using external images
import { Calendar, Clock, ArrowRight, Search, Loader2 } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  createdAt: string;
  readTime?: number; 
}

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch Blogs
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // FIX: Changed to /api/blog (singular) to match your route file
        const res = await fetch("/api/blog"); 
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setPosts(data);
        } else if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 2. Filter Logic (Search)
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      
      {/* --- HEADER SECTION --- */}
      <div className="max-w-4xl mx-auto mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Thoughts & Insights</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Tutorials, tech deep-dives, and updates on my journey in AI & Web Dev.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* --- LOADING STATE --- */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading articles...</p>
        </div>
      )}

      {/* --- EMPTY STATE --- */}
      {!loading && filteredPosts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 mb-2">No articles found.</p>
          <p className="text-gray-400 text-sm">
            {searchQuery ? "Try a different search term." : "Check back later for updates!"}
          </p>
        </div>
      )}

      {/* --- BLOG GRID --- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <Link 
            key={post._id} 
            href={`/blog/${post.slug}`} // Links to your [slug] page
            className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image Area */}
            <div className="relative h-56 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              {post.coverImage ? (
                // Using <img> tag instead of Next/Image to avoid config errors for external URLs
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium bg-gray-100 dark:bg-gray-800">
                  No Cover Image
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="p-6 flex flex-col flex-grow">
              
              {/* Meta Info (Date & Time) */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {/* Handle date formatting safely */}
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Date N/A"}
                </div>
                {post.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime} min read
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">
                {post.excerpt}
              </p>

              {/* Read More Link */}
              <div className="flex items-center text-primary font-semibold text-sm mt-auto group/link">
                Read Article 
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/link:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}