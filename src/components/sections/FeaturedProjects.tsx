"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

interface Project {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) return;
        
        const data = await res.json();
        const allProjects = Array.isArray(data) ? data : data.projects || [];
        
        // Take only the first 3 projects
        setProjects(allProjects.slice(0, 3));
      } catch (error) {
        console.error("Failed to load featured projects", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="container mx-auto px-4 max-w-6xl h-full flex flex-col justify-center">
      
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Featured Work
        </h2>
        <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-medium text-lg">
          Here are a few projects I&apos;ve worked on recently.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="text-center py-10 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl opacity-70">
          <p className="text-gray-500">No projects added yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {projects.map((project) => (
          <div 
            key={project._id} 
            className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
          >
            {/* Image Area */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 shrink-0">
              
              {/* 1. The Fallback Text (Always rendered, sits behind image) */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-lg p-4 text-center z-0">
                {project.title}
              </div>

              {/* 2. The Image (Sits on top, z-10) */}
              {project.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="relative z-10 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                     // FIX: Just hide the image. Do NOT touch parentElement.
                     // Hiding this reveals the fallback text div behind it.
                     (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
            </div>

            {/* Content Area */}
            <div className="p-6 flex flex-col flex-1 relative z-20 bg-white dark:bg-gray-900">
              <div className="flex gap-2 mb-3 flex-wrap">
                {project.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary">
                    {tag}
                  </span>
                ))}
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1 font-medium">
                {project.description}
              </p>
              
              <Link 
                href={project.githubUrl || project.demoUrl || "/projects"} 
                className="inline-flex items-center text-sm font-bold text-primary hover:underline mt-auto"
              >
                View Project <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!loading && projects.length > 0 && (
        <div className="text-center mt-10">
          <Link 
            href="/projects" 
            className="inline-block px-8 py-3 rounded-full border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold"
          >
            View All Projects
          </Link>
        </div>
      )}

    </div>
  );
}