"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; // The MongoDB ID from the URL

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    tags: "",
    githubLink: "",
    liveLink: "",
    image: null as File | null,
    existingImage: "", // Stores the current URL from the database
  });

  // 1. Fetch existing project data
  useEffect(() => {
    if (!id) return;

    fetch(`/api/projects?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.post) {
          const p = data.post;
          setFormData({
            title: p.title || "",
            slug: p.slug || "",
            description: p.description || "",
            tags: p.tags ? p.tags.join(", ") : "",
            githubLink: p.githubLink || "",
            liveLink: p.liveLink || "",
            image: null,
            existingImage: p.image || "",
          });
          setImagePreview(p.image || null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [id]);

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
    setFormData({ ...formData, slug });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("description", formData.description);
    data.append("tags", formData.tags);
    data.append("githubLink", formData.githubLink);
    data.append("liveLink", formData.liveLink);
    
    // If a new file is selected, append it. 
    // Otherwise, the backend will keep the existingImage URL.
    if (formData.image) {
      data.append("image", formData.image);
    } else {
      data.append("existingImage", formData.existingImage);
    }

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        body: data,
      });

      if (res.ok) {
        alert("Project updated successfully!");
        router.push("/admin/projects");
        router.refresh();
      } else {
        const result = await res.json();
        alert(`Failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while connecting to the server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link 
        href="/admin/projects" 
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6"
        title="Back to dashboard"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Edit Project</h1>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="edit-title" className="text-sm font-bold uppercase">Title</label>
            <input
              id="edit-title"
              title="Project Title"
              placeholder="Enter title"
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-slug" className="text-sm font-bold uppercase flex justify-between">
              Slug <button type="button" onClick={generateSlug} className="text-primary text-xs" title="Regenerate slug">Regenerate</button>
            </label>
            <input
              id="edit-slug"
              title="Project Slug"
              placeholder="url-slug"
              required
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-description" className="text-sm font-bold uppercase">Description</label>
          <textarea
            id="edit-description"
            title="Project Description"
            placeholder="Detailed project description"
            required
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-image" className="text-sm font-bold uppercase">Update Project Image</label>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-1/2">
              <input
                id="edit-image"
                title="Choose new image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border rounded-xl dark:bg-black dark:border-gray-700 file:bg-primary/10 file:text-primary file:rounded-full file:border-0"
              />
            </div>
            {imagePreview && (
              <div className="relative w-full md:w-1/2 aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="edit-tags" className="text-sm font-bold uppercase">Tags</label>
            <input
              id="edit-tags"
              title="Tech Stack Tags"
              placeholder="React, Next.js, etc."
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-github" className="text-sm font-bold uppercase">GitHub URL</label>
            <input
              id="edit-github"
              title="GitHub Link"
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
          disabled={saving}
          title="Update Project"
          className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
        >
          {saving ? (
            <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Updating...</span>
          ) : (
            <><Save size={20} /> Update Project</>
          )}
        </button>
      </form>
    </div>
  );
}