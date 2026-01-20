"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Save, Plus, Trash2, Check, Search, Bold, Italic, WrapText, Palette, PaintBucket } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { ALL_SKILLS, SKILL_CATEGORIES } from "@/lib/skillData";

interface Education {
  degree: string;
  institution: string;
  year: string;
}

// --- REUSABLE TOOLBAR (Matches Home Page) ---
const RichToolbar = ({ targetId, onInsert }: { targetId: string; onInsert: (start: string, end: string) => void }) => {
  return (
    <div className="flex flex-wrap items-center gap-1 mb-2 p-1.5 bg-muted/50 rounded-lg border w-fit shadow-sm">
      <button type="button" onClick={() => onInsert("<b>", "</b>")} className="p-1.5 hover:bg-background rounded transition-colors text-xs font-bold" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("<i>", "</i>")} className="p-1.5 hover:bg-background rounded transition-colors text-xs italic" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onInsert("<br />", "")} className="p-1.5 hover:bg-background rounded transition-colors text-xs font-bold" title="Line Break"><WrapText className="w-3.5 h-3.5" /></button>
      <div className="w-px h-4 bg-border mx-1" />
      <button type="button" onClick={() => onInsert('<span class="text-gray-500 dark:text-gray-400 font-medium">', "</span>")} className="p-1.5 hover:bg-background rounded transition-colors text-xs font-bold flex items-center gap-1"><Palette className="w-3.5 h-3.5" /> Gray</button>
      <button type="button" onClick={() => onInsert('<span class="text-blue-600 dark:text-yellow-400">', "</span>")} className="p-1.5 hover:bg-background rounded transition-colors text-xs font-bold flex items-center gap-1"><PaintBucket className="w-3.5 h-3.5" /> Magic Color</button>
    </div>
  );
};

export default function AdminAbout() {
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/sounds/click.mp3");
    audio.volume = 0.2;
    audioRef.current = audio;

    fetch("/api/about", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setBio(data.bio || "");
          if (Array.isArray(data.skills)) {
            setSelectedSkills(data.skills);
          } else if (typeof data.skills === "string") {
            setSelectedSkills(data.skills.split(",").map((s: string) => s.trim()).filter(Boolean));
          }
          setEducation(data.education || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // --- HTML INSERTION LOGIC ---
  const handleInsertTag = (startTag: string, endTag: string) => {
    const input = document.getElementById("input-bio") as HTMLTextAreaElement;
    if (!input) return;

    const startPos = input.selectionStart || 0;
    const endPos = input.selectionEnd || 0;
    const selectedText = bio.substring(startPos, endPos);
    
    const newVal = bio.substring(0, startPos) + startTag + selectedText + endTag + bio.substring(endPos);
    setBio(newVal);

    setTimeout(() => {
      input.focus();
      const newCursorPos = startPos + startTag.length + selectedText.length + endTag.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleSkill = (skillName: string) => {
    playSound();
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(prev => prev.filter(s => s !== skillName));
    } else {
      setSelectedSkills(prev => [...prev, skillName]);
    }
  };

  const addEducation = () => setEducation([...education, { degree: "", institution: "", year: "" }]);
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEdu = [...education];
    newEdu[index][field] = value;
    setEducation(newEdu);
  };
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, skills: selectedSkills, education }),
      });
      if (res.ok) setToast({ message: "About Page updated successfully!", type: "success" });
      else throw new Error("Failed");
    } catch (error) {
      setToast({ message: "Failed to update.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = SKILL_CATEGORIES.map(cat => ({
    ...cat,
    skills: cat.skills.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  })).filter(cat => cat.skills.length > 0);

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-32">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b">
        <h1 className="text-3xl font-bold">Edit About Page</h1>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg">
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} Update All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Bio & Education */}
        <div className="space-y-6">
          <div className="p-6 border rounded-xl bg-card shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Biography</h3>
            
            {/* RICH TOOLBAR */}
            <RichToolbar targetId="input-bio" onInsert={handleInsertTag} />
            
            <textarea 
              id="input-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={12}
              className="w-full p-4 border rounded-lg bg-background font-mono text-sm leading-relaxed focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="I am a B.Tech student..."
            />
          </div>

          <div className="p-6 border rounded-xl bg-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Education Timeline</h3>
              <button onClick={addEducation} className="text-xs flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded hover:opacity-90"><Plus className="w-3 h-3" /> Add</button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {education.map((edu, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 p-4 border rounded-lg bg-background/50 relative group">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={edu.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} className="w-full p-2 border rounded bg-background text-sm font-bold" placeholder="Degree" />
                    <input value={edu.year} onChange={(e) => updateEducation(index, "year", e.target.value)} className="w-full p-2 border rounded bg-background text-sm text-center" placeholder="Year" />
                  </div>
                  <input value={edu.institution} onChange={(e) => updateEducation(index, "institution", e.target.value)} className="w-full p-2 border rounded bg-background text-sm" placeholder="Institution" />
                  <button onClick={() => removeEducation(index)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              {education.length === 0 && <p className="text-center text-xs text-muted-foreground">No education added.</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SKILLS (Unchanged) */}
        <div className="space-y-6">
          <div className="p-6 border rounded-xl bg-card shadow-sm h-full flex flex-col">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              Technical Arsenal <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{selectedSkills.length} Selected</span>
            </h3>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 p-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 space-y-8">
              {filteredCategories.map((cat) => (
                <div key={cat.title}>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">{cat.title}</h4>
                  <div className="flex flex-wrap gap-3">
                    {cat.skills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.name);
                      return (
                        <div key={skill.name} onClick={() => toggleSkill(skill.name)} className={`group relative cursor-pointer w-16 h-16 rounded-xl flex flex-col items-center justify-center select-none transition-all duration-200 ${isSelected ? "shadow-[0_4px_0_rgba(0,0,0,0.2)] translate-y-0" : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/50 opacity-60 hover:opacity-100"}`} style={isSelected ? { backgroundColor: skill.color, color: "white" } : {}}>
                          <skill.Icon className={`w-6 h-6 mb-1 ${!isSelected && "text-gray-500 dark:text-gray-400"}`} />
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${!isSelected && "text-gray-500"}`}>{skill.name}</span>
                          {isSelected && <div className="absolute -top-1 -right-1 bg-white text-black rounded-full p-0.5 shadow-sm"><Check className="w-3 h-3" /></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}