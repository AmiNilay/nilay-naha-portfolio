"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    tags: "",
    githubLink: "",
    liveLink: "",
    image: null as File | null,
  });

  // Automatically creates a slug from the title
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
    setFormData({ ...formData, slug });
  };

  // Handles image selection and preview
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

    // Using FormData to handle file upload
    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("description", formData.description);
    data.append("tags", formData.tags);
    data.append("githubLink", formData.githubLink);
    data.append("liveLink", formData.liveLink);
    
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: data, // No Headers needed, browser sets boundary for FormData
      });

      const result = await res.json();

      if (res.ok) {
        alert("Project saved and image uploaded to GitHub!");
        router.push("/admin/projects");
        router.refresh();
      } else {
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
    <div className="p-8 max-w-4xl mx-auto">
      <Link 
        href="/admin/projects" 
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6"
        title="Back to dashboard"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Create New Project</h1>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
      >
        {/* Title and Slug */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-bold uppercase">Project Title</label>
            <input
              id="title"
              title="Project Title"
              placeholder="e.g., AI Sign Language Translator"
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
                className="text-primary text-xs"
                title="Generate slug from title"
              >
                Auto-generate
              </button>
            </label>
            <input
              id="slug"
              title="URL Slug"
              placeholder="ai-translator"
              required
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-bold uppercase">Description</label>
          <textarea
            id="description"
            title="Project Description"
            placeholder="Describe your project goals and technologies used..."
            required
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Image Upload with Preview */}
        <div className="space-y-2">
          <label htmlFor="image" className="text-sm font-bold uppercase">Project Image (Auto-uploads to GitHub)</label>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-1/2">
              <input
                id="image"
                title="Select Project Image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border rounded-xl dark:bg-black dark:border-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
            {imagePreview && (
              <div className="relative w-full md:w-1/2 aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Tags and Links */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-bold uppercase">Tags (comma separated)</label>
            <input
              id="tags"
              title="Tech Stack Tags"
              placeholder="React, Python, Tailwind"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="github" className="text-sm font-bold uppercase">GitHub Link</label>
            <input
              id="github"
              title="GitHub Repository URL"
              placeholder="https://github.com/..."
              type="text"
              value={formData.githubLink}
              onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          title="Save Project"
          className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Uploading & Saving...</span>
          ) : (
            <><Save size={20} /> Save Project</>
          )}
        </button>
      </form>
    </div>
  );
}