"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Download, Loader2, FileX, Twitter, Mail } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Helper to get tech icons
const getTechIcon = (tech: string) => {
  const t = tech.toLowerCase();
  if (t.includes("python")) return "🐍";
  if (t.includes("fastapi")) return "⚡";
  if (t.includes("docker")) return "🐳";
  if (t.includes("postgres")) return "🐘";
  if (t.includes("mongo")) return "🍃";
  if (t.includes("node")) return "🟢";
  if (t.includes("react")) return "⚛️";
  if (t.includes("next")) return "▲";
  if (t.includes("aws")) return "☁️";
  if (t.includes("linux") || t.includes("ubuntu")) return "🐧";
  if (t.includes("git")) return "🐙";
  return "💻"; // fallback icon
};

export default function Hero() {
  const [data, setData] = useState({
    badge: "",
    title: "",
    subtitle: "",
    profilePic: "",
    resumeUrl: "",
    gDriveProfilePic: "", // ✅ G-Drive Fallback
    gDriveResume: "",     // ✅ G-Drive Fallback
    socialGithub: "",
    socialLinkedin: "",
    socialTwitter: "",
    socialEmail: "",
    techStack: "",
    stat1Value: "", stat1Label: "",
    stat2Value: "", stat2Label: "",
    stat3Value: "", stat3Label: "",
    portfolioLastUpdated: "",
  });

  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cursor parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const imageX = useTransform(springX, [-0.5, 0.5], [-20, 20]);
  const imageY = useTransform(springY, [-0.5, 0.5], [-20, 20]);

  const glowX = useTransform(springX, [-0.5, 0.5], [15, -15]);
  const glowY = useTransform(springY, [-0.5, 0.5], [15, -15]);

  // 🔥 BULLETPROOF SCROLL LOCK 🔥
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const preventScroll = (e: Event) => e.preventDefault();
    const preventKeyScroll = (e: KeyboardEvent) => {
      // ✅ CRITICAL FIX: Allow spacebar and typing if the user is inside an input or textarea!
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (keys.includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventKeyScroll, { passive: false });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventKeyScroll);
    };
  }, []);

  useEffect(() => {
    fetch(`/api/hero?timestamp=${Date.now()}`, {
      cache: "no-store",
      headers: { Pragma: "no-cache" },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData) {
          setData({
            badge: resData.badge || resData.tagline || "",
            title: resData.title || resData.headline || "",
            subtitle: resData.subtitle || resData.description || "",
            profilePic: resData.profilePic || resData.image || "",
            resumeUrl: resData.resumeUrl || "",
            gDriveProfilePic: resData.gDriveProfilePic || "",
            gDriveResume: resData.gDriveResume || "",
            socialGithub: resData.socialGithub || "",
            socialLinkedin: resData.socialLinkedin || "",
            socialTwitter: resData.socialTwitter || "",
            socialEmail: resData.socialEmail || "",
            techStack: resData.techStack || "",
            stat1Value: resData.stat1Value || "", stat1Label: resData.stat1Label || "",
            stat2Value: resData.stat2Value || "", stat2Label: resData.stat2Label || "",
            stat3Value: resData.stat3Value || "", stat3Label: resData.stat3Label || "",
            portfolioLastUpdated: resData.portfolioLastUpdated || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hero Fetch Error", err);
        setLoading(false);
      });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (loading) {
    return (
      <section className="h-[100dvh] flex items-center justify-center overflow-hidden">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </section>
    );
  }

  const imageKey = data.profilePic ? `${data.profilePic}?v=${Date.now()}` : null;
  const easeOut = [0.25, 0.4, 0.25, 1] as const;
  const techArray = data.techStack ? data.techStack.split(",").map(t => t.trim()).filter(Boolean) : [];
  
  // ✅ Determine final resume URL (GitHub first, then G-Drive)
  const finalResumeUrl = data.resumeUrl || data.gDriveResume;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      // ✅ STRICTLY 100dvh and overflow-hidden to prevent ANY scrolling
      className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden py-10 md:py-0"
    >
      {/* INNER CONTAINER (Restored exact layout sizing) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 pb-20 md:pb-16">
        
        {/* TEXT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="flex-1 md:basis-3/5 text-center md:text-left space-y-3 sm:space-y-4 order-2 md:order-1 max-w-3xl z-10 flex flex-col items-center md:items-start w-full"
        >
          {data.badge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              <span
                className="text-primary font-mono text-[10px] sm:text-xs md:text-sm tracking-widest uppercase border-b border-primary/30 pb-1 font-bold"
                dangerouslySetInnerHTML={{ __html: data.badge }}
              />
            </motion.div>
          )}

          {data.title ? (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: easeOut }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] text-balance w-full"
              dangerouslySetInnerHTML={{ __html: data.title }}
            />
          ) : (
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-300">Welcome</h1>
          )}

          {data.subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7, ease: easeOut }}
              className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-300 max-w-lg leading-relaxed font-medium w-full px-2 sm:px-0 [&_p]:whitespace-normal [&_p]:break-words [&_p]:text-center md:[&_p]:text-left"
              dangerouslySetInnerHTML={{ __html: data.subtitle }}
            />
          )}

          {/* BUTTONS & SOCIALS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: easeOut }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4 w-full"
          >
            <Link
              href="/projects"
              className="flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-full shadow-lg hover:opacity-90 hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 text-xs sm:text-sm md:text-base flex-1 md:flex-none min-w-[130px]"
            >
              View Work <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>

            {finalResumeUrl ? (
              <a
                href={finalResumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-full text-gray-800 dark:text-gray-200 font-semibold hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-xs sm:text-sm md:text-base flex-1 md:flex-none min-w-[130px]"
              >
                Resume <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 border-2 border-red-200 text-red-400 rounded-lg cursor-not-allowed opacity-50 text-xs sm:text-sm flex-1 md:flex-none min-w-[130px]"
              >
                No Resume <FileX className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}

            <div className="flex items-center justify-center gap-3 w-full md:w-auto md:ml-2 md:border-l md:pl-6 border-gray-300 dark:border-gray-700 mt-2 md:mt-0">
              {data.socialGithub && (
                <Link href={data.socialGithub} target="_blank" className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-sm transition-all text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                  <Github className="w-5 h-5" />
                </Link>
              )}
              {data.socialLinkedin && (
                <Link href={data.socialLinkedin} target="_blank" className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-sm transition-all text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  <Linkedin className="w-5 h-5" />
                </Link>
              )}
              {data.socialTwitter && (
                <Link href={data.socialTwitter} target="_blank" className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-sm transition-all text-gray-700 dark:text-gray-300 hover:text-[#1DA1F2]">
                  <Twitter className="w-5 h-5" />
                </Link>
              )}
              {data.socialEmail && (
                <a href={`mailto:${data.socialEmail}`} className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-sm transition-all text-gray-700 dark:text-gray-300 hover:text-red-500">
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>

          {/* QUICK STATS */}
          {(data.stat1Value || data.stat2Value || data.stat3Value) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.7, ease: easeOut }}
              className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200 dark:border-gray-800 w-full px-1 sm:px-0"
            >
              {data.stat1Value && (
                <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                  <h4 className="text-base sm:text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">{data.stat1Value}</h4>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{data.stat1Label}</p>
                </div>
              )}
              {data.stat2Value && (
                <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                  <h4 className="text-base sm:text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">{data.stat2Value}</h4>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{data.stat2Label}</p>
                </div>
              )}
              {data.stat3Value && (
                <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                  <h4 className="text-base sm:text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">{data.stat3Value}</h4>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{data.stat3Label}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* GLOBAL STATUS BADGE */}
          {data.portfolioLastUpdated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-full shadow-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs md:text-sm font-bold text-green-700 dark:text-green-400">
                {data.portfolioLastUpdated}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* PROFILE PICTURE with CURSOR PARALLAX (Restored exact sizing and mobile visibility) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: easeOut, delay: 0.2 }}
          className="relative shrink-0 order-1 md:order-2 z-10"
          style={{ perspective: 1000 }}
        >
          <motion.div style={{ x: glowX, y: glowY }} className="absolute inset-0 -z-10 blur-3xl opacity-40 dark:opacity-60">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary via-purple-500 to-pink-500" />
          </motion.div>

          <motion.div
            style={{ x: imageX, y: imageY }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden border-[3px] sm:border-[4px] border-white dark:border-gray-800 shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 bg-gray-100 dark:bg-gray-900"
          >
            {/* ✅ Anti-Download & Fallback Logic Applied */}
            <Image 
              key={imageKey} 
              src={data.profilePic || data.gDriveProfilePic || "/placeholder.png"} 
              alt="Profile Picture" 
              fill 
              className="object-cover object-center select-none pointer-events-none" 
              priority 
              unoptimized 
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onError={(e) => {
                if (data.gDriveProfilePic) {
                  e.currentTarget.src = data.gDriveProfilePic;
                }
              }}
            />
          </motion.div>

          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block absolute -top-4 -right-4 w-6 h-6 rounded-full bg-primary/80 shadow-lg" />
          <motion.div animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="hidden md:block absolute -bottom-2 -left-4 w-4 h-4 rounded-full bg-purple-500/70 shadow-lg" />
        </motion.div>
      </div>

      {/* TECH STACK MARQUEE (Framer Motion Animated) */}
      {techArray.length > 0 && (
        <div className="absolute bottom-12 md:bottom-0 left-0 w-full border-y md:border-y-0 md:border-t border-gray-200 dark:border-gray-800 bg-white/90 md:bg-gray-50/50 dark:bg-gray-900/90 backdrop-blur-md py-2 sm:py-3 overflow-hidden z-20 shadow-sm md:shadow-none flex">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            className="flex whitespace-nowrap w-max"
          >
            {[...techArray, ...techArray, ...techArray, ...techArray].map((tech, i) => (
              <div key={i} className="flex items-center">
                <span className="mx-4 sm:mx-6 md:mx-10 text-[10px] sm:text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-base">{getTechIcon(tech)}</span> {tech}
                </span>
                <span className="text-gray-300 dark:text-gray-700">•</span>
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}
