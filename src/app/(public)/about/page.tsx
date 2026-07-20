"use client";

import { useState, useEffect } from "react";
import { BookOpen, Cpu, Loader2, AlertCircle } from "lucide-react";
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
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-primary" /> Education
        </h2>

        {(!data.education || data.education.length === 0) ? (
          <p className="text-gray-500 italic">No education details added yet.</p>
        ) : (
          <div className="space-y-8 border-l-2 border-gray-200 dark:border-gray-800 ml-3 pl-8 relative">
            {data.education.map((edu, idx) => (
              <div key={idx} className="relative">
                <span
                  className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-background ${
                    idx === 0 ? "bg-primary" : "bg-gray-400 dark:bg-gray-600"
                  }`}
                ></span>

                <h3 className="font-bold text-lg">{edu.degree}</h3>
                <p className="text-gray-500">{edu.institution}</p>
                <span className="text-sm text-gray-400">{edu.year}</span>

                {/* CGPA & Percentage */}
                {(edu.cgpa || edu.percentage) && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {edu.cgpa && (
                      <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                        CGPA: {edu.cgpa}
                      </span>
                    )}
                    {edu.percentage && (
                      <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {edu.percentage}
                      </span>
                    )}
                  </div>
                )}

                {/* Relevant Coursework */}
                {edu.relevantCoursework && edu.relevantCoursework.filter((c) => c.trim()).length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Relevant Coursework
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {edu.relevantCoursework
                        .filter((c) => c.trim())
                        .map((course, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md"
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