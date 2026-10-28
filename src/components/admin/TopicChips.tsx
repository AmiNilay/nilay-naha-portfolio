"use client";

import { TOPICS, isTopic } from "@/lib/topics";

/**
 * One-click topic toggles for the admin tag editors. Topics are stored as tags
 * and kept at the front of the list, so public cards show them first and the
 * blog / project filters (which only offer these topics) pick the item up.
 */
export default function TopicChips({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const has = (topic: string) => tags.some((t) => t.trim().toLowerCase() === topic.toLowerCase());

  const toggle = (topic: string) => {
    const rest = tags.filter((t) => t.trim().toLowerCase() !== topic.toLowerCase());
    if (has(topic)) return onChange(rest);
    const topics = rest.filter(isTopic);
    const others = rest.filter((t) => !isTopic(t));
    onChange([...topics, topic, ...others]);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-zinc-500">
        Topics <span className="text-zinc-400">(pick 1–3 — these power the public filters)</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {TOPICS.map((topic) => {
          const on = has(topic);
          return (
            <button
              key={topic}
              type="button"
              onClick={() => toggle(topic)}
              aria-pressed={on}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                on
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-blue-400"
              }`}
            >
              {on ? "✓ " : "+ "}
              {topic}
            </button>
          );
        })}
      </div>
    </div>
  );
}
