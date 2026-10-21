"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Users, Eye, GitBranch, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface NodeStats {
  path: string;
  visits: number;
  entries: number;
  exits: number;
  exitRate: number;
}

interface EdgeStats {
  from: string;
  to: string;
  count: number;
}

interface FlowData {
  rangeDays: number;
  totalSessions: number;
  totalPageViews: number;
  nodes: NodeStats[];
  edges: EdgeStats[];
}

const RANGE_OPTIONS = [7, 30, 90];
const MAX_EDGES_SHOWN = 10;

function formatPath(path: string) {
  if (path === "/") return "Home";
  return path.replace(/^\//, "").replace(/-/g, " ");
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<FlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (range: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics/flow?days=${range}`);
      if (!res.ok) throw new Error("Request failed");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Could not load analytics data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  const avgPagesPerSession =
    data && data.totalSessions > 0 ? (data.totalPageViews / data.totalSessions).toFixed(1) : "0";

  const topEdges = data?.edges.slice(0, MAX_EDGES_SHOWN) ?? [];
  const maxEdgeCount = Math.max(1, ...topEdges.map((e) => e.count));

  const dropOffNodes = [...(data?.nodes ?? [])]
    .filter((n) => n.visits > 0)
    .sort((a, b) => b.exitRate - a.exitRate || b.visits - a.visits)
    .slice(0, 12);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            User Flow Analytics
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Which pages visitors move through, and where they drop off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setDays(opt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  days === opt
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {opt}d
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData(days)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 transition-all"
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
        <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sessions</p>
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white tabular-nums">
                  {data.totalSessions.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-500">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Page views</p>
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white tabular-nums">
                  {data.totalPageViews.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Avg. pages / session</p>
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white tabular-nums">
                  {avgPagesPerSession}
                </p>
              </div>
            </div>
          </div>

          {/* Top transitions bar chart */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Top page transitions</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              The most common "page A → page B" moves, by session count.
            </p>

            {topEdges.length === 0 ? (
              <p className="text-sm text-zinc-400 py-8 text-center">Not enough data yet for this range.</p>
            ) : (
              <div className="space-y-3">
                {topEdges.map((edge) => {
                  const pct = (edge.count / maxEdgeCount) * 100;
                  return (
                    <div key={`${edge.from}=>${edge.to}`} className="flex items-center gap-3">
                      <div className="w-44 sm:w-64 shrink-0 text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate">
                        {formatPath(edge.from)}{" "}
                        <span className="text-zinc-400 dark:text-zinc-500">→</span>{" "}
                        <span className="text-zinc-900 dark:text-white font-semibold">{formatPath(edge.to)}</span>
                      </div>
                      <div className="flex-1 h-6 relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="h-full rounded-r-md rounded-l-sm"
                          style={{ background: "var(--primary)", maxWidth: "100%" }}
                        />
                      </div>
                      <div className="w-10 text-right text-xs font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">
                        {edge.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drop-off table */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="p-6 sm:p-8 pb-4">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Drop-off by page</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pages sorted by how often they were the last page in a session.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 border-t border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-6 sm:px-8 py-3">Page</th>
                    <th className="px-4 py-3 text-right">Visits</th>
                    <th className="px-4 py-3 text-right">Exits</th>
                    <th className="px-4 sm:px-8 py-3">Exit rate</th>
                  </tr>
                </thead>
                <tbody>
                  {dropOffNodes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-8 text-center text-zinc-400 text-sm">
                        Not enough data yet for this range.
                      </td>
                    </tr>
                  )}
                  {dropOffNodes.map((node) => (
                    <tr
                      key={node.path}
                      className="border-b border-zinc-100 dark:border-zinc-800/80 last:border-0"
                    >
                      <td className="px-6 sm:px-8 py-3 font-medium text-zinc-800 dark:text-zinc-200 capitalize">
                        {formatPath(node.path)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                        {node.visits}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                        {node.exits}
                      </td>
                      <td className="px-4 sm:px-8 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden max-w-[140px]">
                            <div
                              className="h-full rounded-full bg-amber-500"
                              style={{ width: `${Math.round(node.exitRate * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 tabular-nums w-10 text-right">
                            {Math.round(node.exitRate * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
