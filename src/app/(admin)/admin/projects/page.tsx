"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Edit, Trash2, Loader2, AlertTriangle, Search, 
  ExternalLink, Star, Image as ImageIcon, Filter, ArrowUpDown 
} from "lucide-react";
import Toast from "@/components/ui/Toast";

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

// ✅ Hidden Google Drive API to generate clean image thumbnails
const getGDriveThumb = (url?: string) => {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400` : null;
};

export default function AdminProjects( ) {
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
    setProjects(projects.map(p => p._id === project._id ? { ...p, featured: !p.featured } : p));
    try {
      const formData = new FormData();
      formData.append("id", project._id);
      formData.append("featured", String(!project.featured));
      await fetch("/api/projects", { method: "PUT", body: formData });
    } catch (error) {
      setProjects(projects.map(p => p._id === project._id ? { ...p, featured: project.featured } : p));
      setToast({ message: "Failed to update featured status", type: "error" });
    }
  };

  let filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (statusFilter !== "All") {
    if (statusFilter === "Featured") {
      filteredProjects = filteredProjects.filter(p => p.featured);
    } else {
      filteredProjects = filteredProjects.filter(p => (p.status || "Published") === statusFilter);
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

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto pb-32 bg-gray-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black">Manage Projects</h1>
          <p className="text-gray-500 font-medium mt-1">Showing {filteredProjects.length} projects</p>
        </div>
        <Link href="/admin/projects/new" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg">
          <Plus size={20} /> New Project
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search projects by title or slug..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Featured">Featured Only</option>
            </select>
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
              <option value="Alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            No projects found matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredProjects.map((p) => {
              const tagsArray = p.tags || (typeof p.techStack === 'string' ? p.techStack.split(',') : p.techStack) || [];
              const displayTags = tagsArray.slice(0, 3);
              const status = p.status || "Published";

              return (
                <div key={p._id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row items-start md:items-center gap-4 group">
                  
                  {/* ✅ Lightweight Image Thumbnail (GitHub OR G-Drive) */}
                  <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : p.gDriveImage ? (
                      <img src={getGDriveThumb(p.gDriveImage) || ""} alt={p.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-black truncate">{p.title}</h3>
                      {status === "Published" && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Published</span>}
                      {status === "Draft" && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full">Draft</span>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">/{p.slug.toLowerCase()}</span>
                      <span>•</span>
                      <span className="text-xs font-medium">
                        {new Date(p.publishDate || p.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center gap-1.5 w-48 flex-wrap">
                    {displayTags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md border border-gray-200 truncate max-w-[80px]">
                        {tag.trim()}
                      </span>
                    ))}
                    {tagsArray.length > 3 && <span className="text-xs text-gray-400 font-bold">+{tagsArray.length - 3}</span>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleFeatured(p)} title={p.featured ? "Unfeature" : "Feature on Homepage"} className={`p-2 rounded-lg transition-colors ${p.featured ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100" : "text-gray-400 hover:bg-gray-100 hover:text-yellow-500"}`}>
                      <Star size={18} className={p.featured ? "fill-current" : ""} />
                    </button>
                    <Link href={`/projects/${p.slug}`} target="_blank" title="View Live" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <ExternalLink size={18} />
                    </Link>
                    <Link href={`/admin/projects/${p._id}`} title="Edit Project" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => { setProjectToDelete(p._id); setShowDeleteModal(true); }} title="Delete Project" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600"><AlertTriangle size={24} /></div>
              <h3 className="text-xl font-bold text-black">Delete Project?</h3>
            </div>
            <p className="text-gray-500 mb-8 font-medium">This action cannot be undone. This will permanently remove the project from your portfolio.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 font-bold text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3 font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl flex justify-center transition-colors">
                {isDeleting ? <Loader2 className="animate-spin" /> : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

