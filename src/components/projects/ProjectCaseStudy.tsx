"use client";

import { Target, Compass, TrendingUp, FlaskConical, Database, Ruler } from "lucide-react";

export interface ProjectMetric {
  label: string;
  value: string;
  hint?: string;
}

export interface ProjectEvaluation {
  dataset?: string;
  method?: string;
  results?: string;
  benchmarks?: { name: string; score: number; baseline?: number }[];
}

/** Server-rendered (sanitized markdown pipeline) HTML for each case-study section. */
export interface CaseStudyHTML {
  problem?: string;
  approach?: string;
  results?: string;
  evaluation?: string;
}

const PROSE =
  "rich-content " +
  "prose prose-zinc dark:prose-invert max-w-none prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-li:text-sm sm:prose-li:text-base prose-a:text-blue-600 dark:prose-a:text-blue-400";

const STEPS = [
  { key: "problem", title: "Problem", Icon: Target },
  { key: "approach", title: "Approach", Icon: Compass },
  { key: "results", title: "Results", Icon: TrendingUp },
] as const;

/** Headline metrics as compact stat tiles (also reused on project cards). */
export function MetricTiles({ metrics, limit }: { metrics?: ProjectMetric[]; limit?: number }) {
  const list = (metrics || []).filter((m) => m.label && m.value).slice(0, limit);
  if (!list.length) return null;
  return (
    <div className={`grid gap-3 ${limit && limit <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
      {list.map((m, i) => (
        <div
          key={i}
          className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">{m.label}</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">{m.value}</p>
          {m.hint && <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{m.hint}</p>}
        </div>
      ))}
    </div>
  );
}

/**
 * Case study (Problem → Approach → Results), impact metrics and an ML/LLM
 * evaluation section with benchmark bars. Renders nothing when a project has
 * none of these fields, so older projects look unchanged.
 */
export default function ProjectCaseStudy({
  html,
  metrics,
  evaluation,
}: {
  html?: CaseStudyHTML;
  metrics?: ProjectMetric[];
  evaluation?: ProjectEvaluation;
}) {
  const steps = STEPS.filter((s) => html?.[s.key]);
  const hasMetrics = (metrics || []).some((m) => m.label && m.value);
  const benchmarks = (evaluation?.benchmarks || []).filter((b) => b.name && Number.isFinite(b.score));
  const hasEval = Boolean(evaluation?.dataset || evaluation?.method || html?.evaluation || benchmarks.length);
  if (!steps.length && !hasMetrics && !hasEval) return null;

  // Bars use a 0–100 scale, widened if any score or baseline exceeds 100.
  const scale = Math.max(100, ...benchmarks.flatMap((b) => [b.score, b.baseline ?? 0]));
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / scale) * 100))}%`;

  return (
    <section className="mt-14 space-y-10" aria-label="Case study">
      {(steps.length > 0 || hasMetrics) && (
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
            Case Study
          </h2>
          {hasMetrics && <MetricTiles metrics={metrics} />}
          {steps.length > 0 && (
            <ol className="relative space-y-6 border-l border-zinc-200 dark:border-zinc-800 ml-3">
              {steps.map(({ key, title, Icon }) => (
                <li key={key} className="pl-7 relative">
                  <span className="absolute -left-3.5 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                    <Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
                  <div className={PROSE} dangerouslySetInnerHTML={{ __html: html![key]! }} />
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {hasEval && (
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-5 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Evaluation</h2>
          </div>

          {(evaluation?.dataset || evaluation?.method) && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {evaluation?.dataset && (
                <div className="flex gap-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <Database className="h-4 w-4 mt-0.5 shrink-0 text-zinc-500" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Dataset</dt>
                    <dd className="text-sm text-zinc-800 dark:text-zinc-200">{evaluation.dataset}</dd>
                  </div>
                </div>
              )}
              {evaluation?.method && (
                <div className="flex gap-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <Ruler className="h-4 w-4 mt-0.5 shrink-0 text-zinc-500" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Method</dt>
                    <dd className="text-sm text-zinc-800 dark:text-zinc-200">{evaluation.method}</dd>
                  </div>
                </div>
              )}
            </dl>
          )}

          {benchmarks.length > 0 && (
            <div className="space-y-3.5">
              {benchmarks.map((b, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{b.name}</span>
                    <span className="tabular-nums font-semibold text-zinc-900 dark:text-white">
                      {b.score}
                      {b.baseline != null && (
                        <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">baseline {b.baseline}</span>
                      )}
                    </span>
                  </div>
                  <div className="relative mt-1.5 h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {b.baseline != null && (
                      <div className="absolute inset-y-0 left-0 rounded-full bg-zinc-300 dark:bg-zinc-600" style={{ width: pct(b.baseline) }} />
                    )}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-violet-600 dark:bg-violet-400 opacity-90"
                      style={{ width: pct(b.score) }}
                    />
                  </div>
                </div>
              ))}
              {benchmarks.some((b) => b.baseline != null) && (
                <p className="flex items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-3 rounded-sm bg-violet-600 dark:bg-violet-400" /> This project
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-3 rounded-sm bg-zinc-300 dark:bg-zinc-600" /> Baseline
                  </span>
                </p>
              )}
            </div>
          )}

          {html?.evaluation && <div className={PROSE} dangerouslySetInnerHTML={{ __html: html.evaluation }} />}
        </div>
      )}
    </section>
  );
}
