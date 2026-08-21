"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Download, FileX } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ✅ Helper to get REAL Tech Logos (SVGs) instead of emojis
const getTechLogo = (tech: string) => {
  const t = tech.toLowerCase();
  if (t.includes("python")) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg";
  if (t.includes("fastapi" )) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg";
  if (t.includes("docker" )) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg";
  if (t.includes("postgres" )) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg";
  if (t.includes("mongo" )) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg";
  if (t.includes("node" )) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg";
  if (t.includes("react" )) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg";
  if (t.includes("next" )) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg";
  if (t.includes("aws" )) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg";
  if (t.includes("linux" ) || t.includes("ubuntu")) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg";
  if (t.includes("git" )) return "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg";
  return null; // Fallback if no logo found
};

export default function Hero( ) {
  const [data, setData] = useState({
    badgeText: "", showAvailability: true, subtitle: "", profilePic: "", resumeUrl: "",
    gDriveProfilePic: "", gDriveResume: "", socialGithub: "", socialLinkedin: "",
    techStack: "", stat1Value: "", stat1Label: "", stat2Value: "", stat2Label: "",
    stat3Value: "", stat3Label: "", portfolioLastUpdated: "",
    line1Bold: "Build", line1Accent: "clean backends",
    line2Bold: "Ship", line2Accent: "real products"
  });

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  const imageX = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const imageY = useTransform(springY, [-0.5, 0.5], [-15, 15]);
  const glowX = useTransform(springX, [-0.5, 0.5], [20, -20]);
  const glowY = useTransform(springY, [-0.5, 0.5], [20, -20]);

  // 🔥 BULLETPROOF SCROLL LOCK 🔥
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const preventScroll = (e: Event) => e.preventDefault();
    const preventKeyScroll = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (keys.includes(e.key)) e.preventDefault();
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
    fetch(`/api/hero?timestamp=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((resData) => {
        if (resData) {
          setData(prev => ({
            ...prev,
            ...resData,
            badgeText: resData.badgeText || resData.badge || "",
            showAvailability: resData.showAvailability !== false,
            line1Bold: resData.line1Bold || "Build",
            line1Accent: resData.line1Accent || "clean backends",
            line2Bold: resData.line2Bold || "Ship",
            line2Accent: resData.line2Accent || "real products"
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && !resData.error) setSettings(resData);
      })
      .catch(() => {});
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  if (loading) {
    return (
      <section className="fixed inset-0 z-40 flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#FAFBFC] dark:bg-gray-950">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16 flex h-full flex-col items-center justify-center gap-6 pb-16 pt-16 md:flex-row md:justify-between md:gap-12 md:pb-12 md:pt-20 lg:gap-16">
          <div className="flex w-full min-w-0 flex-1 flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-4 h-3 w-36 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800 md:mb-6" />
            <div className="w-full max-w-3xl space-y-3">
              <div className="h-9 w-full max-w-[620px] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 sm:h-12 md:h-14 lg:h-16" />
              <div className="h-9 w-[86%] max-w-[540px] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 sm:h-12 md:h-14 lg:h-16" />
            </div>
            <div className="mt-5 w-full max-w-xl space-y-2 md:mt-6">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-[92%] animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-[70%] animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="mt-6 flex w-full flex-wrap justify-center gap-3 md:mt-8 md:justify-start md:gap-4">
              <div className="h-12 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-12 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="mt-8 grid w-full max-w-[650px] grid-cols-3 gap-2 sm:gap-4 md:mt-12 md:gap-6">
              <div className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 md:h-28 md:rounded-2xl" />
              <div className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 md:h-28 md:rounded-2xl" />
              <div className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 md:h-28 md:rounded-2xl" />
            </div>
            <div className="mt-6 h-8 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800 md:mt-8" />
          </div>
          <div className="relative order-1 flex w-full items-center justify-center md:order-2 md:w-auto md:flex-shrink-0">
            <div className="h-56 w-56 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800 sm:h-72 sm:w-72 md:h-80 md:w-80 lg:h-[420px] lg:w-[420px]" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 flex h-14 w-full items-center gap-10 overflow-hidden border-t border-gray-200/70 bg-white/50 px-8 dark:border-gray-800/70 dark:bg-gray-900/30">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-4 w-24 flex-shrink-0 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </section>
    );
  }

  const imageKey = data.profilePic ? `${data.profilePic}?v=${Date.now()}` : null;
  const easeOut = [0.25, 0.4, 0.25, 1] as const;
  const techArray = data.techStack ? data.techStack.split(",").map(t => t.trim()).filter(Boolean) : [];
    const finalResumeUrl = data.resumeUrl || data.gDriveResume;
  const customFontStyle = (font?: string): React.CSSProperties =>
    font && font !== "Inter"
      ? { fontFamily: `'${font}', sans-serif`, fontWeight: "normal" }
      : {};

  return (

    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#FAFBFC] dark:bg-gray-950 z-40 overscroll-none touch-none"
    >
      {/* ✅ CSS Animation for guaranteed Marquee movement */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes custom-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-custom-marquee {
          animation: custom-marquee 25s linear infinite;
        }
      `}} />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16 flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 md:gap-12 lg:gap-16 h-full pb-16 md:pb-12 pt-16 md:pt-20">
        
        {/* TEXT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="flex-1 text-center md:text-left flex flex-col items-center md:items-start w-full z-10 md:max-w-3xl order-2 md:order-1 min-w-0"
        >
          {/* ✅ FIXED BADGE: Uses badgeText and showAvailability */}
          {data.badgeText && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 mb-4 md:mb-6">
              {data.showAvailability && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              )}
                            <span
                className="text-gray-600 dark:text-gray-400 font-mono text-[10px] sm:text-xs tracking-[0.2em] font-bold uppercase"
                style={customFontStyle(settings?.homeBadgeFont)}
                dangerouslySetInnerHTML={{ __html: data.badgeText }}
              />

            </motion.div>
          )}

          {/* ✅ FIXED HEADLINE: Forced 2 lines, adjusted font size to prevent overlap */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: easeOut }}
                        className="text-[28px] sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[62px] font-extrabold tracking-tight leading-[1.1] w-full flex flex-col"
            style={customFontStyle(settings?.homeHeadlineFont)}

          >
            <span className="block whitespace-nowrap">
              <span className="text-[#111827] dark:text-white">{data.line1Bold}</span>{" "}
              <span className="text-[#6B7280] dark:text-[#9CA3AF]">{data.line1Accent}</span>
            </span>
            <span className="block whitespace-nowrap mt-1 md:mt-2">
              <span className="text-[#111827] dark:text-white">{data.line2Bold}</span>{" "}
              <span className="text-[#6B7280] dark:text-[#9CA3AF]">{data.line2Accent}</span>
            </span>
          </motion.h1>

          {data.subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7, ease: easeOut }}
                            className="text-sm sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-xl mt-4 md:mt-6 leading-relaxed font-medium w-full [&_p]:whitespace-normal [&_p]:text-center md:[&_p]:text-left"
              style={customFontStyle(settings?.homeSubtitleFont)}
              dangerouslySetInnerHTML={{ __html: data.subtitle }}

            />
          )}

          {/* Action Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: easeOut }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 mt-6 md:mt-8 w-full"
          >
            <Link
              href="/projects"
                            className="flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-3.5 bg-[#111827] dark:bg-white text-white dark:text-gray-900 font-semibold rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all duration-200 text-sm md:text-base min-w-[130px] md:min-w-[140px]"
              style={customFontStyle(settings?.homeActionFont)}

            >
              View Work <ArrowRight className="w-4 h-4" />
            </Link>

            {finalResumeUrl ? (
              <a
                href={finalResumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-3.5 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded-full text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 text-sm md:text-base min-w-[130px] md:min-w-[140px]"
                style={customFontStyle(settings?.homeActionFont)}

              >
                Resume <Download className="w-4 h-4" />
              </a>
            ) : (
              <button
                disabled
                                className="flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-3.5 border border-red-200 text-red-400 rounded-full cursor-not-allowed opacity-50 text-sm md:text-base min-w-[130px] md:min-w-[140px]"
                style={customFontStyle(settings?.homeActionFont)}

              >
                No Resume <FileX className="w-4 h-4" />
              </button>
            )}

                        <div
              className="flex items-center justify-center gap-3 w-full md:w-auto md:ml-2 md:border-l border-gray-200 dark:border-gray-800 md:pl-6 mt-2 md:mt-0"
              style={customFontStyle(settings?.homeSocialFont)}
            >

              {data.socialGithub && (
                <Link href={data.socialGithub} target="_blank" className="p-3 md:p-3.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  <Github className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              )}
              {data.socialLinkedin && (
                <Link href={data.socialLinkedin} target="_blank" className="p-3 md:p-3.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              )}
            </div>
          </motion.div>

          {/* Stats Boxes */}
          {(data.stat1Value || data.stat2Value || data.stat3Value) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.7, ease: easeOut }}
              className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mt-8 md:mt-12 w-full max-w-[650px]"
            >
              {data.stat1Value && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col items-center justify-center text-center shadow-sm">
                                    <h4 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#111827] dark:text-white" style={customFontStyle(settings?.homeStatsValueFont)}>{data.stat1Value}</h4>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 md:mt-1.5" style={customFontStyle(settings?.homeStatsLabelFont)}>{data.stat1Label}</p>

                </div>
              )}
              {data.stat2Value && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col items-center justify-center text-center shadow-sm">
                                    <h4 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#111827] dark:text-white" style={customFontStyle(settings?.homeStatsValueFont)}>{data.stat2Value}</h4>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 md:mt-1.5" style={customFontStyle(settings?.homeStatsLabelFont)}>{data.stat2Label}</p>

                </div>
              )}
              {data.stat3Value && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col items-center justify-center text-center shadow-sm">
                                    <h4 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#111827] dark:text-white" style={customFontStyle(settings?.homeStatsValueFont)}>{data.stat3Value}</h4>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 md:mt-1.5" style={customFontStyle(settings?.homeStatsLabelFont)}>{data.stat3Label}</p>

                </div>
              )}
            </motion.div>
          )}

          {/* Last Updated */}
          {data.portfolioLastUpdated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mt-6 md:mt-8 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-full"
            >
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-[10px] md:text-xs font-semibold text-green-700 dark:text-green-500" style={customFontStyle(settings?.homeLastUpdatedFont)}>
                {data.portfolioLastUpdated}
              </span>

            </motion.div>
          )}
        </motion.div>

        {/* Right: Large Profile Picture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: easeOut, delay: 0.2 }}
          className="relative shrink-0 order-1 md:order-2 z-10 flex items-center justify-center mb-4 md:mb-0"
          style={{ perspective: 1000 }}
        >
          <motion.div style={{ x: glowX, y: glowY }} className="absolute inset-0 -z-10 blur-[60px] md:blur-[100px] opacity-60 dark:opacity-40">
            <div className="w-[120%] h-[120%] rounded-full bg-gradient-to-tr from-purple-200 via-fuchsia-100 to-pink-100 dark:from-purple-900 dark:via-fuchsia-900 dark:to-pink-900 absolute -top-[10%] -left-[10%]" />
          </motion.div>

          <motion.div
            style={{ x: imageX, y: imageY }}
            className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[400px] xl:w-[420px] xl:h-[420px] rounded-full overflow-hidden border-[4px] md:border-[8px] border-white dark:border-[#1A2234] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] bg-gray-50 dark:bg-gray-900"
          >
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
        </motion.div>
      </div>

      {/* TECH STACK MARQUEE */}
      {techArray.length > 0 && (
        <div className="absolute bottom-0 left-0 w-full border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md py-3 sm:py-4 overflow-hidden z-20">
          <div className="flex whitespace-nowrap w-max animate-custom-marquee hover:[animation-play-state:paused]">
            {[...techArray, ...techArray, ...techArray, ...techArray, ...techArray, ...techArray].map((tech, i) => {
              const logoUrl = getTechLogo(tech);
              return (
                <div key={i} className="flex items-center">
                                    <span className="mx-6 md:mx-12 text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-[0.15em] flex items-center gap-2 sm:gap-3" style={customFontStyle(settings?.homeTechStackFont)}>

                    {logoUrl ? (
                      <img src={logoUrl} alt={tech} className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                    ) : (
                      <span className="text-lg md:text-xl">💻</span>
                    )}
                    {tech}
                  </span>
                  <span className="text-gray-200 dark:text-gray-800 w-1.5 h-1.5 rounded-full bg-current"></span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
