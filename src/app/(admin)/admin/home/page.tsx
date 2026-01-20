"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Save, Upload, FileText, Github, Linkedin, ExternalLink, FileUp, CheckCircle, Bold, Italic, Palette, WrapText, PaintBucket } from "lucide-react";
import Image from "next/image";
import Toast from "@/components/ui/Toast";

// --- UPDATED: Rich Toolbar with Break & Custom Colors ---
const RichToolbar = ({ targetId, onInsert }: { targetId: string; onInsert: (start: string, end: string) => void }) => {
  return (
    <div className="flex flex-wrap items-center gap-1 mb-2 p-1.5 bg-muted/50 rounded-lg border w-fit shadow-sm">
      
      {/* Basic Formatting */}
      <button 
        type="button"
        onClick={() => onInsert("<b>", "</b>")} 
        className="p-1.5 hover:bg-background hover:text-foreground rounded transition-colors text-xs font-bold border border-transparent hover:border-border" 
        title="Bold Text"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button 
        type="button"
        onClick={() => onInsert("<i>", "</i>")} 
        className="p-1.5 hover:bg-background hover:text-foreground rounded transition-colors text-xs italic border border-transparent hover:border-border" 
        title="Italic Text"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* Line Break */}
      <button 
        type="button"
        onClick={() => onInsert("<br />", "")} 
        className="p-1.5 hover:bg-background hover:text-foreground rounded transition-colors text-xs font-bold border border-transparent hover:border-border flex items-center gap-1" 
        title="Force Line Break"
      >
        <WrapText className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-border mx-1" />

      {/* Better Gray (Visible in Light & Dark) */}
      <button 
        type="button"
        onClick={() => onInsert('<span class="text-gray-500 dark:text-gray-400 font-medium">', "</span>")} 
        className="p-1.5 hover:bg-background hover:text-foreground rounded transition-colors text-xs text-gray-500 font-bold border border-transparent hover:border-border flex items-center gap-1" 
        title="Gray Text (Visible in both modes)"
      >
        <Palette className="w-3.5 h-3.5" /> Gray
      </button>

      {/* Custom Magic Color (Light/Dark Support) */}
      <button 
        type="button"
        onClick={() => onInsert('<span class="text-blue-600 dark:text-yellow-400">', "</span>")} 
        className="p-1.5 hover:bg-background hover:text-foreground rounded transition-colors text-xs text-blue-600 dark:text-yellow-400 font-bold border border-transparent hover:border-border flex items-center gap-1" 
        title="Custom Color (Edit class names after inserting)"
      >
        <PaintBucket className="w-3.5 h-3.5" /> Magic Color
      </button>
    </div>
  );
};

export default function AdminHome() {
  const [formData, setFormData] = useState({
    badge: "",
    title: "",
    subtitle: "",
    resumeUrl: "",
    socialGithub: "",
    socialLinkedin: "",
    profilePic: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Helper to insert tags at cursor position
  const handleInsertTag = (field: keyof typeof formData, startTag: string, endTag: string) => {
    const inputId = `input-${field}`;
    const input = document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement;
    
    if (!input) return;

    const startPos = input.selectionStart || 0;
    const endPos = input.selectionEnd || 0;
    const currentVal = formData[field];
    
    // If inserting <br />, we don't need to wrap selection, just insert it
    const selectedText = currentVal.substring(startPos, endPos);
    const newVal = 
      currentVal.substring(0, startPos) + 
      startTag + selectedText + endTag + 
      currentVal.substring(endPos);

    setFormData({ ...formData, [field]: newVal });
    
    setTimeout(() => {
      input.focus();
      // Move cursor after the inserted tag
      const newCursorPos = startPos + startTag.length + selectedText.length + endTag.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
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
      .catch((err) => {
        console.error("Failed to load admin data", err);
        setLoading(false);
      });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
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
      if (selectedImage) data.append("image", selectedImage);
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

      <div className="flex items-center justify-between border-b pb-4 sticky top-0 bg-background/80 backdrop-blur z-10">
        <h1 className="text-3xl font-bold">Edit Home Page</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Uploading..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN --- */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Picture */}
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
                <span className="text-white text-xs font-bold">Change Image</span>
              </div>
            </div>
            <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          {/* Resume Upload */}
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

        {/* --- RIGHT COLUMN: TEXT EDITOR --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 border rounded-xl bg-card space-y-6 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
              <FileText className="w-4 h-4" /> Text Content
            </h3>
            
            {/* BADGE */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Top Badge</label>
                <RichToolbar targetId="input-badge" onInsert={(s, e) => handleInsertTag('badge', s, e)} />
              </div>
              <input 
                id="input-badge"
                value={formData.badge}
                onChange={(e) => setFormData({...formData, badge: e.target.value})}
                className="w-full p-3 border rounded-lg bg-background font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. SOFTWARE DEVELOPER"
              />
            </div>

            {/* HEADLINE */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Main Headline</label>
                <RichToolbar targetId="input-title" onInsert={(s, e) => handleInsertTag('title', s, e)} />
              </div>
              <textarea 
                id="input-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 border rounded-lg bg-background text-lg font-bold h-32 focus:ring-2 focus:ring-primary/20 outline-none leading-relaxed"
                placeholder="Use the 'Magic Color' button to change text colors..."
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Tip: Click <b>Magic Color</b> to insert a color code. Change "blue-600" to "red-500", "green-600", etc.
              </p>
            </div>

            {/* SUBTITLE */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Subtitle / Bio</label>
                <RichToolbar targetId="input-subtitle" onInsert={(s, e) => handleInsertTag('subtitle', s, e)} />
              </div>
              <textarea 
                id="input-subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="w-full p-3 border rounded-lg bg-background h-32 focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Short bio..."
              />
            </div>
          </div>

          {/* SOCIAL LINKS */}
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