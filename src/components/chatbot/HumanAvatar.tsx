"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

export type AvatarEmotion =
  | "neutral" | "happy" | "excited" | "thinking" | "confused" | "sad" | "surprised" | "sleepy" | "annoyed";

// Facial feature geometry per emotion (viewBox 0 0 120 120; eyes at x=51 / 69, y=67).
const BROWS: Record<AvatarEmotion, [string, string]> = {
  neutral: ["M45 60 Q50 57.5 56 59", "M64 59 Q70 57.5 75 60"],
  happy: ["M45 58.5 Q50 55 56 57.5", "M64 57.5 Q70 55 75 58.5"],
  excited: ["M45 56.5 Q50 52 56 55.5", "M64 55.5 Q70 52 75 56.5"],
  thinking: ["M45 59.5 Q50 58 56 58.5", "M64 56.5 Q70 53 75 56.5"],
  confused: ["M45 57.5 Q50 53 56 56.5", "M64 60.5 Q70 60.5 75 61.5"],
  sad: ["M45 60.5 Q51 59.5 56 56.5", "M64 56.5 Q69 59.5 75 60.5"],
  surprised: ["M45 55.5 Q50 50 56 54.5", "M64 54.5 Q70 50 75 55.5"],
  sleepy: ["M45 61.5 Q50 60.5 56 61.5", "M64 61.5 Q70 60.5 75 61.5"],
  annoyed: ["M45 57.5 Q51 59.5 56 61.5", "M64 61.5 Q69 59.5 75 57.5"],
};

const MOUTHS: Record<AvatarEmotion, { d: string; open?: boolean }> = {
  neutral: { d: "M54 84 Q60 86.5 66 84" },
  happy: { d: "M51.5 82.5 Q60 92 68.5 82.5 Q60 85.5 51.5 82.5Z", open: true },
  excited: { d: "M50 81.5 Q60 96 70 81.5 Q60 85 50 81.5Z", open: true },
  thinking: { d: "M55 85.5 Q61 84.5 66 83.5" },
  confused: { d: "M52.5 85.5 Q56 83.5 59.5 85.5 T66.5 84.5" },
  sad: { d: "M53.5 87.5 Q60 82 66.5 87.5" },
  surprised: { d: "M60 81.5 a3.4 4.4 0 1 0 0.01 0Z", open: true },
  sleepy: { d: "M56 85.5 Q60 87 64 85.5" },
  annoyed: { d: "M54.5 86 L65.5 85.3" },
};

// Expressions drawn with curved closed eyes instead of open ones.
const CLOSED_EYES: Partial<Record<AvatarEmotion, string>> = {
  happy: "Q4 -4 8 0",
  excited: "Q4 -4.6 8 0",
  sleepy: "Q4 2.6 8 0",
};

const HAIR = "#1F140E";

