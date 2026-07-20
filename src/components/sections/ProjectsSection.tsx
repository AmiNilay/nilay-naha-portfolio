"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, ExternalLink } from "lucide-react";

export default function ProjectsSection() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        
        // 🟢 THE FIX: Filter out projects scheduled for the future
        const now = new Date();
        const publishedProjects = (data.projects || []).filter((project: any) => {
          // If there is a publishDate, check if it's older than or equal to RIGHT NOW
          if (project.publishDate) {
            return new Date(project.publishDate) <= now;
          }
          // If no date exists for some reason, just show it
          return true; 
        });

        setProjects(publishedProjects);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 py-24 min-h-full">
      <h1 className="text-4xl font-bold mb-12 text-center md:text-left">My Projects</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {projects.length === 0 ? (
          <p className="text-gray-500 italic">No projects found. Check back soon!</p>
        ) : (
          projects.map((project) => (
            <div 
              key={project._id}
              className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all h-full"
            >
              <Link href={`/projects/${project.slug}`} className="h-48 bg-gray-100 dark:bg-gray-800 relative block overflow-hidden">
                {project.image ? (
                   <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </Link>
              
              <div className="p-6 flex flex-col flex-1">
                <Link href={`/projects/${project.slug}`} className="block mb-2">
                   <h2 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{project.title}</h2>
                </Link>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Link 
                    href={`/projects/${project.slug}`} 
                    className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    View Details <ArrowRight size={16} />
                  </Link>
                  
                  {project.liveLink && (
                    <a 
                      href={project.liveLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
                    >
                      Live Link <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}