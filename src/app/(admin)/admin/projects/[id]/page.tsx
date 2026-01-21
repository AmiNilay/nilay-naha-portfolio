"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Toast from "@/components/ui/Toast";
import dynamic from "next/dynamic";

// 🟢 IMPORT QUILL STYLES
import "react-quill/dist/quill.snow.css";

// 🟢 DYNAMICALLY IMPORT REACT-QUILL (To prevent "document is not defined" error)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", tags: "", githubLink: "", liveLink: "", image: ""
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 🟢 CONFIGURE THE "MS WORD" TOOLBAR
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }], // Headers
      ['bold', 'italic', 'underline', 'strike'], // Basic formatting
      [{ 'color': [] }, { 'background': [] }], // 🟢 COLORS (Text & Highlight)
      [{ 'align': [] }], // 🟢 ALIGNMENT (Left, Center, Right, Justify)
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Lists
      ['link', 'image', 'clean'], // Links, Images, Clear Formatting
    ],
  }), []);

  useEffect(() => {
    if (id === "new") { setLoading(false); return; }
    if (!id) return;
    fetch(`/api/projects?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          const p = data.project;
          setFormData({
            title: p.title || "", slug: p.slug || "", description: p.description || "",
            tags: p.tags ? p.tags.join(", ") : "", githubLink: p.githubLink || "", liveLink: p.liveLink || "", image: p.image || ""
          });
          if (p.image) setPreviewUrl(p.image);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const generateSlug = () => {
    const slug = formData.title.toLowerCase().trim().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
    setFormData({ ...formData, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (newImage) data.append("image", newImage);
      if (id !== "new" && id) data.append("id", id);
      const res = await fetch("/api/projects", { method: id === "new" ? "POST" : "PUT", body: data });
      if (res.ok) {
        setToast({ message: "Project saved successfully!", type: "success" });
        setTimeout(() => { router.push("/admin/projects"); router.refresh(); }, 1500);
      } else {
        throw new Error("Save failed");
      }
    } catch (error: any) {
      setToast({ message: "Failed to save project", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Link href="/admin/projects" className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors w-fit"><ArrowLeft size={18} /> Back</Link>
      
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">{id === "new" ? "Create New Project" : "Edit Project"}</h1>
        <button onClick={handleSubmit} disabled={saving} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg">
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Save
        </button>
      </div>

      <form className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6 p-6 bg-white dark:bg-gray-900 rounded-2xl border shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Project Title</label>
            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 rounded-lg border bg-background" placeholder="Project Name" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 flex justify-between">Slug <button type="button" onClick={generateSlug} className="text-primary text-[10px]">Auto-Generate</button></label>
            <input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full p-3 rounded-lg border bg-background font-mono text-sm" placeholder="project-url" />
          </div>
        </div>

        {/* 🟢 THE NEW MS WORD-LIKE EDITOR */}
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border shadow-sm space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">Description</label>
          <div className="bg-white text-black rounded-lg overflow-hidden border">
            <ReactQuill 
              theme="snow"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              modules={modules}
              className="h-64 mb-12" // mb-12 adds space for the toolbar
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border shadow-sm space-y-4">
            <input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" placeholder="Tags (React, Node...)" />
            <input value={formData.githubLink} onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" placeholder="GitHub URL" />
            <input value={formData.liveLink} onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" placeholder="Live Demo URL" />
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border shadow-sm flex flex-col gap-4">
             <div className="flex-1 border-2 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-black/20">
              {previewUrl ? <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized /> : <div className="text-center p-8 text-gray-400"><Upload className="w-8 h-8 mx-auto mb-2 opacity-50" /><span className="text-xs">No image</span></div>}
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { setNewImage(f); setPreviewUrl(URL.createObjectURL(f)); }}} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}