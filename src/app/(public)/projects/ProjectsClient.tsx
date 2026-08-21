"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, Github, ExternalLink, Search, Image as ImageIcon, AlertTriangle, RefreshCw } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerContainer";

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  gDriveImage?: string;
  githubLink?: string;
  liveLink?: string;
  tags?: string[];
  techStack?: string[] | string;
}

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [projectsRes, settingsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/settings").catch(() => null)
      ]);

      if (!projectsRes.ok) {
        throw new Error("Failed to fetch projects");
      }
      
      const projectsData = await projectsRes.json();
      setProjects(projectsData.projects || []);

      if (settingsRes && settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else {
        setError("Failed to load projects. The server might be busy or experiencing issues.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stripHtml = (html: string) => {
    if (!html) return "";
    let text = html;
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<\/(p|div|h[1-6]|li|ul|ol|table|tr|td|th)>/gi, " ");
    text = text.replace(/<br\s*\/?>/gi, " ");
    text = text.replace(/<[^>]*>?/gm, "");
    text = text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    text = text.replace(/\s+/g, " ").trim();
    return text;
  };

  const allTags = Array.from(
    new Set(
      projects.flatMap((p) => {
        const tags = p.tags || (typeof p.techStack === "string" ? p.techStack.split(",") : p.techStack) || [];
        return tags.map((t: string) => t.trim());
      })
    )
  ).filter(Boolean);
  
  const filterTabs = ["All", ...allTags.slice(0, 5)];

  const filteredProjects = projects.filter((p) => {
    const plainTextDesc = stripHtml(p.description);
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      plainTextDesc.toLowerCase().includes(searchQuery.toLowerCase());
    
    const pTags = p.tags || (typeof p.techStack === "string" ? p.techStack.split(",") : p.techStack) || [];
    const matchesFilter = activeFilter === "All" || pTags.some((t: string) => t.trim() === activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl min-h-screen">
      <AnimatedSection direction="up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            {/* ✅ DYNAMIC HEADER FROM GLOBAL SETTINGS */}
            <h1 
              className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4"
              style={{ 
                fontFamily: settings?.projectsHeaderFont && settings.projectsHeaderFont !== 'Inter' ? `'${settings.projectsHeaderFont}', sans-serif` : 'inherit',
                fontWeight: settings?.projectsHeaderFont && settings.projectsHeaderFont !== 'Inter' ? 'normal' : '800'
              }}
            >
              {settings?.projectsHeader || "My Projects"}
            </h1>
            
            {/* ✅ DYNAMIC SUBHEADER FROM GLOBAL SETTINGS */}
            <p 
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl"
              style={{ 
                fontFamily: settings?.projectsSubheaderFont && settings.projectsSubheaderFont !== 'Inter' ? `'${settings.projectsSubheaderFont}', sans-serif` : 'inherit'
              }}
            >
              {settings?.projectsSubheader || "A collection of my recent work, ranging from full-stack applications to AI models and developer tools."}
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

      {/* ERROR STATE */}
      {error && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Oops! Something went wrong</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-lg">{error}</p>
          <button 
            onClick={() => fetchData()} 
            className="px-8 py-3.5 bg-primary text-white rounded-full font-bold hover:scale-105 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" /> Try Again
          </button>
        </div>
      )}

      {/* SKELETON LOADER */}
      {loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col h-[400px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm animate-pulse">
              <div className="w-full aspect-[16/9] bg-gray-200 dark:bg-gray-800"></div>
              <div className="p-6 flex flex-col flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-16"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 mb-6"></div>
                <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredProjects.length === 0 && (
        <AnimatedSection direction="fade">
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 text-lg font-medium">No projects found matching your criteria.</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter("All"); }} className="mt-4 text-primary font-bold hover:underline">
              Clear filters
            </button>
          </div>
        </AnimatedSection>
      )}

      {/* ACTUAL CONTENT */}
      {!loading && !error && filteredProjects.length > 0 && (
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.12}>
          {filteredProjects.map((project) => {
            const plainTextDesc = stripHtml(project.description);
            const tags = project.tags || (typeof project.techStack === "string" ? project.techStack.split(",") : project.techStack) || [];
            const displayTags = tags.slice(0, 3);
            const displayImage = project.image || project.gDriveImage;

            return (
              <StaggerItem key={project._id}>
                <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  
                  <Link href={`/projects/${project.slug}`} className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-800 overflow-hidden block">
                    {displayImage ? (
                      displayImage.includes("<iframe") ? (
                        <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full pointer-events-none" dangerouslySetInnerHTML={{ __html: displayImage }} />
                      ) : (
                        <img 
                          src={displayImage} 
                          alt={project.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            if (project.gDriveImage && !project.gDriveImage.includes("<iframe") && e.currentTarget.src !== project.gDriveImage) {
                              e.currentTarget.src = project.gDriveImage;
                            } else {
                              e.currentTarget.style.display = 'none';
                            }
                          }}
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                  </Link>

                  <div className="p-6 flex flex-col flex-1">
                    <Link href={`/projects/${project.slug}`} className="block group-hover:text-primary transition-colors">
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white line-clamp-1 mb-3" title={project.title}>
                        {project.title}
                      </h2>
                    </Link>

                    {displayTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {displayTags.map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-md">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                      {plainTextDesc || "No description provided."}
                    </p>

                    <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group/link">
                        View Details <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>

                      <div className="flex items-center gap-3">
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {project.liveLink && (
                          <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
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
