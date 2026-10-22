"use client";

import { Plus, Trash2, Target, FlaskConical } from "lucide-react";

export interface Metric {
  label: string;
  value: string;
  hint?: string;
}

export interface Benchmark {
  name: string;
  score: number | string;
  baseline?: number | string;
}

export interface CaseStudy {
  problem: string;
  approach: string;
  results: string;
  metrics: Metric[];
  evaluation: { dataset: string; method: string; results: string; benchmarks: Benchmark[] };
}

export const EMPTY_CASE_STUDY: CaseStudy = {
  problem: "",
  approach: "",
  results: "",
  metrics: [],
  evaluation: { dataset: "", method: "", results: "", benchmarks: [] },
};

/** Normalize a project from the API into editor state (older projects lack these fields). */
export function caseStudyFrom(p: any): CaseStudy {
  return {
    problem: p?.problem || "",
    approach: p?.approach || "",
    results: p?.results || "",
    metrics: Array.isArray(p?.metrics) ? p.metrics.map((m: any) => ({ label: m.label || "", value: m.value || "", hint: m.hint || "" })) : [],
    evaluation: {
      dataset: p?.evaluation?.dataset || "",
      method: p?.evaluation?.method || "",
      results: p?.evaluation?.results || "",
      benchmarks: Array.isArray(p?.evaluation?.benchmarks)
        ? p.evaluation.benchmarks.map((b: any) => ({ name: b.name || "", score: b.score ?? "", baseline: b.baseline ?? "" }))
        : [],
    },
  };
}

/** Append case-study fields to the project FormData (arrays/objects as JSON). */
export function appendCaseStudy(data: FormData, cs: CaseStudy) {
  data.append("problem", cs.problem);
  data.append("approach", cs.approach);
  data.append("results", cs.results);
  data.append("metrics", JSON.stringify(cs.metrics));
  data.append("evaluation", JSON.stringify(cs.evaluation));
}

const input =
  "w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-blue-500/20";
const label = "block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5";

export default function CaseStudyEditor({ value, onChange }: { value: CaseStudy; onChange: (next: CaseStudy) => void }) {
  const set = (patch: Partial<CaseStudy>) => onChange({ ...value, ...patch });
  const setEval = (patch: Partial<CaseStudy["evaluation"]>) => set({ evaluation: { ...value.evaluation, ...patch } });

  const updateMetric = (i: number, patch: Partial<Metric>) =>
    set({ metrics: value.metrics.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) });
  const updateBenchmark = (i: number, patch: Partial<Benchmark>) =>
    setEval({ benchmarks: value.evaluation.benchmarks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) });

  return (
    <div className="space-y-6">
      {/* Case study */}
      <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Case Study & Impact</h3>
          <span className="text-[11px] text-zinc-400">Optional · Markdown supported</span>
        </div>
        {(["problem", "approach", "results"] as const).map((key) => (
          <div key={key}>
            <label className={label}>{key}</label>
            <textarea
              rows={3}
              value={value[key]}
              onChange={(e) => set({ [key]: e.target.value } as Partial<CaseStudy>)}
              className={`${input} font-mono`}
              placeholder={
                key === "problem"
                  ? "What problem did this solve, and for whom?"
                  : key === "approach"
                  ? "Architecture, key decisions and trade-offs…"
                  : "Outcome: what changed, measured how?"
              }
            />
          </div>
        ))}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={label}>Impact metrics</label>
            <button
              type="button"
              onClick={() => set({ metrics: [...value.metrics, { label: "", value: "", hint: "" }] })}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400"
            >
              <Plus className="w-3.5 h-3.5" /> Add metric
            </button>
          </div>
          <div className="space-y-2">
            {value.metrics.map((m, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] sm:grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-center">
                <input value={m.label} onChange={(e) => updateMetric(i, { label: e.target.value })} className={input} placeholder="Label (Latency)" />
                <input value={m.value} onChange={(e) => updateMetric(i, { value: e.target.value })} className={input} placeholder="Value (120 ms)" />
                <input
                  value={m.hint || ""}
                  onChange={(e) => updateMetric(i, { hint: e.target.value })}
                  className={`${input} hidden sm:block`}
                  placeholder="Hint (p95, down from 480 ms)"
                />
                <button
                  type="button"
                  onClick={() => set({ metrics: value.metrics.filter((_, idx) => idx !== i) })}
                  className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600"
                  aria-label="Remove metric"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {!value.metrics.length && <p className="text-xs text-zinc-400 italic">No metrics yet, e.g. Latency · 120 ms, Accuracy · 94%, Users · 1.2k.</p>}
          </div>
        </div>
      </div>

      {/* Evaluation */}
      <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Evaluation (ML / LLM)</h3>
          <span className="text-[11px] text-zinc-400">Optional</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={label}>Dataset</label>
            <input value={value.evaluation.dataset} onChange={(e) => setEval({ dataset: e.target.value })} className={input} placeholder="ISL-50 (12k clips)" />
          </div>
          <div>
            <label className={label}>Method</label>
            <input value={value.evaluation.method} onChange={(e) => setEval({ method: e.target.value })} className={input} placeholder="5-fold CV, held-out signers" />
          </div>
        </div>
        <div>
          <label className={label}>Findings</label>
          <textarea
            rows={3}
            value={value.evaluation.results}
            onChange={(e) => setEval({ results: e.target.value })}
            className={`${input} font-mono`}
            placeholder="What the evaluation showed, failure cases, regressions caught…"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={label}>Benchmarks (score 0–100)</label>
            <button
              type="button"
              onClick={() => setEval({ benchmarks: [...value.evaluation.benchmarks, { name: "", score: "", baseline: "" }] })}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 dark:text-violet-400"
            >
              <Plus className="w-3.5 h-3.5" /> Add benchmark
            </button>
          </div>
          <div className="space-y-2">
            {value.evaluation.benchmarks.map((b, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-2 items-center">
                <input value={b.name} onChange={(e) => updateBenchmark(i, { name: e.target.value })} className={input} placeholder="Top-1 accuracy" />
                <input type="number" value={b.score} onChange={(e) => updateBenchmark(i, { score: e.target.value })} className={input} placeholder="Score" />
                <input type="number" value={b.baseline ?? ""} onChange={(e) => updateBenchmark(i, { baseline: e.target.value })} className={input} placeholder="Baseline" />
                <button
                  type="button"
                  onClick={() => setEval({ benchmarks: value.evaluation.benchmarks.filter((_, idx) => idx !== i) })}
                  className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600"
                  aria-label="Remove benchmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
