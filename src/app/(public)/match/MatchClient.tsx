"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, CheckCircle2, XCircle, FileText, Mail, Loader2, Sparkles, ArrowUpRight } from "lucide-react";

export const TAILORED_JD_KEY = "tailored_resume_jd";

interface MatchResult {
  score: number;
  verdict: string;
  summary: string;
  requiredSkills: string[];
  matchedSkills: { skill: string; evidence: string[] }[];
  missingSkills: string[];
  relevant: { kind: string; title: string; url?: string; snippet: string }[];
}

const KIND_LABEL: Record<string, string> = { project: "Project", experience: "Experience", post: "Article", education: "Education" };

export default function MatchClient() {
  const router = useRouter();
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);

  // Keep a JD typed earlier in this tab.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(TAILORED_JD_KEY);
      if (saved) setJd(saved);
    } catch {}
  }, []);

  const analyse = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
      try {
        sessionStorage.setItem(TAILORED_JD_KEY, jd);
      } catch {}
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openTailored = () => {
    try {
      sessionStorage.setItem(TAILORED_JD_KEY, jd);
    } catch {}
    router.push("/resume/tailored");
  };

  const ring = result ? (result.score >= 75 ? "#10B981" : result.score >= 50 ? "#0EA5E9" : result.score >= 30 ? "#F59E0B" : "#EF4444") : "#0F766E";

  return (
    <div className="min-h-[100dvh] w-full bg-[#FAFAFA] dark:bg-[#0B0F14] text-[#111827] dark:text-[#F9FAFB] px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F766E]/20 bg-[#0F766E]/[0.06] dark:border-[#F59E0B]/20 dark:bg-[#F59E0B]/[0.06] mb-3">
            <Briefcase className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#F59E0B]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#F59E0B]">For recruiters</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Does Nilay fit your role?</h1>
          <p className="mt-2 text-sm sm:text-base text-[#6B7280] dark:text-[#9CA3AF] max-w-2xl mx-auto">
            Paste a job description. You&apos;ll get an explainable match score built only from his live portfolio — matched skills with
            evidence, gaps listed honestly, and his most relevant work.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#111827] border border-black/[0.08] dark:border-white/[0.08] p-4 sm:p-6 shadow-sm">
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={8}
            maxLength={20000}
            placeholder="Paste the full job description here…"
            className="w-full resize-y rounded-2xl p-4 text-sm bg-[#FAFAFA] dark:bg-[#0B0F14] border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-[#F59E0B]/30 select-text"
          />
          <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <span className="text-xs text-[#9CA3AF]">Runs on the server against portfolio data · nothing is stored</span>
            <button
              onClick={analyse}
              disabled={loading || jd.trim().length < 20}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#0F766E] dark:bg-[#F59E0B] text-white dark:text-[#0B0F14] disabled:opacity-40 hover:opacity-90 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Analysing…" : "Analyse match"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        </div>

        {result && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
            <div className="rounded-3xl bg-white dark:bg-[#111827] border border-black/[0.08] dark:border-white/[0.08] p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-center">
              <div
                className="w-28 h-28 shrink-0 rounded-full grid place-items-center"
                style={{ background: `conic-gradient(${ring} ${result.score * 3.6}deg, rgba(127,127,127,0.15) 0deg)` }}
              >
                <div className="w-[88px] h-[88px] rounded-full bg-white dark:bg-[#111827] grid place-items-center">
                  <span className="text-3xl font-bold">{result.score}</span>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-lg font-bold" style={{ color: ring }}>{result.verdict}</p>
                <p className="mt-1 text-sm text-[#4B5563] dark:text-[#D1D5DB]">{result.summary}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white dark:bg-[#111827] border border-black/[0.08] dark:border-white/[0.08] p-5">
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched skills ({result.matchedSkills.length})
                </h2>
                {result.matchedSkills.length ? (
                  <ul className="space-y-2">
                    {result.matchedSkills.map((m) => (
                      <li key={m.skill} className="text-sm">
                        <span className="font-semibold">{m.skill}</span>
                        <span className="block text-xs text-[#6B7280] dark:text-[#9CA3AF]">{m.evidence.slice(0, 3).join(" · ")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#6B7280]">None recognised.</p>
                )}
              </div>
              <div className="rounded-3xl bg-white dark:bg-[#111827] border border-black/[0.08] dark:border-white/[0.08] p-5">
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" /> Not shown on the portfolio ({result.missingSkills.length})
                </h2>
                {result.missingSkills.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Every recognised skill is covered.</p>
                )}
                <p className="mt-3 text-xs text-[#9CA3AF]">He picks up new tools quickly — worth asking him directly.</p>
              </div>
            </div>

            {result.relevant.length > 0 && (
              <div className="rounded-3xl bg-white dark:bg-[#111827] border border-black/[0.08] dark:border-white/[0.08] p-5">
                <h2 className="text-sm font-bold mb-3">Most relevant work</h2>
                <ul className="divide-y divide-black/5 dark:divide-white/5">
                  {result.relevant.map((r) => (
                    <li key={r.title} className="py-3">
                      <Link href={r.url || "/about"} className="group flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#F59E0B]">{KIND_LABEL[r.kind] || r.kind}</span>
                          <p className="text-sm font-semibold group-hover:underline">{r.title}</p>
                          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] line-clamp-2">{r.snippet}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 shrink-0 text-[#9CA3AF]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={openTailored}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#0F766E] dark:bg-[#F59E0B] text-white dark:text-[#0B0F14] hover:opacity-90"
              >
                <FileText className="w-4 h-4" /> Get a résumé tailored to this role
              </button>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Mail className="w-4 h-4" /> Contact Nilay
              </Link>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
