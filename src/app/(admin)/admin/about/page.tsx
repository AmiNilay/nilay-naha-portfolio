"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Loader2, Plus, Trash2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { ALL_SKILLS } from "@/lib/skillData";
import Toast from "@/components/ui/Toast"; 

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface Education {
  degree: string;
  institution: string;
  year: string;
}

export default function EditAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");

  useEffect(() => {
    audioRef.current = new Audio("/sounds/click.mp3");
    audioRef.current.volume = 0.1;

    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setBio(data.bio || "");
          setSkills(data.skills || []);
          setEducation(data.education || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const addSkill = () => {
    if (!newSkillInput.trim()) return;
    const cleanSkill = newSkillInput.trim();
    if (!skills.some(s => s.toLowerCase() === cleanSkill.toLowerCase())) {
      setSkills([...skills, cleanSkill]);
      playSound();
    }
    setNewSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const getSkillData = (name: string) => {
    return ALL_SKILLS.find(s => s.name.toLowerCase() === name.toLowerCase()) || 
           { name, color: "#666", Icon: () => <span className="text-xl font-bold">?</span> };
  };

  const addEducation = () => setEducation([...education, { degree: "", institution: "", year: "" }]);
  const removeEducation = (index: number) => {
    const updated = [...education];
    updated.splice(index, 1);
    setEducation(updated);
  };
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const data = new FormData();
    data.append("bio", bio);
    data.append("skills", skills.join(",")); 
    data.append("education", JSON.stringify(education));
    
    try {
      const res = await fetch("/api/about", { method: "PUT", body: data });
      if (res.ok) {
        setToast({ message: "About page updated successfully!", type: "success" });
      } else {
        setToast({ message: "Failed to save data.", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Network error occurred.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-3xl font-bold mb-8">Edit About Page</h1>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800">
        
        {/* Bio */}
        <div>
          <label className="font-bold block mb-2 uppercase text-sm">About Me</label>
          <div className="bg-white text-black rounded-xl overflow-hidden border border-gray-300">
            <ReactQuill theme="snow" value={bio} onChange={setBio} className="h-48 mb-12" />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="font-bold block mb-2 uppercase text-sm">Technical Arsenal</label>
          <div className="flex gap-2 mb-6">
            <input 
              title="Add New Skill"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Type skill name (e.g. Python) and press Enter"
              className="flex-1 p-3 rounded-xl border dark:bg-black outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="button" title="Add Skill" onClick={addSkill} className="bg-black dark:bg-white text-white dark:text-black px-6 rounded-xl font-bold hover:opacity-90">Add</button>
          </div>
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-black/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 min-h-[100px]">
            {skills.map((skillName) => {
              const data = getSkillData(skillName);
              return (
                <div key={skillName} className="relative group cursor-pointer" onMouseEnter={playSound} onMouseDown={playSound}>
                  <div 
                    className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white shadow-md transition-transform active:translate-y-1 bg-[var(--skill-color)]" 
                    // FIX: Using CSS Variable to solve 'no-inline-styles' error
                    style={{ "--skill-color": data.color } as React.CSSProperties}
                  >
                    <data.Icon className="w-6 h-6 mb-1" />
                    <span className="text-[8px] font-bold uppercase">{data.name}</span>
                  </div>
                  
                  {/* FIX: Added title and aria-label for accessibility */}
                  <button 
                    type="button" 
                    title={`Remove ${skillName}`}
                    aria-label={`Remove ${skillName}`}
                    onClick={(e) => { e.stopPropagation(); removeSkill(skillName); }} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Education */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="font-bold uppercase text-sm">Education History</label>
            <button type="button" onClick={addEducation} className="text-primary flex gap-1 font-bold items-center text-sm hover:underline"><Plus size={16}/> Add Degree</button>
          </div>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                <input title="Degree" placeholder="Degree" value={edu.degree} onChange={e => updateEducation(idx, "degree", e.target.value)} className="flex-[2] p-2 bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none focus:border-primary" />
                <input title="Institution" placeholder="Institution" value={edu.institution} onChange={e => updateEducation(idx, "institution", e.target.value)} className="flex-[2] p-2 bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none focus:border-primary" />
                <input title="Year" placeholder="Year" value={edu.year} onChange={e => updateEducation(idx, "year", e.target.value)} className="flex-1 p-2 bg-transparent border-b border-gray-300 dark:border-gray-700 outline-none focus:border-primary" />
                <button type="button" title="Remove" onClick={() => removeEducation(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-primary text-white py-4 rounded-xl font-bold flex justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/25">
          {saving ? <Loader2 className="animate-spin"/> : <><Save/> Save Changes</>}
        </button>
      </form>
    </div>
  );
}