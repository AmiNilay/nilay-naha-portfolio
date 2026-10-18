"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Search,
  ExternalLink,
  Star,
  Image as ImageIcon,
  Filter,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  gDriveImage?: string;
  status?: string;
  featured?: boolean;
  publishDate?: string;
  createdAt?: string;
  tags?: string[];
  techStack?: string[] | string;
}

// Hidden Google Drive thumbnail converter
const getGDriveThumb = (url?: string) => {
  if (!url) return null;
  const match = url.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w400` : null;
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/projects?id=${projectToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setProjects(projects.filter((p) => p._id !== projectToDelete));
        setToast({ message: "Project deleted successfully", type: "success" });
        setShowDeleteModal(false);
      } else {
        setToast({ message: "Failed to delete project", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Error deleting project", type: "error" });
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  const toggleFeatured = async (project: Project) => {
    setProjects(projects.map((p) => (p._id === project._id ? { ...p, featured: !p.featured } : p)));
    try {
      const formData = new FormData();
      formData.append("id", project._id);
      formData.append("featured", String(!project.featured));
      await fetch("/api/projects", { method: "PUT", body: formData });
    } catch (error) {
      setProjects(projects.map((p) => (p._id === project._id ? { ...p, featured: project.featured } : p)));
      setToast({ message: "Failed to update featured status", type: "error" });
    }
  };

  let filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (statusFilter !== "All") {
    if (statusFilter === "Featured") {
      filteredProjects = filteredProjects.filter((p) => p.featured);
    } else {
      filteredProjects = filteredProjects.filter((p) => (p.status || "Published") === statusFilter);
    }
  }

  filteredProjects.sort((a, b) => {
    const dateA = new Date(a.publishDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.publishDate || b.createdAt || 0).getTime();
    if (sortBy === "Newest") return dateB - dateA;
    if (sortBy === "Oldest") return dateA - dateB;
    if (sortBy === "Alphabetical") return a.title.localeCompare(b.title);
    return 0;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Loading Project Catalog...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 select-none">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Portfolio Showcase
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Project Inventory
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Managing {projects.length} total projects ({filteredProjects.length} filtered).
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="px-5 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs sm:text-sm font-bold shadow-lg shadow-zinc-950/10 hover:opacity-95 active:scale-98 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" /> Add New Project
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
          />
        </div>

        <div className="flex gap-2.5">
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-semibold focus:outline-none appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Featured">Featured Only</option>
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-semibold focus:outline-none appearance-none"
            >
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
              <option value="Alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List Container */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="p-16 text-center text-zinc-400">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No projects found matching criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {filteredProjects.map((p) => {
              const tagsArray =
                p.tags ||
                (typeof p.techStack === "string" ? p.techStack.split(",") : p.techStack) ||
                [];
              const displayTags = tagsArray.slice(0, 3);
              const status = p.status || "Published";

              return (
                <div
                  key={p._id}
                  className="p-5 sm:p-6 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row items-start md:items-center gap-4 group"
                >
                  {/* Thumbnail Cover - Fitted without crop */}
                  <div className="w-24 h-16 shrink-0 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 relative flex items-center justify-center p-1">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : p.gDriveImage ? (
                      <img
                        src={getGDriveThumb(p.gDriveImage) || ""}
                        alt={p.title}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                    )}
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-base text-zinc-900 dark:text-white truncate">
                        {p.title}
                      </h3>
                      {status === "Published" ? (
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">
                          Published
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                      <span className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-300">
                        /{p.slug.toLowerCase()}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(p.publishDate || p.createdAt || Date.now()).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Tech Tags */}
                  <div className="hidden lg:flex items-center gap-1.5 w-44 flex-wrap">
                    {displayTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-semibold rounded-md border border-zinc-200/60 dark:border-zinc-700/60 truncate max-w-[80px]"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                    {tagsArray.length > 3 && (
                      <span className="text-[10px] text-zinc-400 font-bold">
                        +{tagsArray.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => toggleFeatured(p)}
                      title={p.featured ? "Unfeature" : "Feature on Homepage"}
                      className={`p-2 rounded-xl transition-colors ${
                        p.featured
                          ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                          : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-amber-500"
                      }`}
                    >
                      <Star size={16} className={p.featured ? "fill-current" : ""} />
                    </button>
                    <Link
                      href={`/projects/${p.slug}`}
                      target="_blank"
                      title="View Live"
                      className="p-2 text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <Link
                      href={`/admin/projects/${p._id}`}
                      title="Edit Project"
                      className="p-2 text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors"
                    >
                      <Edit size={15} />
                    </Link>
                    <button
                      onClick={() => {
                        setProjectToDelete(p._id);
                        setShowDeleteModal(true);
                      }}
                      title="Delete Project"
                      className="p-2 text-rose-600 hover:text-rose-700 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] max-w-md w-full border border-zinc-200/80 dark:border-zinc-800 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600 dark:text-rose-400">
                  <AlertTriangle size={22} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  Delete Project?
                </h3>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mb-8 leading-relaxed">
                This action is irreversible. The project and its metadata will be permanently deleted from the database.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-2xl flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
