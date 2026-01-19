"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_SKILLS } from "@/lib/skillData";

interface SkillKeyboardProps {
  activeSkills?: string[];
}

export default function SkillKeyboard({ activeSkills }: SkillKeyboardProps) {
  const [previewSkill, setPreviewSkill] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- OPTIMIZED SOUND LOADING ---
  useEffect(() => {
    // Preload the audio file as soon as the component mounts
    const audio = new Audio("/sounds/click.mp3");
    audio.preload = "auto"; 
    audio.volume = 0.1;
    audioRef.current = audio;
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      // Resetting to 0 before play is key to preventing lag on rapid clicks
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        /* Ignore errors from browser autoplay policies */
      });
    }
  }, []);

  const displaySkills = activeSkills && activeSkills.length > 0
    ? ALL_SKILLS.filter(s => activeSkills.some(active => active.toLowerCase() === s.name.toLowerCase()))
    : ALL_SKILLS;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      
      {/* Dynamic Skill Preview Area */}
      <div className="h-16 flex items-center justify-center mb-4">
        <AnimatePresence mode="wait">
          {previewSkill ? (
            <motion.div
              key={previewSkill}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="px-6 py-2 bg-primary/10 border border-primary/30 rounded-full"
            >
              <span className="text-primary font-mono font-bold uppercase tracking-widest text-sm">
                {previewSkill}
              </span>
            </motion.div>
          ) : (
            <span className="text-gray-500 font-mono text-xs animate-pulse">
              Tap or Hover to Explore Arsenal
            </span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap justify-center gap-4 perspective-[1000px] py-4">
        {displaySkills.map((skill) => (
          <div 
            key={skill.name} 
            // FIX: Use both Mouse and Touch events for better responsiveness
            onMouseEnter={() => { setPreviewSkill(skill.name); playSound(); }} 
            onMouseLeave={() => setPreviewSkill(null)}
            onTouchStart={() => { setPreviewSkill(skill.name); playSound(); }}
            className="group relative cursor-pointer"
          >
            <div
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.25)] dark:shadow-[0_6px_0_rgba(0,0,0,0.4)] transition-all duration-75 active:translate-y-[4px] active:shadow-none flex flex-col items-center justify-center select-none overflow-hidden text-white bg-[var(--skill-color)]"
              style={{ "--skill-color": skill.color } as React.CSSProperties}
            >
              <skill.Icon className="w-9 h-9 md:w-11 md:h-11 mb-1 transition-transform group-hover:scale-110" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-80">
                {skill.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}