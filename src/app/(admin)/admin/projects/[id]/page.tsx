"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

// 🟢 IMPORT QUILL STYLES
import "react-quill/dist/quill.snow.css";

// 🟢 DYNAMICALLY IMPORT REACT-QUILL
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function ProjectEditorPage() {
  const router = useRouter();
  const params = useParams();
  
  // 🟢 HANDLE ID: If it's an array (rare), grab the first one.
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew); // Only load if editing
  const [saving, setSaving] = useState(false);

  // 🟢 UNIFIED FORM STATE
  const [formData, setFormData] = useState({
    title: "", 
    slug: "", 
    description: "", 
    tags: "", 
    githubLink: "", 
    liveLink: "", 
    appLink: "", // New Field
    image: ""
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // 🟢 QUILL EDITOR CONFIG
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'clean'],
    ],
  }), []);

  // 🟢 FETCH DATA (Only if Editing)
  useEffect(() => {
    if (isNew) return;
    
    fetch(`/api/projects?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          const p = data.project;
          setFormData({
            title: p.title || "", 
            slug: p.slug || "", 
            description: p.description || "",
            tags: p.tags ? p.tags.join(", ") : "", 
            githubLink: p.githubLink || "", 
            liveLink: p.liveLink || "", 
            appLink: p.appLink || "", 
            image: p.image || ""
          });
          if (p.image) setPreviewUrl(p.image);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id, isNew]);

  // 🟢 AUTO-GENERATE SLUG
  const generateSlug = () => {
    const slug = formData.title.toLowerCase().trim().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
    setFormData({ ...formData, slug });
  };

  // 🟢 SAFE IMAGE UPLOADER (Max 4.5MB)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) return;

    // Strict 4.5MB Limit for Vercel
    if (file.size > 4.5 * 1024 * 1024) {
      setFileError(`File is too big (${(file.size / 1024 / 1024).toFixed(2)}MB). Limit is 4.5MB.`);
      e.target.value = ""; // Clear input
      return;
    }

    setNewImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.title || !formData.slug) {
      alert("Please fill in the Title and Slug fields.");
      setSaving(false);
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (newImage) data.append("image", newImage);
      if (!isNew && id) data.append("id", id);
      
      const res = await fetch("/api/projects", { method: isNew ? "POST" : "PUT", body: data });
      
      if (res.ok) {
        alert(isNew ? "Project created successfully!" : "Project updated successfully!");
        router.push("/admin/projects");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      <Link href="/admin/projects" className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors w-fit"><ArrowLeft size={18} /> Back to Dashboard</Link>
      
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">{isNew ? "Create New Project" : "Edit Project"}</h1>
        <button onClick={handleSubmit} disabled={saving} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg">
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} {isNew ? "Create Project" : "Save Changes"}
        </button>
      </div>

      <form className="space-y-8">
        {/* Title & Slug */}
        <div className="grid md:grid-cols-2 gap-6 p-6 bg-white dark:bg-gray-900 rounded-2xl border shadow-sm">
          <div className="space-y-2">
            <label htmlFor="title" className="text-xs font-bold uppercase text-gray-500">Project Title</label>
            <input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 rounded-lg border bg-background" placeholder="e.g. AI Task Manager" />
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="text-xs font-bold uppercase text-gray-500 flex justify-between">Slug <button type="button" onClick={generateSlug} className="text-primary text-[10px]">Auto-Generate</button></label>
            <input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full p-3 rounded-lg border bg-background font-mono text-sm" placeholder="ai-task-manager" />
          </div>
        </div>

        {/* Rich Description */}
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border shadow-sm space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">Description</label>
          <div className="bg-white text-black rounded-lg overflow-hidden border">
            <ReactQuill 
              theme="snow"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              modules={modules}
              className="h-64 mb-12"
              placeholder="Describe your project..."
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Links Section */}
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border shadow-sm space-y-4">
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">Tags</label>
               <input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" placeholder="React, Node.js, Tailwind" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">GitHub Link</label>
               <input value={formData.githubLink} onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" placeholder="https://github.com/..." />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">Live Demo Link</label>
               <input value={formData.liveLink} onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" placeholder="https://my-website.com" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">App Download Link</label>
               <input value={formData.appLink} onChange={(e) => setFormData({ ...formData, appLink: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" placeholder="https://play.google.com/..." />
            </div>
          </div>
          
          {/* Image Upload */}
          <div className={`space-y-2 p-6 rounded-2xl border transition-colors flex flex-col ${fileError ? "bg-red-50 border-red-500" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"}`}>
            <label className={`font-bold text-sm uppercase mb-2 ${fileError ? "text-red-600" : "text-gray-500"}`}>
              {fileError ? "⚠️ UPLOAD ERROR" : "PROJECT IMAGE"}
            </label>
            
            <div className="flex items-center gap-4">
              <label htmlFor="image-upload" className={`cursor-pointer px-4 py-2 rounded-lg font-bold shadow-sm hover:opacity-90 transition-opacity ${fileError ? "bg-red-600 text-white" : "bg-black dark:bg-white text-white dark:text-black"}`}>
                Choose file
              </label>
              <span className="text-sm text-gray-500 truncate max-w-[200px]">{newImage ? newImage.name : "No file chosen"}</span>
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            
            {fileError ? (
               <div className="mt-2 text-red-600 text-sm font-bold flex items-center gap-2 animate-pulse">
                 <AlertTriangle size={16} /> {fileError}
               </div>
            ) : (
               <p className="text-xs text-gray-400 mt-1">Max file size: 4.5MB.</p>
            )}

            <div className="mt-4 flex-1 border-2 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-black/20 min-h-[200px]">
              {previewUrl ? (
                <div className="relative w-full h-full group">
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                  <button type="button" onClick={() => { setNewImage(null); setPreviewUrl(null); setFileError(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-400 flex flex-col items-center"><Upload className="w-8 h-8 mb-2 opacity-50" /><span className="text-xs">Image preview</span></div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}