"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IBlog } from "@/types";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { Eye, X, Save, Clock, FileText, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BlogFormProps {
  initialData?: Partial<IBlog>;
  isEditing?: boolean;
}

export default function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    coverImage: "",
    tags: "",
    readTime: 5,
    published: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        content: initialData.content || "",
        coverImage: initialData.coverImage || "",
        tags: initialData.tags ? initialData.tags.join(", ") : "",
        readTime: initialData.readTime || 5,
        published: initialData.published ?? true
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_secret") : null;

    const payload = {
      ...formData,
      tags: formData.tags.split(",").map(s => s.trim()).filter(Boolean),
      readTime: Number(formData.readTime)
    };

    const url = isEditing && initialData?._id 
      ? `/api/blog/${initialData._id}` 
      : "/api/blog";
        
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-admin-secret": token || "" 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save post");
      
      setToast({ message: "Post saved successfully!", type: "success" });

      setTimeout(() => {
        router.push("/admin/blog");
        router.refresh();
      }, 1000);

    } catch (error) {
      console.error(error);
      setToast({ message: "Error saving blog post", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* QUICKLOOK PREVIEW MODAL */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex flex-col justify-end sm:justify-center p-0 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden mx-auto"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500 opacity-60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-60" />
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 pl-2">
                    QuickLook Preview
                  </span>
                </div>
                <button 
                  onClick={() => setShowPreview(false)} 
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <article className="p-8 sm:p-10 overflow-y-auto space-y-6">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {formData.title || "Untitled Post"}
                </h1>
                
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Clock size={13} /> {formData.readTime} min read</span>
                  <span>•</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {formData.tags && formData.tags.split(",").map((tag, i) => (
                      <span key={i} className="text-blue-600 dark:text-blue-400 font-medium">#{tag.trim()}</span>
                    ))}
                  </div>
                </div>

                {formData.coverImage && (
                  <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {formData.content || "Start typing your article markdown content..."}
                </div>
              </article>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Title</label>
            <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="rounded-xl border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="slug" className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Slug</label>
            <Input id="slug" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required className="rounded-xl border-zinc-200 dark:border-zinc-800 font-mono text-xs" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Short Description</label>
          <Input id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="rounded-xl border-zinc-200 dark:border-zinc-800" />
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor="coverImage" className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Cover Image URL</label>
          <Input id="coverImage" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} className="rounded-xl border-zinc-200 dark:border-zinc-800 font-mono text-xs" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="content" className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Content (Markdown)</label>
          <textarea 
            id="content" 
            className="w-full h-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 p-4 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 outline-none leading-relaxed resize-y" 
            value={formData.content} 
            onChange={e => setFormData({...formData, content: e.target.value})} 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="tags" className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Tags (comma separated)</label>
            <Input id="tags" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="rounded-xl border-zinc-200 dark:border-zinc-800 text-xs" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="readTime" className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Read Time (mins)</label>
            <Input id="readTime" type="number" value={formData.readTime} onChange={e => setFormData({...formData, readTime: Number(e.target.value)})} className="rounded-xl border-zinc-200 dark:border-zinc-800 text-xs" />
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60">
          <input 
            type="checkbox" 
            id="published" 
            className="w-4 h-4 rounded accent-emerald-600 cursor-pointer" 
            checked={formData.published} 
            onChange={e => setFormData({...formData, published: e.target.checked})} 
          />
          <label htmlFor="published" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
            Publish immediately (public visibility)
          </label>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{loading ? "Saving..." : isEditing ? "Update Post" : "Create Post"}</span>
          </button>

          <button 
            type="button" 
            onClick={() => setShowPreview(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all"
          >
            <Eye size={14} /> QuickLook Preview
          </button>
        </div>
      </form>
    </>
  );
}
