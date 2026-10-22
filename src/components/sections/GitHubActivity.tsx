"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitCommitHorizontal, GitPullRequest, Rocket, FolderPlus, Star, ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { fetchWithSessionCache } from "@/lib/clientCache";

interface Activity {
  type: "push" | "pr" | "create" | "release";
  text: string;
  repo: string;
  url: string;
  at: string;
}

interface Repo {
  name: string;
  description: string;
  language: string;
  stars: number;
  url: string;
  updatedAt: string;
}

interface GitHubData {
  user?: string;
  profileUrl?: string;
  activity: Activity[];
  repos: Repo[];
}

const ICONS = { push: GitCommitHorizontal, pr: GitPullRequest, create: FolderPlus, release: Rocket };

function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [[31536000, "y"], [2592000, "mo"], [604800, "w"], [86400, "d"], [3600, "h"], [60, "m"]];
  for (const [secs, label] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  return "just now";
}

/** "Currently building": live public GitHub activity from /api/github. Renders nothing when there's no data. */
export default function GitHubActivity() {
  const [data, setData] = useState<GitHubData | null>(null);

  useEffect(() => {
    fetchWithSessionCache<GitHubData>("github_activity", "/api/github")
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data || (!data.activity?.length && !data.repos?.length)) return null;

  return (
    <section className="mb-28 scroll-mt-32" aria-labelledby="github-activity-heading">
      <div className="flex items-center justify-between gap-3 mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-primary">
            <FaGithub className="w-6 h-6" />
          </div>
          <div>
            <h2 id="github-activity-heading" className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Currently Building
            </h2>
            <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live from GitHub
            </p>
          </div>
        </div>
        {data.profileUrl && (
          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            @{data.user} <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {data.activity.length > 0 && (
          <ol className="lg:col-span-3 rounded-3xl p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
            {data.activity.map((a, i) => {
              const Icon = ICONS[a.type] || GitCommitHorizontal;
              return (
                <motion.li
                  key={`${a.at}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-800 dark:text-zinc-200 hover:underline break-words">
                      {a.text}
                    </a>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{timeAgo(a.at)}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}

        {data.repos.length > 0 && (
          <div className={`${data.activity.length ? "lg:col-span-2" : "lg:col-span-5"} grid gap-4`}>
            {data.repos.map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-3xl p-5 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">{r.name}</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white shrink-0" />
                </div>
                {r.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2">{r.description}</p>}
                <div className="flex items-center gap-3 mt-3 text-[11px] text-zinc-400">
                  {r.language && <span className="font-semibold text-zinc-600 dark:text-zinc-300">{r.language}</span>}
                  {r.stars > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="w-3 h-3" /> {r.stars}
                    </span>
                  )}
                  <span>Updated {timeAgo(r.updatedAt)}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
