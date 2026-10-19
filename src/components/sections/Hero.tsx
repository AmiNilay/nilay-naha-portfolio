"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Download, Loader2, FileX } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
  MotionValue,
} from "framer-motion";

// ─── Tech Logo Resolver ────────────────────────────────────────────────────────
const getTechLogo = (tech: string): string | null => {
  const t = tech.toLowerCase();
  const icons: Record<string, string> = {
    python: "python/python-original",
    fastapi: "fastapi/fastapi-original",
    docker: "docker/docker-original",
    postgres: "postgresql/postgresql-original",
    mongo: "mongodb/mongodb-original",
    node: "nodejs/nodejs-original",
    react: "react/react-original",
    next: "nextjs/nextjs-original",
    aws: "amazonwebservices/amazonwebservices-original-wordmark",
    linux: "linux/linux-original",
    ubuntu: "linux/linux-original",
    git: "git/git-original",
  };
  for (const [key, path] of Object.entries(icons)) {
    if (t.includes(key))
      return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}.svg`;
  }
  return null;
};

// ─── Apple critically-damped spring presets ────────────────────────────────────
const SPRING      = { type: "spring", bounce: 0, duration: 0.55 } as const;
const SPRING_FAST = { type: "spring", bounce: 0, duration: 0.35 } as const;

// ─── Stagger fade-up helper ────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { ...SPRING, delay },
});

// ─── TiltCard — isolated 3D avatar component ──────────────────────────────────
// Keeping it as its own component so all hooks run at top-level unconditionally.
function TiltCard({
  profileSrc,
  onImgError,
  shouldReduce,
  glowX,
  glowY,
}: {
  profileSrc: string | null;
  onImgError: () => void;
  shouldReduce: boolean | null;
  glowX: MotionValue<number>;
  glowY: MotionValue<number>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Local motion values — track mouse relative to THIS card
  const lx = useMotionValue(0);   // -1 … +1
  const ly = useMotionValue(0);
  const sx = useSpring(lx, { damping: 20, stiffness: 200 });
  const sy = useSpring(ly, { damping: 20, stiffness: 200 });

  // Map springs → 3D rotation (±18° Y, ±14° X)
  const rotY  = useTransform(sx, [-1, 1], shouldReduce ? [0, 0] : [-18, 18]);
  const rotX  = useTransform(sy, [-1, 1], shouldReduce ? [0, 0] : [14, -14]);
  // Slight xy shift for extra physicality
  const tx    = useTransform(sx, [-1, 1], shouldReduce ? [0, 0] : [-5, 5]);
  const ty    = useTransform(sy, [-1, 1], shouldReduce ? [0, 0] : [-5, 5]);
  // Sheen moves opposite to tilt (light-catching illusion)
  const shX   = useTransform(sx, [-1, 1], shouldReduce ? [0, 0] : [12, -12]);
  const shY   = useTransform(sy, [-1, 1], shouldReduce ? [0, 0] : [8,  -8]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    lx.set(((e.clientX - r.left) / r.width  - 0.5) * 2);
    ly.set(((e.clientY - r.top)  / r.height - 0.5) * 2);
  };
  const onLeave = () => { lx.set(0); ly.set(0); };

  return (
    // Perspective wrapper — must be a plain div, NOT the animated one
    <div style={{ perspective: 900 }} className="relative">
      {/* Ambient glow blob — drifts opposite to section-level mouse */}
      <motion.div
        aria-hidden
        style={{ x: glowX, y: glowY }}
        className="absolute -inset-16 -z-10 pointer-events-none"
      >
        <div className="w-full h-full rounded-full
          bg-gradient-to-tr from-[#0F766E]/25 via-violet-200/10 to-pink-100/10
          dark:from-[#F59E0B]/18 dark:via-violet-900/8 dark:to-pink-900/5
          blur-[90px] md:blur-[120px]"
        />
      </motion.div>

      {/* 3D tilt layer — this is what rotates */}
      <motion.div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileTap={shouldReduce ? {} : { scale: 0.97 }}
        style={{
          rotateX: rotX,
          rotateY: rotY,
          x: tx,
          y: ty,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative cursor-pointer"
      >
        {/* Avatar disc */}
        <div className="
          relative
          w-44 h-44 sm:w-60 sm:h-60 md:w-[300px] md:h-[300px] lg:w-[380px] lg:h-[380px] xl:w-[420px] xl:h-[420px]
          rounded-full overflow-hidden
          border-[3px] md:border-[5px] border-white dark:border-[#1C2333]
          shadow-[0_8px_40px_-8px_rgba(15,118,110,0.25),0_0_0_1px_rgba(15,118,110,0.12)]
          dark:shadow-[0_8px_40px_-8px_rgba(245,158,11,0.25),0_0_0_1px_rgba(245,158,11,0.12)]
          bg-[#F3F4F6] dark:bg-[#111827]
        ">
          {profileSrc ? (
            <Image
              src={profileSrc}
              alt="Profile"
              fill
              className="object-cover object-center pointer-events-none"
              priority
              unoptimized
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onError={onImgError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
              <svg viewBox="0 0 80 80" className="w-1/2 h-1/2 opacity-30" fill="currentColor">
                <circle cx="40" cy="30" r="16" />
                <ellipse cx="40" cy="68" rx="28" ry="18" />
              </svg>
            </div>
          )}

          {/* Glass sheen — moves opposite to tilt */}
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(155deg, rgba(255,255,255,0.22) 0%, transparent 55%)",
              x: shX,
              y: shY,
            }}
          />
        </div>

        {/* Pulsing invitation ring */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full border-2
            border-[#0F766E]/25 dark:border-[#F59E0B]/25
            pointer-events-none"
          animate={shouldReduce ? {} : { scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const [data, setData] = useState({
    badgeText: "", showAvailability: true, subtitle: "",
    profilePic: "", resumeUrl: "", gDriveProfilePic: "", gDriveResume: "",
    socialGithub: "", socialLinkedin: "", techStack: "",
    stat1Value: "", stat1Label: "", stat2Value: "", stat2Label: "",
    stat3Value: "", stat3Label: "", portfolioLastUpdated: "",
    line1Bold: "Build", line1Accent: "clean backends",
    line2Bold: "Ship",  line2Accent: "real products",
  });
  const [loading,  setLoading]  = useState(true);
  const [imgError, setImgError] = useState(false);

  const shouldReduce  = useReducedMotion();
  const containerRef  = useRef<HTMLDivElement>(null);

  // Section-level mouse → glow parallax
  const mouseX   = useMotionValue(0);
  const mouseY   = useMotionValue(0);
  const springX  = useSpring(mouseX, { damping: 22, stiffness: 200 });
  const springY  = useSpring(mouseY, { damping: 22, stiffness: 200 });
  const glowX    = useTransform(springX, [-0.5, 0.5], shouldReduce ? [0,0] : [30,-30]);
  const glowY    = useTransform(springY, [-0.5, 0.5], shouldReduce ? [0,0] : [20,-20]);

  // Manage scroll lock on hero if needed without breaking wheel or touch dispatch
  useEffect(() => {
    const prev = { body: document.body.style.overflow, html: document.documentElement.style.overflow };
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev.body;
      document.documentElement.style.overflow = prev.html;
    };
  }, []);

  // Fetch hero data
  useEffect(() => {
    fetch(`/api/hero?t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d) {
          setData(p => ({
            ...p, ...d,
            badgeText:       d.badgeText || d.badge || "",
            showAvailability: d.showAvailability !== false,
            line1Bold:  d.line1Bold  || "Build",
            line1Accent:d.line1Accent|| "clean backends",
            line2Bold:  d.line2Bold  || "Ship",
            line2Accent:d.line2Accent|| "real products",
          }));
          if (d.siteTitle && typeof document !== "undefined") {
            document.title = d.siteTitle;
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onMouseMove = (e: React.MouseEvent) => {
    if (shouldReduce || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width  - 0.5);
    mouseY.set((e.clientY - r.top)  / r.height - 0.5);
  };
  const onMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  if (loading) {
    return (
      <section className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0B0F14] z-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F766E] dark:text-[#F59E0B]" />
      </section>
    );
  }

  const techArray     = data.techStack ? data.techStack.split(",").map(t => t.trim()).filter(Boolean) : [];
  const finalResumeUrl = data.resumeUrl || data.gDriveResume;
  const profileSrc    = !imgError && (data.profilePic || data.gDriveProfilePic)
    ? (data.profilePic || data.gDriveProfilePic)
    : null;

  return (
    <section
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-[#0B0F14] overscroll-none"
    >
      {/* ── Ambient background glow ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#0F766E]/[0.07] dark:bg-transparent blur-[130px]" />
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-transparent dark:bg-[#F59E0B]/[0.05] blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Main two-column layout ── */}
      <div className="relative z-10 w-full max-w-[1380px] mx-auto px-5 sm:px-10 lg:px-16 flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12 h-full pb-16 pt-20">

        {/* LEFT: Text content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left min-w-0 w-full">

          {/* Availability badge */}
          <AnimatePresence>
            {data.badgeText && (
              <motion.div
                {...fadeUp(0.05)}
                className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border
                  border-[#0F766E]/20 bg-[#0F766E]/[0.06] dark:border-[#F59E0B]/20 dark:bg-[#F59E0B]/[0.06]
                  backdrop-blur-md"
              >
                {data.showAvailability && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                )}
                <span
                  className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#0F766E] dark:text-[#F59E0B]"
                  dangerouslySetInnerHTML={{ __html: data.badgeText }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Headline — Apple-style negative tracking at display sizes */}
          <motion.h1
            {...fadeUp(0.12)}
            className="text-[clamp(2rem,5.5vw,4.2rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-[#111827] dark:text-[#F9FAFB] w-full"
          >
            <span className="block">
              {data.line1Bold}{" "}
              <span className="text-[#0F766E] dark:text-[#F59E0B]">{data.line1Accent}</span>
            </span>
            <span className="block mt-1 md:mt-2">
              {data.line2Bold}{" "}
              <span className="text-[#0F766E] dark:text-[#F59E0B]">{data.line2Accent}</span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          {data.subtitle && (
            <motion.div
              {...fadeUp(0.22)}
              className="mt-4 md:mt-5 max-w-[540px] text-[15px] sm:text-[17px] leading-[1.65]
                text-[#374151] dark:text-[#9CA3AF] font-normal
                [&_p]:text-inherit [&_strong]:text-[#111827] [&_strong]:dark:text-white [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: data.subtitle }}
            />
          )}

          {/* CTA row */}
          <motion.div {...fadeUp(0.33)} className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-7 md:mt-9 w-full">
            {/* Primary */}
            <Link
              href="/projects"
              prefetch={true}
              onClick={(e) => {
                if (window.location.pathname === "/") {
                  e.preventDefault();
                  window.dispatchEvent(
                    new CustomEvent("portfolio-navigate-slide", {
                      detail: { slideIndex: 1 },
                    })
                  );
                }
              }}
              className="group inline-flex items-center justify-center gap-2
                px-5 py-3 md:px-6 md:py-3.5
                bg-[#111827] dark:bg-[#F59E0B]
                text-white dark:text-[#0B0F14]
                text-sm md:text-[15px] font-semibold rounded-full
                shadow-[0_2px_14px_rgba(15,118,110,0.2)] dark:shadow-[0_2px_14px_rgba(245,158,11,0.2)]
                hover:shadow-[0_4px_22px_rgba(15,118,110,0.38)] dark:hover:shadow-[0_4px_22px_rgba(245,158,11,0.38)]
                active:scale-95 hover:scale-[1.03]
                transition-all duration-150 ease-out will-change-transform cursor-pointer"
            >
              View Work
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            {/* Resume */}
            {finalResumeUrl ? (
              <a
                href={finalResumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2
                  px-5 py-3 md:px-6 md:py-3.5
                  bg-white/80 dark:bg-white/[0.05]
                  border border-[#E5E7EB] dark:border-white/10
                  text-[#111827] dark:text-[#F9FAFB]
                  text-sm md:text-[15px] font-semibold rounded-full backdrop-blur-sm
                  hover:bg-white dark:hover:bg-white/10
                  active:scale-[0.97] hover:scale-[1.02]
                  transition-all duration-[170ms] ease-out will-change-transform"
              >
                Résumé <Download className="w-4 h-4" />
              </a>
            ) : (
              <button disabled className="inline-flex items-center gap-2 px-5 py-3 md:px-6 md:py-3.5 border border-red-200/50 text-red-400/70 rounded-full cursor-not-allowed opacity-50 text-sm md:text-[15px]">
                No Résumé <FileX className="w-4 h-4" />
              </button>
            )}

            {/* Social icons */}
            <div className="flex items-center gap-2 md:ml-1">
              {data.socialGithub && (
                <Link href={data.socialGithub} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
                  className="p-2.5 md:p-3 rounded-full border border-[#E5E7EB] dark:border-white/10
                    bg-white/80 dark:bg-white/[0.05] backdrop-blur-sm
                    text-[#374151] dark:text-[#9CA3AF]
                    hover:text-[#111827] dark:hover:text-white hover:border-[#0F766E] dark:hover:border-[#F59E0B]
                    active:scale-95 hover:scale-105 transition-all duration-[150ms] ease-out will-change-transform"
                >
                  <Github className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                </Link>
              )}
              {data.socialLinkedin && (
                <Link href={data.socialLinkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                  className="p-2.5 md:p-3 rounded-full border border-[#E5E7EB] dark:border-white/10
                    bg-white/80 dark:bg-white/[0.05] backdrop-blur-sm
                    text-[#374151] dark:text-[#9CA3AF]
                    hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/40
                    active:scale-95 hover:scale-105 transition-all duration-[150ms] ease-out will-change-transform"
                >
                  <Linkedin className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                </Link>
              )}
            </div>
          </motion.div>

          {/* Stats bento */}
          {(data.stat1Value || data.stat2Value || data.stat3Value) && (
            <motion.div {...fadeUp(0.44)} className="grid grid-cols-3 gap-2 sm:gap-3 mt-8 md:mt-10 w-full max-w-[560px]">
              {[
                { val: data.stat1Value, label: data.stat1Label },
                { val: data.stat2Value, label: data.stat2Label },
                { val: data.stat3Value, label: data.stat3Label },
              ].filter(s => s.val).map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center
                  px-2 py-3.5 md:py-5
                  bg-white/70 dark:bg-white/[0.03]
                  border border-[#E5E7EB] dark:border-white/[0.08]
                  rounded-2xl backdrop-blur-sm
                  shadow-[0_1px_4px_rgba(0,0,0,0.04)]
                  hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]
                  hover:border-[#0F766E]/30 dark:hover:border-[#F59E0B]/30
                  transition-all duration-200">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-[#111827] dark:text-[#F9FAFB]">
                    {stat.val}
                  </span>
                  <span className="mt-1 text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Last updated */}
          {data.portfolioLastUpdated && (
            <motion.p
              {...fadeUp(0.52)}
              className="inline-flex items-center gap-1.5 mt-5 md:mt-6 text-[11px] font-medium text-[#6B7280]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {data.portfolioLastUpdated}
            </motion.p>
          )}
        </div>

        {/* RIGHT: Interactive 3D Avatar */}
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, scale: 0.9, filter: "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ ...SPRING, delay: 0.08 }}
          className="shrink-0 flex items-center justify-center order-1 md:order-2 mb-2 md:mb-0"
        >
          <TiltCard
            profileSrc={profileSrc}
            onImgError={() => setImgError(true)}
            shouldReduce={shouldReduce}
            glowX={glowX}
            glowY={glowY}
          />
        </motion.div>
      </div>

      {/* ── Tech Stack Marquee — CSS animation (bulletproof, always moves) ── */}
      {techArray.length > 0 && (
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_FAST, delay: 0.6 }}
          className="absolute bottom-0 left-0 w-full z-20
            border-t border-[#E5E7EB]/80 dark:border-white/[0.06]
            bg-white/75 dark:bg-[#0B0F14]/80
            backdrop-blur-xl
            py-2.5 sm:py-3 overflow-hidden"
        >
          {/* Fade-edge masks */}
          <div aria-hidden className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none bg-gradient-to-r from-white/95 dark:from-[#0B0F14]/95 to-transparent" />
          <div aria-hidden className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-white/95 dark:from-[#0B0F14]/95 to-transparent" />

          {/*
            Two identical strips A + B placed side-by-side inside the track.
            The .hero-marquee-track CSS class scrolls the whole thing to -50%
            of its own width (= exactly 1 strip width), then loops.
            This is reliable because:
              - width: max-content makes the element exactly as wide as both strips combined
              - translateX(-50%) = exactly -1 strip → seamless loop
              - Pure CSS so no JS/hydration timing issues
          */}
          <div className="hero-marquee-track">
            {/* Strip A */}
            {techArray.map((tech, i) => {
              const logo = getTechLogo(tech);
              return (
                <span key={`a-${i}`} className="inline-flex items-center">
                  <span className="inline-flex items-center gap-2 mx-7 md:mx-10 text-[11px] md:text-xs font-bold uppercase tracking-[0.14em] text-[#6B7280]">
                    {logo
                      ? <img src={logo} alt={tech} width={20} height={20} className="w-4 h-4 md:w-5 md:h-5 object-contain opacity-80" />
                      : <span className="text-[15px]">💻</span>
                    }
                    {tech}
                  </span>
                  <span aria-hidden className="w-1 h-1 rounded-full bg-[#D1D5DB] dark:bg-[#2D3748] shrink-0" />
                </span>
              );
            })}
            {/* Strip B — identical, gives the seamless loop */}
            {techArray.map((tech, i) => {
              const logo = getTechLogo(tech);
              return (
                <span key={`b-${i}`} className="inline-flex items-center">
                  <span className="inline-flex items-center gap-2 mx-7 md:mx-10 text-[11px] md:text-xs font-bold uppercase tracking-[0.14em] text-[#6B7280]">
                    {logo
                      ? <img src={logo} alt={tech} width={20} height={20} className="w-4 h-4 md:w-5 md:h-5 object-contain opacity-80" />
                      : <span className="text-[15px]">💻</span>
                    }
                    {tech}
                  </span>
                  <span aria-hidden className="w-1 h-1 rounded-full bg-[#D1D5DB] dark:bg-[#2D3748] shrink-0" />
                </span>
              );
            })}
          </div>
        </motion.div>
      )}
    </section>
  );
}
