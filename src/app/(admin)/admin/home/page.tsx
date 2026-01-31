"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Save, Upload, FileText, ExternalLink, FileUp, Bold, Italic, Palette, WrapText, PaintBucket, X, Check, ZoomIn } from "lucide-react";
import Image from "next/image";
import Toast from "@/components/ui/Toast";
import Cropper from "react-easy-crop"; 
import { Point, Area } from "react-easy-crop";

// --- HELPER: Create Image from URL ---
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

// --- HELPER: Generate Cropped Image Blob ---
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

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
      resolve(blob);
    }, "image/jpeg", 1);
  });
}

// --- RICH TOOLBAR COMPONENT ---
const RichToolbar = ({ targetId, onInsert }: { targetId: string; onInsert: (start: string, end: string) => void }) => {
  return (
    <div className="flex flex-wrap items-center gap-1 mb-2 p-1.5 bg-muted/50 rounded-lg border w-fit shadow-sm">
      <button type="button" onClick={() => onInsert("<b>", "</b>")} className="p-1.5 hover:bg-background hover:text-foreground rounded transition-colors text-xs font-bold border border-transparent hover:border-border" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("<i>", "</i>")} className="p-1.5 hover:bg-background hover:text-foreground rounded transition-colors text-xs italic border border-transparent hover:border-border" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("<br />", "")} className="p-1.5 hover:bg-background hover:text-foreground rounded transition-colors text-xs font-bold border border-transparent hover:border-border" title="Line Break"><WrapText className="w-3.5 h-3.5" /></button>
      <div className="w-px h-4 bg-border mx-1" />
      <button type="button" onClick={() => onInsert('<span class="text-gray-500 dark:text-gray-400 font-medium">', "</span>")} className="p-1.5 hover:bg-background hover:text-foreground rounded transition-colors text-xs text-gray-500 font-bold border border-transparent hover:border-border flex items-center gap-1"><Palette className="w-3.5 h-3.5" /> Gray</button>
      <button type="button" onClick={() => onInsert('<span class="text-blue-600 dark:text-yellow-400">', "</span>")} className="p-1.5 hover:bg-background hover:text-foreground rounded transition-colors text-xs text-blue-600 dark:text-yellow-400 font-bold border border-transparent hover:border-border flex items-center gap-1"><PaintBucket className="w-3.5 h-3.5" /> Color</button>
    </div>
  );
};

