"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Loader2, Clock, Share2, Check } from "lucide-react"; // 🟢 Added Share2 & Check icons
import Toast from "@/components/ui/Toast"; // 🟢 Import Toast

// Assuming this component exists
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
  
  // 🟢 State for Share Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog?slug=${slug}`);
        const data = await res.json();
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

  // 🟢 Share Handler
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ message: "Link copied to clipboard!", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to copy link.", type: "error" });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <Link href="/blog" className="text-primary hover:underline flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${readingMode ? "bg-[#fbfbfb] dark:bg-[#111]" : "bg-background"}`}>
      
      {/* 🟢 Toast Component */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <article className={`mx-auto px-4 transition-all duration-500 ease-in-out ${readingMode ? "max-w-2xl py-12" : "max-w-4xl py-24"}`}>
        
        {/* Navigation */}
        <div className={`mb-8 flex justify-between items-center transition-opacity duration-300 ${readingMode ? "opacity-0 pointer-events-none h-0" : "opacity-100"}`}>
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to all articles
          </Link>
          
          {/* 🟢 Share Button (Visible in normal mode) */}
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            title="Share this article"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Header Section */}
        <header className="mb-10 text-center md:text-left">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 justify-center md:justify-start">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {post.readTime && (
              <span className="flex items-center gap-1 border-l pl-4 dark:border-gray-800">
                <Clock className="w-4 h-4" /> {post.readTime} min read
              </span>
            )}
          </div>

          <h1 className={`font-bold text-foreground mb-6 transition-all duration-300 ${readingMode ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl md:leading-tight"}`}>
            {post.title}
          </h1>

          {post.coverImage && (
            <div className={`relative w-full overflow-hidden rounded-2xl mb-8 bg-gray-100 dark:bg-gray-800 transition-all duration-500 ${readingMode ? "h-64 opacity-80" : "h-[450px] shadow-2xl"}`}>
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
        </header>

        {/* Reading Controls */}
        <div className="sticky top-20 z-10 bg-background/80 backdrop-blur-sm rounded-full mb-8 flex items-center justify-between px-2">
           <BlogControls content={post.content} onReadingModeChange={setReadingMode} />
           
           {/* 🟢 Share Button (Visible in Reading Mode for convenience) */}
           {readingMode && (
             <button 
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Copy Link"
             >
               <Share2 className="w-5 h-5" />
             </button>
           )}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className={`prose dark:prose-invert max-w-none transition-all duration-500 ${readingMode ? "prose-xl leading-relaxed font-serif text-gray-800 dark:text-gray-200" : "prose-lg text-gray-600 dark:text-gray-300"}`}>
          {/* Render HTML content */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

      </article>
    </div>
  );
}