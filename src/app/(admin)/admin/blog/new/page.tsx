"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import ReactQuill dynamically to prevent SSR errors
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: null as File | null,
  });

  // Automatically create a slug from the title
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
    setFormData({ ...formData, slug });
  };

  // Handle Image Selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);

    // Append the image file if selected
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        body: data, // Send FormData (browser sets the boundary automatically)
      });

      if (res.ok) {
        alert("Blog post created and image uploaded to GitHub!");
        router.push("/admin/blog");
        router.refresh();
      } else {
        const result = await res.json();
        alert(`Failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link 
        href="/admin/blog" 
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6"
        title="Back to Blog List"
      >
        <ArrowLeft size={20} /> Back to Blog List
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Create New Post</h1>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
      >
        {/* Title and Slug */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-bold uppercase">Post Title</label>
            <input
              id="title"
              title="Post Title"
              placeholder="e.g., The Future of AI"
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-bold uppercase flex justify-between">
              Slug 
              <button 
                type="button" 
                onClick={generateSlug} 
                className="text-primary text-xs hover:underline"
                title="Auto-generate slug"
              >
                Auto-generate
              </button>
            </label>
            <input
              id="slug"
              title="URL Slug"
              placeholder="future-of-ai"
              required
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <label htmlFor="excerpt" className="text-sm font-bold uppercase">Short Excerpt</label>
          <textarea
            id="excerpt"
            title="Short Summary"
            placeholder="A brief summary of what this article is about..."
            required
            rows={2}
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label htmlFor="image" className="text-sm font-bold uppercase">Cover Image (Auto-upload to GitHub)</label>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-1/2">
              <input
                id="image"
                title="Select Cover Image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border rounded-xl dark:bg-black dark:border-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
            {imagePreview && (
              <div className="relative w-full md:w-1/2 aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-black">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase">Content</label>
          <div className="bg-white text-black rounded-xl overflow-hidden border border-gray-300">
            <ReactQuill 
              theme="snow" 
              value={formData.content} 
              onChange={(content) => setFormData({ ...formData, content })}
              className="h-80 mb-12"
              placeholder="Write your article content here..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          title="Publish Post"
          className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Uploading & Publishing...</span>
          ) : (
            <><Save size={20} /> Publish Post</>
          )}
        </button>
      </form>
    </div>
  );
}