"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

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
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-10">
      {/* Bio */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Your Bio (HTML tags like &lt;b&gt; are allowed)
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={12}
          className="w-full p-3 border rounded dark:bg-black dark:border-gray-700 font-mono text-sm leading-relaxed"
        />
      </div>

      {/* Education */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Education Timeline</h2>
          <button
            onClick={addEducation}
            className="flex items-center gap-1 text-sm bg-primary text-white px-4 py-1.5 rounded-lg hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>

        <div className="space-y-6">
          {education.map((edu, idx) => (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4 relative"
            >
              <button
                onClick={() => removeEducation(idx)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Degree */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500">Degree / Program</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                    placeholder="e.g. B.Sc. Computer Science"
                    className="w-full p-2 border rounded dark:bg-black dark:border-gray-700 text-sm"
                  />
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                    placeholder="e.g. University of Dhaka"
                    className="w-full p-2 border rounded dark:bg-black dark:border-gray-700 text-sm"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500">Year</label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(idx, "year", e.target.value)}
                    placeholder="e.g. 2021 - 2025"
                    className="w-full p-2 border rounded dark:bg-black dark:border-gray-700 text-sm"
                  />
                </div>

                {/* CGPA */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500">CGPA (optional)</label>
                  <input
                    type="text"
                    value={edu.cgpa}
                    onChange={(e) => updateEducation(idx, "cgpa", e.target.value)}
                    placeholder="e.g. 3.85 / 4.00"
                    className="w-full p-2 border rounded dark:bg-black dark:border-gray-700 text-sm"
                  />
                </div>

                {/* Percentage */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-500">Percentage (optional)</label>
                  <input
                    type="text"
                    value={edu.percentage}
                    onChange={(e) => updateEducation(idx, "percentage", e.target.value)}
                    placeholder="e.g. 88.5%"
                    className="w-full p-2 border rounded dark:bg-black dark:border-gray-700 text-sm"
                  />
                </div>
              </div>

              {/* Relevant Coursework */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-500">
                  Relevant Coursework{" "}
                  <span className="text-gray-400">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={edu.relevantCoursework.join(", ")}
                  onChange={(e) => updateEducation(idx, "relevantCoursework", e.target.value)}
                  placeholder="e.g. Data Structures, Algorithms, OS, Networking"
                  className="w-full p-2 border rounded dark:bg-black dark:border-gray-700 text-sm"
                />
                {edu.relevantCoursework.filter((c) => c.trim()).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {edu.relevantCoursework
                      .filter((c) => c.trim())
                      .map((course, cIdx) => (
                        <span
                          key={cIdx}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
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

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </div>
  );
}