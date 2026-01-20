"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

export default function HomeEditor() {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hero Title</label>
          <input 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-2 border rounded dark:bg-black dark:border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hero Description</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded dark:bg-black dark:border-gray-700 h-24"
          />
        </div>
      </div>
      <button 
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
        Save Home Changes
      </button>
    </div>
  );
}