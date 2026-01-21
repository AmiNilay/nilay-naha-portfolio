"use client";

import { useState, useEffect, useMemo, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Toast from "@/components/ui/Toast";

// 🟢 Import Quill Styles
import "react-quill/dist/quill.snow.css";

// 🟢 Dynamic Import for Editor
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    existingImage: "",
    image: null as File | null,
  });

  // 🟢 MS WORD-LIKE TOOLBAR CONFIGURATION
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }], // Colors
      [{ 'align': [] }], // Text Alignment
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video', 'clean'], // Media & Clean
    ],
  }), []);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.post) {
          const p = data.post;
          setFormData({
            title: p.title || "",
            slug: p.slug || "",
            excerpt: p.excerpt || "",
            content: p.content || "",
            existingImage: p.coverImage || "",
            image: null,
          });
          setImagePreview(p.coverImage || null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

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
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);
    
    if (formData.image) {
      data.append("image", formData.image);
    } else {
      data.append("existingImage", formData.existingImage);
    }

    try {
      const res = await fetch(`/api/blog/${id}`, { method: "PUT", body: data });
      if (res.ok) {
        setToast({ message: "Blog post updated successfully!", type: "success" });
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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Link href="/admin/blog" className="flex items-center gap-2 text-gray-500 mb-6 hover:text-primary transition-colors" title="Back to blog list">
        <ArrowLeft size={20} /> Back
      </Link>

      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Top Section */}
        <div className="grid md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="space-y-2">
            <label htmlFor="title" className="font-bold text-sm uppercase text-gray-500">Title</label>
            <input 
              id="title" required 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full p-3 border rounded-xl dark:bg-black" 
              placeholder="Post Title"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="font-bold text-sm uppercase text-gray-500">Slug</label>
            <input 
              id="slug" required 
              value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} 
              className="w-full p-3 border rounded-xl dark:bg-black font-mono text-sm" 
              placeholder="url-slug"
            />
          </div>
        </div>

        {/* Excerpt & Image */}
        <div className="grid md:grid-cols-2 gap-6">
           <div className="space-y-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
             <label htmlFor="excerpt" className="font-bold text-sm uppercase text-gray-500">Short Excerpt</label>
             <textarea 
               id="excerpt" rows={5}
               value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
               className="w-full p-3 border rounded-xl dark:bg-black leading-relaxed"
               placeholder="Brief summary for the card view..."
             />
           </div>

           <div className="space-y-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col">
             <label className="font-bold text-sm uppercase text-gray-500 mb-2">Cover Image</label>
             <div className="flex-1 border-2 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-black/20">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-8 text-gray-400">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-xs">Upload Cover</span>
                  </div>
                )}
                <input 
                  type="file" accept="image/*" onChange={handleImageChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
             </div>
           </div>
        </div>

        {/* Editor Section */}
        <div className="space-y-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <label className="font-bold text-sm uppercase text-gray-500">Content</label>
          <div className="bg-white text-black rounded-xl overflow-hidden border border-gray-300 [&_*]:!text-black">
            <ReactQuill 
              theme="snow" 
              value={formData.content} 
              onChange={c => setFormData({...formData, content: c})} 
              modules={modules} 
              className="h-96 mb-12" 
              placeholder="Write your story..." 
            />
          </div>
        </div>

        {/* 🟢 FIXED BUTTON: Black background in Light Mode, White background in Dark Mode */}
        <button 
          type="submit" 
          disabled={saving} 
          className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Update Post</>}
        </button>
      </form>
    </div>
  );
}