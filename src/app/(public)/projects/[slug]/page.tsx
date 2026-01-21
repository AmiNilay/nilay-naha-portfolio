"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks"; // 🟢 NEW IMPORT
import rehypeRaw from "rehype-raw";

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
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <p className="text-gray-500">The project slug "{slug}" does not exist.</p>
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

        {/* Project Image */}
        <div className="w-full max-w-4xl mx-auto aspect-video bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden mb-12 shadow-2xl border border-gray-200 dark:border-gray-800 relative">
          {project.image ? (
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image Available</div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          
          {/* Main Content Area */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">About the Project</h2>
            
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg prose dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]} 
                rehypePlugins={[rehypeRaw]}
                components={{
                  // 1. Fix Paragraph Spacing (This separates sections)
                  p: ({node, ...props}) => <p {...props} className="mb-6 leading-relaxed" />,
                  
                  // 2. Fix Images
                  img: ({node, ...props}) => (
                    <img {...props} className="rounded-xl shadow-lg my-6 max-w-full" />
                  ),
                  
                  // 3. Fix Links
                  a: ({node, ...props}) => (
                    <a {...props} className="text-primary font-bold hover:underline" target="_blank" rel="noopener noreferrer" />
                  ),
                  
                  // 4. Fix Table
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-8 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                      <table {...props} className="w-full text-left border-collapse min-w-[500px]" />
                    </div>
                  ),
                  thead: ({node, ...props}) => (
                    <thead {...props} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" />
                  ),
                  th: ({node, ...props}) => (
                    <th {...props} className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold whitespace-nowrap" />
                  ),
                  td: ({node, ...props}) => (
                    <td {...props} className="p-4 border-b border-gray-100 dark:border-gray-800" />
                  ),

                  // 5. Fix Lists (Ensure they have vertical space)
                  ul: ({node, ...props}) => <ul {...props} className="list-disc pl-6 space-y-2 my-6" />,
                  ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-6 space-y-2 my-6" />,
                  li: ({node, ...props}) => <li {...props} className="pl-1" />
                }}
              >
                {project.description}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sidebar Links */}
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