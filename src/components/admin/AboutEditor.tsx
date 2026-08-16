"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2, Eye, X } from "lucide-react"; // 🟢 Added Eye and X

interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  relevantCoursework: string[];
  cgpa: string;
  percentage: string;
}

export default function AboutEditor() {
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // 🟢 Preview State

  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setBio(data.bio || "");
        setEducation(
          (data.education || []).map((edu: EducationEntry) => ({
            degree: edu.degree || "",
            institution: edu.institution || "",
            year: edu.year || "",
            relevantCoursework: edu.relevantCoursework || [],
            cgpa: edu.cgpa || "",
            percentage: edu.percentage || "",
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addEducation = () => {
    setEducation([
      ...education,
      { degree: "", institution: "", year: "", relevantCoursework: [], cgpa: "", percentage: "" },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...education];
    if (field === "relevantCoursework") {
      updated[index][field] = value.split(",").map((s) => s.trimStart());
    } else {
      updated[index][field] = value as never;
    }
    setEducation(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, education }),
    });
    setSaving(false);
    alert("About page updated successfully!");
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-10 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      
      {/* 🟢 PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-12 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-500">Live Preview: About Page</h2>
              <button type="button" onClick={() => setShowPreview(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-medium transition-colors">
                <X size={20} /> Close Preview
              </button>
            </div>
            
            <div className="space-y-16">
              {/* Bio Preview */}
              <section>
                <h3 className="text-3xl font-extrabold text-black mb-6">About Me</h3>
                <div 
                  className="prose max-w-none text-lg text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: bio || "<p>No bio written yet.</p>" }}
                />
              </section>

              {/* Education Preview */}
              <section>
                <h3 className="text-3xl font-extrabold text-black mb-8">Education</h3>
                <div className="space-y-8">
                  {education.length === 0 ? (
                    <p className="text-gray-500 italic">No education entries added.</p>
                  ) : (
                    education.map((edu, idx) => (
                      <div key={idx} className="relative pl-8 border-l-4 border-blue-600">
                        <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-[10px] top-1 border-4 border-white"></div>
                        <h4 className="text-2xl font-bold text-black">{edu.degree || "Degree Title"}</h4>
                        <p className="text-xl text-gray-600 mt-1">{edu.institution || "Institution Name"}</p>
                        <p className="text-md text-gray-500 font-medium mt-1">{edu.year || "Year"}</p>
                        
                        {(edu.cgpa || edu.percentage) && (
                          <div className="flex gap-4 mt-3 text-sm font-bold text-gray-700 bg-gray-100 w-fit px-3 py-1 rounded-lg">
                            {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                            {edu.percentage && <span>Score: {edu.percentage}</span>}
                          </div>
                        )}

                        {edu.relevantCoursework.filter(c => c.trim()).length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-bold text-gray-500 uppercase mb-2">Relevant Coursework</p>
                            <div className="flex flex-wrap gap-2">
                              {edu.relevantCoursework.filter(c => c.trim()).map((course, cIdx) => (
                                <span key={cIdx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                  {course.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Bio Editor */}
      <div>
        <label className="block text-sm font-bold uppercase mb-2 text-gray-500">
          Your Bio (HTML tags like &lt;b&gt; are allowed)
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={10}
          className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black font-mono text-sm leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
          placeholder="<p>Hello! I am a developer...</p>"
        />
      </div>

      {/* Education Editor */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-black">Education Timeline</h2>
          <button
            onClick={addEducation}
            className="flex items-center gap-1 text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-bold"
          >
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>

        <div className="space-y-6">
          {education.map((edu, idx) => (
            <div
              key={idx}
              className="border border-gray-200 bg-gray-50 rounded-2xl p-6 space-y-4 relative shadow-sm"
            >
              <button
                onClick={() => removeEducation(idx)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
                title="Remove Entry"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-12">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Degree / Program</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                    placeholder="e.g. B.Sc. Computer Science"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                    placeholder="e.g. University of Dhaka"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Year</label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(idx, "year", e.target.value)}
                    placeholder="e.g. 2021 - 2025"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-gray-500">CGPA</label>
                    <input
                      type="text"
                      value={edu.cgpa}
                      onChange={(e) => updateEducation(idx, "cgpa", e.target.value)}
                      placeholder="e.g. 3.85"
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Percentage</label>
                    <input
                      type="text"
                      value={edu.percentage}
                      onChange={(e) => updateEducation(idx, "percentage", e.target.value)}
                      placeholder="e.g. 88.5%"
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-gray-500">
                  Relevant Coursework <span className="text-gray-400 normal-case font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={edu.relevantCoursework.join(", ")}
                  onChange={(e) => updateEducation(idx, "relevantCoursework", e.target.value)}
                  placeholder="e.g. Data Structures, Algorithms, OS"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                {edu.relevantCoursework.filter((c) => c.trim()).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {edu.relevantCoursework
                      .filter((c) => c.trim())
                      .map((course, cIdx) => (
                        <span key={cIdx} className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                          {course.trim()}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🟢 BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
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
          {saving ? <Loader2 className="animate-spin w-5 h-5 !text-white" /> : <Save className="w-5 h-5 !text-white" />} <span className="!text-white">Save Changes</span>
        </button>
      </div>
    </div>
  );
}
