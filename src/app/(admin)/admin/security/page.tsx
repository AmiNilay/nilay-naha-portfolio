"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";

interface LogEntry {
  _id: string;
  at: string;
  actor: "admin" | "mcp" | "visitor";
  action: string;
  target?: string;
  ok: boolean;
  ipHash?: string;
  ua?: string;
}

const cardClass = "rounded-3xl bg-white border border-zinc-200/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)]";

const ACTOR_STYLES: Record<LogEntry["actor"], string> = {
  admin: "bg-cyan-50 text-cyan-700 border-cyan-200",
  mcp: "bg-violet-50 text-violet-700 border-violet-200",
  visitor: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

/** Security audit trail: logins, admin and AI-agent (MCP) writes, blocked attempts. */
export default function SecurityPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "failed" | "mcp">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/audit", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = logs.filter((l) => (filter === "failed" ? !l.ok : filter === "mcp" ? l.actor === "mcp" : true));
  const failedLogins = logs.filter((l) => l.action.startsWith("login.") && !l.ok).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Security</h1>
          <p className="text-sm text-zinc-500">Latest 200 events: logins, admin and AI-agent changes, blocked attempts. Kept for 180 days.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`${cardClass} p-4`}>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Events</p>
          <p className="text-2xl font-bold text-zinc-900">{logs.length}</p>
        </div>
        <div className={`${cardClass} p-4`}>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">AI-agent writes</p>
          <p className="text-2xl font-bold text-violet-700">{logs.filter((l) => l.actor === "mcp").length}</p>
        </div>
        <div className={`${cardClass} p-4`}>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Failed / blocked logins</p>
          <p className={`text-2xl font-bold ${failedLogins ? "text-rose-600" : "text-emerald-600"}`}>{failedLogins}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "failed", "mcp"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              filter === f ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200"
            }`}
          >
            {f === "all" ? "All" : f === "failed" ? "Failed / blocked" : "AI agents (MCP)"}
          </button>
        ))}
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-rose-600">{error}</p>
        ) : shown.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">No events yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Who</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {shown.map((l) => (
                  <tr key={l._id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-600">
                      {new Date(l.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-bold ${ACTOR_STYLES[l.actor]}`}>{l.actor}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-medium text-zinc-900">
                        {l.ok ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-rose-600" />}
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[260px] truncate text-zinc-600" title={l.target}>{l.target || "—"}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500 max-w-[260px]">
                      <span className="font-mono">{l.ipHash || "—"}</span>
                      <span className="block truncate" title={l.ua}>{l.ua}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
