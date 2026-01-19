"use client";

import { useEffect, useRef } from "react";
import {
  SiPython,
  SiFastapi,
  SiKotlin,
  SiDocker,
  SiGit,
  SiNodedotjs,
  SiMongodb,
  SiOpenapiinitiative,
  SiReact,
  SiGithub,
  SiHtml5,
  SiCss3,
  SiJavascript,
} from "react-icons/si";

// The colors now apply to the whole key background
const skills = [
  { name: "Python", color: "#3776AB", Icon: SiPython },
  { name: "FastAPI", color: "#009688", Icon: SiFastapi },
  { name: "Kotlin", color: "#7F52FF", Icon: SiKotlin },
  { name: "Docker", color: "#2496ED", Icon: SiDocker },
  { name: "Git", color: "#F05032", Icon: SiGit },
  { name: "Node.js", color: "#339933", Icon: SiNodedotjs },
  { name: "MongoDB", color: "#47A248", Icon: SiMongodb },
  { name: "REST APIs", color: "#6BA539", Icon: SiOpenapiinitiative },
  { name: "React", color: "#61DAFB", Icon: SiReact },
  { name: "GitHub", color: "#181717", Icon: SiGithub },
  { name: "HTML5", color: "#E34F26", Icon: SiHtml5 },
  { name: "CSS3", color: "#1572B6", Icon: SiCss3 },
  { name: "JavaScript", color: "#F7DF1E", Icon: SiJavascript },
];

export default function SkillKeyboard() {
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

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Added py-8 for some vertical breathing room */}
      <div className="flex flex-wrap justify-center gap-4 perspective-[1000px] py-8">
        {skills.map((skill) => (
          <div
            key={skill.name}
            onMouseEnter={playSound}
            onMouseDown={playSound} // Also play on click for mobile feel
            className="group relative cursor-pointer"
          >
            {/* Keycap Body - Now Colored & Chunky */}
            <div
              className="
              relative w-20 h-20 md:w-24 md:h-24 
              rounded-2xl 
              /* Chunky base shadow */
              shadow-[0_6px_0_rgba(0,0,0,0.25)] dark:shadow-[0_6px_0_rgba(0,0,0,0.4)]
              /* 3D Press Animation */
              transition-all duration-100 ease-out
              active:translate-y-[4px] active:shadow-[0_2px_0_rgba(0,0,0,0.25)]
              group-hover:-translate-y-[1px] group-hover:shadow-[0_7px_0_rgba(0,0,0,0.25)] dark:group-hover:shadow-[0_7px_0_rgba(0,0,0,0.4)]
              flex flex-col items-center justify-center
              select-none overflow-hidden
              /* Force white text/icons for contrast on colored keys */
              text-white
            "
              // Apply dynamic background color
              // eslint-disable-next-line
              style={{ backgroundColor: skill.color }}
            >
              <skill.Icon className="w-9 h-9 md:w-11 md:h-11 mb-1 transition-transform group-hover:scale-105 duration-300" />

              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-90">
                {skill.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}