/**
 * Semi-realistic 3D-rendered assistant. Volumetric studio lighting (warm key
 * light upper-left, cyan rim light right), ambient occlusion and glossy eyes.
 * The face shifts against the head (parallax) and the whole bust rotates in
 * CSS 3D, so the head visibly turns toward the pointer — and gently looks
 * around on its own when the pointer is idle. Blinks at random intervals and
 * swaps brows/eyes/mouth per `emotion`.
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
  const gx = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const gy = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  // Head turn: whole bust rotates, face slides further than the skull (parallax).
  const rotY = useTransform(gx, (v) => v * 7);
  const rotX = useTransform(gy, (v) => -v * 5);
  const faceX = useTransform(gx, (v) => v * 1.4);
  const faceY = useTransform(gy, (v) => v * 0.9);
  const hairX = useTransform(gx, (v) => v * 0.5);
  const [blink, setBlink] = useState(false);

  // Gaze: follow the pointer, wander when idle, look up-and-aside while "thinking".
  useEffect(() => {
    if (emotion === "thinking") {
      gx.set(2);
      gy.set(-2.2);
      return;
    }
    if (reduceMotion) {
      gx.set(0);
      gy.set(0);
      return;
    }
    let lastMove = 0;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      lastMove = Date.now();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.55);
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 220);
      gx.set((dx / dist) * 2.4 * reach);
      gy.set((dy / dist) * 2.2 * reach);
    };
    // Idle wander so the 3D turn is visible even without a pointer (touch, small avatars).
    const wander = setInterval(() => {
      if (Date.now() - lastMove < 2500) return;
      gx.set((Math.random() * 2 - 1) * 2);
      gy.set((Math.random() * 2 - 1) * 1.2);
    }, 2200);
    if (track) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearInterval(wander);
      window.removeEventListener("pointermove", onMove);
    };
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
  const eyeRy = emotion === "surprised" ? 4.6 : 3.7;
  const bob =
    reduceMotion ? {} :
    emotion === "excited" ? { y: [0, -3, 0] } :
    emotion === "sad" ? { y: 1.5 } :
    emotion === "sleepy" ? { y: [1, 2, 1], rotate: [0, 3, 0] } :
    { y: [0, -1, 0] };

  const g = (name: string) => `url(#${uid}-${name})`;

  const eye = (cx: number) =>
    closed ? (
      <path d={`M${cx - 4} 67.5 ${closed}`} stroke={HAIR} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    ) : (
      <g style={{ transformOrigin: `${cx}px 67px`, transform: `scaleY(${blink ? 0.08 : 1})`, transition: "transform 70ms" }}>
        {/* Eye socket shading */}
        <ellipse cx={cx} cy="66.2" rx="6.4" ry={eyeRy + 2} fill="#8A5234" opacity="0.18" />
        <ellipse cx={cx} cy="67" rx="4.6" ry={eyeRy} fill={g("sclera")} />
        <motion.g style={{ x: gx, y: gy }}>
          <circle cx={cx} cy="67" r="2.7" fill={g("iris")} />
          <circle cx={cx} cy="67" r="1.25" fill="#050302" />
          <circle cx={cx + 1} cy="65.9" r="0.85" fill="#fff" />
          <circle cx={cx - 0.9} cy="68" r="0.35" fill="#fff" opacity="0.7" />
        </motion.g>
        {/* Upper lid with lash line, lower lid crease */}
        <path d={`M${cx - 4.8} 67 Q${cx} ${67 - eyeRy - 1.4} ${cx + 4.8} 67`} stroke={HAIR} strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d={`M${cx - 4.6} 66.4 Q${cx} ${67 - eyeRy - 3.4} ${cx + 4.6} 66.4`} stroke="#9A5E3C" strokeOpacity="0.45" strokeWidth="0.8" fill="none" />
        <path d={`M${cx - 3.6} ${67 + eyeRy + 0.6} Q${cx} ${67 + eyeRy + 1.8} ${cx + 3.6} ${67 + eyeRy + 0.6}`} stroke="#9A5E3C" strokeOpacity="0.35" strokeWidth="0.7" fill="none" />
      </g>
    );

  return (
    <motion.div
      className={`inline-block rounded-full ${className}`}
      style={{ width: size, height: size, transformPerspective: 220, rotateX: rotX, rotateY: rotY }}
    >
      <svg
        ref={ref}
        viewBox="0 0 120 120"
        width={size}
        height={size}
        role="img"
        aria-label={`Assistant avatar, ${emotion}`}
        style={{ filter: "drop-shadow(0 4px 8px rgba(15,23,42,0.45))", display: "block" }}
      >
        <defs>
          {/* Studio backdrop */}
          <radialGradient id={`${uid}-bg`} cx="0.3" cy="0.22" r="0.95">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="45%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </radialGradient>
          {/* Skin: key light upper-left, falloff to shadow lower-right */}
          <radialGradient id={`${uid}-skin`} cx="0.36" cy="0.3" r="0.85">
            <stop offset="0%" stopColor="#FFE3CC" />
            <stop offset="35%" stopColor="#F2C09A" />
            <stop offset="75%" stopColor="#C98A60" />
            <stop offset="100%" stopColor="#8E5636" />
          </radialGradient>
          <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="70%" stopColor="#67E8F9" stopOpacity="0" />
            <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.75" />
          </linearGradient>
          <radialGradient id={`${uid}-ear`} cx="0.45" cy="0.4" r="0.7">
            <stop offset="0%" stopColor="#E9B089" />
            <stop offset="100%" stopColor="#8E5636" />
          </radialGradient>
          <linearGradient id={`${uid}-neck`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A452A" />
            <stop offset="60%" stopColor="#B87A52" />
            <stop offset="100%" stopColor="#D49A70" />
          </linearGradient>
          <linearGradient id={`${uid}-hair`} x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stopColor="#6B4A36" />
            <stop offset="35%" stopColor="#2E1E15" />
            <stop offset="100%" stopColor="#0A0604" />
          </linearGradient>
          <radialGradient id={`${uid}-shirt`} cx="0.3" cy="0.15" r="1">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <radialGradient id={`${uid}-iris`} cx="0.4" cy="0.35" r="0.7">
            <stop offset="0%" stopColor="#9B6A45" />
            <stop offset="65%" stopColor="#4A2E1C" />
            <stop offset="100%" stopColor="#1A0F08" />
          </radialGradient>
          <radialGradient id={`${uid}-sclera`} cx="0.45" cy="0.4" r="0.65">
            <stop offset="60%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#CDBFB5" />
          </radialGradient>
          <linearGradient id={`${uid}-lip`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B4624D" />
            <stop offset="100%" stopColor="#8C4535" />
          </linearGradient>
          <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="45%" stopColor="#334155" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <radialGradient id={`${uid}-gloss`} cx="0.3" cy="0.15" r="0.5">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-vignette`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="75%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
          </radialGradient>
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <clipPath id={`${uid}-clip`}>
            <circle cx="60" cy="60" r="60" />
          </clipPath>
          <clipPath id={`${uid}-face`}>
            <path d="M38 64 Q38 41 60 40 Q82 41 82 64 Q82 80 74 88 Q67 94 60 94 Q53 94 46 88 Q38 80 38 64Z" />
          </clipPath>
        </defs>
        <g clipPath={g("clip")}>
          <circle cx="60" cy="60" r="60" fill={g("bg")} />
          <motion.g
            animate={bob}
            transition={{ duration: emotion === "excited" ? 0.6 : 4, repeat: emotion === "sad" ? 0 : Infinity, ease: "easeInOut" }}
          >
            {/* Shoulders, shirt and collar */}
            <path d="M22 122 Q24 99 60 96 Q96 99 98 122Z" fill={g("shirt")} />
            <path d="M22 122 Q24 99 60 96 Q96 99 98 122Z" fill={g("rim")} opacity="0.6" />
            <path d="M51 97 L60 108 L69 97" stroke="#38BDF8" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
            {/* Neck with cast shadow from the jaw */}
            <path d="M52 84 L52 99 Q60 103 68 99 L68 84Z" fill={g("neck")} />
            <ellipse cx="60" cy="90" rx="10" ry="4" fill="#4A2616" opacity="0.45" filter={g("soft")} />
            {/* Ears */}
            <ellipse cx="38.5" cy="68" rx="4" ry="5.5" fill={g("ear")} />
            <ellipse cx="81.5" cy="68" rx="4" ry="5.5" fill={g("ear")} />
            <path d="M37.5 65.5 Q36 68 38 71" stroke="#7A452A" strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M82.5 65.5 Q84 68 82 71" stroke="#7A452A" strokeWidth="1" fill="none" opacity="0.6" />
            {/* Head with jawline */}
            <path d="M38 64 Q38 41 60 40 Q82 41 82 64 Q82 80 74 88 Q67 94 60 94 Q53 94 46 88 Q38 80 38 64Z" fill={g("skin")} />
            <g clipPath={g("face")}>
              {/* Rim light along the right cheek */}
              <rect x="38" y="40" width="44" height="54" fill={g("rim")} />
              {/* Ambient occlusion under the hairline and at the jaw */}
              <ellipse cx="60" cy="49" rx="22" ry="6" fill="#6E3B22" opacity="0.35" filter={g("soft")} />
              <ellipse cx="66" cy="92" rx="18" ry="5" fill="#6E3B22" opacity="0.3" filter={g("soft")} />
              {/* Moving facial features (parallax head-turn) */}
              <motion.g style={{ x: faceX, y: faceY }}>
                {/* Cheekbone highlight */}
                <ellipse cx="48" cy="75" rx="5" ry="3" fill="#fff" opacity="0.18" filter={g("soft")} />
                {/* Brows */}
                <motion.path d={browL} initial={false} animate={{ d: browL }} transition={{ duration: 0.25 }} stroke={HAIR} strokeWidth="2.3" strokeLinecap="round" fill="none" />
                <motion.path d={browR} initial={false} animate={{ d: browR }} transition={{ duration: 0.25 }} stroke={HAIR} strokeWidth="2.3" strokeLinecap="round" fill="none" />
                {/* Eyes */}
                {eye(51)}
                {eye(69)}
                {/* Nose: bridge shadow, tip highlight, nostrils */}
                <path d="M61.5 68 Q63 74 62.5 77.5" stroke="#9A5E3C" strokeOpacity="0.55" strokeWidth="1.4" fill="none" strokeLinecap="round" filter={g("soft")} />
                <ellipse cx="59.5" cy="72" rx="1" ry="3.2" fill="#fff" opacity="0.4" />
                <ellipse cx="60" cy="77.2" rx="3.6" ry="2.2" fill="#E6A57E" />
                <ellipse cx="59.4" cy="76.6" rx="1.3" ry="0.8" fill="#fff" opacity="0.45" />
                <ellipse cx="57.6" cy="78.3" rx="0.9" ry="0.55" fill="#5C2E1C" opacity="0.7" />
                <ellipse cx="62.4" cy="78.3" rx="0.9" ry="0.55" fill="#5C2E1C" opacity="0.7" />
                {/* Blush */}
                <motion.g animate={{ opacity: emotion === "happy" || emotion === "excited" ? 0.35 : 0.08 }}>
                  <ellipse cx="46" cy="78" rx="4.5" ry="2.8" fill="#F87171" filter={g("soft")} />
                  <ellipse cx="74" cy="78" rx="4.5" ry="2.8" fill="#F87171" filter={g("soft")} />
                </motion.g>
                {/* Mouth */}
                <motion.g
                  key={emotion}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ transformOrigin: "60px 85px" }}
                >
                  {mouth.open ? (
                    <>
                      <path d={mouth.d} fill="#3B0F0A" stroke={g("lip")} strokeWidth="1.4" strokeLinejoin="round" />
                      {emotion !== "surprised" && <path d="M53.5 83.4 Q60 85.4 66.5 83.4 L66 84.6 Q60 86.4 54 84.6Z" fill="#F8F4EE" />}
                    </>
                  ) : (
                    <path d={mouth.d} stroke={g("lip")} strokeWidth="2.4" strokeLinecap="round" fill="none" />
                  )}
                  {/* Lower-lip highlight */}
                  <ellipse cx="60" cy="88.6" rx="3" ry="0.8" fill="#fff" opacity="0.18" />
                </motion.g>
              </motion.g>
            </g>
            {/* Hair: volumetric mass with strand highlights */}
            <motion.g style={{ x: hairX }}>
              <path d="M36.5 66 Q31 36 60 34 Q89 36 83.5 66 Q82 50 72 46 Q64 52 54 48 Q42 50 36.5 66Z" fill={g("hair")} />
              <path d="M52 48 Q56 39 68 40 Q61 43 59 49Z" fill={g("hair")} />
              <path d="M42 46 Q50 37 62 37" stroke="#A27B5F" strokeOpacity="0.7" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              <path d="M45 50 Q52 42 60 41" stroke="#A27B5F" strokeOpacity="0.4" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M78 44 Q83 52 82.5 62" stroke="#67E8F9" strokeOpacity="0.5" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </motion.g>
            {/* Headset */}
            <path d="M34 63 Q33 30 60 29.5 Q87 30 86 63" stroke={g("metal")} strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <rect x="30" y="59" width="8" height="14" rx="4" fill={g("metal")} />
            <rect x="82" y="59" width="8" height="14" rx="4" fill={g("metal")} />
            <rect x="31.2" y="60.5" width="2" height="9" rx="1" fill="#fff" opacity="0.35" />
            <path d="M86 70 Q87 86 72 88" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="71.5" cy="88" r="2.5" fill="#38BDF8" />
            <circle cx="70.8" cy="87.3" r="0.9" fill="#fff" opacity="0.85" />
            {/* Extras */}
            {emotion === "sad" && (
              <motion.path
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: [0, 1, 1, 0], y: [-2, 0, 5, 9] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                d="M47 72 q-2 3.5 0 5 q2 -1.5 0 -5"
                fill="#60A5FA"
              />
            )}
            {emotion === "confused" && <path d="M80 47 q-2.4 4 0 5.6 q2.4 -1.6 0 -5.6" fill="#93C5FD" />}
            {emotion === "annoyed" && (
              <path d="M77 44 l3 3 m0 -3 l-3 3 M82 42 l2 2" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </motion.g>
          {emotion === "sleepy" && (
            <motion.text
              x="86" y="32" fontSize="11" fontWeight="800" fill="#fff"
              animate={{ opacity: [0, 1, 0], y: [34, 26, 20] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              z
            </motion.text>
          )}
          {emotion === "thinking" && (
            <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <circle cx="90" cy="38" r="2" fill="#fff" />
              <circle cx="96" cy="31" r="2.6" fill="#fff" />
              <circle cx="103" cy="23" r="3.2" fill="#fff" />
            </motion.g>
          )}
          {/* Lens vignette + specular gloss over the sphere */}
          <circle cx="60" cy="60" r="60" fill={g("vignette")} pointerEvents="none" />
          <circle cx="60" cy="60" r="60" fill={g("gloss")} pointerEvents="none" />
        </g>
      </svg>
    </motion.div>
  );
}
