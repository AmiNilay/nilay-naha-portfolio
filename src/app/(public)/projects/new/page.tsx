"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PublicNewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    tags: "",
    image: "",
    githubLink: "",
    liveLink: "",
  });

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
    setFormData({ ...formData, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const projectData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (res.ok) {
        alert("Project submitted successfully!");
        router.push("/projects");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred while connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pt-24">
      <Link 
        href="/projects" 
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6"
        title="Go back to projects"
      >
        <ArrowLeft size={20} /> Back to Projects
      </Link>

      <h1 className="text-3xl font-bold mb-8">Submit a New Project</h1>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-bold uppercase">Project Title</label>
            <input
              id="title"
              title="Project Title"
              placeholder="e.g., Real-time Face Recognition"
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
              placeholder="face-recognition-project"
              required
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-bold uppercase">Full Description</label>
          <textarea
            id="description"
            title="Project Description"
            placeholder="Detailed explanation of your work, tech used, and results..."
            required
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-bold uppercase">Tags (comma separated)</label>
            <input
              id="tags"
              title="Tags"
              placeholder="Python, OpenCV, TensorFlow"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-bold uppercase">Image URL</label>
            <input
              id="image"
              title="Project Image URL"
              placeholder="https://example.com/project.jpg"
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full p-3 rounded-xl border dark:bg-black dark:border-gray-700 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          title="Submit Project"
          className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Submit Project</>}
        </button>
      </form>
    </div>
  );
}