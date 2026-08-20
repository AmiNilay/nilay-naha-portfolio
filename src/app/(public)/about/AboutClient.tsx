"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, Cpu, Loader2, AlertCircle, GraduationCap, Award, 
  Calendar, MapPin, Download, ArrowRight, Mail, Briefcase, ExternalLink, BadgeCheck,
  AlertTriangle, RefreshCw
} from "lucide-react";
import SkillKeyboard from "@/components/ui/SkillKeyboard";
import AnimatedSection from "@/components/ui/AnimatedSection";

interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  relevantCoursework: string[];
  cgpa: string;
  percentage: string;
}

interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface AboutData {
  bio: string;
  location?: string;
  availability?: string;
  skills: string[];
  education: EducationEntry[];
  experience?: Experience[];
  certifications?: Certification[];
}

export default function AboutClient() {
  const [data, setData] = useState<AboutData | null>(null);
  const [heroData, setHeroData] = useState<{ profilePic?: string; resumeUrl?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAboutData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [aboutRes, heroRes] = await Promise.all([
        fetch("/api/about").then(res => {
          if (!res.ok) throw new Error("Failed to fetch about data");
          return res.json();
        }),
        fetch("/api/hero").then(res => res.json()).catch(() => null)
      ]);
      
      if (aboutRes && (aboutRes.bio || aboutRes.education?.length > 0)) {
        setData(aboutRes);
      }
      if (heroRes) setHeroData(heroRes);
    } catch (err) {
      console.error("Fetch error:", err);
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else {
        setError("Failed to load about details. The server might be busy or experiencing issues.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  // ==========================================
  // ERROR STATE UI
  // ==========================================
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center pt-20">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Oops! Something went wrong</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-lg">{error}</p>
        <button 
          onClick={fetchAboutData} 
          className="px-8 py-3.5 bg-primary text-white rounded-full font-bold hover:scale-105 hover:shadow-lg transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" /> Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // SKELETON LOADER UI
  // ==========================================
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen max-w-5xl">
        <div className="flex flex-col md:flex-row gap-12 items-start mb-24">
          <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-6">
            <div className="w-full aspect-square rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          </div>
          <div className="w-full md:w-2/3 space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/2 animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/5 animate-pulse"></div>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="h-12 w-40 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
              <div className="h-12 w-40 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen max-w-5xl flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold mb-2">About Section Not Setup</h1>
        <p className="text-gray-500">See you soon.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen max-w-5xl">

      {/* 1. HERO & BIO SECTION */}
      <AnimatedSection direction="up">
        <div className="flex flex-col md:flex-row gap-12 items-start mb-24">
          {/* Profile Image (Left) */}
          <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-6">
            <div className="w-full aspect-square rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
              {heroData?.profilePic ? (
                <img src={heroData.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No Image</div>
              )}
            </div>
            
            {/* Quick Status Badges */}
            <div className="flex flex-col gap-3">
              {data.location && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-xl">
                  <MapPin className="w-4 h-4 text-primary" /> {data.location}
                </div>
              )}
              {data.availability && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" /> {data.availability}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-xl">
                <GraduationCap className="w-4 h-4 text-primary" /> Class of 2026
              </div>
            </div>
          </div>

          {/* Bio Content (Right) */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white tracking-tight">
              About Me
            </h1>
            {/* 🟢 Added Tailwind selectors to respect Quill's alignment classes */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed mb-8 prose-a:text-primary prose-strong:text-gray-900 dark:prose-strong:text-white [&_.ql-align-justify]:text-justify [&_.ql-align-center]:text-center [&_.ql-align-right]:text-right"
              dangerouslySetInnerHTML={{ __html: data.bio || "<p>No bio added yet.</p>" }}
            />
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              {heroData?.resumeUrl && (
                <a 
                  href={heroData.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all"
                >
                  <Download className="w-4 h-4" /> Download Resume
                </a>
              )}
              <Link 
                href="/contact"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-bold rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all"
              >
                <Mail className="w-4 h-4" /> Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* 2. TECHNICAL ARSENAL */}
      <AnimatedSection direction="up">
        <div className="mb-24">
          <h2 className="text-3xl font-extrabold mb-10 flex items-center text-gray-900 dark:text-white">
            <Cpu className="w-8 h-8 mr-3 text-primary" /> Technical Arsenal
          </h2>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 md:p-10">
            <SkillKeyboard activeSkills={data.skills} />
          </div>
        </div>
      </AnimatedSection>

      {/* 3. EXPERIENCE TIMELINE (NEW) */}
      {data.experience && data.experience.length > 0 && (
        <AnimatedSection direction="up">
          <div className="mb-24">
            <h2 className="text-3xl font-extrabold mb-10 flex items-center text-gray-900 dark:text-white">
              <Briefcase className="w-8 h-8 mr-3 text-primary" /> Experience
            </h2>
            <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 md:ml-6 space-y-12 pb-4">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-8 md:pl-12 group">
                  <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-primary ring-4 ring-white dark:ring-background group-hover:scale-125 transition-transform duration-300" />
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                          {exp.role}
                        </h3>
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                          <MapPin className="w-4 h-4 text-primary" />
                          {exp.company}
                        </p>
                      </div>
                      {exp.duration && (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg shrink-0">
                          <Calendar className="w-4 h-4" />
                          {exp.duration}
                        </div>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* 4. EDUCATION TIMELINE */}
      <AnimatedSection direction="up">
        <div className="mb-24">
          <h2 className="text-3xl font-extrabold mb-10 flex items-center text-gray-900 dark:text-white">
            <BookOpen className="w-8 h-8 mr-3 text-primary" /> Education Journey
          </h2>

          {(!data.education || data.education.length === 0) ? (
            <p className="text-gray-500 italic">No education details added yet.</p>
          ) : (
            <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 md:ml-6 space-y-12 pb-4">
              {data.education.map((edu, idx) => (
                <div key={idx} className="relative pl-8 md:pl-12 group">
                  <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-primary ring-4 ring-white dark:ring-background group-hover:scale-125 transition-transform duration-300" />
                  
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                          {edu.degree}
                        </h3>
                        {edu.institution && (
                          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            <MapPin className="w-4 h-4 text-primary" />
                            {edu.institution}
                          </p>
                        )}
                      </div>
                      {edu.year && (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg shrink-0">
                          <Calendar className="w-4 h-4" />
                          {edu.year}
                        </div>
                      )}
                    </div>

                    {(edu.cgpa || edu.percentage) && (
                      <div className="flex flex-wrap gap-3 mb-6">
                        {edu.cgpa && (
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">CGPA</span>
                            <span className="text-sm font-extrabold text-gray-900 dark:text-white">{edu.cgpa}</span>
                          </div>
                        )}
                        {edu.percentage && (
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Score</span>
                            <span className="text-sm font-extrabold text-gray-900 dark:text-white">{edu.percentage}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {edu.relevantCoursework && edu.relevantCoursework.filter((c) => c.trim()).length > 0 && (
                      <div className="pt-5 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Relevant Coursework
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {edu.relevantCoursework.filter((c) => c.trim()).map((course, cIdx) => (
                            <span key={cIdx} className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md">
                              {course.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* 5. CERTIFICATIONS (NEW) */}
      {data.certifications && data.certifications.length > 0 && (
        <AnimatedSection direction="up">
          <div className="mb-24">
            <h2 className="text-3xl font-extrabold mb-10 flex items-center text-gray-900 dark:text-white">
              <BadgeCheck className="w-8 h-8 mr-3 text-primary" /> Certifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{cert.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-4">{cert.issuer}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{cert.date}</span>
                    {cert.url && (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                        View Credential <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* 6. BOTTOM CTA */}
      <AnimatedSection direction="up">
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Let's Build Something Great
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Interested in working together or discussing backend architecture? I'm currently open to new opportunities.
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-full shadow-lg hover:opacity-90 hover:-translate-y-1 transition-all"
          >
            Get In Touch <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </AnimatedSection>

    </div>
  );
}
