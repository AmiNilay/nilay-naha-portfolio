"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, Github, ExternalLink, Search, Image as ImageIcon } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerContainer";

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  githubLink?: string;
  liveLink?: string;
  tags?: string[];
  techStack?: string[] | string;
}

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setLoading(false);
          return;
        }
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

  // 1. Utility to strip raw HTML tags and HTML entities from Quill editor content
  const stripHtml = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>?/gm, "") // Strip HTML tags
      .replace(/&nbsp;/g, " ")   // Replace non-breaking spaces
      .replace(/&amp;/g, "&")    // Replace ampersands
      .trim();
  };

  // 2. Extract unique tags for the Filter Bar
  const allTags = Array.from(
    new Set(
      projects.flatMap((p) => {
        const tags = p.tags || (typeof p.techStack === "string" ? p.techStack.split(",") : p.techStack) || [];
        return tags.map((t: string) => t.trim());
      })
    )
  ).filter(Boolean);
  
  // Take top 5 tags for quick filters to avoid clutter
  const filterTabs = ["All", ...allTags.slice(0, 5)];

  // 3. Filter and Search Logic
  const filteredProjects = projects.filter((p) => {
    const plainTextDesc = stripHtml(p.description);
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      plainTextDesc.toLowerCase().includes(searchQuery.toLowerCase());
    
    const pTags = p.tags || (typeof p.techStack === "string" ? p.techStack.split(",") : p.techStack) || [];
    const matchesFilter = activeFilter === "All" || pTags.some((t: string) => t.trim() === activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl">
      
      {/* HEADER & SEARCH BAR */}
      <AnimatedSection direction="up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              My Projects
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              A collection of my recent work, ranging from full-stack applications to AI models and developer tools.
            </p>
          </div>
          
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
            />
          </div>
        </div>
      </AnimatedSection>

      {/* FILTER TABS */}
      {filterTabs.length > 1 && (
        <AnimatedSection direction="up">
          <div className="flex flex-wrap items-center gap-2 mb-12">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeFilter === tab 
                    ? "bg-primary text-white shadow-md" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* PROJECTS GRID */}
      {filteredProjects.length === 0 ? (
        <AnimatedSection direction="fade">
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 text-lg font-medium">No projects found matching your criteria.</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("All"); }} className="mt-4 text-primary font-bold hover:underline">
              Clear filters
            </button>
          </div>
        </AnimatedSection>
      ) : (
        <StaggerContainer
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          staggerDelay={0.12}
        >
          {filteredProjects.map((project) => {
            const plainTextDesc = stripHtml(project.description);
            const tags = project.tags || (typeof project.techStack === "string" ? project.techStack.split(",") : project.techStack) || [];
            const displayTags = tags.slice(0, 3);

            return (
              <StaggerItem key={project._id}>
                <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  
                  {/* 16:9 Thumbnail */}
                  <Link href={`/projects/${project.slug}`} className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-800 overflow-hidden block">
                    {project.image ? (
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                          e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<span class="text-gray-400 flex flex-col items-center gap-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg> Image Unavailable</span>');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                  </Link>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <Link href={`/projects/${project.slug}`} className="block group-hover:text-primary transition-colors">
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white line-clamp-1 mb-3" title={project.title}>
                        {project.title}
                      </h2>
                    </Link>

                    {/* Tech Stack Pills */}
                    {displayTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {displayTags.map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-md">
                            {tag.trim()}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                            +{tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Clean Excerpt */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                      {plainTextDesc || "No description provided."}
                    </p>

                    {/* Footer (Pinned to bottom using mt-auto) */}
                    <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <Link 
                        href={`/projects/${project.slug}`} 
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group/link"
                      >
                        View Details <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-3">
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="View Source Code">
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {project.liveLink && (
                          <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors" title="Live Demo">
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
