"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload, X, Calendar, Crop } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import Cropper from "react-easy-crop";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Helper function to extract the cropped image
const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<File> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg", 0.95);
  });
};

export default function ProjectEditorPage() {
  const router = useRouter();
  const params = useParams();
  
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", tags: "", githubLink: "", liveLink: "", appLink: "", image: "",
    publishDate: "" 
  });

  // Cropper State
  const [fileError, setFileError] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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

  useEffect(() => {
    if (isNew) {
      setFormData(prev => ({ ...prev, publishDate: new Date().toISOString().slice(0, 16) }));
      return;
    }
    
    fetch(`/api/projects?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          const p = data.project;
          const formattedDate = p.publishDate ? new Date(p.publishDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);

          setFormData({
            title: p.title || "", slug: p.slug || "", description: p.description || "",
            tags: p.tags ? p.tags.join(", ") : "", githubLink: p.githubLink || "", 
            liveLink: p.liveLink || "", appLink: p.appLink || "", image: p.image || "",
            publishDate: formattedDate
          });
          if (p.image) setPreviewUrl(p.image);
        }
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [id, isNew]);

  const generateSlug = () => {
    const slug = formData.title.toLowerCase().trim().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
    setFormData({ ...formData, slug });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      setFileError(`File is too big (${(file.size / 1024 / 1024).toFixed(2)}MB). Limit is 4.5MB.`);
      e.target.value = "";
      return;
    }
    
    // Pass image to cropper instead of setting it immediately
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      const croppedImageFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setNewImage(croppedImageFile);
      setPreviewUrl(URL.createObjectURL(croppedImageFile));
      setImageToCrop(null); // Close cropper modal
    } catch (e) {
      console.error(e);
      alert("Failed to crop image");
    }
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
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "image") {
          data.append(key, value);
        }
      });

      if (newImage) {
        data.append("image", newImage);
      } else if (formData.image) {
        data.append("image", formData.image);
      }

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
      alert("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      
      {/* CROPPER MODAL */}
      {imageToCrop && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[60vh] bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="w-full max-w-4xl mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2 flex items-center gap-4 text-white">
               <span className="text-sm font-medium">Zoom:</span>
               <input
                 type="range"
                 value={zoom}
                 min={1}
                 max={3}
                 step={0.1}
                 aria-labelledby="Zoom"
                 onChange={(e) => setZoom(Number(e.target.value))}
                 className="w-full accent-primary"
               />
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button onClick={() => setImageToCrop(null)} className="flex-1 px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={handleCropSave} className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2 transition-colors"><Crop size={18} /> Apply Crop</button>
            </div>
          </div>
        </div>
      )}

      <Link href="/admin/projects" className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 w-fit"><ArrowLeft size={18} /> Back</Link>
      
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">{isNew ? "Create Project" : "Edit Project"}</h1>
        <button onClick={handleSubmit} disabled={saving} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Save
        </button>
      </div>

      <form className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6 p-6 bg-white dark:bg-gray-900 rounded-2xl border shadow-sm">
          <div className="space-y-2">
            <label htmlFor="title" className="text-xs font-bold uppercase text-gray-500">Project Title</label>
            <input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 rounded-lg border bg-background" />
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="text-xs font-bold uppercase text-gray-500 flex justify-between">Slug <button type="button" onClick={generateSlug} className="text-primary text-[10px]">Auto-Generate</button></label>
            <input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full p-3 rounded-lg border bg-background font-mono text-sm" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border shadow-sm space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">Description</label>
          <div className="bg-white text-black rounded-lg overflow-hidden border">
            <ReactQuill theme="snow" value={formData.description} onChange={(value) => setFormData({ ...formData, description: value })} modules={modules} className="h-64 mb-12" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border shadow-sm space-y-4">
            
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1"><Calendar size={14}/> Schedule / Publish Date</label>
               <input type="datetime-local" value={formData.publishDate} onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" />
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">Tags</label>
               <input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">GitHub Link</label>
               <input value={formData.githubLink} onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">Live Demo Link</label>
               <input value={formData.liveLink} onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">App Download Link</label>
               <input value={formData.appLink} onChange={(e) => setFormData({ ...formData, appLink: e.target.value })} className="w-full p-3 rounded-lg border bg-background text-sm" />
            </div>
          </div>
          
          <div className={`space-y-2 p-6 rounded-2xl border flex flex-col ${fileError ? "bg-red-50 border-red-500" : "bg-white dark:bg-gray-900 border-gray-200"}`}>
            <label className="font-bold text-sm uppercase mb-2 text-gray-500">Project Image (16:9)</label>
            <div className="flex items-center gap-4">
              <label htmlFor="image-upload" className="cursor-pointer px-4 py-2 rounded-lg font-bold shadow-sm bg-black dark:bg-white text-white dark:text-black">Choose file</label>
              <input id="image-upload" type="file" accept=".jpg,.jpeg,.png,.gif,image/*" className="hidden" onChange={handleImageSelect} />
            </div>
            
            {/* 16:9 Preview Container */}
            <div className="mt-4 w-full aspect-[16/9] border-2 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-black/20">
              {previewUrl ? (
                <div className="relative w-full h-full group">
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                  <button type="button" onClick={() => { setNewImage(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-400"><Upload className="w-8 h-8 mb-2 mx-auto opacity-50" /><span className="text-xs">Preview</span></div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}