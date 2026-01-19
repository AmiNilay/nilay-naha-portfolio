"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    existingImage: "",
    image: null as File | null,
  });

  // 1. Fetch existing blog post data SAFELY
  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog?id=${id}`);
        
        // FIX: Check if response is valid before parsing JSON
        if (!res.ok) {
          console.error("Server Error:", res.statusText);
          alert("Failed to fetch blog details. ID might be invalid.");
          setLoading(false);
          return;
        }

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

    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);
    
    // Handle image update logic
    if (formData.image) {
      data.append("image", formData.image);
    } else {
      data.append("existingImage", formData.existingImage);
    }

    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: "PUT",
        body: data,
      });

      if (res.ok) {
        alert("Blog post updated successfully!");
        router.push("/admin/blog");
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (error) {
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/admin/blog" className="flex items-center gap-2 text-gray-500 mb-6" title="Back to blog list">
        <ArrowLeft size={20} /> Back
      </Link>

      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="font-bold">Title</label>
            <input 
              id="title" title="Post Title" placeholder="Enter title" required 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full p-3 border rounded-xl dark:bg-black" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="font-bold">Slug</label>
            <input 
              id="slug" title="Post Slug" placeholder="url-slug" required 
              value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} 
              className="w-full p-3 border rounded-xl dark:bg-black" 
            />
          </div>
        </div>

        <div className="space-y-2">
           <label htmlFor="excerpt" className="font-bold">Short Excerpt</label>
           <textarea 
             id="excerpt" title="Excerpt" placeholder="Short summary" rows={2}
             value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
             className="w-full p-3 border rounded-xl dark:bg-black"
           />
        </div>

        <div className="space-y-2">
          <label htmlFor="blog-image" className="font-bold">Cover Image</label>
          <input 
            id="blog-image" title="Upload cover image" type="file" accept="image/*" 
            onChange={handleImageChange} className="w-full p-3 border rounded-xl dark:bg-black" 
          />
          {imagePreview && <img src={imagePreview} alt="Preview" className="h-40 rounded-xl object-cover mt-2" />}
        </div>

        <div className="space-y-2">
          <label className="font-bold">Content</label>
          <div className="bg-white text-black rounded-xl overflow-hidden border border-gray-300">
            <ReactQuill 
              theme="snow" 
              value={formData.content} 
              onChange={c => setFormData({...formData, content: c})} 
              className="h-80 mb-12" 
              placeholder="Write your post content here..." 
            />
          </div>
        </div>

        <button type="submit" disabled={saving} title="Update blog post" className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Update Post</>}
        </button>
      </form>
    </div>
  );
}