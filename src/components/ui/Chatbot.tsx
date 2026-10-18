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
// 🤖 3D CUTE BOT CHARACTER COMPONENT (Apple Fluid Motion & Tactile Physics)
// =========================================================================
interface CuteBotAvatarProps {
  size?: "sm" | "md" | "lg";
  interactive?: boolean; // Follows cursor with 3D tilt & eye tracking
  isTyping?: boolean; // Fast antenna ping and curious expression
  isHappy?: boolean; // Happy curved eyes on hover or success
  onClick?: () => void;
}

function CuteBotAvatar({
  size = "lg",
  interactive = false,
  isTyping = false,
  isHappy = false,
  onClick,
}: CuteBotAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const botRef = useRef<HTMLDivElement>(null);

  // Framer Motion values for physical 3D tilt and pupil tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apple-grade critically damped spring physics (WWDC Fluid Interfaces)
  const springConfig = { damping: 22, stiffness: 220, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Head 3D rotation angles
  const rotateY = useTransform(smoothX, [-1, 1], [-16, 16]);
  const rotateX = useTransform(smoothY, [-1, 1], [14, -14]);

  // Pupil & Visor Parallax displacement
  const eyeX = useTransform(smoothX, [-1, 1], [-4.5, 4.5]);
  const eyeY = useTransform(smoothY, [-1, 1], [-3.5, 3.5]);
  const antennaTilt = useTransform(smoothX, [-1, 1], [-12, 12]);

  // Periodic natural blinking
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3600);
    return () => clearInterval(blinkTimer);
  }, []);

  // Global mouse position listener for interactive 3D head and pupil tracking
  useEffect(() => {
    if (!interactive) return;

    // Respect user's motion preference (Apple Design principle 14)
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

      // Distance normalized between -1 and 1 within an 500px reach radius
      const reach = 500;
      const dx = Math.max(-1, Math.min(1, (e.clientX - centerX) / reach));
      const dy = Math.max(-1, Math.min(1, (e.clientY - centerY) / reach));

      mouseX.set(dx);
      mouseY.set(dy);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [interactive, mouseX, mouseY]);

  // Dimension scaling maps
  const dimensions = {
    lg: {
      container: "w-[72px] h-[72px]",
      head: "w-[62px] h-[54px] rounded-[22px]",
      antennaHeight: "h-3.5",
      bulb: "w-3 h-3 -top-3.5",
      earWidth: "w-1.5 h-4.5",
      earLight: "w-0.5 h-2",
      visor: "w-[48px] h-[34px] rounded-[15px]",
      eye: "w-2.5 h-3.5",
      eyeGap: "gap-2.5",
      cheek: "w-2.5 h-1 bottom-1",
      mouth: "w-3 h-1 bottom-1.5",
    },
    md: {
      container: "w-[46px] h-[46px]",
      head: "w-[40px] h-[36px] rounded-[15px]",
      antennaHeight: "h-2.5",
      bulb: "w-2 h-2 -top-2.5",
      earWidth: "w-1 h-3.5",
      earLight: "w-0.5 h-1.5",
      visor: "w-[32px] h-[23px] rounded-[10px]",
      eye: "w-1.5 h-2.5",
      eyeGap: "gap-1.5",
      cheek: "w-1.5 h-0.5 bottom-0.5",
      mouth: "w-2 h-0.5 bottom-1",
    },
    sm: {
      container: "w-[30px] h-[30px]",
      head: "w-[28px] h-[25px] rounded-[10px]",
      antennaHeight: "h-2",
      bulb: "w-1.5 h-1.5 -top-2",
      earWidth: "w-0.5 h-2.5",
      earLight: "w-0.5 h-1",
      visor: "w-[22px] h-[16px] rounded-[7px]",
      eye: "w-1 h-1.5",
      eyeGap: "gap-1",
      cheek: "w-1 h-0.5 bottom-0.5",
      mouth: "w-1.5 h-0.5 bottom-0.5",
    },
  }[size];

  const effectiveHappy = isHappy || isHovered;

  return (
    <div
      ref={botRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: 600 }}
      className={`relative select-none flex items-center justify-center ${dimensions.container} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <motion.div
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        whileHover={onClick ? { scale: 1.08 } : undefined}
        whileTap={onClick ? { scale: 0.92, rotate: -3 } : undefined}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="relative flex items-center justify-center"
      >
        {/* Antenna */}
        <motion.div
          style={{ rotate: interactive ? antennaTilt : 0 }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
        >
          {/* Glowing Orb Bulb */}
          <div
            className={`relative rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-emerald-300 shadow-[0_0_10px_rgba(6,182,212,0.9),0_0_20px_rgba(6,182,212,0.4)] ${
              dimensions.bulb
            } ${isTyping ? "animate-pulse" : ""}`}
          >
            <span
              className={`absolute inset-0 rounded-full bg-cyan-400 opacity-60 ${
                isTyping ? "animate-ping" : "animate-pulse"
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
          <div
            className={`rounded-full bg-cyan-400 shadow-[0_0_4px_#06b6d4] ${dimensions.earLight}`}
          />
        </div>

        {/* Right Ear Audio Pod */}
        <div
          className={`absolute -right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-l from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-700 shadow-sm border-r border-white/70 dark:border-zinc-600 flex items-center justify-center ${dimensions.earWidth}`}
        >
          <div
            className={`rounded-full bg-cyan-400 shadow-[0_0_4px_#06b6d4] ${dimensions.earLight}`}
          />
        </div>

        {/* Main 3D Robot Head (Glossy Ceramic / Space Grey Titanium) */}
        <div
          className={`relative flex items-center justify-center bg-gradient-to-b from-white via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950 border border-white/80 dark:border-zinc-700/60 shadow-[0_12px_28px_rgba(0,0,0,0.18),0_2px_4px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.3),inset_0_1.5px_2px_rgba(255,255,255,0.18),inset_0_-3px_6px_rgba(0,0,0,0.5)] ${dimensions.head}`}
        >
          {/* Specular Rim Light Gradient across the top dome */}
          <div className="absolute top-0 inset-x-2 h-[35%] bg-gradient-to-b from-white/60 dark:from-white/15 to-transparent rounded-t-[18px] pointer-events-none" />

          {/* Curved Face Visor (Black Obsidian Glass) */}
          <div
            className={`relative overflow-hidden bg-gradient-to-b from-zinc-950 via-black to-zinc-900 border border-zinc-800/80 shadow-[inset_0_2px_5px_rgba(0,0,0,0.9),0_1px_2px_rgba(255,255,255,0.12)] flex flex-col items-center justify-center ${dimensions.visor}`}
          >
            {/* Glossy Reflection Arc */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[12px] pointer-events-none" />

            {/* Expressive LED Eyes Container */}
            <div className={`relative flex items-center ${dimensions.eyeGap} z-10`}>
              {/* Left Eye */}
              <div className="relative flex items-center justify-center">
                {effectiveHappy ? (
                  <svg
                    viewBox="0 0 16 10"
                    className="w-3.5 h-2.5 text-cyan-400 fill-none stroke-current stroke-[2.5] stroke-linecap-round filter drop-shadow-[0_0_4px_#06b6d4]"
                  >
                    <path d="M 2 8 Q 8 1 14 8" />
                  </svg>
                ) : (
                  <motion.div
                    style={{
                      x: interactive ? eyeX : 0,
                      y: interactive ? eyeY : 0,
                    }}
                    animate={{ scaleY: isBlinking ? 0.12 : 1 }}
                    transition={{ duration: 0.12 }}
                    className={`relative rounded-full bg-gradient-to-b from-cyan-300 via-cyan-400 to-sky-500 shadow-[0_0_8px_#06b6d4,0_0_14px_rgba(6,182,212,0.6)] flex items-start justify-end p-0.5 ${dimensions.eye}`}
                  >
                    {/* Cute Pupil Specular Dot */}
                    <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_2px_#fff]" />
                  </motion.div>
                )}
              </div>

              {/* Right Eye */}
              <div className="relative flex items-center justify-center">
                {effectiveHappy ? (
                  <svg
                    viewBox="0 0 16 10"
                    className="w-3.5 h-2.5 text-cyan-400 fill-none stroke-current stroke-[2.5] stroke-linecap-round filter drop-shadow-[0_0_4px_#06b6d4]"
                  >
                    <path d="M 2 8 Q 8 1 14 8" />
                  </svg>
                ) : (
                  <motion.div
                    style={{
                      x: interactive ? eyeX : 0,
                      y: interactive ? eyeY : 0,
                    }}
                    animate={{ scaleY: isBlinking ? 0.12 : 1 }}
                    transition={{ duration: 0.12 }}
                    className={`relative rounded-full bg-gradient-to-b from-cyan-300 via-cyan-400 to-sky-500 shadow-[0_0_8px_#06b6d4,0_0_14px_rgba(6,182,212,0.6)] flex items-start justify-end p-0.5 ${dimensions.eye}`}
                  >
                    {/* Cute Pupil Specular Dot */}
                    <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_2px_#fff]" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Blushing Cheeks (Light up on hover / happy) */}
            <div className="absolute inset-x-2 bottom-1.5 flex justify-between pointer-events-none">
              <div
                className={`rounded-full bg-pink-400/40 blur-[0.8px] transition-opacity duration-300 ${
                  effectiveHappy ? "opacity-100 bg-pink-400/80" : "opacity-40"
                } ${dimensions.cheek}`}
              />
              <div
                className={`rounded-full bg-pink-400/40 blur-[0.8px] transition-opacity duration-300 ${
                  effectiveHappy ? "opacity-100 bg-pink-400/80" : "opacity-40"
                } ${dimensions.cheek}`}
              />
            </div>

            {/* Digital Wave Mouth when Typing / Speaking */}
            {isTyping && (
              <motion.div
                animate={{ scaleX: [0.6, 1.2, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4] ${dimensions.mouth}`}
              />
            )}
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
      } else {
        // Bypass strict closure inference
        let bestRule: any = null;
        let highestScore = 0;

        // Scoring algorithm to find the BEST match
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
  };

  return (
    <>
      {/* =============================================================== */}
      {/* 🌟 FLOATING 3D CUTE BOT TRIGGER (Bottom Right) */}
      {/* =============================================================== */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
        }`}
      >
        {/* Apple-style Frosted Speech Bubble Pill */}
        <AnimatePresence>
          {showSpeechBubble && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              onClick={() => setIsOpen(true)}
              className="absolute bottom-full right-0 mb-3 cursor-pointer group select-none"
            >
              <div className="relative px-3.5 py-2 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-white/60 dark:border-zinc-700/60 shadow-[0_8px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)] flex items-center gap-2 transition-transform duration-200 group-hover:scale-[1.03]">
                {/* Live Activity Pulse */}
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>

                {/* Animated Speech Text */}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={speechPromptIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 whitespace-nowrap"
                  >
                    {SPEECH_PROMPTS[speechPromptIndex]}
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
            animate={{ y: [0, -7, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            className="relative"
          >
            <CuteBotAvatar
              size="lg"
              interactive={true}
              onClick={() => setIsOpen(true)}
            />
          </motion.div>

          {/* Dynamic Breathing Ground Shadow */}
          <motion.div
            animate={{ scale: [1, 0.8, 1], opacity: [0.35, 0.18, 0.35] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            className="w-11 h-2 rounded-[100%] bg-zinc-950/20 dark:bg-black/50 blur-[3px] pointer-events-none -mt-1"
          />
        </div>
      </div>

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
