"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Loader2, Download, Calendar, Tag } from "lucide-react";

export default function ProjectDetails() {
  const params = useParams();
  const slug = params?.slug; 
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

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
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Project Not Found</h1>
        <p className="text-gray-500 mb-4">The project you are looking for does not exist or was removed.</p>
        <Link href="/projects" className="bg-primary text-white px-6 py-3 rounded-full hover:opacity-90 font-bold transition-all flex items-center gap-2 shadow-lg">
          <ArrowLeft size={18} /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 sm:px-12 animate-in fade-in duration-700 bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation & Header */}
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary mb-10 transition-colors group">
          <div className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm group-hover:-translate-x-1 transition-transform border border-gray-200 dark:border-gray-800">
            <ArrowLeft size={16} />
          </div>
          Back to Portfolio
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-6">
            {project.title}
          </h1>
          
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag size={16} className="text-gray-400 mr-1" />
              {project.tags.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold tracking-wide shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-[16/9] bg-gray-200 dark:bg-gray-900 rounded-3xl overflow-hidden mb-16 shadow-2xl border border-gray-200 dark:border-gray-800 relative group">
          {project.image ? (
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">No Cover Image Provided</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="grid lg:grid-cols-3 gap-16">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-4">Project Overview</h2>
            
            <div 
              className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </div>

          {/* Redesigned Sidebar Area (Glassmorphism & Fixed Buttons) */}
          <div className="space-y-8">
            <div className="p-8 bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl sticky top-32">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-xl">Resources</h3>
              
              <div className="space-y-4">
                
                {/* 1. Live Link (Now styled to match the image, with white text & icon) */}
                {project.liveLink && (
                  <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full p-4 bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors font-semibold group">
                    <ExternalLink size={20} className="text-gray-900 dark:text-white" /> Live Preview
                  </a>
                )}

                {/* 2. GitHub Link (Fixed: White Text on Dark Background with GitHub Icon) */}
                {project.githubLink && (
                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full p-4 bg-gray-900 dark:bg-black text-white rounded-2xl hover:bg-gray-800 transition-colors shadow-lg font-semibold group">
                    <span className="flex items-center gap-3"><Github size={20} className="text-white" /> Source Code</span>
                    <ExternalLink size={18} className="text-white/70 group-hover:text-white transition-opacity" />
                  </a>
                )}

                {/* 3. App Download Link (Fixed: Correct Light Green Aesthetic with Icon) */}
                {project.appLink && (
                  <a href={project.appLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full p-4 bg-[#e6fcf0] dark:bg-green-950 text-[#006e3a] dark:text-green-300 rounded-2xl hover:bg-[#d4f9e6] dark:hover:bg-green-900 transition-colors font-semibold group">
                    <span className="flex items-center gap-3"><Download size={20} className="text-[#006e3a] dark:text-green-300" /> Download App</span>
                    <ExternalLink size={18} className="text-[#006e3a]/70 dark:text-green-300/70 rotate-180" />
                  </a>
                )}

              </div>
              
              {/* 4. Date (Now centered with the same gray aesthetic) */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 dark:bg-gray-950/50 py-3 rounded-xl">
                <Calendar size={16} className="text-primary" />
                <span>Published on {new Date(project.publishDate || project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}