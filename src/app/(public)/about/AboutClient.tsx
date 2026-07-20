"use client";

import { useState, useEffect } from "react";
import { BookOpen, Cpu, Loader2, AlertCircle, GraduationCap, Award, Calendar, MapPin } from "lucide-react";
import SkillKeyboard from "@/components/ui/SkillKeyboard";

interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  relevantCoursework: string[];
  cgpa: string;
  percentage: string;
}

interface AboutData {
  bio: string;
  skills: string[];
  education: EducationEntry[];
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && (resData.bio || resData.education?.length > 0)) {
          setData(resData);
        } else {
          setData(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
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

      {/* Bio */}
      <div className="max-w-4xl mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">About Me</h1>
        <div
          className="prose dark:prose-invert max-w-none text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data.bio || "<p>No bio added yet.</p>" }}
        />
      </div>

      {/* Skills */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <Cpu className="w-6 h-6 mr-2 text-primary" /> Technical Arsenal
        </h2>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <SkillKeyboard activeSkills={data.skills} />
        </div>
      </div>

      {/* Education */}
      <div>
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-primary" /> Education
        </h2>

        {(!data.education || data.education.length === 0) ? (
          <p className="text-gray-500 italic">No education details added yet.</p>
        ) : (
          <div className="space-y-6">
            {data.education.map((edu, idx) => (
              <div
                key={idx}
                className="group relative bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                {/* Top Accent Line */}
                <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-full ${idx === 0 ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"}`} />

                {/* Header: Degree + Year */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-2 rounded-lg ${idx === 0 ? "bg-primary/10 text-primary" : "bg-gray-200 dark:bg-gray-800 text-gray-500"}`}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                          {edu.degree}
                        </h3>
                        {edu.institution && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            {edu.institution}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {edu.year && (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 md:mt-2 md:ml-0 ml-11">
                      <Calendar className="w-3.5 h-3.5" />
                      {edu.year}
                    </div>
                  )}
                </div>

                {/* Grades: CGPA + Percentage */}
                {(edu.cgpa || edu.percentage) && (
                  <div className="flex flex-wrap gap-3 mb-5 ml-11">
                    {edu.cgpa && (
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">CGPA</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{edu.cgpa}</span>
                      </div>
                    )}
                    {edu.percentage && (
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Score</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{edu.percentage}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Relevant Coursework */}
                {edu.relevantCoursework && edu.relevantCoursework.filter((c) => c.trim()).length > 0 && (
                  <div className="ml-11 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Relevant Coursework
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {edu.relevantCoursework
                        .filter((c) => c.trim())
                        .map((course, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full hover:border-primary/50 hover:text-primary transition-colors"
                          >
                            {course.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}