"use client";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

export default function AdminHome() {
  const [formData, setFormData] = useState({
    tagline: "",
    headline: "",
    subheadline: "",
    description: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch existing data
    fetch("/api/hero")
      .then(res => res.json())
      .then(data => {
        if(data) setFormData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/hero", {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      alert("Home section updated!");
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Edit Home Section</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        
        {/* Tagline Input */}
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium mb-2">Tagline (Green text)</label>
          <input 
            id="tagline"
            type="text" 
            value={formData.tagline || ""} 
            onChange={e => setFormData({...formData, tagline: e.target.value})}
            className="w-full p-2 border rounded-md bg-transparent"
            placeholder="e.g. Full Stack Engineer"
          />
        </div>

        {/* Headline Input */}
        <div>
          <label htmlFor="headline" className="block text-sm font-medium mb-2">Main Headline</label>
          <input 
            id="headline"
            type="text" 
            value={formData.headline || ""} 
            onChange={e => setFormData({...formData, headline: e.target.value})}
            className="w-full p-2 border rounded-md bg-transparent"
            placeholder="e.g. Building digital experiences"
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
          <textarea 
            id="description"
            rows={4}
            value={formData.description || ""} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded-md bg-transparent"
            placeholder="Short bio about yourself..."
          />
        </div>

        {/* Submit Button */}
        <button 
          disabled={saving} 
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}