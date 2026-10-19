"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  X,
  Send,
  User,
  Sparkles,
  ExternalLink,
  Download,
  Search,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface LinkItem {
  label: string;
  url: string;
}

interface Rule {
  keywords: string[];
  answer: string;
  quickReplies?: string[];
  links?: LinkItem[];
}

interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  quickReplies?: string[];
  links?: LinkItem[];
  isResumeTrigger?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What projects have you built?",
  "What languages do you know?",
  "Download Resume",
  "Why should we hire you?",
];

const SPEECH_PROMPTS = [
  "Hi! I'm Nilay's AI bot 👋",
  "Ask about projects or stack! 🚀",
  "Need Nilay's resume? Just ask! 📄",
];

// Fuzzy Matching Algorithm (Levenshtein Distance)
const getLevenshteinDistance = (a: string, b: string) => {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const arr = [];
  for (let i = 0; i <= b.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= a.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
            );
    }
  }
  return arr[b.length][a.length];
};

// Stop words to ignore during matching
const STOP_WORDS = [
  "what",
  "is",
  "the",
  "have",
  "you",
  "in",
  "do",
  "a",
  "an",
  "to",
  "for",
  "of",
  "my",
  "your",
];

const isFuzzyMatch = (input: string, keyword: string) => {
  const inputWords = input
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => !STOP_WORDS.includes(w));
  const keywordWords = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => !STOP_WORDS.includes(w));

  if (input.toLowerCase().includes(keyword.toLowerCase())) return true;

  for (const kw of keywordWords) {
    if (kw.length < 3) continue;
    for (const iw of inputWords) {
      if (getLevenshteinDistance(kw, iw) <= 2) return true;
    }
  }
  return false;
};

// =========================================================================
// 🤖 3D INTERACTIVE AVATAR COMPONENT (Physical Depth, Expressions & Tracking)
// =========================================================================
export type BotEmotion = "neutral" | "smiling" | "confused" | "angry";

interface CuteBotAvatarProps {
  size?: "sm" | "md" | "lg";
  interactive?: boolean; // Follows cursor with 3D tilt & eye tracking
  isTyping?: boolean; // Fast antenna ping and curious expression
  isHappy?: boolean; // Happy curved eyes on hover or success
  emotion?: BotEmotion; // Emotional state machine: neutral | smiling | confused | angry
  isDragging?: boolean;
  onClick?: () => void;
}

