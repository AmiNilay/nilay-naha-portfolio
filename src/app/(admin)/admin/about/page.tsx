"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  Check,
  Search,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  Image as ImageIcon,
  Briefcase,
  MapPin,
  Calendar,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import { SKILL_CATEGORIES } from "@/lib/skillData";
import ImageUploader from "@/components/admin/ImageUploader";

interface Education {
  degree: string;
  institution: string;
  year: string;
  cgpa: string;
  percentage: string;
  relevantCoursework: string[];
}

interface ExperienceMedia {
  name: string;
  url: string;
}

interface Experience {
  jobTitle: string;
  organization: string;
  companyLogo: string;
  location: string;
  locationType: string;
  employmentType: string;
  currentlyWorking: boolean;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  description: string;
  highlights: string[];
  skills: string[];
  media: ExperienceMedia[];
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const LOCATION_TYPES = ["", "On-site", "Remote", "Hybrid"];

const EMPLOYMENT_TYPES = [
  "",
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
  "Self-employed",
];

function emptyExperience(): Experience {
  return {
    jobTitle: "",
    organization: "",
    companyLogo: "",
    location: "",
    locationType: "",
    employmentType: "",
    currentlyWorking: false,
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    description: "",
    highlights: [],
    skills: [],
    media: [],
  };
}

export default function AdminAbout() {
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [gDriveProfilePic, setGDriveProfilePic] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/about", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setBio(data.bio || "");
          setLocation(data.location || "");
          setAvailability(data.availability || "");
          setGDriveProfilePic(data.gDriveProfilePic || "");

          if (data.gDriveProfilePic) {
            const match =
              data.gDriveProfilePic.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
              data.gDriveProfilePic.match(/id=([a-zA-Z0-9_-]+)/);
            if (match) {
              setPreviewImage(
                `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`
              );
            } else {
              setPreviewImage(data.gDriveProfilePic);
            }
          }

          if (Array.isArray(data.skills)) setSelectedSkills(data.skills);
          else if (typeof data.skills === "string")
            setSelectedSkills(
              data.skills
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            );

          setEducation(data.education || []);

          // Migrate old experience format to new
          const migratedExp = (data.experience || []).map(
            (exp: Record<string, unknown>) => ({
              jobTitle: exp.jobTitle || exp.role || "",
              organization: exp.organization || exp.company || "",
              companyLogo: exp.companyLogo || "",
              location: exp.location || "",
              locationType: exp.locationType || "",
              employmentType: exp.employmentType || "",
              currentlyWorking: exp.currentlyWorking || false,
              startMonth: exp.startMonth || "",
              startYear: exp.startYear || "",
              endMonth: exp.endMonth || "",
              endYear: exp.endYear || "",
              description: exp.description || "",
              highlights: exp.highlights || [],
              skills: exp.skills || [],
              media: exp.media || [],
            })
          );
          setExperience(migratedExp);

          setCertifications(data.certifications || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Image controls
  const handleExtractImage = () => {
    if (!gDriveProfilePic) {
      setToast({ message: "Please paste a link first.", type: "error" });
      return;
    }
    const match =
      gDriveProfilePic.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      gDriveProfilePic.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) {
      setPreviewImage(
        `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`
      );
      setToast({ message: "Image extracted successfully!", type: "success" });
    } else {
      setPreviewImage(gDriveProfilePic);
      setToast({
        message: "Link applied (no ID extracted).",
        type: "success",
      });
    }
  };

  const handleRemoveImage = () => {
    setGDriveProfilePic("");
    setPreviewImage("");
    setToast({ message: "Image removed.", type: "success" });
  };

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName))
      setSelectedSkills((prev) => prev.filter((s) => s !== skillName));
    else setSelectedSkills((prev) => [...prev, skillName]);
  };

  // Education controls
  const addEducation = () =>
    setEducation([
      ...education,
      {
        degree: "",
        institution: "",
        year: "",
        cgpa: "",
        percentage: "",
        relevantCoursework: [],
      },
    ]);

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    const newEdu = [...education];
    if (field === "relevantCoursework")
      newEdu[index].relevantCoursework = value
        .split(",")
        .map((s) => s.trimStart());
    else newEdu[index][field] = value as never;
    setEducation(newEdu);
  };

  const removeEducation = (index: number) =>
    setEducation(education.filter((_, i) => i !== index));

  const moveEducation = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === education.length - 1)
    )
      return;
    const newEdu = [...education];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newEdu[index], newEdu[swapIndex]] = [newEdu[swapIndex], newEdu[index]];
    setEducation(newEdu);
  };

  const removeCoursework = (eduIndex: number, courseIndex: number) => {
    const newEdu = [...education];
    newEdu[eduIndex].relevantCoursework = newEdu[
      eduIndex
    ].relevantCoursework.filter((_, i) => i !== courseIndex);
    setEducation(newEdu);
  };

  // Experience controls
  const addExperience = () =>
    setExperience([...experience, emptyExperience()]);

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: unknown
  ) => {
    const newExp = [...experience];
    (newExp[index] as unknown as Record<string, unknown>)[field] = value;
    setExperience(newExp);
  };

  const removeExperience = (index: number) =>
    setExperience(experience.filter((_, i) => i !== index));

  const moveExperience = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === experience.length - 1)
    )
      return;
    const newExp = [...experience];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newExp[index], newExp[swapIndex]] = [newExp[swapIndex], newExp[index]];
    setExperience(newExp);
  };

  const addHighlight = (expIndex: number) => {
    const newExp = [...experience];
    newExp[expIndex].highlights = [...newExp[expIndex].highlights, ""];
    setExperience(newExp);
  };

  const updateHighlight = (
    expIndex: number,
    hlIndex: number,
    value: string
  ) => {
    const newExp = [...experience];
    newExp[expIndex].highlights[hlIndex] = value;
    setExperience(newExp);
  };

  const removeHighlight = (expIndex: number, hlIndex: number) => {
    const newExp = [...experience];
    newExp[expIndex].highlights = newExp[expIndex].highlights.filter(
      (_, i) => i !== hlIndex
    );
    setExperience(newExp);
  };

  const addExpSkill = (expIndex: number) => {
    const newExp = [...experience];
    newExp[expIndex].skills = [...newExp[expIndex].skills, ""];
    setExperience(newExp);
  };

  const updateExpSkill = (
    expIndex: number,
    skIndex: number,
    value: string
  ) => {
    const newExp = [...experience];
    newExp[expIndex].skills[skIndex] = value;
    setExperience(newExp);
  };

  const removeExpSkill = (expIndex: number, skIndex: number) => {
    const newExp = [...experience];
    newExp[expIndex].skills = newExp[expIndex].skills.filter(
      (_, i) => i !== skIndex
    );
    setExperience(newExp);
  };

  const addMedia = (expIndex: number) => {
    const newExp = [...experience];
    newExp[expIndex].media = [
      ...newExp[expIndex].media,
      { name: "", url: "" },
    ];
    setExperience(newExp);
  };

  const updateMedia = (
    expIndex: number,
    mediaIndex: number,
    field: "name" | "url",
    value: string
  ) => {
    const newExp = [...experience];
    newExp[expIndex].media[mediaIndex][field] = value;
    setExperience(newExp);
  };

  const removeMedia = (expIndex: number, mediaIndex: number) => {
    const newExp = [...experience];
    newExp[expIndex].media = newExp[expIndex].media.filter(
      (_, i) => i !== mediaIndex
    );
    setExperience(newExp);
  };

  // Certification controls
  const addCertification = () =>
    setCertifications([
      ...certifications,
      { name: "", issuer: "", date: "", url: "" },
    ]);

  const updateCertification = (
    index: number,
    field: keyof Certification,
    value: string
  ) => {
    const newCert = [...certifications];
    newCert[index][field] = value;
    setCertifications(newCert);
  };

  const removeCertification = (index: number) =>
    setCertifications(certifications.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          location,
          availability,
          gDriveProfilePic,
          skills: selectedSkills,
          education,
          experience,
          certifications,
        }),
      });
      if (res.ok)
        setToast({
          message: "About Page updated successfully!",
          type: "success",
        });
      else throw new Error("Failed");
    } catch {
      setToast({ message: "Failed to update.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = SKILL_CATEGORIES.map((cat) => ({
    ...cat,
    skills: cat.skills.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((cat) => cat.skills.length > 0);

  if (loading)
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-black">Edit About Page</h1>
        <div className="flex gap-3">
          <a
            href="/about"
            target="_blank"
            className="bg-white border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Eye size={20} /> Preview
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg transition-all"
          >
            {saving ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}{" "}
            Update All
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          {/* Profile & Biography */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-black border-b pb-2">
              Profile & Biography
            </h3>

            <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                <ImageIcon size={14} /> Dedicated About Page Image (G-Drive)
              </label>
              <p className="text-[10px] text-gray-400 mb-2">
                If left blank, it will fallback to the Home Page profile picture.
              </p>

              {previewImage && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden mb-3 border border-gray-200 shadow-sm">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={gDriveProfilePic}
                  onChange={(e) => setGDriveProfilePic(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Paste Google Drive link..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleExtractImage}
                    className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm font-bold rounded-lg transition-colors"
                  >
                    Extract
                  </button>
                  {gDriveProfilePic && (
                    <button
                      onClick={handleRemoveImage}
                      className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                      title="Remove Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">
                  Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Siliguri, India"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">
                  Availability Status
                </label>
                <input
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Open to Backend Roles"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500">
                Biography (HTML Supported)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none resize-y font-mono text-sm leading-relaxed bg-gray-50"
                placeholder="<p>Write your bio here...</p>"
              />
            </div>
          </div>

          {/* Education Timeline */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b pb-2">
              <h3 className="font-bold text-lg text-black">
                Education Timeline
              </h3>
              <button
                onClick={addEducation}
                className="text-sm flex items-center gap-1 bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Entry
              </button>
            </div>

            <div className="space-y-6">
              {education.map((edu, index) => (
                <div
                  key={index}
                  className="p-5 border border-gray-200 rounded-xl bg-gray-50 relative group"
                >
                  <div className="absolute -top-3 -right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveEducation(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-blue-600 disabled:opacity-30 shadow-sm"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveEducation(index, "down")}
                      disabled={index === education.length - 1}
                      className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-blue-600 disabled:opacity-30 shadow-sm"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => removeEducation(index)}
                      className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Degree
                      </label>
                      <input
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(index, "degree", e.target.value)
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-black"
                        placeholder="e.g. B.Tech in CS"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Year
                      </label>
                      <input
                        value={edu.year}
                        onChange={(e) =>
                          updateEducation(index, "year", e.target.value)
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black"
                        placeholder="e.g. 2023 - 2026"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                      Institution
                    </label>
                    <input
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(index, "institution", e.target.value)
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black"
                      placeholder="e.g. Siliguri Institute of Technology"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        CGPA
                      </label>
                      <input
                        value={edu.cgpa}
                        onChange={(e) =>
                          updateEducation(index, "cgpa", e.target.value)
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black"
                        placeholder="e.g. 7.73"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Percentage
                      </label>
                      <input
                        value={edu.percentage}
                        onChange={(e) =>
                          updateEducation(index, "percentage", e.target.value)
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black"
                        placeholder="e.g. 88.5%"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                      Relevant Coursework (comma separated)
                    </label>
                    <input
                      value={edu.relevantCoursework.join(", ")}
                      onChange={(e) =>
                        updateEducation(
                          index,
                          "relevantCoursework",
                          e.target.value
                        )
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black mb-2"
                      placeholder="e.g. Data Structures, Algorithms"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {edu.relevantCoursework
                        .filter((c) => c.trim())
                        .map((course, cIdx) => (
                          <span
                            key={cIdx}
                            onClick={() => removeCoursework(index, cIdx)}
                            className="text-[10px] font-bold bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center gap-1 transition-colors"
                          >
                            {course.trim()} <X size={10} />
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* Technical Arsenal */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col h-[600px]">
            <h3 className="font-bold text-lg text-black mb-4 flex items-center justify-between border-b pb-2">
              Technical Arsenal
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {selectedSkills.length} Selected
              </span>
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 p-2.5 rounded-xl border border-gray-300 bg-gray-50 text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {filteredCategories.map((cat) => (
                <div key={cat.title}>
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">
                    {cat.title}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {cat.skills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.name);
                      return (
                        <div
                          key={skill.name}
                          onClick={() => toggleSkill(skill.name)}
                          className={`group relative cursor-pointer w-16 h-16 rounded-xl flex flex-col items-center justify-center select-none transition-all duration-200 ${
                            isSelected
                              ? "shadow-md translate-y-0"
                              : "bg-gray-50 border border-gray-200 hover:border-blue-400 opacity-70 hover:opacity-100"
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: skill.color, color: "white" }
                              : {}
                          }
                        >
                          <skill.Icon
                            className={`w-6 h-6 mb-1 ${!isSelected && "text-gray-500"}`}
                          />
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider ${!isSelected && "text-gray-500"}`}
                          >
                            {skill.name}
                          </span>
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 bg-white text-black rounded-full p-0.5 shadow-sm border border-gray-200">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b pb-2">
              <h3 className="font-bold text-lg text-black flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Experience
              </h3>
              <button
                onClick={addExperience}
                className="text-sm flex items-center gap-1 bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl bg-gray-50 relative group"
                >
                  {/* Top controls */}
                  <div className="absolute -top-3 -right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => moveExperience(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-blue-600 disabled:opacity-30 shadow-sm"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveExperience(index, "down")}
                      disabled={index === experience.length - 1}
                      className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-blue-600 disabled:opacity-30 shadow-sm"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => removeExperience(index)}
                      className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Header */}
                  <div className="px-5 py-4 border-b border-gray-200 bg-white rounded-t-xl">
                    <p className="text-sm font-bold text-gray-700">
                      {exp.jobTitle || "New Experience"}
                      {exp.organization && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          at {exp.organization}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Row 1: Job Title + Organization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                          Job Title *
                        </label>
                        <input
                          value={exp.jobTitle}
                          onChange={(e) =>
                            updateExperience(index, "jobTitle", e.target.value)
                          }
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g. Senior Product Manager"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                          Organization *
                        </label>
                        <input
                          value={exp.organization}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "organization",
                              e.target.value
                            )
                          }
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g. Microsoft"
                        />
                      </div>
                    </div>

                    {/* Row 2: Location + Location Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                          <MapPin size={10} /> Location
                        </label>
                        <input
                          value={exp.location}
                          onChange={(e) =>
                            updateExperience(index, "location", e.target.value)
                          }
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="City or region"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                          Location Type
                        </label>
                        <select
                          value={exp.locationType}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "locationType",
                              e.target.value
                            )
                          }
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                          {LOCATION_TYPES.map((lt) => (
                            <option key={lt} value={lt}>
                              {lt || "Please select"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Employment Type + Currently Working */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                          Employment Type
                        </label>
                        <select
                          value={exp.employmentType}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "employmentType",
                              e.target.value
                            )
                          }
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                          {EMPLOYMENT_TYPES.map((et) => (
                            <option key={et} value={et}>
                              {et || "Please select"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={exp.currentlyWorking}
                            onChange={(e) =>
                              updateExperience(
                                index,
                                "currentlyWorking",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            I currently work here
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Row 4: Start Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                          <Calendar size={10} /> Start Month
                        </label>
                        <select
                          value={exp.startMonth}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "startMonth",
                              e.target.value
                            )
                          }
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                          <option value="">Select</option>
                          {MONTHS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                          Start Year *
                        </label>
                        <input
                          value={exp.startYear}
                          onChange={(e) =>
                            updateExperience(index, "startYear", e.target.value)
                          }
                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="2026"
                          type="text"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    {/* Row 5: End Date (hidden if currently working) */}
                    {!exp.currentlyWorking && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                            End Month
                          </label>
                          <select
                            value={exp.endMonth}
                            onChange={(e) =>
                              updateExperience(
                                index,
                                "endMonth",
                                e.target.value
                              )
                            }
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          >
                            <option value="">Select</option>
                            {MONTHS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                            End Year
                          </label>
                          <input
                            value={exp.endYear}
                            onChange={(e) =>
                              updateExperience(
                                index,
                                "endYear",
                                e.target.value
                              )
                            }
                            className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="2028"
                            type="text"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Description
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[60px]"
                        placeholder="Describe your role and responsibilities..."
                        rows={3}
                      />
                    </div>

                    {/* Highlights */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                          <Sparkles size={10} /> Highlights
                        </label>
                        <button
                          type="button"
                          onClick={() => addHighlight(index)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {exp.highlights.map((hl, hlIdx) => (
                          <div key={hlIdx} className="flex items-center gap-2">
                            <span className="text-gray-300 text-xs">
                              {hlIdx + 1}.
                            </span>
                            <input
                              value={hl}
                              onChange={(e) =>
                                updateHighlight(index, hlIdx, e.target.value)
                              }
                              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Key achievement or highlight..."
                            />
                            <button
                              type="button"
                              onClick={() => removeHighlight(index, hlIdx)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills for this role */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">
                          Skills
                        </label>
                        <button
                          type="button"
                          onClick={() => addExpSkill(index)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((sk, skIdx) => (
                          <div
                            key={skIdx}
                            className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1"
                          >
                            <input
                              value={sk}
                              onChange={(e) =>
                                updateExpSkill(index, skIdx, e.target.value)
                              }
                              className="w-20 p-0.5 border-none text-xs text-black focus:ring-0 outline-none bg-transparent"
                              placeholder="Skill"
                            />
                            <button
                              type="button"
                              onClick={() => removeExpSkill(index, skIdx)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Media */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                          <LinkIcon size={10} /> Media
                        </label>
                        <button
                          type="button"
                          onClick={() => addMedia(index)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {exp.media.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="flex items-center gap-2"
                          >
                            <input
                              value={m.name}
                              onChange={(e) =>
                                updateMedia(
                                  index,
                                  mIdx,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-1/3 p-2 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Name"
                            />
                            <input
                              value={m.url}
                              onChange={(e) =>
                                updateMedia(
                                  index,
                                  mIdx,
                                  "url",
                                  e.target.value
                                )
                              }
                              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="https://..."
                            />
                            <button
                              type="button"
                              onClick={() => removeMedia(index, mIdx)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Company Logo Upload */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-1 block">
                        <ImageIcon size={10} /> Company Logo
                      </label>
                      <ImageUploader
                        defaultCategory="about"
                        fixedFilename={
                          exp.organization
                            ? `${exp.organization.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-logo`
                            : undefined
                        }
                        onUpload={(url) =>
                          updateExperience(index, "companyLogo", url)
                        }
                      />
                      {exp.companyLogo && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={exp.companyLogo}
                            alt="Logo"
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          />
                          <span className="text-xs text-gray-400 font-mono truncate flex-1">
                            {exp.companyLogo}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateExperience(index, "companyLogo", "")
                            }
                            className="text-red-400 hover:text-red-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {experience.length === 0 && (
                <div className="text-center py-8">
                  <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    No experience added yet.
                  </p>
                  <button
                    onClick={addExperience}
                    className="mt-3 text-sm text-blue-600 font-bold hover:text-blue-700"
                  >
                    + Add your first experience
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Certifications */}
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b pb-2">
              <h3 className="font-bold text-lg text-black">Certifications</h3>
              <button
                onClick={addCertification}
                className="text-sm flex items-center gap-1 bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-xl bg-gray-50 relative group"
                >
                  <button
                    onClick={() => removeCertification(index)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 size={12} />
                  </button>
                  <input
                    value={cert.name}
                    onChange={(e) =>
                      updateCertification(index, "name", e.target.value)
                    }
                    className="w-full p-2 mb-2 border border-gray-300 rounded-lg text-sm font-bold text-black"
                    placeholder="Certification Name"
                  />
                  <input
                    value={cert.issuer}
                    onChange={(e) =>
                      updateCertification(index, "issuer", e.target.value)
                    }
                    className="w-full p-2 mb-2 border border-gray-300 rounded-lg text-sm text-black"
                    placeholder="Issuer (e.g. Coursera, AWS)"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={cert.date}
                      onChange={(e) =>
                        updateCertification(index, "date", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                      placeholder="Date (e.g. Aug 2024)"
                    />
                    <input
                      value={cert.url}
                      onChange={(e) =>
                        updateCertification(index, "url", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm text-black"
                      placeholder="Credential URL"
                    />
                  </div>
                </div>
              ))}
              {certifications.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  No certifications added.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}