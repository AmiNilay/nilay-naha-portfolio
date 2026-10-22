"use client";

import { useState } from "react";
import { Check, Search, Code2 } from "lucide-react";
import { SKILL_CATEGORIES, ALL_SKILLS, readableIconColors } from "@/lib/skillData";

/** Catalog logo for a skill name in its theme-aware brand color; generic icon for legacy free-text items. */
export function SkillIcon({ name, className = "w-3.5 h-3.5" }: { name: string; className?: string }) {
  const skill = ALL_SKILLS.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (!skill) return <Code2 className={`${className} text-zinc-400`} />;
  const colors = readableIconColors(skill.color);
  return (
    <skill.Icon
      className={`${className} text-[var(--icon-light)] dark:text-[var(--icon-dark)]`}
      style={{ "--icon-light": colors.light, "--icon-dark": colors.dark } as React.CSSProperties}
    />
  );
}

/**
 * Click-to-select logo grid over the shared skill catalog (src/lib/skillData.ts).
 * Used by Admin → About (Technical Arsenal) and Admin → Home (tech marquee).
 */
export default function SkillPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (name: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = SKILL_CATEGORIES.map((cat) => ({
    ...cat,
    skills: cat.skills.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
  })).filter((cat) => cat.skills.length > 0);

  return (
    <>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        <input
          type="text"
          placeholder="Filter skill database..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {filteredCategories.map((cat) => (
          <div key={cat.title}>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">{cat.title}</h4>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill) => {
                const isSelected = selected.includes(skill.name);
                return (
                  <div
                    key={skill.name}
                    onClick={() => onToggle(skill.name)}
                    className={`cursor-pointer px-3 py-1.5 rounded-xl flex items-center gap-2 select-none transition-all text-xs font-semibold ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <skill.Icon
                      className={`w-3.5 h-3.5 ${isSelected ? "" : "text-[var(--icon-light)] dark:text-[var(--icon-dark)]"}`}
                      style={
                        isSelected
                          ? undefined
                          : ({
                              "--icon-light": readableIconColors(skill.color).light,
                              "--icon-dark": readableIconColors(skill.color).dark,
                            } as React.CSSProperties)
                      }
                    />
                    <span>{skill.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
