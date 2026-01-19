"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Save, Loader2, Upload } from "lucide-react";
import Toast from "@/components/ui/Toast"; 

export default function EditHeroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [tagline, setTagline] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    fetch("/api/hero")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setTagline(data.tagline || "");
          setHeadline(data.headline || "");
          setDescription(data.description || "");
          setPreview(data.image || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData();
    formData.append("tagline", tagline);
    formData.append("headline", headline);
    formData.append("description", description);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch("/api/hero", { method: "PUT", body: formData });
      if (res.ok) {
        setToast({ message: "Home page updated!", type: "success" });
      } else {
        setToast({ message: "Update failed.", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Network error.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-3xl font-bold mb-8">Edit Home / Hero</h1>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800">
        
        {/* Profile Image */}
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 relative group">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Img</div>
            )}
          </div>
          <div className="flex-1">
             <label className="block text-sm font-bold uppercase mb-2">Profile Picture</label>
             <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
             <p className="text-xs text-gray-400 mt-2">Uploading a new image will automatically delete the old one from GitHub.</p>
          </div>
        </div>

        {/* Tagline */}
        <div>
          <label className="font-bold block mb-2 uppercase text-sm text-green-600">Tagline (Green Text)</label>
          <input 
            value={tagline} 
            onChange={(e) => setTagline(e.target.value)} 
            placeholder="Full Stack Engineer"
            className="w-full p-3 rounded-xl border dark:bg-black focus:ring-2 focus:ring-primary outline-none" 
          />
        </div>

        {/* Headline */}
        <div>
          <label className="font-bold block mb-2 uppercase text-sm">Main Headline (Allows HTML)</label>
          <p className="text-xs text-gray-500 mb-2">Use &lt;br /&gt; for line breaks and &lt;span class=&quot;text-gray-500&quot;&gt; for gray text.</p>
          <textarea 
            rows={3}
            value={headline} 
            onChange={(e) => setHeadline(e.target.value)} 
            placeholder='Building digital <br /> experiences that <span class="text-gray-500">matter.</span>'
            className="w-full p-3 rounded-xl border dark:bg-black font-mono text-sm focus:ring-2 focus:ring-primary outline-none" 
          />
        </div>

        {/* Description */}
        <div>
          <label className="font-bold block mb-2 uppercase text-sm">Description</label>
          <textarea 
            rows={4}
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="I'm Nilay, a developer specializing in..."
            className="w-full p-3 rounded-xl border dark:bg-black focus:ring-2 focus:ring-primary outline-none" 
          />
        </div>

        <button type="submit" disabled={saving} className="w-full bg-primary text-white py-4 rounded-xl font-bold flex justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/25">
          {saving ? <Loader2 className="animate-spin"/> : <><Save/> Save Changes</>}
        </button>
      </form>
    </div>
  );
}