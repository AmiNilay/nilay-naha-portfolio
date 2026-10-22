"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, MessageSquare, HelpCircle, Users, RefreshCw, Lightbulb } from "lucide-react";

interface Insights {
  days: number;
  total: number;
  unansweredCount: number;
  visitors: number;
  topQuestions: { question: string; count: number }[];
  topTopics: { topic: string; count: number }[];
  gaps: { question: string; count: number; last: string }[];
  series: { date: string; count: number }[];
}

const RANGE_OPTIONS = [7, 30, 90];

const TOPIC_LABELS: Record<string, string> = {
  project: "A specific project",
  post: "A specific article",
  projects: "Projects",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  contact: "Contact",
  availability: "Availability",
  blog: "Blog",
};

const card = "p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)]";

function Sparkline({ series }: { series: Insights["series"] }) {
  const max = Math.max(1, ...series.map((s) => s.count));
  const w = 600;
  const h = 80;
  const step = series.length > 1 ? w / (series.length - 1) : w;
  const points = series.map((s, i) => `${(i * step).toFixed(1)},${(h - (s.count / max) * (h - 6) - 3).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none" role="img" aria-label="Questions per day">
      <polygon points={`0,${h} ${points.join(" ")} ${w},${h}`} fill="rgba(6,182,212,0.12)" />
      <polyline points={points.join(" ")} fill="none" stroke="#06B6D4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function InsightsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (range: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/chat-insights?days=${range}`);
      if (!res.ok) throw new Error("Request failed");
      setData(await res.json());
    } catch {
      setError("Could not load chatbot insights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  const answeredRate = data && data.total > 0 ? Math.round(((data.total - data.unansweredCount) / data.total) * 100) : 0;
  const maxTopic = Math.max(1, ...(data?.topTopics.map((t) => t.count) ?? []));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Chatbot Insights</h1>
          <p className="text-sm text-zinc-500 mt-1">What visitors ask your assistant, and what it couldn&apos;t answer.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-2xl border border-zinc-200/60">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setDays(opt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  days === opt ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {opt}d
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData(days)}
            className="p-2 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 transition-all"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">{error}</div>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Questions", value: data.total, icon: MessageSquare, tint: "bg-cyan-500/10 text-cyan-600" },
              { label: "Unique visitors", value: data.visitors, icon: Users, tint: "bg-violet-500/10 text-violet-600" },
              { label: "Answered", value: `${answeredRate}%`, icon: HelpCircle, tint: "bg-emerald-500/10 text-emerald-600" },
            ].map(({ label, value, icon: Icon, tint }) => (
              <div key={label} className={`${card} flex items-center gap-4`}>
                <div className={`p-3.5 rounded-2xl ${tint}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
                  <p className="text-2xl font-extrabold text-zinc-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={card}>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Questions per day</p>
            <Sparkline series={data.series} />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>{data.series[0]?.date}</span>
              <span>{data.series[data.series.length - 1]?.date}</span>
            </div>
          </div>

          {/* Content gaps — the most actionable list */}
          <div className={card}>
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-extrabold text-zinc-900">Unanswered questions (content gaps)</h2>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Add this information to your portfolio, or a curated answer in Train Chatbot, so the assistant can answer next time.
            </p>
            {data.gaps.length === 0 ? (
              <p className="text-sm text-zinc-400 italic">No unanswered questions in this period.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {data.gaps.map((g) => (
                  <li key={g.question} className="py-2.5 flex items-start justify-between gap-4">
                    <span className="text-sm text-zinc-800 break-words">{g.question}</span>
                    <span className="shrink-0 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">×{g.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={card}>
              <h2 className="text-sm font-extrabold text-zinc-900 mb-4">Top questions</h2>
              {data.topQuestions.length === 0 ? (
                <p className="text-sm text-zinc-400 italic">No questions yet.</p>
              ) : (
                <ol className="space-y-2">
                  {data.topQuestions.map((q, i) => (
                    <li key={q.question} className="flex items-start gap-3 text-sm">
                      <span className="w-5 shrink-0 text-xs font-bold text-zinc-400">{i + 1}</span>
                      <span className="flex-1 text-zinc-800 break-words">{q.question}</span>
                      <span className="shrink-0 text-xs font-bold text-zinc-500">{q.count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className={card}>
              <h2 className="text-sm font-extrabold text-zinc-900 mb-4">Top topics</h2>
              {data.topTopics.length === 0 ? (
                <p className="text-sm text-zinc-400 italic">No topics yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.topTopics.map((t) => (
                    <div key={t.topic}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-zinc-700">{TOPIC_LABELS[t.topic] || t.topic}</span>
                        <span className="text-zinc-500">{t.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(t.count / maxTopic) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
