"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Save, Loader2, Upload, X, Calendar, Crop, Eye, Wand2,
  Table as TableIcon, Code, Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Cropper from "react-easy-crop";
import Toast from "@/components/ui/Toast";

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
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

  // ✅ NEW: State to hold available blogs for the dropdown
  const [availableBlogs, setAvailableBlogs] = useState<{_id: string, title: string}[]>([]);

  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", githubLink: "", liveLink: "", appLink: "", image: "",
    gDriveImage: "",
    publishDate: "", role: "", status: "Published", featured: false, frameStyle: "Browser",
    relatedBlog: "" // ✅ NEW: Field to store linked blog ID
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [fileError, setFileError] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    // ✅ Fetch all blogs to populate the dropdown
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
            relatedBlog: p.relatedBlog || "" // ✅ Load existing linked blog
          });
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
      setFileError(`File is too big. Limit is 4.5MB.`);
      e.target.value = "";
      return;
    }
    setImageToCrop(URL.createObjectURL(file));
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
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
      alert("Failed to crop image");
    }
  };

  const insertTableTemplate = () => {
    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; border: 1px solid #d1d5db;">
  <tbody>
    <tr style="background-color: #f3f4f6;">
      <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Header 1</td>
      <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Header 2</td>
      <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Header 3</td>
    </tr>
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 12px;">Row 1 Data</td>
      <td style="border: 1px solid #d1d5db; padding: 12px;">Row 1 Data</td>
      <td style="border: 1px solid #d1d5db; padding: 12px;">Row 1 Data</td>
    </tr>
  </tbody>
</table>
`;
    setFormData(prev => ({ ...prev, description: prev.description + "\n" + tableHtml + "\n" }));
    setToast({ message: "HTML Table inserted!", type: "success" });
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
        if (key !== "image") data.append(key, value as string);
      });
      data.append("tags", tags.join(","));
      if (newImage) data.append("image", newImage);
      else if (formData.image) data.append("image", formData.image);
      if (!isNew && id) data.append("id", id);
      
      const res = await fetch("/api/projects", { method: isNew ? "POST" : "PUT", body: data });
      if (res.ok) {
        setToast({ message: isNew ? "Project created successfully!" : "Project updated successfully!", type: "success" });
        setTimeout(() => {
          router.push("/admin/projects");
          router.refresh();
        }, 1500);
      } else {
        const errorData = await res.json();
        setToast({ message: `Error: ${errorData.error}`, type: "error" });
      }
    } catch (error) {
      setToast({ message: "An unexpected error occurred.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32 bg-gray-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* FULLSCREEN LIVE PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-12 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-500">Live Preview: {formData.title || "Untitled"}</h2>
              <button type="button" onClick={() => setShowPreview(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-medium transition-colors">
                <X size={20} /> Close Preview
              </button>
            </div>
            
            <header className="mb-12">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">{tag}</span>
                  ))}
                </div>
              )}
              <h1 className="text-5xl font-extrabold text-black mb-4">{formData.title || "Project Title"}</h1>
              <div className="flex gap-4 text-gray-500 font-medium mb-8">
                <span>{formData.role || "Role not specified"}</span> • <span>{formData.status}</span>
              </div>
              
              {previewUrl && (
                <div className={`w-full mt-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white ${formData.frameStyle === 'Browser' ? 'pt-10 relative' : ''}`}>
                  {formData.frameStyle === 'Browser' && (
                    <div className="absolute top-0 left-0 w-full h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                    </div>
                  )}
                  <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover" />
                </div>
              )}
            </header>
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-pre:bg-gray-900 prose-pre:text-white" dangerouslySetInnerHTML={{ __html: formData.description || "<p>No content yet...</p>" }} />
          </div>
        </div>
      )}

      {/* CROPPER MODAL */}
      {imageToCrop && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[60vh] bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
            <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={16 / 9} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
          </div>
          <div className="w-full max-w-4xl mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2 flex items-center gap-4 text-white">
               <span className="text-sm font-medium">Zoom:</span>
               <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button type="button" onClick={() => setImageToCrop(null)} className="flex-1 px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700">Cancel</button>
              <button type="button" onClick={handleCropSave} className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"><Crop size={18} /> Apply Crop</button>
            </div>
          </div>
        </div>
      )}

      <Link href="/admin/projects" className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 w-fit font-bold"><ArrowLeft size={18} /> Back to Projects</Link>
      
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold text-black">{isNew ? "Create Project" : "Edit Project"}</h1>
        <div className="flex gap-3">
          <button type="button" onClick={() => setShowPreview(true)} className="bg-white border-2 border-gray-300 text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:border-blue-600 hover:text-blue-600 transition-all">
            <Eye className="w-5 h-5" /> Full Preview
          </button>
          <button onClick={handleSubmit} disabled={saving} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-all">
            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Save
          </button>
        </div>
      </div>

      <form className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Project Title</label>
            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. AI Yield Predictor" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 flex justify-between items-center">
              Slug 
              <button type="button" onClick={generateSlug} className="text-blue-600 flex items-center gap-1 hover:underline bg-blue-50 px-2 py-1 rounded-md">
                <Wand2 size={12} /> Auto-Generate
              </button>
            </label>
            <input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. ai-yield-predictor" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Role / Position</label>
            <input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Full-Stack Developer" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div className="space-y-2 flex flex-col justify-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="font-bold text-gray-700">Featured Project</span>
            </label>
          </div>
        </div>
                {/* ✅ NEW: TABBED HTML/MARKDOWN EDITOR */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col transition-all">
          {/* Editor Header with Tabs */}
          <div className="flex justify-between items-end mb-0 border-b border-gray-200 px-6 pt-6">
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setEditorTab("write")} 
                className={`px-4 py-2.5 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors ${editorTab === "write" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                <Code size={16} /> Write Code
              </button>
              <button 
                type="button" 
                onClick={() => setEditorTab("preview")} 
                className={`px-4 py-2.5 text-sm font-bold rounded-t-lg flex items-center gap-2 transition-colors ${editorTab === "preview" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                <Eye size={16} /> Inline Preview
              </button>
            </div>
            
            <div className="flex items-center gap-2 pb-2">
              {editorTab === "write" && (
                <button 
                  type="button" 
                  onClick={insertTableTemplate} 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded-lg transition-colors"
                >
                  <TableIcon size={16} /> Insert HTML Table
                </button>
              )}
            </div>
          </div>
          
          {/* Editor Content Area */}
          <div className="flex-1 p-6">
            {editorTab === "write" ? (
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full p-4 bg-gray-900 text-gray-100 font-mono text-sm rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed h-[400px]"
                placeholder="<h1>Project Overview</h1>&#10;<p>Write your HTML, CSS, or Markdown here...</p>"
              />
            ) : (
              <div 
                className="w-full p-6 bg-white border border-gray-200 rounded-xl overflow-y-auto prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-pre:bg-gray-900 prose-pre:text-white h-[400px]"
                dangerouslySetInnerHTML={{ __html: formData.description || "<p class='text-gray-400'>Nothing to preview yet...</p>" }}
              />
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-6">
            
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1"><Calendar size={14}/> Publish Date</label>
               <input type="datetime-local" value={formData.publishDate} onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* ✅ NEW: Link to Blog Post */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                <LinkIcon size={14} /> Link to Blog Post
              </label>
              <select 
                value={formData.relatedBlog} 
                onChange={(e) => setFormData({ ...formData, relatedBlog: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- No Blog Linked --</option>
                {availableBlogs.map(blog => (
                  <option key={blog._id} value={blog._id}>{blog.title}</option>
                ))}
              </select>
            </div>

            {/* Tag Pills Input */}
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">Tech Stack & Tags (Press Enter)</label>
               <div className="w-full p-2 rounded-xl border border-gray-300 bg-white flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-blue-500">
                 {tags.map((tag, i) => (
                   <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">
                     {tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14}/></button>
                   </span>
                 ))}
                 <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Type and press Enter..." className="flex-1 min-w-[120px] p-1 outline-none bg-transparent text-black font-medium text-sm" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">GitHub Link</label>
               <input value={formData.githubLink} onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase text-gray-500">Live Demo Link</label>
               <input value={formData.liveLink} onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          
          <div className={`space-y-6 p-8 rounded-2xl border ${fileError ? "bg-red-50 border-red-500" : "bg-white border-gray-200 shadow-sm"}`}>
            <div className="flex justify-between items-center">
              <label className="font-bold text-sm uppercase text-gray-500">Project Image (16:9)</label>
              <select value={formData.frameStyle} onChange={(e) => setFormData({ ...formData, frameStyle: e.target.value })} className="p-2 rounded-lg border border-gray-300 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
                <option value="None">No Frame</option>
                <option value="Browser">Browser Mockup</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label htmlFor="image-upload" className="cursor-pointer px-4 py-2 rounded-lg font-bold shadow-sm bg-black text-white hover:bg-gray-800 transition-colors">Choose file</label>
              <input id="image-upload" type="file" accept=".jpg,.jpeg,.png,.gif,image/*" className="hidden" onChange={handleImageSelect} />
            </div>
            
            <div className="mt-4 w-full aspect-[16/9] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center relative overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
              {previewUrl ? (
                <div className="relative w-full h-full group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setNewImage(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-400"><Upload className="w-8 h-8 mb-2 mx-auto opacity-50" /><span className="text-xs font-medium">Preview</span></div>
              )}
            </div>

            {/* ✅ G-Drive Fallback */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase text-gray-500">G-Drive Fallback URL</label>
              <input 
                type="text" 
                value={formData.gDriveImage} 
                onChange={(e) => setFormData({ ...formData, gDriveImage: e.target.value })} 
                placeholder="Paste Google Drive link or iframe..." 
                className="w-full p-3 rounded-xl border border-gray-300 bg-white text-black text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}


