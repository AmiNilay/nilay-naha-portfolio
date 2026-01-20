"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

export default function AboutEditor() {
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setBio(data.bio || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Your Bio (HTML tags like &lt;b&gt; are allowed)</label>
        <textarea 
          value={bio} 
          onChange={(e) => setBio(e.target.value)}
          rows={12}
          className="w-full p-3 border rounded dark:bg-black dark:border-gray-700 font-mono text-sm leading-relaxed"
        />
      </div>
      <button 
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
        Update Biography
      </button>
    </div>
  );
}