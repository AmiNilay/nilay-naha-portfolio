"use client";

import SkillPicker, { SkillIcon } from "@/components/admin/SkillPicker";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  Save,
  Upload,
  FileText,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Mail,
  X,
  Check,
  ZoomIn,
  Eye,
  Trash2,
  Clock,
  Sparkles,
  Camera,
  Layers,
  Globe,
  Radio,
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarClock,
} from "lucide-react";
import Image from "next/image";
import MediaFrame from "@/components/ui/MediaFrame";
import { formatDeployTime, relativeDeployTime } from "@/lib/lastDeployed";
import Toast from "@/components/ui/Toast";
import Cropper, { Point, Area } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";

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
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Canvas is empty"));
        else resolve(blob);
      },
      "image/jpeg",
      1
    );
  });
}

export default function AdminHome() {
  const [formData, setFormData] = useState({
    siteTitle: "Nilay Naha - Software Engineer",
    siteSubtitle: "Software Engineer",
    badgeText: "Software Engineer",
    showAvailability: true,
    line1Bold: "Build",
    line1Accent: "clean backends",
    line2Bold: "ship",
    line2Accent: "real products",
    bio: "",
    socialGithub: "",
    socialLinkedin: "",
    socialTwitter: "",
    socialInstagram: "",
    bookingUrl: "",
    socialEmail: "",
    profilePic: "",
    resumeUrl: "",
    gDriveProfilePic: "",
    gDriveResume: "",
    techStack: "Python, FastAPI, Docker, PostgreSQL, MongoDB",
    techMarqueeSpeed: 40,
    stat1Value: "5+",
    stat1Label: "Projects Built",
    stat2Value: "100%",
    stat2Label: "Open Source",
    stat3Value: "AIML",
    stat3Label: "Class of 2026",
    portfolioLastUpdated: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Blob | File | null>(null);
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
          setFormData((prev) => ({
            ...prev,
            bio: data.subtitle || "",
            socialGithub: data.socialGithub || "",
            socialLinkedin: data.socialLinkedin || "",
            socialTwitter: data.socialTwitter || "",
            socialInstagram: data.socialInstagram || "",
            bookingUrl: data.bookingUrl || "",
            socialEmail: data.socialEmail || "",
            profilePic: data.profilePic || "",
            resumeUrl: data.resumeUrl || "",
            gDriveProfilePic: data.gDriveProfilePic || "",
            gDriveResume: data.gDriveResume || "",
            siteTitle: data.siteTitle || prev.siteTitle,
            siteSubtitle: data.siteSubtitle || prev.siteSubtitle,
            badgeText: data.badgeText || prev.badgeText,
            showAvailability: data.showAvailability ?? prev.showAvailability,
            line1Bold: data.line1Bold || prev.line1Bold,
            line1Accent: data.line1Accent || prev.line1Accent,
            line2Bold: data.line2Bold || prev.line2Bold,
            line2Accent: data.line2Accent || prev.line2Accent,
            techStack: data.techStack || prev.techStack,
            techMarqueeSpeed: Number(data.techMarqueeSpeed) || prev.techMarqueeSpeed,
            stat1Value: data.stat1Value || prev.stat1Value,
            stat1Label: data.stat1Label || prev.stat1Label,
            stat2Value: data.stat2Value || prev.stat2Value,
            stat2Label: data.stat2Label || prev.stat2Label,
            stat3Value: data.stat3Value || prev.stat3Value,
            stat3Label: data.stat3Label || prev.stat3Label,
            portfolioLastUpdated: data.portfolioLastUpdated || prev.portfolioLastUpdated,
          }));

          if (data.profilePic) {
            setPreviewUrl(data.profilePic);
          } else if (data.gDriveProfilePic) {
            setPreviewUrl(data.gDriveProfilePic);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
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
      setToast({ message: "Failed to crop image", type: "error" });
    }
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    setSelectedImage(null);
    setFormData((prev) => ({ ...prev, profilePic: "", gDriveProfilePic: "" }));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeResume = () => {
    setSelectedResume(null);
    setFormData((prev) => ({ ...prev, resumeUrl: "", gDriveResume: "" }));
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedResume(file);
  };

  const extractGDriveId = (url: string) => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handleExtractProfilePic = () => {
    const id = extractGDriveId(formData.gDriveProfilePic);
    if (id) {
      setPreviewUrl(formData.gDriveProfilePic.trim());
      setToast({ message: "Profile picture extracted successfully!", type: "success" });
    } else {
      setToast({ message: "Invalid Google Drive Image URL", type: "error" });
    }
  };

  const handleExtractResume = () => {
    const id = extractGDriveId(formData.gDriveResume);
    if (id) {
      setToast({ message: "Resume link extracted successfully!", type: "success" });
    } else {
      setToast({ message: "Invalid Google Drive Resume URL", type: "error" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadProgress(0);
    setToast(null);

    try {
      const data = new FormData();

      const generatedTitle = `${formData.line1Bold} <span class="text-zinc-400 font-medium">${formData.line1Accent}</span>  
 ${formData.line2Bold} <span class="text-zinc-400 font-medium">${formData.line2Accent}</span>`;
      const generatedBadge = formData.showAvailability
        ? `<span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ${formData.badgeText}</span>`
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
      else if (formData.profilePic === "") data.append("removeImage", "true");

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
        setFormData((prev) => ({ ...prev, profilePic: updated.profilePic }));
      }
      if (updated.resumeUrl !== undefined) {
        setFormData((prev) => ({ ...prev, resumeUrl: updated.resumeUrl }));
      }

      setSelectedImage(null);
      setSelectedResume(null);
      setToast({ message: "Hero & Home Page updated successfully!", type: "success" });
    } catch (error) {
      setToast({ message: "Network Error or Save Failed.", type: "error" });
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Loading Home Settings...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 select-none">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* CROPPER MODAL */}
      <AnimatePresence>
        {isCropping && cropSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-zinc-200/80 dark:border-zinc-800"
            >
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Crop Profile Photo
                </h3>
                <button
                  onClick={() => setIsCropping(false)}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative h-[320px] w-full bg-black">
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

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <ZoomIn className="w-4 h-4 text-zinc-400" />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsCropping(false)}
                    className="flex-1 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 font-bold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropSave}
                    className="flex-1 px-4 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md"
                  >
                    <Check className="w-4 h-4" /> Save Crop
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Header & Sticky Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Landing Presentation
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Hero & Home Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Configure landing banner headlines, profile portraits, resume files, and live metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 active:scale-98 transition-all"
          >
            <Eye className="w-4 h-4 text-cyan-500" /> Preview
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="relative overflow-hidden px-6 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs sm:text-sm font-bold shadow-lg shadow-zinc-950/10 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <div
                className="absolute left-0 top-0 bottom-0 bg-cyan-500/30 transition-all duration-200 ease-out z-0"
                style={{ width: `${uploadProgress}%` }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress > 0 && uploadProgress < 100
                    ? `Uploading ${uploadProgress}%`
                    : "Processing..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Media & Resume (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Picture Card */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col items-center text-center">
            <h3 className="font-bold text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-cyan-500" /> Profile Avatar
            </h3>

            <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 shadow-md bg-zinc-50 dark:bg-zinc-800 mb-6 group">
              {previewUrl ? (
                <MediaFrame src={previewUrl} alt="Preview" width={600} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <Upload className="w-8 h-8" />
                </div>
              )}
            </div>

            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/jpeg, image/png, image/webp, image/gif, video/mp4, video/webm"
            />

            <div className="flex gap-2 w-full">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs transition-colors"
              >
                {previewUrl ? "Change Photo" : "Upload Photo"}
              </button>
              {previewUrl && (
                <button
                  onClick={removePhoto}
                  className="px-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                  title="Remove Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">Image, GIF or MP4/WebM video. Shown on the Home page only.</p>

            {/* G-Drive Fallback */}
            <div className="mt-5 w-full text-left border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Google Drive Link (image, GIF or video)
              </label>
              <p className="text-[10px] text-zinc-400 mb-1.5">Share as &quot;Anyone with the link&quot;. Add <code>#gif</code> for an animated GIF or <code>#video</code> for a video at the end of the link.</p>
              <div className="flex gap-1.5">
                <input
                  value={formData.gDriveProfilePic}
                  onChange={(e) =>
                    setFormData({ ...formData, gDriveProfilePic: e.target.value })
                  }
                  className="flex-1 p-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Paste G-Drive link..."
                />
                <button
                  onClick={handleExtractProfilePic}
                  className="px-3 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Extract
                </button>
              </div>
            </div>
          </div>

          {/* Resume PDF Card */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <h3 className="font-bold text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-500" /> Resume Document (PDF)
            </h3>

            <input
              type="file"
              ref={resumeInputRef}
              onChange={handleResumeChange}
              className="hidden"
              accept=".pdf"
            />

            {selectedResume || formData.resumeUrl || formData.gDriveResume ? (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Current Document</p>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {selectedResume
                        ? selectedResume.name
                        : formData.resumeUrl
                        ? formData.resumeUrl.split("/").pop()
                        : "G-Drive Document Linked"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {(formData.resumeUrl || formData.gDriveResume) && !selectedResume && (
                    <a
                      href={
                        formData.resumeUrl ||
                        (formData.gDriveResume.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
                          ? `https://drive.google.com/file/d/${
                              formData.gDriveResume.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1]
                            }/preview`
                          : formData.gDriveResume)
                      }
                      target="_blank"
                      className="flex-1 text-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      View ↗
                    </a>
                  )}
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    className="flex-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold py-2 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Replace
                  </button>
                  <button
                    onClick={removeResume}
                    className="px-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                    title="Remove Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => resumeInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-cyan-500 transition-all flex flex-col items-center gap-2 group bg-zinc-50/50 dark:bg-zinc-850/50"
              >
                <Upload className="w-6 h-6 text-zinc-400 group-hover:text-cyan-500" />
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-cyan-500">
                  Upload PDF Resume
                </span>
              </button>
            )}

            {/* G-Drive Resume Fallback */}
            <div className="mt-5 w-full text-left border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Google Drive Resume Fallback URL
              </label>
              <div className="flex gap-1.5">
                <input
                  value={formData.gDriveResume}
                  onChange={(e) =>
                    setFormData({ ...formData, gDriveResume: e.target.value })
                  }
                  className="flex-1 p-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Paste G-Drive PDF link..."
                />
                <button
                  onClick={handleExtractResume}
                  className="px-3 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Extract
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Headlines & Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Headlines Card */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-6">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800/80 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-500" /> Website Tab Title & Browser Metadata
            </h3>

            {/* Website Tab Title & Subtitle */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                  Browser Tab Title (Website & SEO Title)
                </label>
                <input
                  value={formData.siteTitle}
                  onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-bold"
                  placeholder="e.g. Nilay Naha - Software Engineer"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  This text appears on the browser tab, Google search results, and social sharing previews.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                  Primary Professional Title
                </label>
                <input
                  value={formData.siteSubtitle}
                  onChange={(e) => setFormData({ ...formData, siteSubtitle: e.target.value })}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                  placeholder="e.g. Software Engineer"
                />
              </div>
            </div>

            <h3 className="font-bold text-base text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800/80 pb-3 flex items-center gap-2 pt-2">
              <Sparkles className="w-4 h-4 text-cyan-500" /> Hero Headlines & Badges
            </h3>

            {/* Badge Text & Toggle */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Role Eyebrow Badge
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showAvailability}
                    onChange={(e) =>
                      setFormData({ ...formData, showAvailability: e.target.checked })
                    }
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Show Pulsing "Available" Dot
                  </span>
                </label>
              </div>
              <input
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                placeholder="e.g. Software Developer (Python)"
              />
            </div>

            {/* Structured Headlines */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Two-Line Hero Headline
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={formData.line1Bold}
                  onChange={(e) => setFormData({ ...formData, line1Bold: e.target.value })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Line 1 Bold (e.g. Build)"
                />
                <input
                  value={formData.line1Accent}
                  onChange={(e) => setFormData({ ...formData, line1Accent: e.target.value })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Line 1 Accent (e.g. clean backends)"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={formData.line2Bold}
                  onChange={(e) => setFormData({ ...formData, line2Bold: e.target.value })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Line 2 Bold (e.g. ship)"
                />
                <input
                  value={formData.line2Accent}
                  onChange={(e) => setFormData({ ...formData, line2Accent: e.target.value })}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Line 2 Accent (e.g. real products)"
                />
              </div>
            </div>

            {/* Subtitle / Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Subtitle Statement
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full h-32 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 leading-relaxed font-medium"
                placeholder="Write your hero subtitle statement..."
              />
            </div>
          </div>

          {/* Social Profiles Card */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800/80 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-500" /> Public Social Profiles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  value={formData.socialGithub}
                  onChange={(e) => setFormData({ ...formData, socialGithub: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                  placeholder="GitHub URL"
                />
              </div>

              <div className="relative">
                <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  value={formData.socialLinkedin}
                  onChange={(e) => setFormData({ ...formData, socialLinkedin: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                  placeholder="LinkedIn URL"
                />
              </div>

              <div className="relative">
                <Twitter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  value={formData.socialTwitter}
                  onChange={(e) => setFormData({ ...formData, socialTwitter: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                  placeholder="Twitter / X URL (Optional)"
                />
              </div>

              <div className="relative">
                <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  value={formData.socialInstagram}
                  onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                  placeholder="Instagram URL (Optional)"
                />
              </div>

              <div className="relative">
                <CalendarClock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  value={formData.bookingUrl}
                  onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                  placeholder="Book-a-call link, e.g. https://cal.com/your-name (Optional, shows on Contact)"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  value={formData.socialEmail}
                  onChange={(e) => setFormData({ ...formData, socialEmail: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                  placeholder="Email Address"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats & Tech Stack Card */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-6">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800/80 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" /> Stats Counters & Tech Stack
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Tech Stack Marquee
              </label>
              <TechStackEditor
                value={formData.techStack}
                onChange={(techStack) => setFormData({ ...formData, techStack })}
              />
              <div className="flex items-center gap-3 pt-2">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 shrink-0">Scroll speed</span>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  // Slider runs fast → slow left to right is unintuitive; invert so right = faster.
                  value={130 - formData.techMarqueeSpeed}
                  onChange={(e) => setFormData({ ...formData, techMarqueeSpeed: 130 - Number(e.target.value) })}
                  className="flex-1 accent-cyan-500"
                  aria-label="Marquee speed"
                />
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 w-24 text-right shrink-0">
                  {formData.techMarqueeSpeed}s per loop
                </span>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/40 py-2">
                <div
                  className="flex w-max"
                  style={{ animation: `hero-scroll ${formData.techMarqueeSpeed}s linear infinite` }}
                >
                  {[0, 1].map((copy) =>
                    formData.techStack
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((t, i) => (
                        <span key={`${copy}-${i}`} className="mx-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                          <SkillIcon name={t} />
                          {t}
                        </span>
                      ))
                  )}
                </div>
              </div>
              <p className="text-[10px] text-zinc-400">Live preview. Lower seconds = faster. Hover pauses it on the site.</p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Three Hero Live Stat Metrics
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1.5">
                  <input
                    value={formData.stat1Value}
                    onChange={(e) => setFormData({ ...formData, stat1Value: e.target.value })}
                    className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center font-bold text-sm text-zinc-900 dark:text-white"
                    placeholder="5+"
                  />
                  <input
                    value={formData.stat1Label}
                    onChange={(e) => setFormData({ ...formData, stat1Label: e.target.value })}
                    className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center text-[11px] text-zinc-600 dark:text-zinc-400"
                    placeholder="Projects Built"
                  />
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1.5">
                  <input
                    value={formData.stat2Value}
                    onChange={(e) => setFormData({ ...formData, stat2Value: e.target.value })}
                    className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center font-bold text-sm text-zinc-900 dark:text-white"
                    placeholder="100%"
                  />
                  <input
                    value={formData.stat2Label}
                    onChange={(e) => setFormData({ ...formData, stat2Label: e.target.value })}
                    className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center text-[11px] text-zinc-600 dark:text-zinc-400"
                    placeholder="Open Source"
                  />
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1.5">
                  <input
                    value={formData.stat3Value}
                    onChange={(e) => setFormData({ ...formData, stat3Value: e.target.value })}
                    className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center font-bold text-sm text-zinc-900 dark:text-white"
                    placeholder="AIML"
                  />
                  <input
                    value={formData.stat3Label}
                    onChange={(e) => setFormData({ ...formData, stat3Label: e.target.value })}
                    className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center text-[11px] text-zinc-600 dark:text-zinc-400"
                    placeholder="Class of 2026"
                  />
                </div>
              </div>
            </div>

            {/* Global Status Text */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Global Pulse Status Text
              </label>
              <input
                value={formData.portfolioLastUpdated}
                onChange={(e) =>
                  setFormData({ ...formData, portfolioLastUpdated: e.target.value })
                }
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                placeholder="e.g. Actively Seeking Python / Backend Engineering Roles"
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                &quot;Last updated&quot; is automatic: <strong>{formatDeployTime() || "set on next deploy"}</strong>
                {relativeDeployTime() && <> ({relativeDeployTime()})</>} — the time of the latest push to GitHub. Text here is shown next to it; a typed &quot;Last updated…&quot; is ignored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hero tech list editor: the selected items (with logos) can be reordered or
 * removed, and new ones are picked from the same logo catalog as Admin → About.
 * Stored as the comma-separated `techStack` string; legacy free-text items keep working.
 */
function TechStackEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = value.split(",").map((t) => t.trim()).filter(Boolean);
  const commit = (next: string[]) => onChange(next.join(", "));
  const toggle = (name: string) =>
    commit(items.some((t) => t.toLowerCase() === name.toLowerCase())
      ? items.filter((t) => t.toLowerCase() !== name.toLowerCase())
      : [...items, name]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {items.map((t, i) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200"
          >
            <button type="button" onClick={() => move(i, -1)} aria-label={`Move ${t} left`} className="p-0.5 text-zinc-400 hover:text-cyan-500 disabled:opacity-30" disabled={i === 0}>
              <ChevronLeft className="w-3 h-3" />
            </button>
            <SkillIcon name={t} />
            {t}
            <button type="button" onClick={() => move(i, 1)} aria-label={`Move ${t} right`} className="p-0.5 text-zinc-400 hover:text-cyan-500 disabled:opacity-30" disabled={i === items.length - 1}>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button type="button" onClick={() => commit(items.filter((_, k) => k !== i))} aria-label={`Remove ${t}`} className="p-0.5 text-zinc-400 hover:text-rose-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {!items.length && <span className="text-[11px] italic text-zinc-400">Nothing selected yet — click logos below.</span>}
      </div>
      <div className="flex flex-col h-[340px] p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
        <SkillPicker selected={items} onToggle={toggle} />
      </div>
    </div>
  );
}
