"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Loader2, Clock } from "lucide-react";

// Assuming this component exists in your project
import BlogControls from "@/components/blog/BlogControls";

interface BlogPost {
  _id: string;
  title: string;
  content: string; 
  coverImage?: string;
  createdAt: string;
  readTime?: number;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        // FIX: Using the query param style to match our API route
        const res = await fetch(`/api/blog?slug=${slug}`);
        const data = await res.json();
        
        // Match the data structure { post: {...} } from your API
        if (data && data.post) {
          setPost(data.post);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error("Failed to fetch blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-8">The article you are looking for does not exist.</p>
        <Link href="/blog" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${readingMode ? "bg-[#fbfbfb] dark:bg-[#111]" : "bg-background"}`}>
      
      <article 
        className={`mx-auto px-4 transition-all duration-500 ease-in-out ${
          readingMode ? "max-w-2xl py-12" : "max-w-4xl py-24"
        }`}
      >
        
        {/* Navigation */}
        <div className={`mb-8 transition-opacity duration-300 ${readingMode ? "opacity-0 pointer-events-none h-0" : "opacity-100"}`}>
          <Link 
            href="/blog" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to all articles
          </Link>
        </div>

        {/* Header Section */}
        <header className="mb-10 text-center md:text-left">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 justify-center md:justify-start">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
            {post.readTime && (
              <span className="flex items-center gap-1 border-l pl-4 dark:border-gray-800">
                <Clock className="w-4 h-4" /> {post.readTime} min read
              </span>
            )}
          </div>

          <h1 className={`font-bold text-foreground mb-6 transition-all duration-300 ${
            readingMode ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl md:leading-tight"
          }`}>
            {post.title}
          </h1>

          {post.coverImage && (
            <div className={`relative w-full overflow-hidden rounded-2xl mb-8 bg-gray-100 dark:bg-gray-800 transition-all duration-500 ${
              readingMode ? "h-64 opacity-80" : "h-[450px] shadow-2xl"
            }`}>
              {/* Using standard img to avoid domain whitelist errors in dev */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        {/* Reading Controls */}
        <div className="sticky top-20 z-10 bg-background/80 backdrop-blur-sm rounded-full mb-8">
           <BlogControls 
             content={post.content} 
             onReadingModeChange={setReadingMode} 
           />
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div 
          className={`prose dark:prose-invert max-w-none transition-all duration-500 ${
            readingMode 
              ? "prose-xl leading-relaxed font-serif text-gray-800 dark:text-gray-200" 
              : "prose-lg text-gray-600 dark:text-gray-300"
          }`}
        >
          {/* CRITICAL: Safely render HTML from your Rich Text Editor */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

      </article>
    </div>
  );
}