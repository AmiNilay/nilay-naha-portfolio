"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { TAILORED_JD_KEY } from "../../match/MatchClient";

interface Resume {
  name: string;
  headline: string;
  contact: { label: string; url: string }[];
  location: string;
  summary: string;
  skills: { name: string; matched: boolean }[];
  experience: { role: string; company: string; duration: string; description: string }[];
  projects: { title: string; url: string; tech: string[]; summary: string; matched: boolean }[];
  education: { degree: string; institution: string; year: string; grade: string }[];
  certifications: { name: string; issuer: string }[];
}

// Print: only the résumé sheet, A4, no site chrome (navbar, chatbot, cursor canvas).
const PRINT_CSS = `
@page { size: A4; margin: 12mm; }
@media print {
  html, body { background: #fff !important; }
  body * { visibility: hidden !important; }
  #tailored-resume, #tailored-resume * { visibility: visible !important; }
  #tailored-resume { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 0 !important; padding: 0 !important; color: #111 !important; background: #fff !important; }
  #tailored-resume a { color: #111 !important; text-decoration: none; }
}`;

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0F766E] border-b border-black/10 pb-1 mb-2 mt-4">{children}</h2>
);

export default function TailoredResumeClient() {
  const params = useSearchParams();
  const [resume, setResume] = useState<Resume | null>(null);
  const [tailored, setTailored] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let jd = params.get("jd") || "";
    if (!jd) {
      try {
        jd = sessionStorage.getItem(TAILORED_JD_KEY) || "";
      } catch {}
    }
    fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jd, resume: true }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.resume) throw new Error(data.error || "Could not build the résumé");
        setResume(data.resume);
        setTailored(!!data.match);
      })
      .catch((e) => setError(e.message));
  }, [params]);

  return (
    <div className="min-h-[100dvh] bg-[#F3F4F6] dark:bg-[#0B0F14] px-3 sm:px-6 pt-24 pb-12">
      <style>{PRINT_CSS}</style>
      <div className="max-w-[820px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Link href="/match" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4B5563] dark:text-[#D1D5DB] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to job match
          </Link>
          <button
            onClick={() => window.print()}
            disabled={!resume}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[#0F766E] dark:bg-[#F59E0B] text-white dark:text-[#0B0F14] disabled:opacity-40"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
        {resume && (
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-3">
            {tailored
              ? "Reordered for your job description: matching skills and projects are highlighted and listed first."
              : "General version — paste a job description on the Job Match page to tailor it."}{" "}
            In the print dialog choose “Save as PDF”.
          </p>
        )}

        {error && <p className="text-sm text-rose-500">{error}</p>}
        {!resume && !error && (
          <div className="grid place-items-center py-24 text-[#6B7280]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {resume && (
          <article
            id="tailored-resume"
            className="bg-white text-[#111827] rounded-xl shadow-lg border border-black/5 p-6 sm:p-10 text-[12.5px] leading-relaxed select-text"
          >
            <header>
              <h1 className="text-2xl font-bold tracking-tight">{resume.name}</h1>
              <p className="text-sm font-medium text-[#374151]">{resume.headline}</p>
              <p className="mt-1 text-[11.5px] text-[#4B5563] flex flex-wrap gap-x-3 gap-y-0.5">
                {resume.location && <span>{resume.location}</span>}
                {resume.contact.map((c) => (
                  <a key={c.url} href={c.url} className="hover:underline">{c.label}</a>
                ))}
              </p>
            </header>

            {resume.summary && (
              <>
                <H>Summary</H>
                <p>{resume.summary}</p>
              </>
            )}

            {resume.skills.length > 0 && (
              <>
                <H>Skills</H>
                <p>
                  {resume.skills.map((s, i) => (
                    <span key={s.name}>
                      <span className={s.matched ? "font-bold text-[#0F766E]" : ""}>{s.name}</span>
                      {i < resume.skills.length - 1 && " · "}
                    </span>
                  ))}
                </p>
              </>
            )}

            {resume.experience.length > 0 && (
              <>
                <H>Experience</H>
                {resume.experience.map((e) => (
                  <div key={`${e.role}-${e.company}`} className="mb-2 break-inside-avoid">
                    <div className="flex justify-between gap-3">
                      <p className="font-semibold">{e.role} — {e.company}</p>
                      <p className="text-[#6B7280] shrink-0">{e.duration}</p>
                    </div>
                    {e.description && <p className="text-[#374151]">{e.description}</p>}
                  </div>
                ))}
              </>
            )}

            {resume.projects.length > 0 && (
              <>
                <H>{tailored ? "Relevant Projects" : "Projects"}</H>
                {resume.projects.map((p) => (
                  <div key={p.title} className="mb-2 break-inside-avoid">
                    <p className="font-semibold">
                      <a href={p.url} className="hover:underline">{p.title}</a>
                      {p.tech.length > 0 && <span className="font-normal text-[#6B7280]"> · {p.tech.join(", ")}</span>}
                    </p>
                    <p className="text-[#374151]">{p.summary}</p>
                  </div>
                ))}
              </>
            )}

            {resume.education.length > 0 && (
              <>
                <H>Education</H>
                {resume.education.map((e) => (
                  <div key={`${e.degree}-${e.institution}`} className="flex justify-between gap-3 mb-1">
                    <p><span className="font-semibold">{e.degree}</span>, {e.institution}{e.grade && ` — ${e.grade}`}</p>
                    <p className="text-[#6B7280] shrink-0">{e.year}</p>
                  </div>
                ))}
              </>
            )}

            {resume.certifications.length > 0 && (
              <>
                <H>Certifications</H>
                <p>{resume.certifications.map((c) => `${c.name}${c.issuer ? ` (${c.issuer})` : ""}`).join(" · ")}</p>
              </>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