export default function AdminHome() {
  const [formData, setFormData] = useState({
    badge: "", title: "", subtitle: "", resumeUrl: "", socialGithub: "", socialLinkedin: "", profilePic: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Blob | File | null>(null);
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // CROP STATE
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleInsertTag = (field: keyof typeof formData, startTag: string, endTag: string) => {
    const inputId = `input-${field}`;
    const input = document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement;
    if (!input) return;
    const startPos = input.selectionStart || 0;
    const endPos = input.selectionEnd || 0;
    const currentVal = formData[field];
    const newVal = currentVal.substring(0, startPos) + startTag + currentVal.substring(startPos, endPos) + endTag + currentVal.substring(endPos);
    setFormData({ ...formData, [field]: newVal });
  };

  useEffect(() => {
    fetch("/api/hero", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormData({
            badge: data.badge || "",
            title: data.title || "",
            subtitle: data.subtitle || "",
            resumeUrl: data.resumeUrl || "",
            socialGithub: data.socialGithub || "",
            socialLinkedin: data.socialLinkedin || "",
            profilePic: data.profilePic || ""
          });
          if (data.profilePic) setPreviewUrl(data.profilePic);
        }
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(cropSrc, croppedAreaPixels);
      setSelectedImage(croppedBlob);
      setPreviewUrl(URL.createObjectURL(croppedBlob));
      setIsCropping(false);
      setCropSrc(null);
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to crop image", type: "error" });
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedResume(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (selectedImage) data.append("image", selectedImage, "profile-pic.jpg");
      if (selectedResume) data.append("resume", selectedResume);
      
      const res = await fetch("/api/hero", { method: "PUT", body: data });

      if (res.ok) {
        const updated = await res.json();
        setFormData(prev => ({ ...prev, ...updated }));
        setSelectedImage(null);
        setSelectedResume(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (resumeInputRef.current) resumeInputRef.current.value = "";
        setToast({ message: "Home Page updated successfully!", type: "success" });
      } else {
        setToast({ message: "Failed to save.", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Network Error.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-32">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 🟢 FIXED CROPPER MODAL: Removed fixed height, added color safety */}
      {isCropping && cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h3 className="font-bold text-lg">Crop Profile Picture</h3>
              <button onClick={() => setIsCropping(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            {/* Cropper Area: Fixed height to ensure it fits */}
            <div className="relative h-[300px] w-full bg-black">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls Area */}
            <div className="p-6 bg-white dark:bg-gray-900 space-y-4">
               <div className="flex items-center gap-2">
                 <ZoomIn className="w-4 h-4 text-gray-500" />
                 <input 
                   type="range" 
                   value={zoom} 
                   min={1} 
                   max={3} 
                   step={0.1} 
                   onChange={(e) => setZoom(Number(e.target.value))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                 />
               </div>
               <div className="flex gap-3 pt-2">
                 <button 
                    onClick={() => setIsCropping(false)} 
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                 >
                    Cancel
                 </button>
                 {/* 🟢 FIXED BUTTON: Hardcoded Blue Color to ensure visibility */}
                 <button 
                    onClick={handleCropSave} 
                    className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                 >
                    <Check className="w-4 h-4" /> Save Crop
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b pb-4 sticky top-0 bg-background/80 backdrop-blur z-10">
        <h1 className="text-3xl font-bold">Edit Home Page</h1>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md">
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Uploading..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 border rounded-xl bg-card flex flex-col items-center gap-4 text-center shadow-sm">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Profile Picture</h3>
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-border shadow-md group bg-muted">
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Upload className="w-8 h-8" /></div>
              )}
              <div onClick={() => imageInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-6 h-6 text-white mb-1" />
                <span className="text-white text-xs font-bold">Change & Crop</span>
              </div>
            </div>
            <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          <div className="p-6 border rounded-xl bg-card space-y-4 shadow-sm">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2"><FileUp className="w-4 h-4" /> Resume PDF</h3>
            <div className={`p-6 rounded-lg border-2 border-dashed transition-all text-center ${selectedResume ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-border bg-muted/30"}`}>
               <input type="file" ref={resumeInputRef} onChange={handleResumeChange} className="hidden" accept=".pdf" />
              {selectedResume ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-green-600" />
                  <span className="text-sm font-bold text-green-700 break-all">{selectedResume.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => resumeInputRef.current?.click()}>
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs font-bold text-primary">Click to Select PDF</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 border rounded-xl bg-card space-y-6 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2"><FileText className="w-4 h-4" /> Text Content</h3>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Top Badge</label>
                <RichToolbar targetId="input-badge" onInsert={(s, e) => handleInsertTag('badge', s, e)} />
              </div>
              <input id="input-badge" value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})} className="w-full p-3 border rounded-lg bg-background font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. SOFTWARE DEVELOPER" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Main Headline</label>
                <RichToolbar targetId="input-title" onInsert={(s, e) => handleInsertTag('title', s, e)} />
              </div>
              <textarea id="input-title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-3 border rounded-lg bg-background text-lg font-bold h-32 focus:ring-2 focus:ring-primary/20 outline-none leading-relaxed" placeholder="Headline..." />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Subtitle / Bio</label>
                <RichToolbar targetId="input-subtitle" onInsert={(s, e) => handleInsertTag('subtitle', s, e)} />
              </div>
              <textarea id="input-subtitle" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full p-3 border rounded-lg bg-background h-32 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Short bio..." />
            </div>
          </div>

          <div className="p-6 border rounded-xl bg-card space-y-4 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2"><ExternalLink className="w-4 h-4" /> Social Links</h3>
            <div className="grid gap-4">
              <input value={formData.socialGithub} onChange={(e) => setFormData({...formData, socialGithub: e.target.value})} className="w-full p-3 border rounded-lg bg-background text-sm" placeholder="GitHub URL" />
              <input value={formData.socialLinkedin} onChange={(e) => setFormData({...formData, socialLinkedin: e.target.value})} className="w-full p-3 border rounded-lg bg-background text-sm" placeholder="LinkedIn URL" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}