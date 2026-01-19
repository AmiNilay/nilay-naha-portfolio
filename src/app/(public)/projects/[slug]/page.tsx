"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Loader2, Tag } from "lucide-react";

export default function ProjectDetails() {
  const params = useParams();
  const slug = params?.slug; 
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    // We must fetch using the slug parameter
    fetch(`/api/projects?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <p className="text-gray-500">The project slug "{slug}" does not exist in the database.</p>
        <Link href="/projects" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto">
        <Link href="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Projects
        </Link>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
          {project.title}
        </h1>

        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden mb-12 shadow-2xl border border-gray-200 dark:border-gray-800">
          {project.image ? (
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">About the Project</h2>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
              {project.description}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 sticky top-28">
              <h3 className="font-semibold mb-6 text-lg italic">Project Links</h3>
              <div className="space-y-4">
                {project.githubLink && (
                  <a href={project.githubLink} target="_blank" className="flex items-center justify-between w-full p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary transition-all">
                    <span className="flex items-center gap-3 font-medium"><Github size={20} /> GitHub</span>
                    <ExternalLink size={18} />
                  </a>
                )}
                {project.liveLink && (
                  <a href={project.liveLink} target="_blank" className="flex items-center justify-between w-full p-4 bg-primary text-white rounded-xl hover:opacity-90 transition-all">
                    <span className="flex items-center gap-3 font-medium"><ExternalLink size={20} /> Live Demo</span>
                    <ArrowLeft size={18} className="rotate-180" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}