"use client";

import { useState, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  RefreshCw,
  ExternalLink,
  Search,
  Loader2,
  GitCommit,
  Clock,
  User,
} from "lucide-react";

interface Commit {
  sha: string;
  fullSha: string;
  message: string;
  fullMessage: string;
  author: string;
  date: string;
}

export default function AdminTerminal() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSha, setSelectedSha] = useState<string | null>(null);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/activity", { cache: "no-store" });
      const data = await res.json();
      if (data.commits) setCommits(data.commits);
    } catch {
      console.error("Failed to fetch activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const filtered = commits.filter(
    (c) =>
      c.message.toLowerCase().includes(search.toLowerCase()) ||
      c.sha.toLowerCase().includes(search.toLowerCase())
  );

  const formatRelative = (dateStr: string) => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const githubUser = "AmiNilay";
  const githubRepo = "nilay-naha-portfolio";

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `,
        }}
      />

      {/* Terminal Header */}
      <div className="sticky top-0 z-40 bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <TerminalIcon className="w-4 h-4 text-[#8b949e]" />
            <span className="text-sm font-bold text-[#8b949e] font-mono">
              nilay@portfolio:~/deployments
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8b949e] font-mono">
            {commits.length} commits
          </span>
          <button
            onClick={fetchActivity}
            disabled={loading}
            className="p-2 text-[#8b949e] hover:text-white hover:bg-[#30363d] rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw
              className={"w-4 h-4 ".concat(loading ? "animate-spin" : "")}
            />
          </button>
          <a
            href={"https://github.com/".concat(githubUser, "/", githubRepo)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#8b949e] hover:text-white hover:bg-[#30363d] rounded-lg transition-colors"
            title="Open in GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter commits..."
            className="w-full pl-11 pr-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-sm font-mono text-[#e6edf3] placeholder:text-[#484f58] focus:ring-1 focus:ring-[#388bfd] focus:border-[#388bfd] outline-none transition-all"
          />
        </div>

        {/* Loading */}
        {loading && commits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-[#388bfd] animate-spin" />
            <p className="text-sm text-[#8b949e] font-mono">
              Fetching deployment history...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <GitCommit className="w-8 h-8 text-[#484f58]" />
            <p className="text-sm text-[#8b949e] font-mono">
              {search
                ? "No commits match your search."
                : "No commits found."}
            </p>
          </div>
        )}

        {/* Commit List */}
        <div className="space-y-1">
          {filtered.map((commit, i) => {
            const isExpanded = selectedSha === commit.sha;

            return (
              <div
                key={commit.sha}
                style={{
                  opacity: 0,
                  animation: "fadeIn 0.15s ease forwards",
                  animationDelay: "".concat(String(Math.min(i * 30, 500)), "ms"),
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSha(isExpanded ? null : commit.sha)
                  }
                  className={"w-full text-left px-4 py-3 rounded-lg transition-all font-mono text-sm ".concat(
                    isExpanded
                      ? "bg-[#1f2937] border border-[#388bfd]"
                      : "hover:bg-[#161b22] border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-[#388bfd] select-none shrink-0 mt-0.5">
                      $
                    </span>
                    <span className="text-[#7ee787] shrink-0 w-16">
                      {commit.sha}
                    </span>
                    <span className="text-[#e6edf3] flex-1 min-w-0 truncate">
                      {commit.message}
                    </span>
                    <span className="text-[#484f58] shrink-0 text-xs mt-0.5 hidden sm:block">
                      {formatRelative(commit.date)}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div
                    className="ml-12 mr-4 mb-2 mt-1 p-4 bg-[#161b22] rounded-lg border border-[#30363d] text-xs font-mono space-y-3"
                    style={{
                      opacity: 0,
                      animation: "fadeIn 0.2s ease forwards",
                    }}
                  >
                    {commit.fullMessage.includes("\n") && (
                      <div>
                        <span className="text-[#8b949e] block mb-1">
                          Full message:
                        </span>
                        <p className="text-[#e6edf3] whitespace-pre-wrap leading-relaxed">
                          {commit.fullMessage}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-[#8b949e]" />
                        <span className="text-[#8b949e]">Author:</span>
                        <span className="text-[#e6edf3]">
                          {commit.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-[#8b949e]" />
                        <span className="text-[#8b949e]">Date:</span>
                        <span className="text-[#e6edf3]">
                          {formatDate(commit.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitCommit className="w-3 h-3 text-[#8b949e]" />
                        <span className="text-[#8b949e]">SHA:</span>
                        <a
                          href={
                            "https://github.com/"
                              .concat(githubUser, "/")
                              .concat(githubRepo, "/commit/")
                              .concat(commit.fullSha)
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#388bfd] hover:underline"
                        >
                          {commit.sha}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats */}
        {commits.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#30363d] flex flex-wrap gap-6 text-xs font-mono text-[#8b949e]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7ee787]" />
              <span>
                Latest: {formatRelative(commits[0]?.date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#388bfd]" />
              <span>
                This week:{" "}
                {
                  commits.filter(
                    (c) =>
                      Date.now() - new Date(c.date).getTime() <
                      7 * 24 * 60 * 60 * 1000
                  ).length
                }{" "}
                commits
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d2a8ff]" />
              <span>Total: {commits.length} shown</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}