function CuteBotAvatar({
  size = "lg",
  interactive = false,
  isTyping = false,
  isHappy = false,
  emotion = "neutral",
  isDragging = false,
  onClick,
}: CuteBotAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const botRef = useRef<HTMLDivElement>(null);

  // Framer Motion values for physical 3D tilt and pupil tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apple-grade critically damped spring physics (WWDC Fluid Interfaces)
  const springConfig = { damping: 20, stiffness: 240, mass: 0.45 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Head 3D rotation angles (enhanced tilt for expressive depth)
  const rotateY = useTransform(smoothX, [-1, 1], [-22, 22]);
  const rotateX = useTransform(smoothY, [-1, 1], [18, -18]);
  const headZ = useTransform(smoothX, [-1, 1], [-4, 4]);

  // Pupil & Visor Parallax displacement
  const eyeX = useTransform(smoothX, [-1, 1], [-5.5, 5.5]);
  const eyeY = useTransform(smoothY, [-1, 1], [-4, 4]);
  const antennaTilt = useTransform(smoothX, [-1, 1], [-18, 18]);

  // Periodic natural blinking (unless angry)
  useEffect(() => {
    if (emotion === "angry") return;
    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3600);
    return () => clearInterval(blinkTimer);
  }, [emotion]);

  // Global mouse position listener for interactive 3D head and pupil tracking
  useEffect(() => {
    if (!interactive) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!botRef.current) return;
      const rect = botRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Reach radius around bot for 3D cursor tracking
      const reach = 550;
      const dx = Math.max(-1, Math.min(1, (e.clientX - centerX) / reach));
      const dy = Math.max(-1, Math.min(1, (e.clientY - centerY) / reach));

      mouseX.set(dx);
      mouseY.set(dy);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [interactive, mouseX, mouseY]);

  // Compute active emotional appearance
  const activeEmotion: BotEmotion = useMemo(() => {
    if (isDragging) return "confused";
    if (emotion === "angry") return "angry";
    if (emotion === "confused") return "confused";
    if (emotion === "smiling" || isHappy || isHovered) return "smiling";
    return "neutral";
  }, [isDragging, emotion, isHappy, isHovered]);

  // Dimension scaling maps
  const dimensions = {
    lg: {
      container: "w-[76px] h-[76px]",
      head: "w-[66px] h-[58px] rounded-[24px]",
      antennaHeight: "h-3.5",
      bulb: "w-3 h-3 -top-3.5",
      earWidth: "w-2 h-5",
      earLight: "w-0.5 h-2.5",
      visor: "w-[52px] h-[36px] rounded-[16px]",
      eye: "w-2.5 h-3.5",
      eyeGap: "gap-2.5",
      cheek: "w-2.5 h-1 bottom-1",
      mouth: "w-3 h-1 bottom-1.5",
    },
    md: {
      container: "w-[48px] h-[48px]",
      head: "w-[42px] h-[38px] rounded-[16px]",
      antennaHeight: "h-2.5",
      bulb: "w-2 h-2 -top-2.5",
      earWidth: "w-1.5 h-4",
      earLight: "w-0.5 h-2",
      visor: "w-[34px] h-[24px] rounded-[11px]",
      eye: "w-1.5 h-2.5",
      eyeGap: "gap-1.5",
      cheek: "w-1.5 h-0.5 bottom-0.5",
      mouth: "w-2 h-0.5 bottom-1",
    },
    sm: {
      container: "w-[32px] h-[32px]",
      head: "w-[28px] h-[26px] rounded-[10px]",
      antennaHeight: "h-2",
      bulb: "w-1.5 h-1.5 -top-2",
      earWidth: "w-1 h-3",
      earLight: "w-0.5 h-1.5",
      visor: "w-[22px] h-[16px] rounded-[7px]",
      eye: "w-1 h-1.5",
      eyeGap: "gap-1",
      cheek: "w-1 h-0.5 bottom-0.5",
      mouth: "w-1.5 h-0.5 bottom-0.5",
    },
  }[size];

  // Dynamic glow and accent colors by emotion
  const emotionThemes = {
    neutral: {
      bulb: "from-cyan-400 via-sky-300 to-emerald-300 shadow-[0_0_12px_rgba(6,182,212,0.9),0_0_24px_rgba(6,182,212,0.4)]",
      bulbPing: "bg-cyan-400",
      ear: "bg-cyan-400 shadow-[0_0_5px_#06b6d4]",
      visorBorder: "border-zinc-800/80",
      visorGlow: "",
      eyeColor: "text-cyan-400 fill-cyan-400",
      eyeDropShadow: "drop-shadow-[0_0_5px_#06b6d4]",
      eyeGrad: "from-cyan-300 via-cyan-400 to-sky-500 shadow-[0_0_10px_#06b6d4]",
      cheekColor: "bg-pink-400/40",
    },
    smiling: {
      bulb: "from-amber-300 via-emerald-400 to-cyan-400 shadow-[0_0_14px_rgba(16,185,129,0.9),0_0_26px_rgba(52,211,153,0.5)]",
      bulbPing: "bg-emerald-400",
      ear: "bg-emerald-400 shadow-[0_0_6px_#10b981]",
      visorBorder: "border-emerald-500/40",
      visorGlow: "shadow-[inset_0_0_12px_rgba(16,185,129,0.2)]",
      eyeColor: "text-emerald-400 fill-none",
      eyeDropShadow: "drop-shadow-[0_0_6px_#10b981]",
      eyeGrad: "from-emerald-300 via-teal-400 to-cyan-500 shadow-[0_0_10px_#10b981]",
      cheekColor: "bg-pink-500/80 shadow-[0_0_6px_rgba(236,72,153,0.6)]",
    },
    confused: {
      bulb: "from-purple-400 via-amber-300 to-yellow-400 shadow-[0_0_12px_rgba(168,85,247,0.8),0_0_24px_rgba(234,179,8,0.4)]",
      bulbPing: "bg-purple-400",
      ear: "bg-purple-400 shadow-[0_0_5px_#c084fc]",
      visorBorder: "border-purple-500/40",
      visorGlow: "shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]",
      eyeColor: "text-purple-300 fill-none",
      eyeDropShadow: "drop-shadow-[0_0_5px_#c084fc]",
      eyeGrad: "from-purple-300 via-violet-400 to-indigo-500 shadow-[0_0_8px_#c084fc]",
      cheekColor: "bg-amber-400/50",
    },
    angry: {
      bulb: "from-red-500 via-rose-500 to-amber-500 shadow-[0_0_16px_rgba(239,68,68,0.9),0_0_30px_rgba(244,63,94,0.6)]",
      bulbPing: "bg-red-500",
      ear: "bg-rose-500 shadow-[0_0_7px_#f43f5e]",
      visorBorder: "border-rose-500/60",
      visorGlow: "shadow-[inset_0_0_16px_rgba(239,68,68,0.35)]",
      eyeColor: "text-rose-500 fill-rose-500",
      eyeDropShadow: "drop-shadow-[0_0_8px_#ef4444]",
      eyeGrad: "from-rose-400 via-red-500 to-amber-600 shadow-[0_0_12px_#ef4444]",
      cheekColor: "bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.7)]",
    },
  }[activeEmotion];

  return (
    <div
      ref={botRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: 800 }}
      className={`relative select-none flex items-center justify-center ${dimensions.container} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <motion.div
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          rotateZ: interactive && activeEmotion === "confused" ? -8 : headZ,
          transformStyle: "preserve-3d",
        }}
        animate={
          activeEmotion === "angry"
            ? {
                x: [-1.5, 1.5, -1, 1, 0],
                y: [0, -1, 1, -0.5, 0],
                transition: { repeat: Infinity, duration: 0.22 },
              }
            : activeEmotion === "confused"
            ? {
                rotate: [-6, 6, -6],
                transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
              }
            : {}
        }
        whileHover={onClick ? { scale: 1.08 } : undefined}
        whileTap={onClick ? { scale: 0.92, rotate: -3 } : undefined}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="relative flex items-center justify-center"
      >
        {/* Antenna */}
        <motion.div
          style={{ rotate: interactive ? antennaTilt : 0 }}
          animate={
            activeEmotion === "angry"
              ? { rotate: [-15, 15, -15], transition: { repeat: Infinity, duration: 0.18 } }
              : activeEmotion === "confused"
              ? { rotate: [-20, 10, -20], transition: { repeat: Infinity, duration: 1.8 } }
              : {}
          }
          className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
        >
          {/* Glowing Orb Bulb */}
          <div
            className={`relative rounded-full bg-gradient-to-tr transition-all duration-300 ${dimensions.bulb} ${emotionThemes.bulb} ${
              isTyping || activeEmotion === "angry" ? "animate-pulse" : ""
            }`}
          >
            <span
              className={`absolute inset-0 rounded-full opacity-60 ${emotionThemes.bulbPing} ${
                isTyping || activeEmotion === "angry" ? "animate-ping" : "animate-pulse"
              }`}
            />
          </div>
          {/* Antenna Stem */}
          <div
            className={`w-[2px] bg-gradient-to-t from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-500 rounded-t-sm ${dimensions.antennaHeight}`}
          />
        </motion.div>

        {/* Left Ear Audio Pod */}
        <div
          className={`absolute -left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-700 shadow-sm border-l border-white/70 dark:border-zinc-600 flex items-center justify-center ${dimensions.earWidth}`}
        >
          <div className={`rounded-full transition-colors duration-300 ${emotionThemes.ear} ${dimensions.earLight}`} />
        </div>

        {/* Right Ear Audio Pod */}
        <div
          className={`absolute -right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-l from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-700 shadow-sm border-r border-white/70 dark:border-zinc-600 flex items-center justify-center ${dimensions.earWidth}`}
        >
          <div className={`rounded-full transition-colors duration-300 ${emotionThemes.ear} ${dimensions.earLight}`} />
        </div>

        {/* Main 3D Robot Head (Glossy Ceramic / Space Grey Titanium) */}
        <div
          className={`relative flex items-center justify-center bg-gradient-to-b from-white via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950 border border-white/80 dark:border-zinc-700/60 shadow-[0_14px_30px_rgba(0,0,0,0.18),0_2px_4px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.3),inset_0_1.5px_2px_rgba(255,255,255,0.18),inset_0_-3px_6px_rgba(0,0,0,0.5)] ${dimensions.head}`}
        >
          {/* Specular Rim Light Gradient across the top dome */}
          <div className="absolute top-0 inset-x-2 h-[35%] bg-gradient-to-b from-white/60 dark:from-white/15 to-transparent rounded-t-[18px] pointer-events-none" />

          {/* Curved Face Visor (Black Obsidian Glass with reactive emotion glow) */}
          <div
            className={`relative overflow-hidden bg-gradient-to-b from-zinc-950 via-black to-zinc-900 border transition-all duration-300 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_1px_2px_rgba(255,255,255,0.12)] flex flex-col items-center justify-center ${dimensions.visor} ${emotionThemes.visorBorder} ${emotionThemes.visorGlow}`}
          >
            {/* Glossy Reflection Arc */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[12px] pointer-events-none" />

            {/* Angry Eyebrows Overlay */}
            {activeEmotion === "angry" && (
              <div className="absolute top-1.5 inset-x-2 flex justify-between z-20 pointer-events-none">
                <div className="w-3.5 h-[2.5px] bg-rose-500 rounded-full rotate-[28deg] shadow-[0_0_6px_#ef4444]" />
                <div className="w-3.5 h-[2.5px] bg-rose-500 rounded-full -rotate-[28deg] shadow-[0_0_6px_#ef4444]" />
              </div>
            )}

            {/* Confused Eyebrows Overlay */}
            {activeEmotion === "confused" && (
              <div className="absolute top-1.5 inset-x-2.5 flex justify-between z-20 pointer-events-none">
                <div className="w-3 h-[2px] bg-purple-400 rounded-full -rotate-[16deg] shadow-[0_0_4px_#c084fc]" />
                <div className="w-3 h-[2px] bg-purple-400 rounded-full rotate-[22deg] shadow-[0_0_4px_#c084fc]" />
              </div>
            )}

            {/* Expressive LED Eyes Container */}
            <div className={`relative flex items-center ${dimensions.eyeGap} z-10`}>
              {/* Left Eye */}
              <div className="relative flex items-center justify-center">
                {activeEmotion === "smiling" ? (
                  <svg
                    viewBox="0 0 16 10"
                    className={`w-3.5 h-2.5 stroke-current stroke-[2.5] stroke-linecap-round filter ${emotionThemes.eyeColor} ${emotionThemes.eyeDropShadow}`}
                  >
                    <path d="M 2 8 Q 8 1 14 8" />
                  </svg>
                ) : activeEmotion === "angry" ? (
                  <div
                    className={`relative rounded-md bg-gradient-to-b ${emotionThemes.eyeGrad} flex items-center justify-center rotate-6 ${dimensions.eye}`}
                  >
                    <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                  </div>
                ) : activeEmotion === "confused" ? (
                  /* Spiral / dizzy eye */
                  <div className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin shadow-[0_0_5px_#c084fc]" />
                ) : (
                  <motion.div
                    style={{
                      x: interactive ? eyeX : 0,
                      y: interactive ? eyeY : 0,
                    }}
                    animate={{ scaleY: isBlinking ? 0.12 : 1 }}
                    transition={{ duration: 0.12 }}
                    className={`relative rounded-full bg-gradient-to-b ${emotionThemes.eyeGrad} flex items-start justify-end p-0.5 ${dimensions.eye}`}
                  >
                    <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_2px_#fff]" />
                  </motion.div>
                )}
              </div>

              {/* Right Eye */}
              <div className="relative flex items-center justify-center">
                {activeEmotion === "smiling" ? (
                  <svg
                    viewBox="0 0 16 10"
                    className={`w-3.5 h-2.5 stroke-current stroke-[2.5] stroke-linecap-round filter ${emotionThemes.eyeColor} ${emotionThemes.eyeDropShadow}`}
                  >
                    <path d="M 2 8 Q 8 1 14 8" />
                  </svg>
                ) : activeEmotion === "angry" ? (
                  <div
                    className={`relative rounded-md bg-gradient-to-b ${emotionThemes.eyeGrad} flex items-center justify-center -rotate-6 ${dimensions.eye}`}
                  >
                    <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                  </div>
                ) : activeEmotion === "confused" ? (
                  /* Wide tilted curious eye */
                  <div
                    className={`relative rounded-full bg-gradient-to-b ${emotionThemes.eyeGrad} flex items-center justify-center scale-110 ${dimensions.eye}`}
                  >
                    <span className="w-1 h-1 rounded-full bg-white" />
                  </div>
                ) : (
                  <motion.div
                    style={{
                      x: interactive ? eyeX : 0,
                      y: interactive ? eyeY : 0,
                    }}
                    animate={{ scaleY: isBlinking ? 0.12 : 1 }}
                    transition={{ duration: 0.12 }}
                    className={`relative rounded-full bg-gradient-to-b ${emotionThemes.eyeGrad} flex items-start justify-end p-0.5 ${dimensions.eye}`}
                  >
                    <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_2px_#fff]" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Blushing Cheeks (Lights up warmly on happy or flustered/angry) */}
            <div className="absolute inset-x-2 bottom-1.5 flex justify-between pointer-events-none">
              <div
                className={`rounded-full blur-[0.8px] transition-all duration-300 ${emotionThemes.cheekColor} ${
                  activeEmotion !== "neutral" ? "opacity-100" : "opacity-30"
                } ${dimensions.cheek}`}
              />
              <div
                className={`rounded-full blur-[0.8px] transition-all duration-300 ${emotionThemes.cheekColor} ${
                  activeEmotion !== "neutral" ? "opacity-100" : "opacity-30"
                } ${dimensions.cheek}`}
              />
            </div>

            {/* Expressive Mouth */}
            {activeEmotion === "smiling" ? (
              <div className="absolute bottom-1 w-2.5 h-1 border-b-2 border-emerald-400 rounded-full shadow-[0_0_4px_#10b981]" />
            ) : activeEmotion === "angry" ? (
              <div className="absolute bottom-1 w-2.5 h-1 border-t-2 border-rose-500 rounded-full shadow-[0_0_5px_#ef4444]" />
            ) : activeEmotion === "confused" ? (
              <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full border border-purple-400 shadow-[0_0_3px_#c084fc]" />
            ) : isTyping ? (
              <motion.div
                animate={{ scaleX: [0.6, 1.2, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4] ${dimensions.mouth}`}
              />
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// =========================================================================
// 🚀 MAIN CHATBOT COMPONENT
// =========================================================================
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [speechPromptIndex, setSpeechPromptIndex] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Emotional reactivity state machine
  const [botEmotion, setBotEmotion] = useState<BotEmotion>("neutral");
  const [isDraggingBot, setIsDraggingBot] = useState(false);
  const emotionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Click & shake gesture detection for "angry" and "confused" states
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const shakeVelocityRef = useRef({ lastX: 0, lastY: 0, lastTime: 0, rapidChanges: 0 });

  const triggerEmotion = (emotion: BotEmotion, durationMs = 3500) => {
    if (emotionTimeoutRef.current) clearTimeout(emotionTimeoutRef.current);
    setBotEmotion(emotion);
    if (durationMs > 0) {
      emotionTimeoutRef.current = setTimeout(() => {
        setBotEmotion("neutral");
      }, durationMs);
    }
  };

  // Detect rapid mouse shaking or erratic pointer motion to trigger "angry"
  useEffect(() => {
    let lastDirX = 0;
    let reversals = 0;
    let reversalResetTimer: NodeJS.Timeout | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = now - shakeVelocityRef.current.lastTime;
      if (dt <= 16) return;

      const dx = e.clientX - shakeVelocityRef.current.lastX;
      const speed = Math.abs(dx) / dt;

      // Detect frequent direction reversals at high speed (shaking back & forth)
      const currentDirX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
      if (currentDirX !== 0 && currentDirX !== lastDirX && speed > 1.2) {
        reversals++;
        lastDirX = currentDirX;

        if (reversalResetTimer) clearTimeout(reversalResetTimer);
        reversalResetTimer = setTimeout(() => {
          reversals = 0;
        }, 600);

        // If user shook mouse violently 6+ times in <600ms, bot gets angry!
        if (reversals >= 5) {
          triggerEmotion("angry", 4000);
          reversals = 0;
        }
      }

      shakeVelocityRef.current = {
        lastX: e.clientX,
        lastY: e.clientY,
        lastTime: now,
        rapidChanges: reversals,
      };
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (reversalResetTimer) clearTimeout(reversalResetTimer);
    };
  }, []);

  const handleBotClick = () => {
    if (isDraggingBot) return;

    const now = Date.now();
    if (now - lastClickTimeRef.current < 450) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;

    // Rapid spam clicks make the bot angry!
    if (clickCountRef.current >= 4) {
      triggerEmotion("angry", 4000);
      clickCountRef.current = 0;
      return;
    }

    // Normal click opens chat and smiles
    triggerEmotion("smiling", 3000);
    setIsOpen(true);
  };

  const initialBotMessage: Message = useMemo(
    () => ({
      id: "welcome",
      role: "bot",
      content:
        "Hi! I'm Nilay's AI assistant. Ask me about his projects, technical skills, background, or request his resume!",
    }),
    []
  );

  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);

  useEffect(() => {
    fetch("/api/chatbot")
      .then((res) => res.json())
      .then((data) => {
        if (data.rules) setRules(data.rules);
      })
      .catch(() => {});

    fetch("/api/hero")
      .then((res) => res.json())
      .then((data) => {
        if (data.resumeUrl) setResumeUrl(data.resumeUrl);
      })
      .catch(() => {});
  }, []);

  // Cycle speech bubble hints every 6 seconds
  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => {
      setSpeechPromptIndex((prev) => (prev + 1) % SPEECH_PROMPTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Auto-Suggest Logic
  const suggestions =
    input.trim().length > 1
      ? Array.from(new Set(rules.flatMap((r) => r.keywords)))
          .filter((k) => k.toLowerCase().includes(input.toLowerCase()))
          .slice(0, 3)
      : [];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: text },
    ]);
    setInput("");
    setIsTyping(true);
    triggerEmotion("smiling", 2500);

    setTimeout(() => {
      let responseText =
        "I'm just a simple bot and I don't know the answer to that yet! Please feel free to reach out to Nilay directly via the contact page.";
      let quickReplies: string[] = [];
      let links: LinkItem[] = [];
      let isResumeTrigger = false;

      // Check for Resume Download Trigger
      if (
        isFuzzyMatch(text, "resume") ||
        isFuzzyMatch(text, "cv") ||
        isFuzzyMatch(text, "download")
      ) {
        responseText = resumeUrl
          ? "Here is Nilay's resume! Tap the button below to view or download it."
          : "Sorry, Nilay hasn't uploaded a resume PDF yet.";
        isResumeTrigger = !!resumeUrl;
        triggerEmotion("smiling", 3500);
      } else {
        let bestRule: any = null;
        let highestScore = 0;

        rules.forEach((rule) => {
          let score = 0;
          rule.keywords.forEach((kw) => {
            if (isFuzzyMatch(text, kw)) score += 1;
          });
          if (score > highestScore) {
            highestScore = score;
            bestRule = rule;
          }
        });

        if (bestRule && highestScore > 0) {
          responseText = bestRule.answer;
          quickReplies = bestRule.quickReplies || [];
          links = bestRule.links || [];
          triggerEmotion("smiling", 3000);
        } else {
          // If no match found, bot looks confused
          triggerEmotion("confused", 3500);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: responseText,
          quickReplies,
          links,
          isResumeTrigger,
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleReset = () => {
    setMessages([initialBotMessage]);
    triggerEmotion("smiling", 2000);
  };

  return (
    <>
      {/* =============================================================== */}
      {/* 🌟 DRAGGABLE FLOATING 3D CUTE BOT LAUNCHER WITH EMOTIONS */}
      {/* =============================================================== */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.12}
        dragConstraints={{
          top: typeof window !== "undefined" ? -window.innerHeight + 140 : -600,
          left: typeof window !== "undefined" ? -window.innerWidth + 120 : -800,
          right: 0,
          bottom: 0,
        }}
        onDragStart={() => {
          setIsDraggingBot(true);
          triggerEmotion("confused", 0);
        }}
        onDragEnd={(_e, info) => {
          setIsDraggingBot(false);
          // If dragged with violent throw velocity, gets angry briefly
          const throwVelocity = Math.hypot(info.velocity.x, info.velocity.y);
          if (throwVelocity > 950) {
            triggerEmotion("angry", 3000);
          } else {
            triggerEmotion("smiling", 2000);
          }
        }}
        className={`fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing transition-opacity duration-300 ${
          isOpen ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
        }`}
      >
        {/* Apple-style Frosted Speech Bubble Pill */}
        <AnimatePresence>
          {showSpeechBubble && !isOpen && !isDraggingBot && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              onClick={handleBotClick}
              className="absolute bottom-full right-0 mb-3 cursor-pointer group select-none"
            >
              <div className="relative px-3.5 py-2 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-white/60 dark:border-zinc-700/60 shadow-[0_8px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)] flex items-center gap-2 transition-transform duration-200 group-hover:scale-[1.03]">
                {/* Live Activity Pulse */}
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>

                {/* Animated Speech Text or Emotion reactions */}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={botEmotion !== "neutral" ? botEmotion : speechPromptIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 whitespace-nowrap"
                  >
                    {botEmotion === "angry"
                      ? "Hey! Don't shake me! 💢"
                      : botEmotion === "confused"
                      ? "Whoa, where are we going? 🌀"
                      : SPEECH_PROMPTS[speechPromptIndex]}
                  </motion.span>
                </AnimatePresence>

                {/* Dismiss Bubble Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpeechBubble(false);
                  }}
                  className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Tail pointing down to the bot */}
                <div className="absolute -bottom-1.5 right-7 w-3 h-3 rotate-45 bg-white/85 dark:bg-zinc-900/85 border-r border-b border-white/60 dark:border-zinc-700/60" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bobbing Mascot & Synchronized Shadow */}
        <div className="relative flex flex-col items-center">
          <motion.div
            animate={isDraggingBot ? { scale: 1.12, rotate: 6 } : { y: [0, -7, 0] }}
            transition={
              isDraggingBot
                ? { type: "spring", damping: 15 }
                : { repeat: Infinity, duration: 3.2, ease: "easeInOut" }
            }
            className="relative"
          >
            <CuteBotAvatar
              size="lg"
              interactive={true}
              emotion={botEmotion}
              isDragging={isDraggingBot}
              onClick={handleBotClick}
            />
          </motion.div>

          {/* Dynamic Breathing Ground Shadow */}
          <motion.div
            animate={
              isDraggingBot
                ? { scale: 0.5, opacity: 0.1 }
                : { scale: [1, 0.8, 1], opacity: [0.35, 0.18, 0.35] }
            }
            transition={{ repeat: isDraggingBot ? 0 : Infinity, duration: 3.2, ease: "easeInOut" }}
            className="w-11 h-2 rounded-[100%] bg-zinc-950/20 dark:bg-black/50 blur-[3px] pointer-events-none -mt-1"
          />
        </div>
      </motion.div>

      {/* =============================================================== */}
      {/* 💬 CHAT MODAL DRAWER (Apple Design Materials & Fluid Springs) */}
      {/* =============================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-4.5rem)] rounded-[28px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_28px_70px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 flex flex-col overflow-hidden"
          >
            {/* Top Drag Indicator for Touch screens */}
            <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2 md:hidden" />

            {/* Header: Interactive 3D Cute Bot Mascot & Controls */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl z-10">
              <div className="flex items-center gap-3">
                {/* Header Cute Bot Avatar */}
                <div className="p-1 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                  <CuteBotAvatar
                    size="md"
                    interactive={true}
                    isTyping={isTyping}
                    isHappy={!isTyping}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                    Nilay's Assistant
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500 fill-cyan-400" />
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                          isTyping ? "bg-cyan-400" : "bg-emerald-400"
                        } opacity-75`}
                      ></span>
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          isTyping ? "bg-cyan-500" : "bg-emerald-500"
                        }`}
                      ></span>
                    </span>
                    {isTyping ? "Thinking..." : "Online • Ready"}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset conversation"
                  className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40 dark:bg-zinc-900/20 relative">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 24, stiffness: 350 }}
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Bot Avatar in Message Stream */}
                  {msg.role === "bot" && (
                    <div className="shrink-0 mt-0.5">
                      <CuteBotAvatar size="sm" isHappy={true} />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 max-w-[82%]">
                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm shadow-sm font-medium"
                          : "bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-100 rounded-tl-sm border border-zinc-200/80 dark:border-zinc-800 shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Inline External Links */}
                    {msg.links && msg.links.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        {msg.links.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl hover:opacity-90 active:scale-98 transition-all shadow-sm"
                          >
                            {link.label} <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Resume Download Action Trigger */}
                    {msg.isResumeTrigger && resumeUrl && (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 mt-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl hover:brightness-105 active:scale-98 transition-all shadow-md shadow-emerald-600/20"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Nilay's Resume
                      </a>
                    )}

                    {/* Dynamic Quick Replies */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.quickReplies.map((qr, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSend(qr)}
                            className="text-xs px-3 py-1.5 bg-white/90 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700/90 active:scale-95 transition-all shadow-sm font-semibold"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Bot Thinking / Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 justify-start items-center"
                >
                  <div className="shrink-0">
                    <CuteBotAvatar size="sm" isTyping={true} />
                  </div>
                  <div className="px-3.5 py-2.5 bg-white/90 dark:bg-zinc-900/90 rounded-2xl rounded-tl-sm shadow-sm border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></span>
                  </div>
                </motion.div>
              )}

              {/* Starter Suggested Questions */}
              {messages.length === 1 && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pt-2 flex flex-wrap gap-2"
                >
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="text-xs px-3.5 py-2 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all shadow-sm font-semibold"
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Auto-Suggest Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-[84px] left-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-20"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setInput(s);
                        handleSend(s);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-cyan-500" /> {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Dock (Apple Translucent Toolbar) */}
            <div className="p-3.5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-200/60 dark:border-zinc-800/80 relative z-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2 relative"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about skills, projects, resume..."
                  className="flex-1 py-2.5 pl-4 pr-11 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/60 dark:border-zinc-800/60 focus:bg-white dark:focus:bg-zinc-950 focus:border-cyan-500/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/10 rounded-2xl text-xs md:text-sm outline-none transition-all text-zinc-900 dark:text-white placeholder-zinc-400 font-medium"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 p-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:hover:opacity-40 transition-all active:scale-95 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Footer Note */}
              <div className="mt-2 text-center">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                  Automated AI assistant. For human inquiries,{" "}
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="text-zinc-800 dark:text-zinc-200 hover:underline font-bold"
                  >
                    contact Nilay here
                  </Link>
                  .
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
