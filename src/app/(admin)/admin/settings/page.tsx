"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Type, LayoutTemplate } from "lucide-react";
import Toast from "@/components/ui/Toast";

const CUSTOM_FONTS = [
  "Inter", "Story Script", "Bitcount Prop Single", "Bitcount Prop Single Ink", 
  "Bitcount Grid Single", "Allura", "Italianno", "Alex Brush", 
  "Corinthia", "Carattere", "Kaushan Script", "Praise", 
  "Londrina Shadow", "Rouge Script", "Libertinus Keyboard", 
  "Birthstone", "Dancing Script"
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    blogHeader: "", blogHeaderFont: "Inter",
    blogSubheader: "", blogSubheaderFont: "Inter",
    projectsHeader: "", projectsHeaderFont: "Inter",
    projectsSubheader: "", projectsSubheaderFont: "Inter",
        aboutHeader: "", aboutHeaderFont: "Inter",
    aboutSubheader: "", aboutSubheaderFont: "Inter",
    aboutBioFont: "Inter",
    aboutLocationFont: "Inter",
    aboutAvailabilityFont: "Inter",
    aboutSkillsFont: "Inter",
    aboutEducationFont: "Inter",
    aboutExperienceFont: "Inter",
    aboutCertificationFont: "Inter",
    contactHeader: "", contactHeaderFont: "Inter",
    contactSubheader: "", contactSubheaderFont: "Inter",
    contactToastFont: "Inter",
    contactLocationFont: "Inter",
    contactAvailabilityFont: "Inter",
    contactCardsFont: "Inter",
    contactFormHeadingFont: "Inter",
    contactFormLabelFont: "Inter",
    contactFormFieldFont: "Inter",
    contactFormStatusFont: "Inter",
    contactFormButtonFont: "Inter",
    homeBadgeFont: "Inter",
    homeHeadlineFont: "Inter",
    homeSubtitleFont: "Inter",
    homeActionFont: "Inter",
    homeSocialFont: "Inter",
    homeStatsValueFont: "Inter",
    homeStatsLabelFont: "Inter",
    homeLastUpdatedFont: "Inter",
    homeTechStackFont: "Inter",

  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setFormData(prev => ({ ...prev, ...data }));
        }
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
    setToast(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setToast({ message: "Global settings saved successfully!", type: "success" });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      setToast({ message: "Error saving settings.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label: string, textKey: keyof typeof formData, fontKey: keyof typeof formData, isTextarea = false) => (
    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <label className="text-xs font-bold uppercase text-gray-500">{label}</label>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          {isTextarea ? (
            <textarea 
              value={formData[textKey]} 
              onChange={(e) => setFormData({ ...formData, [textKey]: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none"
              rows={2}
            />
          ) : (
            <input 
              value={formData[textKey]} 
              onChange={(e) => setFormData({ ...formData, [textKey]: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}
        </div>
        <div className="w-full md:w-64 shrink-0 relative">
          <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            value={formData[fontKey]}
            onChange={(e) => setFormData({ ...formData, [fontKey]: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 text-gray-900 text-sm font-bold rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            style={{ fontFamily: formData[fontKey] === 'Inter' ? 'inherit' : `'${formData[fontKey]}', sans-serif` }}
          >
            {CUSTOM_FONTS.map(font => (
              <option key={font} value={font} style={{ fontFamily: font === 'Inter' ? 'inherit' : `'${font}', sans-serif` }}>
                {font}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderFontField = (label: string, fontKey: keyof typeof formData) => (
    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <label className="text-xs font-bold uppercase text-gray-500">{label}</label>
      <div className="w-full relative">
        <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <select
          value={formData[fontKey]}
          onChange={(e) => setFormData({ ...formData, [fontKey]: e.target.value })}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 text-gray-900 text-sm font-bold rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          style={{ fontFamily: formData[fontKey] === "Inter" ? "inherit" : `'${formData[fontKey]}', sans-serif` }}
        >
          {CUSTOM_FONTS.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font === "Inter" ? "inherit" : `'${font}', sans-serif` }}>
              {font}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <LayoutTemplate className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-extrabold text-black">Global Settings</h1>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg transition-all">
          {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Save Changes
        </button>
      </div>

            <div className="p-8 max-w-5xl mx-auto space-y-8">

        {/* HOME SETTINGS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b pb-2">Home Page</h2>
          {renderFontField("Availability Badge", "homeBadgeFont")}
          {renderFontField("Headline", "homeHeadlineFont")}
          {renderFontField("Subtitle / Bio", "homeSubtitleFont")}
          {renderFontField("Action Buttons", "homeActionFont")}
          {renderFontField("Social Links", "homeSocialFont")}
          {renderFontField("Statistics Values", "homeStatsValueFont")}
          {renderFontField("Statistics Labels", "homeStatsLabelFont")}
          {renderFontField("Last Updated", "homeLastUpdatedFont")}
          {renderFontField("Tech Stack Marquee", "homeTechStackFont")}
        </div>
        
        {/* BLOG SETTINGS */}

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b pb-2">Blog Page</h2>
          {renderField("Main Header", "blogHeader", "blogHeaderFont")}
          {renderField("Subheader", "blogSubheader", "blogSubheaderFont", true)}
        </div>

        {/* PROJECTS SETTINGS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b pb-2">Projects Page</h2>
          {renderField("Main Header", "projectsHeader", "projectsHeaderFont")}
          {renderField("Subheader", "projectsSubheader", "projectsSubheaderFont", true)}
        </div>

        {/* ABOUT SETTINGS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b pb-2">About Page</h2>
          {renderField("Main Header", "aboutHeader", "aboutHeaderFont")}
          {renderField("Subheader", "aboutSubheader", "aboutSubheaderFont", true)}
          {renderFontField("Bio / Details", "aboutBioFont")}
          {renderFontField("Location", "aboutLocationFont")}
          {renderFontField("Availability", "aboutAvailabilityFont")}
          {renderFontField("Skills", "aboutSkillsFont")}
          {renderFontField("Education", "aboutEducationFont")}
          {renderFontField("Experience", "aboutExperienceFont")}
          {renderFontField("Certifications", "aboutCertificationFont")}
        </div>

        {/* CONTACT SETTINGS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b pb-2">Contact Page</h2>
          {renderField("Main Header", "contactHeader", "contactHeaderFont")}
          {renderField("Subheader", "contactSubheader", "contactSubheaderFont", true)}
          {renderFontField("Copy Toast", "contactToastFont")}
          {renderFontField("Location Badge", "contactLocationFont")}
          {renderFontField("Availability Badge", "contactAvailabilityFont")}
          {renderFontField("Contact Cards", "contactCardsFont")}
          {renderFontField("Form Heading", "contactFormHeadingFont")}
          {renderFontField("Form Labels", "contactFormLabelFont")}
          {renderFontField("Form Fields", "contactFormFieldFont")}
          {renderFontField("Form Status", "contactFormStatusFont")}
          {renderFontField("Form Button", "contactFormButtonFont")}

        </div>

      </div>
    </div>
  );
}
