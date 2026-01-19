"use client";

import { useEffect, useRef } from "react";
import { ALL_SKILLS } from "@/lib/skillData";

interface SkillKeyboardProps {
  activeSkills?: string[];
}

export default function SkillKeyboard({ activeSkills }: SkillKeyboardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/click.mp3");
    audioRef.current.volume = 0.1;
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const displaySkills = activeSkills && activeSkills.length > 0
    ? ALL_SKILLS.filter(s => activeSkills.some(active => active.toLowerCase() === s.name.toLowerCase()))
    : ALL_SKILLS;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-wrap justify-center gap-4 perspective-[1000px] py-8">
        {displaySkills.map((skill) => (
          <div key={skill.name} onMouseEnter={playSound} onMouseDown={playSound} className="group relative cursor-pointer">
            <div
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.25)] dark:shadow-[0_6px_0_rgba(0,0,0,0.4)] transition-all duration-100 ease-out active:translate-y-[4px] active:shadow-[0_2px_0_rgba(0,0,0,0.25)] group-hover:-translate-y-[1px] group-hover:shadow-[0_7px_0_rgba(0,0,0,0.25)] dark:group-hover:shadow-[0_7px_0_rgba(0,0,0,0.4)] flex flex-col items-center justify-center select-none overflow-hidden text-white bg-[var(--skill-color)]"
              style={{ "--skill-color": skill.color } as React.CSSProperties}
            >
              <skill.Icon className="w-9 h-9 md:w-11 md:h-11 mb-1 transition-transform group-hover:scale-105 duration-300" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-90">{skill.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}