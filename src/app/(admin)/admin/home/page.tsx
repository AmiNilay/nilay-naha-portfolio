"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Loader2, Save, Upload, FileText, ExternalLink, 
  Github, Linkedin, Twitter, Mail, X, Check, ZoomIn, Eye, Trash2, Clock
} from "lucide-react";
import Image from "next/image";
import Toast from "@/components/ui/Toast";
import Cropper, { Point, Area } from "react-easy-crop"; 

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Canvas is empty"));
      else resolve(blob);
    }, "image/jpeg", 1);
  });
}

export default function AdminHome() {
  const [formData, setFormData] = useState({
    badgeText: "Software Developer (Python)",
    showAvailability: true,
    line1Bold: "Build",
    line1Accent: "clean backends",
    line2Bold: "ship",
    line2Accent: "real products",
    bio: "",
    socialGithub: "",
    socialLinkedin: "",
    socialTwitter: "",
    socialEmail: "",
    profilePic: "",
    resumeUrl: "",
    gDriveProfilePic: "",
    gDriveResume: "",
    techStack: "Python, FastAPI, Docker, PostgreSQL, MongoDB",
    stat1Value: "5+", stat1Label: "Projects Built",
    stat2Value: "100%", stat2Label: "Open Source",
    stat3Value: "AIML", stat3Label: "Class of 2026",
    portfolioLastUpdated: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Blob | File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    fetch("/api/hero", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormData(prev => ({
            ...prev,
            bio: data.subtitle || "",
            socialGithub: data.socialGithub || "",
            socialLinkedin: data.socialLinkedin || "",
            socialTwitter: data.socialTwitter || "",
            socialEmail: data.socialEmail || "",
            profilePic: data.profilePic || "",
            resumeUrl: data.resumeUrl || "",
            gDriveProfilePic: data.gDriveProfilePic || "",
            gDriveResume: data.gDriveResume || "",
            badgeText: data.badgeText || prev.badgeText,
            showAvailability: data.showAvailability ?? prev.showAvailability,
            line1Bold: data.line1Bold || prev.line1Bold,
            line1Accent: data.line1Accent || prev.line1Accent,
            line2Bold: data.line2Bold || prev.line2Bold,
            line2Accent: data.line2Accent || prev.line2Accent,
            techStack: data.techStack || prev.techStack,
            stat1Value: data.stat1Value || prev.stat1Value, stat1Label: data.stat1Label || prev.stat1Label,
            stat2Value: data.stat2Value || prev.stat2Value, stat2Label: data.stat2Label || prev.stat2Label,
            stat3Value: data.stat3Value || prev.stat3Value, stat3Label: data.stat3Label || prev.stat3Label,
            portfolioLastUpdated: data.portfolioLastUpdated || prev.portfolioLastUpdated,
          }));
          
          // Load initial previews
          if (data.profilePic) {
            setPreviewUrl(data.profilePic);
          } else if (data.gDriveProfilePic) {
            const id = extractGDriveId(data.gDriveProfilePic);
            if (id) setPreviewUrl(`https://drive.google.com/thumbnail?id=${id}&sz=w800` );
          }
        }
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { setCropSrc(reader.result as string); setIsCropping(true); };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => setCroppedAreaPixels(croppedAreaPixels), []);

  const handleCropSave = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(cropSrc, croppedAreaPixels);
      setSelectedImage(croppedBlob);
      setImageRemoved(false);
      setPreviewUrl(URL.createObjectURL(croppedBlob));
      setIsCropping(false);
      setCropSrc(null);
    } catch (e) {
      setToast({ message: "Failed to crop image", type: "error" });
    }
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    setSelectedImage(null);
    setImageRemoved(true);
    setFormData(prev => ({ ...prev, profilePic: "", gDriveProfilePic: "" }));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeResume = () => {
    setSelectedResume(null);
    setFormData(prev => ({ ...prev, resumeUrl: "", gDriveResume: "" }));
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedResume(file);
  };

  // ✅ G-Drive Extraction Logic
  const extractGDriveId = (url: string) => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handleExtractProfilePic = () => {
    const id = extractGDriveId(formData.gDriveProfilePic);
    if (id) {
      const thumbUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
      setPreviewUrl(thumbUrl );
      setToast({ message: "Profile pic extracted successfully!", type: "success" });
    } else {
      setToast({ message: "Invalid G-Drive Image URL", type: "error" });
    }
  };

  const handleExtractResume = () => {
    const id = extractGDriveId(formData.gDriveResume);
    if (id) {
      setToast({ message: "Resume extracted successfully!", type: "success" });
    } else {
      setToast({ message: "Invalid G-Drive Resume URL", type: "error" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadProgress(0);
    setToast(null);

    try {
      const data = new FormData();
      
      const generatedTitle = `${formData.line1Bold} <span class="text-gray-500 font-medium">${formData.line1Accent}</span>  
 ${formData.line2Bold} <span class="text-gray-500 font-medium">${formData.line2Accent}</span>`;
      const generatedBadge = formData.showAvailability 
        ? `<span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> ${formData.badgeText}</span>` 
        : formData.badgeText;

      data.append("title", generatedTitle);
      data.append("badge", generatedBadge);
      data.append("subtitle", formData.bio);

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "bio" && key !== "profilePic" && key !== "resumeUrl") {
          data.append(key, String(value));
        }
      });

      if (selectedImage) data.append("image", selectedImage, "profile-pic.jpg");
      else if (imageRemoved) data.append("removeImage", "true");

      if (selectedResume) data.append("resume", selectedResume);
      else if (formData.resumeUrl === "") data.append("removeResume", "true");

      const updated: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", "/api/hero");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Failed to save"));
          }
        };

        xhr.onerror = () => reject(new Error("Network Error"));
        xhr.send(data);
      });

      if (updated.profilePic !== undefined) {
        setPreviewUrl(updated.profilePic);
        setFormData(prev => ({ ...prev, profilePic: updated.profilePic }));
      }
      if (updated.resumeUrl !== undefined) {
        setFormData(prev => ({ ...prev, resumeUrl: updated.resumeUrl }));
      }

      setSelectedImage(null);
      setSelectedResume(null);
      setImageRemoved(false);
      setToast({ message: "Home Page updated successfully!", type: "success" });
    } catch (error) {
      setToast({ message: "Network Error or Save Failed.", type: "error" });
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* CROPPER MODAL */}
      {isCropping && cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Crop Profile Picture</h3>
              <button onClick={() => setIsCropping(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-900"><X className="w-5 h-5" /></button>
            </div>
            <div className="relative h-[300px] w-full bg-black">
              <Cropper image={cropSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="p-6 bg-white space-y-4">
               <div className="flex items-center gap-2">
                 <ZoomIn className="w-4 h-4 text-gray-500" />
                 <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               </div>
               <div className="flex gap-3 pt-2">
                 <button onClick={() => setIsCropping(false)} className="flex-1 px-4 py-2 rounded-xl border border-gray-300 font-bold hover:bg-gray-100 text-gray-900">Cancel</button>
                 <button onClick={handleCropSave} className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Save Crop</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Edit Home Page</h1>
        <div className="flex gap-3">
          <a href="/" target="_blank" className="bg-white border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-900 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
            <Eye size={20} /> Preview
          </a>
          
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-90 shadow-lg transition-all"
          >
            {saving && (
              <div 
                className="absolute left-0 top-0 bottom-0 bg-blue-800 transition-all duration-200 ease-out z-0" 
                style={{ width: `${uploadProgress}%` }} 
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> 
                  {uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${uploadProgress}%` : "Processing..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Changes
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Media */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Picture */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col items-center text-center">
            <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wide mb-6">Profile Picture</h3>
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-md bg-gray-50 mb-6">
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><Upload className="w-8 h-8" /></div>
              )}
            </div>
            <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/jpeg, image/png, image/webp" />
            <div className="flex gap-2 w-full">
              <button onClick={() => imageInputRef.current?.click()} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-2 rounded-lg text-sm transition-colors">
                {previewUrl ? "Change Photo" : "Upload Photo"}
              </button>
              {previewUrl && (
                <button onClick={removePhoto} className="px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors" title="Remove Photo">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-3">JPG, PNG, WebP up to 5MB</p>

            {/* ✅ G-Drive Fallback Input with Extract Button */}
            <div className="mt-6 w-full text-left border-t pt-4">
              <label className="text-[10px] font-bold uppercase text-gray-500">G-Drive Image Fallback URL</label>
              <div className="flex gap-2 mt-1">
                <input 
                  value={formData.gDriveProfilePic} 
                  onChange={(e) => setFormData({...formData, gDriveProfilePic: e.target.value})} 
                  className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Paste Google Drive image link..." 
                />
                <button 
                  onClick={handleExtractProfilePic} 
                  className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Extract
                </button>
              </div>
            </div>
          </div>

          {/* Resume PDF */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
            <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Resume (PDF)</h3>
            <input type="file" ref={resumeInputRef} onChange={handleResumeChange} className="hidden" accept=".pdf" />
            
            {selectedResume || formData.resumeUrl || formData.gDriveResume ? (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-8 h-8 text-blue-600 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-gray-500 uppercase">Current File</p>
                    <p className="text-sm font-bold text-blue-900 truncate">
                      {selectedResume ? selectedResume.name : (formData.resumeUrl ? formData.resumeUrl.split('/').pop() : "G-Drive Resume Linked")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(formData.resumeUrl || formData.gDriveResume) && !selectedResume && (
                    <a 
                      href={formData.resumeUrl || (formData.gDriveResume.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ? `https://drive.google.com/file/d/${formData.gDriveResume.match(/\/file\/d\/([a-zA-Z0-9_-]+ )/)?.[1]}/preview` : formData.gDriveResume)} 
                      target="_blank" 
                      className="flex-1 text-center bg-white border border-blue-200 text-blue-700 text-xs font-bold py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      View ↗
                    </a>
                  )}
                  <button onClick={() => resumeInputRef.current?.click()} className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Replace File
                  </button>
                  <button onClick={removeResume} className="px-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors" title="Remove Resume">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => resumeInputRef.current?.click()} className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-400 transition-all flex flex-col items-center gap-2 group bg-white">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600">Click to Upload PDF</span>
              </button>
            )}

            {/* ✅ G-Drive Fallback Input with Extract Button */}
            <div className="mt-6 w-full text-left border-t pt-4">
              <label className="text-[10px] font-bold uppercase text-gray-500">G-Drive Resume Fallback URL</label>
              <div className="flex gap-2 mt-1">
                <input 
                  value={formData.gDriveResume} 
                  onChange={(e) => setFormData({...formData, gDriveResume: e.target.value})} 
                  className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Paste Google Drive PDF link..." 
                />
                <button 
                  onClick={handleExtractResume} 
                  className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Extract
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Content & Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Headline & Badge (Structured) */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-gray-900 border-b pb-2 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-400" /> Hero Headline & Badge</h3>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-gray-500">Badge Text</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.showAvailability} onChange={(e) => setFormData({...formData, showAvailability: e.target.checked})} className="w-4 h-4 accent-green-500" />
                  <span className="text-xs font-bold text-gray-700">Show "Available" Green Dot</span>
                </label>
              </div>
              <input value={formData.badgeText} onChange={(e) => setFormData({...formData, badgeText: e.target.value})} className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Software Developer (Python)" />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-gray-500">Main Headline (Structured)</label>
              <div className="grid grid-cols-2 gap-4">
                <input value={formData.line1Bold} onChange={(e) => setFormData({...formData, line1Bold: e.target.value})} className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Line 1 Bold (e.g. Build)" />
                <input value={formData.line1Accent} onChange={(e) => setFormData({...formData, line1Accent: e.target.value})} className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Line 1 Accent (e.g. clean backends)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input value={formData.line2Bold} onChange={(e) => setFormData({...formData, line2Bold: e.target.value})} className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Line 2 Bold (e.g. ship)" />
                <input value={formData.line2Accent} onChange={(e) => setFormData({...formData, line2Accent: e.target.value})} className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Line 2 Accent (e.g. real products)" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500">Subtitle / Bio (HTML Supported)</label>
              <textarea 
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                className="w-full h-40 p-4 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-y" 
                placeholder="Write your bio here... HTML tags like <b> or   
 are supported." 
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-gray-900 border-b pb-2 flex items-center gap-2"><ExternalLink className="w-5 h-5 text-gray-400" /> Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input value={formData.socialGithub} onChange={(e) => setFormData({...formData, socialGithub: e.target.value})} className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="GitHub URL" />
              </div>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input value={formData.socialLinkedin} onChange={(e) => setFormData({...formData, socialLinkedin: e.target.value})} className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="LinkedIn URL" />
              </div>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input value={formData.socialTwitter} onChange={(e) => setFormData({...formData, socialTwitter: e.target.value})} className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Twitter / X URL (Optional)" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input value={formData.socialEmail} onChange={(e) => setFormData({...formData, socialEmail: e.target.value})} className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email Address (Optional)" />
              </div>
            </div>
          </div>

          {/* Quick Stats & Tech Stack */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-gray-900 border-b pb-2 flex items-center gap-2"><ZoomIn className="w-5 h-5 text-gray-400" /> Hero Quick Stats & Tech Stack</h3>
            
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-gray-500">Tech Stack Marquee (Comma Separated)</label>
              <input value={formData.techStack} onChange={(e) => setFormData({...formData, techStack: e.target.value})} className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Python, FastAPI, Docker, PostgreSQL" />
            </div>

            <div className="space-y-4 pt-4">
              <label className="text-xs font-bold uppercase text-gray-500">Quick Stats (3 Items)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                  <input value={formData.stat1Value} onChange={(e) => setFormData({...formData, stat1Value: e.target.value})} className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-bold text-center placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Value (e.g. 5+)" />
                  <input value={formData.stat1Label} onChange={(e) => setFormData({...formData, stat1Label: e.target.value})} className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-600 text-xs text-center placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Label (e.g. Projects)" />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                  <input value={formData.stat2Value} onChange={(e) => setFormData({...formData, stat2Value: e.target.value})} className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-bold text-center placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Value (e.g. 100%)" />
                  <input value={formData.stat2Label} onChange={(e) => setFormData({...formData, stat2Label: e.target.value})} className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-600 text-xs text-center placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Label (e.g. Open Source)" />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                  <input value={formData.stat3Value} onChange={(e) => setFormData({...formData, stat3Value: e.target.value})} className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-bold text-center placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Value (e.g. AIML)" />
                  <input value={formData.stat3Label} onChange={(e) => setFormData({...formData, stat3Label: e.target.value})} className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-600 text-xs text-center placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Label (e.g. Class of 2026)" />
                </div>
              </div>
            </div>
          </div>

          {/* Global Status Badge */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-gray-900 border-b pb-2 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-400" /> Global Status Badge</h3>
            
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-gray-500">Status Text (Shows with pulsing green dot)</label>
              <input 
                value={formData.portfolioLastUpdated} 
                onChange={(e) => setFormData({...formData, portfolioLastUpdated: e.target.value})} 
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="e.g. Actively Seeking Python / Backend Roles" 
              />
              <p className="text-xs text-gray-500 mt-1">This text will appear next to the pulsing green dot below your stats. Leave blank to hide.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
