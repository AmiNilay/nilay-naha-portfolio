"use client";

import { useState, useEffect, ChangeEvent } from "react";
import TopicChips from "@/components/admin/TopicChips";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Save, Loader2, Upload, Calendar, Eye, Wand2, 
  X, Maximize2, Minimize2, ChevronDown, ChevronUp, Clock, FileText,
  Table as TableIcon, Code, Link as LinkIcon, Sparkles, Globe, 
  CheckCircle2, AlertCircle, Share2
} from "lucide-react";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import RichPreview, { ContentSyntaxHint } from "@/components/admin/RichPreview";
import { motion, AnimatePresence } from "framer-motion";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const [availableProjects, setAvailableProjects] = useState<{_id: string, title: string}[]>([]);

  const [formData, setFormData] = useState({
    title: "", slug: "", excerpt: "", content: "", existingImage: "",
    image: null as File | null,
    gDriveImage: "",
    publishDate: "", status: "Draft", featured: false,
    metaTitle: "", metaDescription: "", canonicalUrl: "",
    relatedProject: ""
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);

  useEffect(() => {
    fetch("/api/projects?all=1")
      .then(res => res.json())
      .then(data => {
        if (data.projects) setAvailableProjects(data.projects);
      })
      .catch(err => console.error("Failed to fetch projects", err));

    if (isNew) {
      setFormData(prev => ({ ...prev, publishDate: new Date().toISOString().slice(0, 16) }));
      return;
    }

    if (!id) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog?id=${id}&all=1`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.post) {
          const p = data.post;
          const formattedDate = p.publishDate ? new Date(p.publishDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);

          setFormData({
            title: p.title || "", slug: p.slug || "", excerpt: p.excerpt || "",
            content: p.content || "", existingImage: p.coverImage || "", image: null,
            gDriveImage: p.gDriveImage || "",
            publishDate: formattedDate, status: p.status || (p.published ? "Published" : "Draft"),
            featured: p.featured || false, metaTitle: p.metaTitle || "", 
            metaDescription: p.metaDescription || "", canonicalUrl: p.canonicalUrl || "",
            relatedProject: p.relatedProject || ""
          });
          setTags(p.tags || []);
          setImagePreview(p.coverImage || null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, isNew]);

  useEffect(() => {
    const text = formData.content.replace(/<[^>]+>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
    setReadTime(Math.ceil(words / 200) || 1);
  }, [formData.content]);

  const generateSlug = () => {
    const slug = formData.title.toLowerCase().trim().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
    setFormData({ ...formData, slug });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const insertTableTemplate = () => {
    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; border: 1px solid rgba(150, 150, 150, 0.2); border-radius: 8px; overflow: hidden;">
  <thead>
    <tr style="background-color: rgba(120, 120, 120, 0.08);">
      <th style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px; font-weight: 600; text-align: left;">Topic</th>
      <th style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px; font-weight: 600; text-align: left;">Key Takeaway</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px;">Architecture</td>
      <td style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px;">Microservices decoupled with event queues.</td>
    </tr>
  </tbody>
</table>
`;
    setFormData(prev => ({ ...prev, content: prev.content + "\n" + tableHtml + "\n" }));
    setToast({ message: "Table markup added!", type: "success" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "image" && typeof value === "string") data.append(key, value);
    });
    data.append("featured", String(formData.featured));
    data.append("published", String(formData.status === "Published"));
    data.append("tags", tags.join(","));
    
    if (!isNew && id) data.append("id", id as string);
    if (formData.image) data.append("image", formData.image);
    else data.append("existingImage", formData.existingImage);

    try {
      const res = await fetch(`/api/blog`, { method: isNew ? "POST" : "PUT", body: data });
      if (res.ok) {
        setToast({ message: "Article saved successfully!", type: "success" });
        setTimeout(() => router.push("/admin/blog"), 1200);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Update failed");
      }
    } catch {
      setToast({ message: "An error occurred while saving article.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Loading article data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* FULLSCREEN QUICKLOOK LIVE PREVIEW */}
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
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden mx-auto"
            >
              {/* Window Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => setShowPreview(false)}
                      className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition-opacity" 
                      title="Close"
                    />
                    <div className="w-3 h-3 rounded-full bg-amber-500 opacity-60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-60" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 pl-2">
                    QuickLook Preview — {formData.title || "Untitled Post"}
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowPreview(false)} 
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Preview Body */}
              <div className="p-8 sm:p-12 overflow-y-auto space-y-8">
                <div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
                    {formData.title || "Untitled Post"}
                  </h1>
                  {formData.excerpt && (
                    <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal mb-6">
                      {formData.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                    <span className="flex items-center gap-1"><Clock size={13} /> {readTime} min read</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><FileText size={13} /> {wordCount} words</span>
                  </div>
                </div>

                {imagePreview && (
                  <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div 
                  className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: formData.content || "<p class='text-zinc-400 italic'>No content yet...</p>" }} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP BAR NAVIGATION & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/blog" 
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                {isNew ? "Drafting Canvas" : "Article Inspector"}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] font-medium text-zinc-400">
                {formData.status} • {wordCount} words (~{readTime} min read)
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {isNew ? "Compose New Story" : formData.title || "Edit Article"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setShowPreview(true)} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 backdrop-blur-md shadow-sm active:scale-[0.98] transition-all"
          >
            <Eye size={15} /> QuickLook Preview
          </button>
          <button 
            type="button"
            onClick={handleSubmit} 
            disabled={saving} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? "Publishing..." : "Save Article"}</span>
          </button>
        </div>
      </div>

      {/* MAIN 2-COLUMN LAYOUT */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: MAIN CONTENT & EDITOR */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Title & Slug Bento */}
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-sm space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Article Title</label>
              <input 
                required 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 text-base font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400" 
                placeholder="Give your writing an insightful title..." 
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Slug Path</label>
                <button 
                  type="button" 
                  onClick={generateSlug} 
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Wand2 size={11} /> Auto-Generate
                </button>
              </div>
              <div className="flex items-center px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/50 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                <span className="text-zinc-400 select-none">/blog/</span>
                <input 
                  required 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100" 
                  placeholder="modern-ai-architecture" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Abstract / Excerpt</label>
                <span className={`text-[11px] font-mono ${formData.excerpt.length > 160 ? 'text-rose-500 font-semibold' : 'text-zinc-400'}`}>
                  {formData.excerpt.length} / 160
                </span>
              </div>
              <textarea 
                rows={3} 
                value={formData.excerpt} 
                onChange={e => setFormData({...formData, excerpt: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-zinc-400" 
                placeholder="A concise, compelling overview displayed in social cards and search results..." 
              />
            </div>
          </div>

          {/* TABBED SOURCE / RENDERED EDITOR */}
          <div className={`rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col transition-all ${isFullscreen ? 'fixed inset-4 z-50 p-6' : ''}`}>
            
            {/* Editor Action Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60">
                <button 
                  type="button" 
                  onClick={() => setEditorTab("write")} 
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    editorTab === "write" 
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Code size={14} /> Write Source
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditorTab("preview")} 
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    editorTab === "preview" 
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Eye size={14} /> Rendered View
                </button>
              </div>

              <div className="flex items-center gap-2">
                {editorTab === "write" && (
                  <button 
                    type="button" 
                    onClick={insertTableTemplate} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <TableIcon size={14} /> Insert Table
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setIsFullscreen(!isFullscreen)} 
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Distraction-Free Mode"}
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
              </div>
            </div>

            {/* Editor Workspace */}
            <div className="p-6 flex-1">
              {editorTab === "write" ? (<>
                <textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  className={`w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/20 resize-y ${
                    isFullscreen ? 'h-[75vh]' : 'h-[500px]'
                  }`} 
                  placeholder="<h1>Deep Dive</h1>&#10;<p>Share architectural reasoning, insights, code snippets and analysis...</p>" 
                />
                <ContentSyntaxHint />
              </>
              ) : (
                <RichPreview 
                  className={`w-full p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 overflow-y-auto ${
                    isFullscreen ? 'h-[75vh]' : 'h-[500px]'
                  }`}
                  content={formData.content} empty="Nothing to render yet..."
                />
              )}
            </div>
          </div>

          {/* SEO & SOCIAL SHARE ACCORDION */}
          <div className="rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-sm overflow-hidden">
            <button 
              type="button" 
              onClick={() => setShowSEO(!showSEO)} 
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-blue-500" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  SEO & Social Metadata
                </span>
              </div>
              {showSEO ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
            </button>

            {showSEO && (
              <div className="p-6 pt-2 space-y-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Meta Title</label>
                  <input 
                    value={formData.metaTitle} 
                    onChange={e => setFormData({...formData, metaTitle: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="SEO title tag (falls back to post title)" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Meta Description</label>
                  <textarea 
                    rows={2} 
                    value={formData.metaDescription} 
                    onChange={e => setFormData({...formData, metaDescription: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="Search snippet description" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Canonical URL</label>
                  <input 
                    value={formData.canonicalUrl} 
                    onChange={e => setFormData({...formData, canonicalUrl: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="https://nilaynaha.dev/blog/original-post" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY PUBLISHING SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-24 space-y-6">
            
            {/* Publishing Controls */}
            <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Publishing State</h2>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Published">Published (Public)</option>
                    <option value="Draft">Draft (Private)</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                    <Calendar size={12} /> Publication Date
                  </label>
                  <input 
                    type="datetime-local" 
                    value={formData.publishDate} 
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} 
                    className="w-full px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
              </div>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className={formData.featured ? "text-amber-500" : "text-zinc-400"} />
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Feature on Home</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.featured} 
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} 
                  className="w-4 h-4 rounded-md accent-blue-600 cursor-pointer" 
                />
              </label>
            </div>

            {/* Link to Portfolio Project */}
            <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-sm space-y-3">
              <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                <LinkIcon size={13} /> Linked Case Study / Project
              </label>
              <select 
                value={formData.relatedProject} 
                onChange={(e) => setFormData({ ...formData, relatedProject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- No Project Linked --</option>
                {availableProjects.map(proj => (
                  <option key={proj._id} value={proj._id}>{proj.title}</option>
                ))}
              </select>
            </div>

            {/* Cover Imagery */}
            <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-sm space-y-4">
              <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Hero Media (Cover)</span>
              
              <div className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-center relative overflow-hidden group">
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => { setFormData({...formData, image: null}); setImagePreview(null); }} 
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-4 text-center">
                    <Upload className="w-6 h-6 mb-1.5 opacity-50" />
                    <span className="text-xs font-semibold">Upload Cover</span>
                    <span className="text-[10px] text-zinc-400">PNG, JPG or WebP</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">Google Drive Fallback</label>
                <input 
                  type="text" 
                  value={formData.gDriveImage} 
                  onChange={(e) => setFormData({ ...formData, gDriveImage: e.target.value })} 
                  placeholder="Paste Drive thumbnail link..." 
                  className="w-full px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
              </div>
            </div>

            {/* Categorization & Tags */}
            <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-sm space-y-3">
              <label className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Article Tags</label>
              <div className="p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-wrap gap-1.5 items-center">
                {tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500 transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)} 
                  onKeyDown={handleTagKeyDown} 
                  placeholder="Type tag & Enter..." 
                  className="flex-1 min-w-[100px] px-2 py-1 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none" 
                />
              </div>
              <TopicChips tags={tags} onChange={setTags} />
            </div>

            {/* Quick Metrics */}
            <div className="p-4 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-around text-zinc-500 text-xs font-medium">
              <span className="flex items-center gap-1.5"><FileText size={14} /> {wordCount} words</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> ~{readTime} min read</span>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
