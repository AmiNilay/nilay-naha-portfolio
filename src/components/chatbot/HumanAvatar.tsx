"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export type AvatarEmotion =
  | "neutral" | "happy" | "excited" | "thinking" | "confused" | "sad" | "surprised" | "sleepy" | "annoyed";

// Facial feature geometry per emotion (viewBox 0 0 120 120; eyes at x=50.5 / 69.5, y=68).
const BROWS: Record<AvatarEmotion, [string, string]> = {
  neutral: ["M45 61 Q50 58 56 60", "M64 60 Q70 58 75 61"],
  happy: ["M45 59 Q50 55 56 58", "M64 58 Q70 55 75 59"],
  excited: ["M45 57 Q50 52 56 56", "M64 56 Q70 52 75 57"],
  thinking: ["M45 60 Q50 58 56 59", "M64 57 Q70 53 75 57"],
  confused: ["M45 58 Q50 53 56 57", "M64 61 Q70 61 75 62"],
  sad: ["M45 61 Q51 60 56 57", "M64 57 Q69 60 75 61"],
  surprised: ["M45 56 Q50 50 56 55", "M64 55 Q70 50 75 56"],
  sleepy: ["M45 62 Q50 61 56 62", "M64 62 Q70 61 75 62"],
  annoyed: ["M45 58 Q51 60 56 62", "M64 62 Q69 60 75 58"],
};

const MOUTHS: Record<AvatarEmotion, { d: string; filled?: boolean }> = {
  neutral: { d: "M53 84 Q60 88.5 67 84" },
  happy: { d: "M50 82 Q60 95 70 82 Q60 87 50 82Z", filled: true },
  excited: { d: "M48 80 Q60 99 72 80 Q60 86 48 80Z", filled: true },
  thinking: { d: "M54 86 Q61 84.5 67 83.5" },
  confused: { d: "M51 86 Q55 83 59 86 T67 85" },
  sad: { d: "M52 88.5 Q60 81 68 88.5" },
  surprised: { d: "M60 81.5 a4 5 0 1 0 0.01 0Z", filled: true },
  sleepy: { d: "M55 86 Q60 88 65 86" },
  annoyed: { d: "M53 87 L67 86" },
};

// Expressions drawn with curved closed eyes instead of open ones.
const CLOSED_EYES: Partial<Record<AvatarEmotion, string>> = {
  happy: "Q4.5 -5 9 0",
  excited: "Q4.5 -5.5 9 0",
  sleepy: "Q4.5 3 9 0",
};

const SKIN = "#F2C6A0";
const SKIN_SHADE = "#E3AE86";
const HAIR = "#2A1B14";

/**
 * Friendly illustrated assistant. Pupils follow the pointer (when `track`),
 * blinks at random intervals, and swaps brows/eyes/mouth per `emotion`.
 */
