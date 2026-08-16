"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Eye, X } from "lucide-react"; // 🟢 Added Eye and X

export default function HomeEditor() {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // 🟢 Preview State

  useEffect(() => {
    fetch("/api/home-data")
      .then((res) => res.json())
      .then((data) => {
        setFormData(data || { title: "", description: "" });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/home-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setSaving(false);
    alert("Home page updated successfully!");
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      
      {/* 🟢 PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-16 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-500">Live Preview: Hero Section</h2>
              <button type="button" onClick={() => setShowPreview(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-medium transition-colors">
                <X size={20} /> Close Preview
              </button>
            </div>
            
            {/* Mock Hero Section Preview */}
            <div className="text-center py-20 px-4 bg-gray-50 rounded-3xl border border-gray-200">
              <h1 className="text-5xl md:text-7xl font-extrabold text-black mb-6 tracking-tight">
                {formData.title || "Your Hero Title"}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {formData.description || "Your hero description will appear right here..."}
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <div className="px-8 py-3 bg-black text-white rounded-full font-medium opacity-50 cursor-not-allowed">Primary CTA</div>
                <div className="px-8 py-3 bg-white border border-gray-300 text-black rounded-full font-medium opacity-50 cursor-not-allowed">Secondary CTA</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-bold uppercase mb-2 text-gray-500">Hero Title</label>
          <input 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-xl bg-white text-black focus:ring-2 focus:ring-primary focus:outline-none text-lg font-medium"
            placeholder="e.g. Hi, I'm Nilay Naha"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-2 text-gray-500">Hero Description</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-xl bg-white text-black h-32 focus:ring-2 focus:ring-primary focus:outline-none text-lg leading-relaxed"
            placeholder="e.g. A passionate Software Developer building..."
          />
        </div>
      </div>

      {/* 🟢 BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button 
          type="button" 
          onClick={() => setShowPreview(true)}
          className="flex-1 sm:flex-none bg-white border-2 border-gray-300 hover:border-primary hover:text-primary text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Eye size={20} /> Preview
        </button>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 !text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg transition-all"
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5 !text-white" /> : <Save className="w-5 h-5 !text-white" />} <span className="!text-white">Save Home Changes</span>
        </button>
      </div>
    </div>
  );
}
