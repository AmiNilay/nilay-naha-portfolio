"use client";

import { useState } from "react";
import { Loader2, Sparkles, Send, Zap } from "lucide-react";

const LIVE_TOPICS = [
  "Overview / tell me about him", "Projects (and any project by name)", "Work experience & current role",
  "Education & CGPA", "Tech stack & \"does he know X?\"", "AI tools", "Contact, GitHub, LinkedIn",
  "Location & availability", "Certifications", "Blog posts (and any post by name)", "Recommendations",
];

const RECRUITER_QUESTIONS = [
  "Tell me about yourself", "Why should we hire him?", "Is he a fresher or experienced?",
  "What roles is he looking for?", "Where is he currently working?", "Does he know React?",
  "What is his expected salary?", "Is he open to relocation?", "Can we schedule an interview?",
  "What is his strongest project?", "How does he approach problem solving?", "Is he a team player?",
  "Does he have web development experience?", "What AI tools does he use?", "How was this website built?",
];

/** Explains what the assistant answers on its own, and lets the admin test any question. */
export default function ChatbotGuide() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<{ reply: string; links: { label: string; url: string }[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setQuestion(q);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setAnswer(res.ok ? data : { reply: data.error || "Error", links: [] });
    } catch {
      setAnswer({ reply: "Could not reach the assistant.", links: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-[32px] p-6 sm:p-8 bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Answered automatically from your live content
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          These update the moment you edit Home, About, Projects, Blog or Testimonials — no rules needed. Use rules
          below for soft questions (strengths, teamwork, salary, relocation) or to override wording.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LIVE_TOPICS.map((t) => (
            <span key={t} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
              {t}
            </span>
          ))}
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pt-2">Questions recruiters often ask — click to test</h3>
        <div className="flex flex-wrap gap-1.5">
          {RECRUITER_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] p-6 sm:p-8 bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 flex flex-col">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500" /> Test the assistant
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
          className="flex gap-2"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything a visitor might ask…"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white"
          />
          <button type="submit" disabled={loading} className="px-3.5 rounded-xl bg-cyan-600 text-white disabled:opacity-60" aria-label="Ask">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <div className="flex-1 min-h-[120px] rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 p-4 text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap">
          {answer ? (
            <>
              {answer.reply.replace(/\*\*/g, "")}
              {answer.links?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {answer.links.map((l) => (
                    <span key={l.url} className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[11px] font-semibold">
                      {l.label}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <span className="text-zinc-400">The exact answer visitors would see appears here.</span>
          )}
        </div>
      </div>
    </div>
  );
}
