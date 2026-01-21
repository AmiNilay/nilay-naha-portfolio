"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

export default function ProjectsSection() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // 🟢 FIXED: Manually decodes the symbols causing your issue
  const stripHtml = (html: string) => {
    if (!html) return "";

    // 1. Replace encoded brackets (This is likely the main culprit)
    let text = html
      .replace(/&lt;/g, "<")  // Turn &lt; back into <
      .replace(/&gt;/g, ">")  // Turn &gt; back into >
      .replace(/&nbsp;/g, " ") // Turn &nbsp; into space
      .replace(/&amp;/g, "&"); // Turn &amp; into &

    // 2. Remove all HTML tags (<p>, <div>, <br>, etc.)
    text = text.replace(/<[^>]*>?/gm, " ");

    // 3. Clean up extra spaces
    return text.replace(/\s+/g, " ").trim();
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 py-24 min-h-full">
      <h1 className="text-4xl font-bold mb-12 text-center md:text-left">My Projects</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {projects.length === 0 ? (
          <p className="text-gray-500 italic">No projects found. Check back soon!</p>
        ) : (
          projects.map((project) => (
            <Link 
              key={project._id}
              href={`/projects/${project.slug}`} 
              className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="h-48 bg-gray-100 dark:bg-gray-800 relative">
                {project.image ? (
                   <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{project.title}</h2>
                
                {/* 🟢 Clean Preview Text */}
                <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                  {project.description ? stripHtml(project.description) : "No description available."}
                </p>

                <span className="text-primary font-bold inline-flex items-center gap-2">
                  View Details <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}