"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Loader2, AlertTriangle } from "lucide-react";

interface Post {
  _id: string;
  title: string;
  slug: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: State for Custom Delete Modal ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // 1. Open custom modal instead of window.confirm
  const openDeleteModal = (id: string) => {
    setPostToDelete(id);
    setShowDeleteModal(true);
  };

  // 2. The actual delete function
  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/blog?id=${postToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p._id !== postToDelete));
        setShowDeleteModal(false);
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-8 relative min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Blog</h1>
        <Link 
          href="/admin/blog/new" 
          className="bg-primary text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          title="Create New Post"
        >
          <Plus size={20} /> New Post
        </Link>
      </div>

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500">No blog posts found. Start writing!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div 
              key={post._id} 
              className="group p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 font-mono">/{post.slug}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link 
                  href={`/admin/blog/${post._id}`} 
                  className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit Post"
                >
                  <Edit size={20} />
                </Link>
                <button 
                  onClick={() => openDeleteModal(post._id)}
                  className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Post"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- CUSTOM DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-950 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-5 mb-6">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600 dark:text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Delete Post?</h3>
                <p className="text-sm text-gray-500">This cannot be undone.</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Are you sure you want to permanently remove this article from your blog?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all"
                title="Cancel"
              >
                Keep Post
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20"
                title="Confirm Delete"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}