export default function HumanAvatar({
  emotion = "neutral",
  size = 56,
  track = true,
  className = "",
}: {
  emotion?: AvatarEmotion;
  size?: number;
  track?: boolean;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduceMotion = useReducedMotion();
  const gx = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const gy = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const [blink, setBlink] = useState(false);

  // Gaze: follow the pointer, or look up-and-aside while "thinking".
  useEffect(() => {
    if (emotion === "thinking") {
      gx.set(2.2);
      gy.set(-2.4);
      return;
    }
    if (!track || reduceMotion) {
      gx.set(0);
      gy.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.55);
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 220);
      gx.set((dx / dist) * 2.4 * reach);
      gy.set((dy / dist) * 2.2 * reach);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [track, emotion, reduceMotion, gx, gy]);

  // Natural blinking every 2.5–6 s.
  useEffect(() => {
    if (reduceMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        schedule();
      }, 2500 + Math.random() * 3500);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  const closed = CLOSED_EYES[emotion];
  const mouth = MOUTHS[emotion];
  const [browL, browR] = BROWS[emotion];
  const eyeRy = emotion === "surprised" ? 6.4 : 5.4;
  const bob =
    reduceMotion ? {} :
    emotion === "excited" ? { y: [0, -3, 0] } :
    emotion === "sad" ? { y: 1.5 } :
    emotion === "sleepy" ? { y: [1, 2, 1], rotate: [0, 3, 0] } :
    { y: [0, -1.2, 0] };

  const eye = (cx: number) =>
    closed ? (
      <path d={`M${cx - 4.5} 68.5 ${closed}`} stroke={HAIR} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    ) : (
      <g style={{ transformOrigin: `${cx}px 68px`, transform: `scaleY(${blink ? 0.08 : 1})`, transition: "transform 70ms" }}>
        <ellipse cx={cx} cy="68" rx="5" ry={eyeRy} fill="#fff" />
        <motion.g style={{ x: gx, y: gy }}>
          <circle cx={cx} cy="68" r="3.3" fill="#4A3426" />
          <circle cx={cx} cy="68" r="1.7" fill="#120B07" />
          <circle cx={cx + 1.1} cy="66.8" r="0.9" fill="#fff" />
        </motion.g>
      </g>
    );

  return (
    <svg
      ref={ref}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Assistant avatar, ${emotion}`}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}-clip)`}>
        <circle cx="60" cy="60" r="60" fill={`url(#${uid}-bg)`} />
        <motion.g
          animate={bob}
          transition={{ duration: emotion === "excited" ? 0.6 : 4, repeat: emotion === "sad" ? 0 : Infinity, ease: "easeInOut" }}
        >
          {/* Shoulders & shirt */}
          <path d="M26 122 Q28 98 60 95 Q92 98 94 122Z" fill="#1E293B" />
          <path d="M53 96.5 L60 105 L67 96.5" stroke="#38BDF8" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <rect x="54" y="86" width="12" height="11" rx="4" fill={SKIN_SHADE} />
          {/* Ears & head */}
          <circle cx="38.5" cy="69" r="4.5" fill={SKIN_SHADE} />
          <circle cx="81.5" cy="69" r="4.5" fill={SKIN_SHADE} />
          <ellipse cx="60" cy="66" rx="22" ry="25" fill={SKIN} />
          {/* Hair */}
          <path d="M37.5 66 Q34 39 60 37 Q86 39 82.5 66 Q81 52 72 48.5 Q65 54 55 50 Q44 51 37.5 66Z" fill={HAIR} />
          <path d="M55 50 Q58 43 66 44 Q61 46 60 51Z" fill={HAIR} />
          {/* Headset */}
          <path d="M35 64 Q34 33 60 32.5 Q86 33 85 64" stroke="#0F172A" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <rect x="31.5" y="60" width="7" height="13" rx="3.5" fill="#0F172A" />
          <rect x="81.5" y="60" width="7" height="13" rx="3.5" fill="#0F172A" />
          <path d="M85 70 Q86 86 71 88" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="70.5" cy="88" r="2.4" fill="#38BDF8" />
          {/* Brows */}
          <motion.path d={browL} initial={false} animate={{ d: browL }} transition={{ duration: 0.25 }} stroke={HAIR} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <motion.path d={browR} initial={false} animate={{ d: browR }} transition={{ duration: 0.25 }} stroke={HAIR} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          {/* Eyes */}
          {eye(50.5)}
          {eye(69.5)}
          {/* Nose */}
          <path d="M60 71 Q58 77 61 78" stroke={SKIN_SHADE} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <motion.g animate={{ opacity: emotion === "happy" || emotion === "excited" ? 0.55 : 0.12 }}>
            <circle cx="45" cy="78" r="4" fill="#F87171" />
            <circle cx="75" cy="78" r="4" fill="#F87171" />
          </motion.g>
          {/* Mouth */}
          <motion.path
            key={emotion}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ transformOrigin: "60px 85px" }}
            d={mouth.d}
            fill={mouth.filled ? "#7F2D2D" : "none"}
            stroke={mouth.filled ? "none" : "#5C2A1E"}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Extras */}
          {emotion === "sad" && (
            <motion.path
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: [0, 1, 1, 0], y: [-2, 0, 5, 9] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              d="M46.5 74 q-2 3.5 0 5 q2 -1.5 0 -5"
              fill="#60A5FA"
            />
          )}
          {emotion === "confused" && <path d="M80 49 q-2.4 4 0 5.6 q2.4 -1.6 0 -5.6" fill="#93C5FD" />}
          {emotion === "annoyed" && (
            <path d="M77 46 l3 3 m0 -3 l-3 3 M82 44 l2 2" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round" />
          )}
        </motion.g>
        {emotion === "sleepy" && (
          <motion.text
            x="84" y="34" fontSize="11" fontWeight="800" fill="#fff"
            animate={{ opacity: [0, 1, 0], y: [36, 28, 22] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            z
          </motion.text>
        )}
        {emotion === "thinking" && (
          <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
            <circle cx="88" cy="40" r="2" fill="#fff" />
            <circle cx="94" cy="33" r="2.6" fill="#fff" />
            <circle cx="101" cy="25" r="3.2" fill="#fff" />
          </motion.g>
        )}
      </g>
    </svg>
  );
}
