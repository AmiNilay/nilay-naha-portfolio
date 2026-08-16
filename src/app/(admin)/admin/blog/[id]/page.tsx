"use client";

import { useState, useEffect, useMemo, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Save, Loader2, Upload, Calendar, Eye, Wand2, 
  X, Maximize2, Minimize2, ChevronDown, ChevronUp, Clock, FileText
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Toast from "@/components/ui/Toast";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

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

  const [formData, setFormData] = useState({
    title: "", slug: "", excerpt: "", content: "", existingImage: "",
    image: null as File | null,
    publishDate: "", status: "Draft", featured: false,
    metaTitle: "", metaDescription: "", canonicalUrl: ""
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Stats
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'clean'],
    ],
  }), []);

  useEffect(() => {
    if (isNew) {
      setFormData(prev => ({ ...prev, publishDate: new Date().toISOString().slice(0, 16) }));
      return;
    }

    if (!id) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.post) {
          const p = data.post;
          const formattedDate = p.publishDate ? new Date(p.publishDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);

          setFormData({
            title: p.title || "", slug: p.slug || "", excerpt: p.excerpt || "",
            content: p.content || "", existingImage: p.coverImage || "", image: null,
            publishDate: formattedDate, status: p.status || (p.published ? "Published" : "Draft"),
            featured: p.featured || false, metaTitle: p.metaTitle || "", 
            metaDescription: p.metaDescription || "", canonicalUrl: p.canonicalUrl || ""
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

  // Calculate Word Count & Read Time dynamically
  useEffect(() => {
    const text = formData.content.replace(/<[^>]+>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
    setReadTime(Math.ceil(words / 200) || 1); // Avg reading speed: 200 wpm
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
        setToast({ message: "Blog post saved successfully!", type: "success" });
        setTimeout(() => router.push("/admin/blog"), 1500);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Update failed");
      }
    } catch (error) {
      setToast({ message: "An error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 🟢 LIVE PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-12 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-500">Live Preview</h2>
              <button type="button" onClick={() => setShowPreview(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-medium transition-colors">
                <X size={20} /> Close Preview
              </button>
            </div>
            <header className="mb-12">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag, i) => <span key={i} className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">{tag}</span>)}
                </div>
              )}
              <h1 className="text-5xl font-extrabold text-black mb-6">{formData.title || "Untitled Post"}</h1>
              <p className="text-xl text-gray-600 mb-8">{formData.excerpt}</p>
              {imagePreview && <img src={imagePreview} alt="Cover" className="w-full aspect-[21/9] object-cover rounded-2xl mb-8 shadow-lg" />}
            </header>
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-pre:bg-gray-900 prose-pre:text-white" dangerouslySetInnerHTML={{ __html: formData.content || "<p>No content yet...</p>" }} />
          </div>
        </div>
      )}

      {/* 🟢 STICKY HEADER ACTIONS */}
      <div className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-black transition-colors"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-extrabold text-black">{isNew ? "Create Post" : "Edit Post"}</h1>
            <p className="text-sm text-gray-500 font-medium">{formData.status} • {wordCount} words</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button type="button" onClick={() => setShowPreview(true)} className="flex-1 sm:flex-none bg-white border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 text-black px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            <Eye size={20} /> Preview
          </button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 !text-white px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg transition-all">
            {saving ? <Loader2 className="animate-spin w-5 h-5 !text-white" /> : <Save className="w-5 h-5 !text-white" />} <span className="!text-white">Save</span>
          </button>
        </div>
      </div>

      <form className="p-8 max-w-7xl mx-auto">
        {/* 🟢 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Post Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 text-xl font-bold border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter an engaging title..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 flex justify-between items-center">
                  Slug
                  <button type="button" onClick={generateSlug} className="text-blue-600 flex items-center gap-1 hover:underline bg-blue-50 px-2 py-1 rounded-md"><Wand2 size={12} /> Auto-Generate</button>
                </label>
                <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. my-awesome-post" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 flex justify-between">
                  Short Excerpt <span className={`${formData.excerpt.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>{formData.excerpt.length} / 160</span>
                </label>
                <textarea rows={3} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed" placeholder="A brief summary of the article..." />
              </div>
            </div>

            {/* Rich Text Editor with Fullscreen Toggle */}
            <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col transition-all ${isFullscreen ? 'fixed inset-0 z-50 p-8 overflow-y-auto' : 'p-6'}`}>
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold uppercase text-gray-500">Content Body</label>
                <button type="button" onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
              <div className={`bg-white text-black rounded-xl overflow-hidden border border-gray-300 flex-1 ${isFullscreen ? 'min-h-[80vh]' : ''}`}>
                <ReactQuill theme="snow" value={formData.content} onChange={c => setFormData({...formData, content: c})} modules={modules} className={`${isFullscreen ? 'h-[75vh]' : 'h-[500px]'} mb-12`} />
              </div>
            </div>

            {/* SEO Accordion */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button type="button" onClick={() => setShowSEO(!showSEO)} className="w-full p-6 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="font-bold text-black">SEO & Social Share Settings</span>
                {showSEO ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showSEO && (
                <div className="p-6 space-y-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Meta Title</label>
                    <input value={formData.metaTitle} onChange={e => setFormData({...formData, metaTitle: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="SEO Title (defaults to post title)" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Meta Description</label>
                    <textarea rows={2} value={formData.metaDescription} onChange={e => setFormData({...formData, metaDescription: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="SEO Description (defaults to excerpt)" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Canonical URL</label>
                    <input value={formData.canonicalUrl} onChange={e => setFormData({...formData, canonicalUrl: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://medium.com/your-article" />
                  </div>
                </div>
               )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Publishing Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-28 space-y-6">
              
              {/* Publishing Metadata */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Publish Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1"><Calendar size={14}/> Publish Date</label>
                  <input type="datetime-local" value={formData.publishDate} onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-black text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="font-bold text-gray-700">Feature this article</span>
                  </label>
                </div>
              </div>

              {/* Cover Image */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <label className="text-xs font-bold uppercase text-gray-500">Cover Image</label>
                <div className="w-full aspect-[16/9] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center relative overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
                  {imagePreview ? (
                    <div className="relative w-full h-full group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setFormData({...formData, image: null}); setImagePreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                    </div>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-blue-600 transition-colors">
                      <Upload className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-bold">Click or Drag Image</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Categories & Tags */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Categories & Tags</label>
                <div className="w-full p-2 rounded-xl border border-gray-300 bg-white flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-blue-500">
                  {tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">
                      {tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14}/></button>
                    </span>
                  ))}
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Type and press Enter..." className="flex-1 min-w-[120px] p-1 outline-none bg-transparent text-black font-medium text-sm" />
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center text-gray-500">
                <div className="flex items-center gap-2 font-medium text-sm"><FileText size={16} /> {wordCount} words</div>
                <div className="flex items-center gap-2 font-medium text-sm"><Clock size={16} /> ~{readTime} min read</div>
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
