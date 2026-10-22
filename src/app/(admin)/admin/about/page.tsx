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
  GraduationCap,
  Briefcase,
  BadgeCheck,
  Cpu,
  User,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import { Upload } from "lucide-react";
import Toast from "@/components/ui/Toast";
import CompanyLogo, { resolveLogoUrl } from "@/components/ui/CompanyLogo";
import MediaFrame from "@/components/ui/MediaFrame";
import { SKILL_CATEGORIES, readableIconColors } from "@/lib/skillData";
import { motion } from "framer-motion";

interface Education {
  degree: string;
  institution: string;
  year: string;
  cgpa: string;
  percentage: string;
  relevantCoursework: string[];
  institutionLinkedin?: string;
  location?: string;
  image?: string;
}

interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
  companyLogo?: string;
  companyLinkedin?: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  url: string;
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
  const [aiWorkflow, setAiWorkflow] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
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

          if (data.gDriveProfilePic) setPreviewImage(data.gDriveProfilePic);

          if (Array.isArray(data.skills)) setSelectedSkills(data.skills);
          else if (typeof data.skills === "string")
            setSelectedSkills(
              data.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
            );

          setEducation(data.education || []);
          setExperience(data.experience || []);
          setCertifications(data.certifications || []);
          setAiWorkflow(data.aiWorkflow || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleExtractImage = () => {
    if (!gDriveProfilePic) {
      setToast({ message: "Please paste a link first.", type: "error" });
      return;
    }
    setPreviewImage(gDriveProfilePic.trim());
    setToast({ message: "Media applied. Click Save to publish.", type: "success" });
  };

  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);
  const uploadAboutImage = async (file: File) => {
    setUploadingAboutImage(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setGDriveProfilePic(data.url);
      setPreviewImage(data.url);
      setToast({ message: "Image uploaded. Click Save to publish.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Upload failed", type: "error" });
    } finally {
      setUploadingAboutImage(false);
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
        institutionLinkedin: "",
        location: "",
        image: "",
      },
    ]);
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEdu = [...education];
    if (field === "relevantCoursework")
      newEdu[index].relevantCoursework = value.split(",").map((s) => s.trimStart());
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
  const [uploadingCollege, setUploadingCollege] = useState<number | null>(null);
  const uploadCollegeImage = async (index: number, file: File) => {
    setUploadingCollege(index);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      updateEducation(index, "image", data.url);
      setToast({ message: "College photo uploaded. Click Save to publish.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "College photo upload failed", type: "error" });
    } finally {
      setUploadingCollege(null);
    }
  };
  const removeCoursework = (eduIndex: number, courseIndex: number) => {
    const newEdu = [...education];
    newEdu[eduIndex].relevantCoursework = newEdu[eduIndex].relevantCoursework.filter(
      (_, i) => i !== courseIndex
    );
    setEducation(newEdu);
  };

  // Experience controls
  const addExperience = () =>
    setExperience([
      ...experience,
      { role: "", company: "", duration: "", description: "", companyLogo: "", companyLinkedin: "" },
    ]);
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setExperience((prev) => prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)));
  };

  const [uploadingLogo, setUploadingLogo] = useState<number | null>(null);
  const uploadCompanyLogo = async (index: number, file: File) => {
    setUploadingLogo(index);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      updateExperience(index, "companyLogo", data.url);
      setToast({ message: "Logo uploaded. Click Save to publish.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Logo upload failed", type: "error" });
    } finally {
      setUploadingLogo(null);
    }
  };
  const removeExperience = (index: number) =>
    setExperience(experience.filter((_, i) => i !== index));

  // Certification controls
  const addCertification = () =>
    setCertifications([...certifications, { name: "", issuer: "", date: "", url: "" }]);
  const updateCertification = (index: number, field: keyof Certification, value: string) => {
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
          aiWorkflow,
          education,
          experience,
          certifications,
        }),
      });
      if (res.ok) setToast({ message: "About Page profile updated successfully!", type: "success" });
      else throw new Error("Failed");
    } catch {
      setToast({ message: "Failed to update profile.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = SKILL_CATEGORIES.map((cat) => ({
    ...cat,
    skills: cat.skills.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
  })).filter((cat) => cat.skills.length > 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Loading About Profile...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 select-none">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Header & Sticky Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5" /> Developer Identity
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            About Me Profile Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your biography, career history, education milestones, and verified skill badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/about"
            target="_blank"
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 active:scale-98 transition-all"
          >
            <Eye className="w-4 h-4 text-cyan-500" /> Preview Page
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs sm:text-sm font-bold shadow-lg shadow-zinc-950/10 hover:opacity-95 active:scale-98 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Update Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Profile & Education (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Biography & Metadata Card */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-5">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800/80 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" /> Profile & Biography
            </h3>

            {/* Dedicated G-Drive Image */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-500" /> About Page Image (separate from the Home avatar)
              </label>
              <p className="text-[11px] text-zinc-500">Upload an image/GIF, or paste a Google Drive link (image, GIF or video; add <code>#gif</code> or <code>#video</code> at the end). Empty = uses the Home avatar.</p>

              {previewImage && (
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm">
                  <MediaFrame src={previewImage} alt="Preview" width={600} />
                </div>
              )}

              <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-600 cursor-pointer">
                {uploadingAboutImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {uploadingAboutImage ? "Uploading…" : "Upload image / GIF"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  disabled={uploadingAboutImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAboutImage(file);
                    e.target.value = "";
                  }}
                />
              </label>

              <div className="flex gap-2">
                <input
                  value={gDriveProfilePic}
                  onChange={(e) => setGDriveProfilePic(e.target.value)}
                  className="flex-1 p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Paste Google Drive link or image URL..."
                />
                <button
                  onClick={handleExtractImage}
                  className="px-4 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Extract
                </button>
                {gDriveProfilePic && (
                  <button
                    onClick={handleRemoveImage}
                    className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                  Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                  placeholder="e.g. Siliguri, India"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                  Availability Status
                </label>
                <input
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                  placeholder="e.g. Open to Backend Roles"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Biography Content (HTML Supported)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-56 p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 leading-relaxed resize-y"
                placeholder="<p>Write your detailed background and philosophy...</p>"
              />
            </div>
          </div>

          {/* Education Timeline Card */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-500" /> Academic Journey
              </h3>
              <button
                onClick={addEducation}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Milestone
              </button>
            </div>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={index}
                  className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-3 relative group"
                >
                  {/* Floating Action Controls */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={() => moveEducation(index, "up")}
                      className="p-1 rounded-lg bg-white dark:bg-zinc-700 text-zinc-500 hover:text-zinc-900 shadow-sm"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveEducation(index, "down")}
                      className="p-1 rounded-lg bg-white dark:bg-zinc-700 text-zinc-500 hover:text-zinc-900 shadow-sm"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeEducation(index)}
                      className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-20">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                        Degree / Program
                      </label>
                      <input
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-white"
                        placeholder="e.g. B.Tech in CSE"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                        Duration / Year
                      </label>
                      <input
                        value={edu.year}
                        onChange={(e) => updateEducation(index, "year", e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                        placeholder="e.g. 2022 - 2026"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                      Institution / University
                    </label>
                    <input
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, "institution", e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                      placeholder="e.g. Siliguri Institute of Technology"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                        College Location
                      </label>
                      <input
                        value={edu.location || ""}
                        onChange={(e) => updateEducation(index, "location", e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                        placeholder="e.g. Siliguri, West Bengal"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                        College LinkedIn Page
                      </label>
                      <input
                        value={edu.institutionLinkedin || ""}
                        onChange={(e) => updateEducation(index, "institutionLinkedin", e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                        placeholder="https://www.linkedin.com/school/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                      College Photo (shown large on the About page)
                    </label>
                    {edu.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveLogoUrl(edu.image)}
                        alt={edu.institution || "College"}
                        className="w-full aspect-video object-cover rounded-xl border border-zinc-200 dark:border-zinc-700 mb-2"
                      />
                    )}
                    <input
                      value={edu.image || ""}
                      onChange={(e) => updateEducation(index, "image", e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white mb-1.5"
                      placeholder="Image URL or Google Drive link"
                    />
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 cursor-pointer">
                      {uploadingCollege === index ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {uploadingCollege === index ? "Uploading…" : "Upload photo"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        disabled={uploadingCollege !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadCollegeImage(index, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                        CGPA Score
                      </label>
                      <input
                        value={edu.cgpa}
                        onChange={(e) => updateEducation(index, "cgpa", e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                        placeholder="e.g. 8.2"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                        Percentage (Optional)
                      </label>
                      <input
                        value={edu.percentage}
                        onChange={(e) => updateEducation(index, "percentage", e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                        placeholder="e.g. 85%"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                      Relevant Coursework (Comma separated)
                    </label>
                    <input
                      value={edu.relevantCoursework.join(", ")}
                      onChange={(e) =>
                        updateEducation(index, "relevantCoursework", e.target.value)
                      }
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white mb-2"
                      placeholder="e.g. Data Structures, DBMS, Operating Systems"
                    />
                    <div className="flex flex-wrap gap-1">
                      {edu.relevantCoursework
                        .filter((c) => c.trim())
                        .map((course, cIdx) => (
                          <span
                            key={cIdx}
                            onClick={() => removeCoursework(index, cIdx)}
                            className="text-[10px] font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md cursor-pointer hover:bg-rose-50 hover:text-rose-600 flex items-center gap-1"
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

          {/* How I Use AI Card (public page: /ai) */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-3">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <Sparkles className="w-4 h-4 text-cyan-500" /> How I Use AI
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Markdown shown on the public <span className="font-mono">/ai</span> page: your workflow with AI tools, agents, prompting and evals. Leave empty to show an automatic summary of your selected AI tools.
            </p>
            <textarea
              value={aiWorkflow}
              onChange={(e) => setAiWorkflow(e.target.value)}
              rows={10}
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white"
              placeholder={"## My AI workflow\n\n- I plan features with Claude, then implement with Claude Code...\n\n## How I verify AI output\n\n..."}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Skills, Experience & Certifications (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Technical Arsenal Skills Selector */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80 mb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-500" /> Technical Arsenal
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
                {selectedSkills.length} Selected
              </span>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter skill database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {filteredCategories.map((cat) => (
                <div key={cat.title}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    {cat.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.name);
                      return (
                        <div
                          key={skill.name}
                          onClick={() => toggleSkill(skill.name)}
                          className={`cursor-pointer px-3 py-1.5 rounded-xl flex items-center gap-2 select-none transition-all text-xs font-semibold ${
                            isSelected
                              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          <skill.Icon
                            className={`w-3.5 h-3.5 ${isSelected ? "" : "text-[var(--icon-light)] dark:text-[var(--icon-dark)]"}`}
                            style={
                              isSelected
                                ? undefined
                                : ({
                                    "--icon-light": readableIconColors(skill.color).light,
                                    "--icon-dark": readableIconColors(skill.color).dark,
                                  } as React.CSSProperties)
                            }
                          />
                          <span>{skill.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-500" /> Work Experience
              </h3>
              <button
                onClick={addExperience}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            </div>

            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2 relative group"
                >
                  <button
                    onClick={() => removeExperience(index)}
                    className="absolute top-3 right-3 p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-10">
                    <input
                      value={exp.role}
                      onChange={(e) => updateExperience(index, "role", e.target.value)}
                      className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-white"
                      placeholder="Role (e.g. Backend Intern)"
                    />
                    <input
                      value={exp.company}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                      placeholder="Company Name"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                    <CompanyLogo src={exp.companyLogo} company={exp.company || "Company"} size="sm" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <input
                        value={exp.companyLogo || ""}
                        onChange={(e) => updateExperience(index, "companyLogo", e.target.value)}
                        className="w-full p-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[11px] text-zinc-900 dark:text-white"
                        placeholder="Company logo URL or Google Drive link"
                      />
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 cursor-pointer">
                        {uploadingLogo === index ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        {uploadingLogo === index ? "Uploading…" : "Upload logo"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                          className="hidden"
                          disabled={uploadingLogo !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadCompanyLogo(index, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <input
                    value={exp.companyLinkedin || ""}
                    onChange={(e) => updateExperience(index, "companyLinkedin", e.target.value)}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                    placeholder="Company LinkedIn page (e.g. https://www.linkedin.com/company/...)"
                  />

                  <input
                    value={exp.duration}
                    onChange={(e) => updateExperience(index, "duration", e.target.value)}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                    placeholder="Duration (e.g. Jan 2024 - Present)"
                  />

                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, "description", e.target.value)}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                    placeholder="Key contributions and technologies used..."
                    rows={2}
                  />
                </div>
              ))}
              {experience.length === 0 && (
                <p className="text-xs text-zinc-400 italic">No professional experience added yet.</p>
              )}
            </div>
          </div>

          {/* Certifications */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-cyan-500" /> Verified Credentials
              </h3>
              <button
                onClick={addCertification}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Credential
              </button>
            </div>

            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2 relative group"
                >
                  <button
                    onClick={() => removeCertification(index)}
                    className="absolute top-3 right-3 p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-10">
                    <input
                      value={cert.name}
                      onChange={(e) => updateCertification(index, "name", e.target.value)}
                      className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-white"
                      placeholder="Certification Name"
                    />
                    <input
                      value={cert.issuer}
                      onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                      className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                      placeholder="Issuer (e.g. AWS, Coursera)"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={cert.date}
                      onChange={(e) => updateCertification(index, "date", e.target.value)}
                      className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                      placeholder="Issue Date"
                    />
                    <input
                      value={cert.url}
                      onChange={(e) => updateCertification(index, "url", e.target.value)}
                      className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white"
                      placeholder="Verification URL"
                    />
                  </div>
                </div>
              ))}
              {certifications.length === 0 && (
                <p className="text-xs text-zinc-400 italic">No certifications added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
