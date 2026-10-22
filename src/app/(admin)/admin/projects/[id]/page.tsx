"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Save, Loader2, Upload, X, Calendar, Crop, Eye, Wand2,
  Table as TableIcon, Code, Link as LinkIcon, RefreshCw, Trash2,
  Sparkles, Globe, Github, Monitor, Layers, CheckCircle2, AlertCircle,
  Maximize2
} from "lucide-react";
import Link from "next/link";
import Cropper from "react-easy-crop";
import Toast from "@/components/ui/Toast";
import CaseStudyEditor, { EMPTY_CASE_STUDY, appendCaseStudy, caseStudyFrom, type CaseStudy } from "../CaseStudyEditor";
import { motion, AnimatePresence } from "framer-motion";

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
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("Canvas is empty")); return; }
      resolve(new File([blob], "cropped-image.jpg", { type: "image/jpeg" }));
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
  const [extracting, setExtracting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const [availableBlogs, setAvailableBlogs] = useState<{_id: string, title: string}[]>([]);

  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", githubLink: "", liveLink: "", appLink: "", image: "",
    gDriveImage: "",
    publishDate: "", role: "", status: "Published", featured: false, frameStyle: "Browser",
    relatedBlog: ""
  });

  const [caseStudy, setCaseStudy] = useState<CaseStudy>(EMPTY_CASE_STUDY);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [fileError, setFileError] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAspect, setCropAspect] = useState<number | undefined>(16 / 9);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    fetch("/api/blog")
      .then(res => res.json())
      .then(data => {
        if (data.posts) setAvailableBlogs(data.posts);
      })
      .catch(err => console.error("Failed to fetch blogs", err));

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
            githubLink: p.githubLink || "", liveLink: p.liveLink || "", appLink: p.appLink || "", image: p.image || "",
            gDriveImage: p.gDriveImage || "",
            publishDate: formattedDate, role: p.role || "", status: p.status || "Published", 
            featured: p.featured || false, frameStyle: p.frameStyle || "Browser",
            relatedBlog: p.relatedBlog || ""
          });
          setCaseStudy(caseStudyFrom(p));
          setTags(p.tags || (typeof p.techStack === 'string' ? p.techStack.split(',') : p.techStack) || []);
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

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;
    if (file.size > 4.5 * 1024 * 1024) {
      setFileError("Image file exceeds the 4.5MB threshold.");
      e.target.value = "";
      return;
    }
    setRawSelectedFile(file);
    // Directly apply original image with 100% full aspect ratio preserved without crop
    setNewImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setToast({ message: "Image applied in original aspect ratio! You can optionally crop/re-frame.", type: "success" });
  };

  const handleOpenCropper = () => {
    if (rawSelectedFile) {
      setImageToCrop(URL.createObjectURL(rawSelectedFile));
    } else if (previewUrl) {
      setImageToCrop(previewUrl);
    } else if (formData.image) {
      setImageToCrop(formData.image);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      const croppedImageFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setNewImage(croppedImageFile);
      setPreviewUrl(URL.createObjectURL(croppedImageFile));
      setImageToCrop(null);
      setToast({ message: "Cropped image applied successfully!", type: "success" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to crop image properly.", type: "error" });
    }
  };

  const handleUseOriginal = () => {
    if (!rawSelectedFile) {
      setImageToCrop(null);
      return;
    }
    setNewImage(rawSelectedFile);
    setPreviewUrl(URL.createObjectURL(rawSelectedFile));
    setImageToCrop(null);
    setToast({ message: "Original image applied without any crop!", type: "success" });
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: "" }));
    setPreviewUrl(null);
    setNewImage(null);
    setRawSelectedFile(null);
    setToast({ message: "Image removed. Click Save to persist.", type: "success" });
  };

  const handleExtractGDrive = () => {
    if (!formData.gDriveImage) return;
    setExtracting(true);
    
    setTimeout(() => {
      let url = formData.gDriveImage;
      if (!url.includes("<iframe")) {
        const fileIdMatch = url.match(/[-\w]{25,}/);
        if (fileIdMatch) {
          url = `https://drive.google.com/thumbnail?id=${fileIdMatch[0]}&sz=w1000`;
          setFormData(prev => ({ ...prev, gDriveImage: url }));
        }
      }
      setExtracting(false);
      setToast({ message: "Google Drive source processed!", type: "success" });
    }, 700);
  };

  const insertTableTemplate = () => {
    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; border: 1px solid rgba(150, 150, 150, 0.2); border-radius: 8px; overflow: hidden;">
  <thead>
    <tr style="background-color: rgba(120, 120, 120, 0.08);">
      <th style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px; font-weight: 600; text-align: left;">Feature</th>
      <th style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px; font-weight: 600; text-align: left;">Technology</th>
      <th style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px; font-weight: 600; text-align: left;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px;">Core Engine</td>
      <td style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px;">Next.js & TypeScript</td>
      <td style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px;">Production</td>
    </tr>
  </tbody>
</table>
`;
    setFormData(prev => ({ ...prev, description: prev.description + "\n" + tableHtml + "\n" }));
    setToast({ message: "Responsive table markup inserted!", type: "success" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (!formData.title || !formData.slug) {
      setToast({ message: "Please specify both Title and Slug.", type: "error" });
      setSaving(false);
      return;
    }
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "image") data.append(key, value as string);
      });
      data.append("tags", tags.join(","));
      appendCaseStudy(data, caseStudy);
      
      if (newImage) {
        data.append("image", newImage);
      } else if (formData.image === "") {
        data.append("image", "");
      } else if (formData.image) {
        data.append("image", formData.image);
      }

      if (!isNew && id) data.append("id", id);
      
      const res = await fetch("/api/projects", { method: isNew ? "POST" : "PUT", body: data });
      if (res.ok) {
        setToast({ message: isNew ? "Project created successfully!" : "Project updated successfully!", type: "success" });
        setTimeout(() => {
          router.push("/admin/projects");
          router.refresh();
        }, 1200);
      } else {
        const errorData = await res.json();
        setToast({ message: `Error: ${errorData.error}`, type: "error" });
      }
    } catch {
      setToast({ message: "An unexpected error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        <span className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Loading project data...</span>
      </div>
    );
  }

  const displayPreviewImage = previewUrl || formData.gDriveImage;

  return (
    <div className="space-y-8 pb-32">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* FULLSCREEN LIVE PREVIEW SHEET (macOS QuickLook Style) */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex flex-col justify-end sm:justify-center p-0 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden mx-auto"
            >
              {/* Preview Window Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => setShowPreview(false)}
                      className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition-opacity" 
                      title="Close"
                    />
                    <div className="w-3 h-3 rounded-full bg-amber-500 opacity-60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-60" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 pl-2">
                    QuickLook Preview — {formData.title || "Untitled Project"}
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowPreview(false)} 
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Preview Scrollable Body */}
              <div className="p-8 overflow-y-auto space-y-8">
                <div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
                    {formData.title || "Project Title"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <span>{formData.role || "Role not specified"}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {formData.status}
                    </span>
                    {formData.featured && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Sparkles size={11} /> Featured
                      </span>
                    )}
                  </div>
                </div>

                {displayPreviewImage && (
                  <div className={`w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 shadow-lg ${formData.frameStyle === 'Browser' ? 'pt-8 relative' : ''}`}>
                    {formData.frameStyle === 'Browser' && (
                      <div className="absolute top-0 left-0 w-full h-8 bg-zinc-200/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700/60 flex items-center px-3 gap-1.5 z-20">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        <div className="mx-auto text-[11px] font-mono text-zinc-600 dark:text-zinc-400 px-3 py-0.5 bg-white/70 dark:bg-zinc-900/70 rounded-md">
                          {formData.liveLink || "https://preview.local"}
                        </div>
                      </div>
                    )}
                    
                    {/* Fitted Preview Stage without crop */}
                    <div className="relative h-[320px] sm:h-[420px] w-full flex items-center justify-center p-4 overflow-hidden">
                      {displayPreviewImage.includes("<iframe") ? (
                        <div className="w-full aspect-[16/9] [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: displayPreviewImage }} />
                      ) : (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={displayPreviewImage}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 dark:opacity-15 scale-110 pointer-events-none select-none"
                          />
                          {/* 100% UN-CUT Fitted Image */}
                          <div className="relative z-10 w-full h-full flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={displayPreviewImage}
                              alt="Preview"
                              className="w-full h-full object-contain rounded-xl drop-shadow-md select-none"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div 
                  className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: formData.description || "<p class='text-zinc-400 italic'>No description provided yet...</p>" }} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CROPPER / ORIGINAL RATIO MODAL */}
      <AnimatePresence>
        {imageToCrop && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            {/* Cropper Canvas Container */}
            <div className="relative w-full max-w-4xl h-[55vh] bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
              <Cropper 
                image={imageToCrop} 
                crop={crop} 
                zoom={zoom} 
                aspect={cropAspect} 
                onCropChange={setCrop} 
                onZoomChange={setZoom} 
                onCropComplete={onCropComplete} 
              />
            </div>

            {/* Controls Bar */}
            <div className="w-full max-w-4xl mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
              {/* Aspect Ratio Switches */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold uppercase text-zinc-400 mr-1">Ratio:</span>
                {[
                  { label: "16:9", val: 16 / 9 },
                  { label: "4:3", val: 4 / 3 },
                  { label: "1:1", val: 1 / 1 },
                  { label: "Free", val: undefined },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setCropAspect(item.val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      cropAspect === item.val
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Zoom Slider */}
              <div className="w-full sm:w-48 flex items-center gap-2 text-zinc-200">
                <span className="text-[11px] font-semibold uppercase text-zinc-400">Zoom</span>
                <input 
                  type="range" 
                  value={zoom} 
                  min={1} 
                  max={3} 
                  step={0.1} 
                  onChange={(e) => setZoom(Number(e.target.value))} 
                  className="w-full accent-blue-500 cursor-pointer" 
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  type="button" 
                  onClick={() => setImageToCrop(null)} 
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleUseOriginal} 
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors"
                  title="Use original image with its exact aspect ratio without cropping"
                >
                  Use Original (No Crop)
                </button>
                <button 
                  type="button" 
                  onClick={handleCropSave} 
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
                >
                  <Crop size={14} /> Apply Crop
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP NAVIGATION & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/projects" 
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                {isNew ? "Create Mode" : "Inspector & Editor"}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {formData.status}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {isNew ? "New Portfolio Project" : formData.title || "Edit Project"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setShowPreview(true)} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm active:scale-[0.98] transition-all"
          >
            <Eye size={15} /> QuickLook Preview
          </button>
          <button 
            type="button"
            onClick={handleSubmit} 
            disabled={saving} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-md disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? "Saving..." : "Save Project"}</span>
          </button>
        </div>
      </div>

      {/* FORM BODY: BENTO ARCHITECTURE */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ROW 1: PRIMARY METADATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={16} className="text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Project Identity</h2>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Project Title</label>
              <input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400" 
                placeholder="e.g. Autonomous Yield Prediction Engine" 
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">URL Slug</label>
                <button 
                  type="button" 
                  onClick={generateSlug} 
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Wand2 size={11} /> Auto-Generate
                </button>
              </div>
              <div className="flex items-center px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                <span className="text-zinc-400 select-none">/projects/</span>
                <input 
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                  className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100" 
                  placeholder="yield-prediction-engine" 
                />
              </div>
            </div>
          </div>

          {/* STATUS & PUBLISHING */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Visibility & Status</h2>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">State</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                    className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Published">Published (Live)</option>
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                    <Calendar size={12} /> Publication Date
                  </label>
                  <input 
                    type="datetime-local" 
                    value={formData.publishDate} 
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} 
                    className="w-full px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className={formData.featured ? "text-amber-500" : "text-zinc-400"} />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Featured Showcase</span>
              </div>
              <input 
                type="checkbox" 
                checked={formData.featured} 
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} 
                className="w-4 h-4 rounded-md accent-blue-600 cursor-pointer" 
              />
            </label>
          </div>
        </div>

        {/* ROW 2: ROLE, LINKS, CONNECTIVITY */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Role & External Connections</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">My Role / Position</label>
              <input 
                value={formData.role} 
                onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20" 
                placeholder="Lead Systems Architect" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1">
                <Github size={12} /> GitHub Repository
              </label>
              <input 
                value={formData.githubLink} 
                onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })} 
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20" 
                placeholder="https://github.com/nilaynaha/repo" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1">
                <Globe size={12} /> Live Production URL
              </label>
              <input 
                value={formData.liveLink} 
                onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })} 
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20" 
                placeholder="https://app.nilaynaha.dev" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1">
                <LinkIcon size={12} /> Linked Blog Post
              </label>
              <select 
                value={formData.relatedBlog} 
                onChange={(e) => setFormData({ ...formData, relatedBlog: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- No Article Linked --</option>
                {availableBlogs.map(blog => (
                  <option key={blog._id} value={blog._id}>{blog.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ROW 3: MEDIA & FRAME STUDIO */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Monitor size={16} className="text-cyan-500" />
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Visual Media & Mockup Frame</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Upload any ratio image (PNG, JPG, WebP) or configure a Google Drive embed</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Frame Style:</span>
              <div className="flex p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, frameStyle: "Browser" })}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    formData.frameStyle === "Browser" 
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  macOS Browser
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, frameStyle: "None" })}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    formData.frameStyle === "None" 
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  Borderless
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Direct Upload & Fitted Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Primary Cover Image</span>
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm active:scale-95 transition-all"
                >
                  Choose Media
                </label>
                <input id="image-upload" type="file" accept=".jpg,.jpeg,.png,.gif,image/*" className="hidden" onChange={handleImageSelect} />
              </div>

              {fileError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  <AlertCircle size={14} /> {fileError}
                </div>
              )}

              {/* Fitted Preview Container: Shows any ratio without cutting */}
              <div className="w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center relative overflow-hidden group p-3">
                {previewUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Ambient blurred backdrop for letterboxing */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 dark:opacity-15 scale-110 pointer-events-none select-none"
                    />
                    {/* 100% UN-CUT Fitted Image */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Cover Preview"
                        className="w-full h-full object-contain rounded-xl drop-shadow-sm select-none"
                      />
                    </div>
                    {/* Overlay Action Buttons */}
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button" 
                        onClick={handleOpenCropper} 
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-900 text-white text-[11px] font-bold shadow-md backdrop-blur-sm flex items-center gap-1 transition-all"
                        title="Crop or Reframe image"
                      >
                        <Crop size={12} /> Crop / Reframe
                      </button>
                      <button 
                        type="button" 
                        onClick={handleRemoveImage} 
                        className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md backdrop-blur-sm transition-all"
                        title="Remove Image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                    <Upload className="w-8 h-8 mb-2 opacity-40" />
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No Image Uploaded</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Supports any ratio (Square, 4:3, 16:9, Portrait) without cut</span>
                  </div>
                )}
              </div>
            </div>

            {/* Google Drive Fallback & Auto-Extract */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">Google Drive Fallback / Embed</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={formData.gDriveImage} 
                  onChange={(e) => setFormData({ ...formData, gDriveImage: e.target.value })} 
                  placeholder="Paste Google Drive share URL or <iframe> embed..." 
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
                <button 
                  type="button" 
                  onClick={handleExtractGDrive}
                  disabled={!formData.gDriveImage || extracting}
                  className="px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
                >
                  {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Extract
                </button>
              </div>

              {/* G-Drive Fitted Preview */}
              <div className="w-full aspect-[16/10] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center relative overflow-hidden p-3">
                {formData.gDriveImage ? (
                  formData.gDriveImage.includes("<iframe") ? (
                    <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full pointer-events-none" dangerouslySetInnerHTML={{ __html: formData.gDriveImage }} />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.gDriveImage}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 dark:opacity-10 scale-110 pointer-events-none select-none"
                      />
                      <div className="relative z-10 w-full h-full flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.gDriveImage}
                          alt="G-Drive fallback"
                          className="w-full h-full object-contain rounded-xl drop-shadow-sm select-none"
                        />
                      </div>
                    </div>
                  )
                ) : (
                  <span className="text-xs text-zinc-400 font-medium">G-Drive thumbnail preview will appear here</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: TECH ARSENAL TAGS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
          <label className="text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
            Technologies & Tags (Type and press Enter)
          </label>
          <div className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-blue-500/20">
            {tags.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500 transition-colors">
                  <X size={12} />
                </button>
              </span>
            ))}
            <input 
              value={tagInput} 
              onChange={(e) => setTagInput(e.target.value)} 
              onKeyDown={handleTagKeyDown} 
              placeholder="e.g. Next.js, PyTorch, GraphQL..." 
              className="flex-1 min-w-[140px] px-2 py-1 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none" 
            />
          </div>
        </div>

        {/* ROW 5: MARKDOWN / HTML DESCRIPTION STUDIO */}
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden flex flex-col">
          {/* Segmented Control Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/70">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-800">
              <button 
                type="button" 
                onClick={() => setEditorTab("write")} 
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editorTab === "write" 
                    ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <Code size={14} /> Write Source
              </button>
              <button 
                type="button" 
                onClick={() => setEditorTab("preview")} 
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editorTab === "preview" 
                    ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <Eye size={14} /> Rendered View
              </button>
            </div>

            {editorTab === "write" && (
              <button 
                type="button" 
                onClick={insertTableTemplate} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-colors"
              >
                <TableIcon size={14} /> Insert Table Spec
              </button>
            )}
          </div>

          {/* Editor Body */}
          <div className="p-6">
            {editorTab === "write" ? (
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                className="w-full h-[440px] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/20 resize-y" 
                placeholder="<h2>Architectural Blueprint</h2>&#10;<p>Describe system design, trade-offs, benchmarks and interactive capabilities here...</p>" 
              />
            ) : (
              <div 
                className="w-full min-h-[440px] p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: formData.description || "<p class='text-zinc-400 italic'>Nothing to preview yet. Switch back to Write Source to start typing.</p>" }}
              />
            )}
          </div>
        </div>

        <CaseStudyEditor value={caseStudy} onChange={setCaseStudy} />
      </form>
    </div>
  );
}
