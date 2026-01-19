"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Loader2, AlertTriangle } from "lucide-react";

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        
        // FIX: Check if response is okay before parsing JSON
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Server Error:", errorText);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/projects?id=${projectToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects(projects.filter((p) => p._id !== projectToDelete));
        setShowDeleteModal(false);
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <Link 
          href="/admin/projects/new" 
          title="Create New Project"
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={20} /> New Project
        </Link>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <p className="text-gray-500 italic">No projects found.</p>
        ) : (
          projects.map((p) => (
            <div key={p._id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl flex justify-between items-center group">
              <div>
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-gray-500 font-mono">Slug: {p.slug}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <Link 
                   href={`/admin/projects/${p._id}`} 
                   title="Edit Project"
                   className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                >
                  <Edit size={18} />
                </Link>
                <button 
                  title="Delete Project"
                  onClick={() => { setProjectToDelete(p._id); setShowDeleteModal(true); }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl max-w-md w-full border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600"><AlertTriangle size={24} /></div>
              <h3 className="text-xl font-bold">Confirm Delete?</h3>
            </div>
            <p className="text-gray-500 mb-8">This action is permanent and cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                title="Cancel Delete"
                onClick={() => setShowDeleteModal(false)} 
                className="flex-1 py-3 font-bold bg-gray-100 dark:bg-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button 
                title="Confirm Delete Forever"
                onClick={confirmDelete} 
                disabled={isDeleting} 
                className="flex-1 py-3 font-bold bg-red-600 text-white rounded-xl"
              >
                {isDeleting ? <Loader2 className="animate-spin mx-auto" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}