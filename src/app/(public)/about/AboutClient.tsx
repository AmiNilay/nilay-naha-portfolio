"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchWithSessionCache } from "@/lib/clientCache";
import Testimonials from "@/components/sections/Testimonials";
import GitHubActivity from "@/components/sections/GitHubActivity";
import CompanyLogo, { resolveLogoUrl } from "@/components/ui/CompanyLogo";
import MediaFrame from "@/components/ui/MediaFrame";
import { Linkedin } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  BookOpen,
  Cpu,
  Loader2,
  AlertCircle,
  GraduationCap,
  Award,
  Calendar,
  MapPin,
  Download,
  ArrowRight,
  Mail,
  Briefcase,
  ExternalLink,
  BadgeCheck,
  Sparkles,
  Layers,
  Terminal,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Compass,
  User,
} from "lucide-react";
import SkillKeyboard from "@/components/ui/SkillKeyboard";

interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  relevantCoursework: string[];
  cgpa: string;
  percentage: string;
  institutionLinkedin?: string;
  location?: string;
  image?: string;
}

interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
  companyLogo?: string;
  companyLinkedin?: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface AboutData {
  bio: string;
  bioHtml?: string;
  gDriveProfilePic?: string; // About page's own image/GIF/video (Drive link or URL)
  image?: string; // legacy

  location?: string;
  availability?: string;
  skills: string[];
  education: EducationEntry[];
  experience?: Experience[];
  certifications?: Certification[];
}

export default function AboutClient() {
  const [data, setData] = useState<AboutData | null>(null);
  const [heroData, setHeroData] = useState<{
    profilePic?: string;
    resumeUrl?: string;
    gDriveProfilePic?: string;
    gDriveResume?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("story");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  // References for sticky sub-nav jump scrolling
  const sectionRefs = {
    story: useRef<HTMLDivElement>(null),
    experience: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
    certifications: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    Promise.all([
      fetchWithSessionCache<any>("about_data", "/api/about"),
      fetchWithSessionCache<any>("hero_data", "/api/hero").catch(() => null),
    ])
      .then(([aboutRes, heroRes]) => {
        if (aboutRes && (aboutRes.bio || aboutRes.education?.length > 0)) {
          setData(aboutRes);
        }
        if (heroRes) setHeroData(heroRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Apple-style smooth scroll to section on tab click
  const scrollToSection = (id: keyof typeof sectionRefs) => {
    setActiveTab(id);
    // scrollIntoView scrolls whichever ancestor actually scrolls (the Home slide
    // container or the window); sections carry scroll-mt-32 for the sticky bar.
    sectionRefs[id]?.current?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  // Scroll-spy: highlight the tab for the section currently in view.
  useEffect(() => {
    if (loading) return;
    const entries = Object.entries(sectionRefs) as [keyof typeof sectionRefs, React.RefObject<HTMLDivElement>][];
    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visible) return;
        const match = entries.find(([, ref]) => ref.current === visible.target);
        if (match) setActiveTab(match[0]);
      },
      { rootMargin: "-140px 0px -55% 0px" }
    );
    entries.forEach(([, ref]) => ref.current && observer.observe(ref.current));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("nilaynaha14@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center px-8 py-7 rounded-3xl bg-white/70 dark:bg-card/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] border-t-white/80 dark:border-t-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="w-11 h-11 mb-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200">
            <User className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-foreground mb-4">
            Loading Profile...
          </span>
          <div className="w-36 h-1 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 w-1/3 bg-zinc-800 dark:bg-zinc-200 rounded-full animate-apple-shimmer shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-32 min-h-screen max-w-4xl flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm">
          <AlertCircle className="w-8 h-8 text-zinc-400" />
        </div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
          Profile Not Configured
        </h1>
        <p className="text-sm text-zinc-500 max-w-md">
          The about profile data has not been seeded yet. Check back soon or visit the contact page.
        </p>
      </div>
    );
  }

  // About has its own image; the Home avatar is only a fallback when it's empty.
  const rawImage = data.gDriveProfilePic || data.image || heroData?.profilePic || heroData?.gDriveProfilePic;
  const displayResume = heroData?.resumeUrl || heroData?.gDriveResume;

  // Active navigation tabs
  const navTabs = [
    { id: "story" as const, label: "Overview", icon: Sparkles },
    ...(data.experience && data.experience.length > 0
      ? [{ id: "experience" as const, label: "Experience", icon: Briefcase }]
      : []),
    ...(data.education && data.education.length > 0
      ? [{ id: "education" as const, label: "Education", icon: GraduationCap }]
      : []),
    { id: "skills" as const, label: "Technical Arsenal", icon: Cpu },
    ...(data.certifications && data.certifications.length > 0
      ? [{ id: "certifications" as const, label: "Credentials", icon: BadgeCheck }]
      : []),
  ];

  // Motion variants with strong cubic-bezier ease-out (animate skill recipe)
  const sectionVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-800 dark:selection:text-cyan-200">
      {/* Rich-text alignment styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ql-align-justify { text-align: justify !important; }
        .ql-align-center { text-align: center !important; }
        .ql-align-right { text-align: right !important; }
      `,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 max-w-6xl">
        {/* =============================================================== */}
        {/* 1. EXECUTIVE EDITORIAL HERO (Apple Keynote Display Hierarchy)  */}
        {/* =============================================================== */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariant}
          className="mb-14 text-center md:text-left"
        >
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600 dark:text-zinc-400 mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Executive Profile & Philosophy
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.08] mb-6">
            Engineering Systems with{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
              Precision & Purpose.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed font-normal">
            Specialized in architecting high-concurrency backend services, asynchronous APIs, and full-stack software applications with clean ergonomics and resilient data layers.
          </p>
        </motion.div>

        {/* =============================================================== */}
        {/* 2. STICKY APPLE SEGMENTED CONTROL SUB-NAV                      */}
        {/* =============================================================== */}
        <div className="sticky top-20 z-30 mb-16 flex justify-center">
          <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-[0_12px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-x-auto max-w-full">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs md:text-sm font-bold tracking-tight whitespace-nowrap transition-colors duration-200 select-none ${
                    isActive
                      ? "text-zinc-950 dark:text-white"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="aboutActiveTab"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      className="absolute inset-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 shadow-sm"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =============================================================== */}
        {/* 3. PROFILE & STORY SECTION (Bento Grid)                        */}
        {/* =============================================================== */}
        <section ref={sectionRefs.story} className="mb-28 scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: 3D Squircle Portrait Card (4 cols) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionVariant}
              className="lg:col-span-5 flex flex-col gap-6"
            >
              <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-b from-zinc-100 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] aspect-square p-2 group">
                <div className="w-full h-full rounded-[26px] overflow-hidden bg-zinc-200 dark:bg-zinc-800 relative">
                  {rawImage ? (
                    <MediaFrame
                      src={rawImage}
                      alt="Nilay Naha"
                      width={1000}
                      className="transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                      <User className="w-10 h-10" />
                      <span className="text-xs font-semibold">No Image Available</span>
                    </div>
                  )}

                  {/* Frosted Activity Status Badge (Overlaid) */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <div className="px-3 py-1.5 rounded-full bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border border-white/60 dark:border-zinc-800/80 shadow-md flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                        {data.availability || "Open to Opportunities"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Meta Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                      Location
                    </span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {data.location || "Siliguri, India"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                      Academics
                    </span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Class of 2026
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Detailed Biography & Direct Actions (7 cols) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionVariant}
              className="lg:col-span-7 flex flex-col justify-between"
            >
              <div className="rounded-[32px] p-8 md:p-10 bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.3)] mb-6">
                <div className="flex items-center gap-2 mb-6 text-xs font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
                  <Terminal className="w-4 h-4" /> Background & Vision
                </div>

                <div
                  className="rich-content prose prose-base sm:prose-lg dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-a:font-semibold hover:prose-a:underline prose-strong:text-zinc-900 dark:prose-strong:text-white"
                  dangerouslySetInnerHTML={{
                    __html: data.bioHtml || data.bio || "<p>Software developer dedicated to reliable software design.</p>",
                  }}
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {displayResume && (
                  <a
                    href={displayResume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-bold shadow-lg shadow-zinc-950/10 hover:opacity-95 active:scale-97 transition-all"
                  >
                    <Download className="w-4 h-4" /> Download Resume
                  </a>
                )}

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 text-sm font-bold hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 active:scale-97 transition-all"
                >
                  <Mail className="w-4 h-4 text-cyan-500" /> Send a Message
                </Link>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Email
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 4. AT A GLANCE BENTO METRICS                                    */}
        {/* =============================================================== */}
        <section className="mb-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
              <div className="p-3 w-fit rounded-2xl bg-cyan-500/10 text-cyan-500 mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
                  Core Specialization
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  FastAPI, Python Asyncio, Node.js, and modern Next.js 14 architecture.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
              <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
                  Systems & Data
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  MongoDB, SQL optimization, Docker containerization, REST API designs.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
              <div className="p-3 w-fit rounded-2xl bg-sky-500/10 text-sky-500 mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
                  Engineering Philosophy
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Resilient security, zero dead-weight abstractions, and fluid ergonomics.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
              <div className="p-3 w-fit rounded-2xl bg-purple-500/10 text-purple-500 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1">
                  Availability
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  {data.availability || "Open to Full-Stack & Backend Engineering Roles."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 5. EXPERIENCE TIMELINE (Apple Career Journey)                  */}
        {/* =============================================================== */}
        {data.experience && data.experience.length > 0 && (
          <section ref={sectionRefs.experience} className="mb-28 scroll-mt-32">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Work Experience
                </h2>
                <p className="text-xs text-zinc-400 font-medium">
                  Industry roles, internships, and engineering contributions.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {data.experience.map((exp, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  variants={sectionVariant}
                  className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <CompanyLogo src={exp.companyLogo} company={exp.company} />
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {exp.role}
                        </h3>
                        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5 flex-wrap">
                          <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          {exp.companyLinkedin ? (
                            <a
                              href={exp.companyLinkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 hover:text-[#0A66C2] transition-colors"
                            >
                              {exp.company}
                              <Linkedin className="w-3.5 h-3.5" aria-label="LinkedIn" />
                            </a>
                          ) : (
                            exp.company
                          )}
                        </p>
                      </div>
                    </div>

                    {exp.duration && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-bold text-zinc-700 dark:text-zinc-300 w-fit">
                        <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                        {exp.duration}
                      </div>
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-normal">
                      {exp.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* =============================================================== */}
        {/* 6. EDUCATION JOURNEY (Academic Excellence)                     */}
        {/* =============================================================== */}
        {data.education && data.education.length > 0 && (
          <section ref={sectionRefs.education} className="mb-28 scroll-mt-32">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Education Journey
                </h2>
                <p className="text-xs text-zinc-400 font-medium">
                  Academic qualifications, coursework, and performance milestones.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.education.map((edu, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  variants={sectionVariant}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col"
                >
                  {edu.image && (
                    <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveLogoUrl(edu.image)}
                        alt={`${edu.institution || "College"} campus`}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                        {edu.degree}
                      </h3>
                      {edu.year && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                          <Calendar className="w-3 h-3 text-cyan-500" />
                          {edu.year}
                        </span>
                      )}
                    </div>

                    {edu.institution && (
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 mb-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        {edu.institution}
                      </p>
                    )}
                    {(edu.location || edu.institutionLinkedin) && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        {edu.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                            {edu.location}
                          </span>
                        )}
                        {edu.institutionLinkedin && (
                          <a
                            href={edu.institutionLinkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#0A66C2] dark:text-[#5AA9F0] hover:underline"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    )}
                    {!edu.location && !edu.institutionLinkedin && edu.institution && <div className="mb-4" />}

                    {/* Scores & CGPA */}
                    {(edu.cgpa || edu.percentage) && (
                      <div className="flex flex-wrap gap-2.5 mb-6">
                        {edu.cgpa && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <Award className="w-3.5 h-3.5" />
                            <span>CGPA: {edu.cgpa}</span>
                          </div>
                        )}
                        {edu.percentage && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                            <Award className="w-3.5 h-3.5" />
                            <span>Score: {edu.percentage}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Coursework Chips */}
                  {edu.relevantCoursework &&
                    edu.relevantCoursework.filter((c) => c.trim()).length > 0 && (
                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
                          Relevant Coursework
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {edu.relevantCoursework
                            .filter((c) => c.trim())
                            .map((course, cIdx) => (
                              <span
                                key={cIdx}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              >
                                {course.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* =============================================================== */}
        {/* 7. TECHNICAL ARSENAL (Studio Hardware Keypad Showcase)         */}
        {/* =============================================================== */}
        <section ref={sectionRefs.skills} className="mb-28 scroll-mt-32">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-500">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Technical Arsenal
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Core technologies, database engines, cloud services, and developer workflows.
              </p>
            </div>
          </div>

          <div className="rounded-[36px] bg-gradient-to-b from-zinc-50 via-zinc-50 to-zinc-100/60 dark:from-zinc-900/40 dark:via-zinc-900/30 dark:to-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <SkillKeyboard activeSkills={data.skills} />
          </div>
        </section>

        {/* =============================================================== */}
        {/* 8. CERTIFICATIONS & CREDENTIALS                                */}
        {/* =============================================================== */}
        {data.certifications && data.certifications.length > 0 && (
          <section ref={sectionRefs.certifications} className="mb-28 scroll-mt-32">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Verified Certifications
                </h2>
                <p className="text-xs text-zinc-400 font-medium">
                  Official credentials, certifications, and verified achievements.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.certifications.map((cert, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  variants={sectionVariant}
                  className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                        {cert.name}
                      </h3>
                      <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
                      {cert.issuer}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-xs font-bold text-zinc-400">
                      {cert.date}
                    </span>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline active:scale-95 transition-transform"
                      >
                        Verify Credential <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations (managed in /admin/testimonials) */}
        <Testimonials />

        {/* Live public GitHub activity (/api/github) */}
        <GitHubActivity />

        {/* =============================================================== */}
        {/* 9. BOTTOM APPLE STUDIO CTA                                     */}
        {/* =============================================================== */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariant}
          className="relative rounded-[36px] overflow-hidden p-8 sm:p-12 md:p-16 text-center max-w-4xl mx-auto bg-gradient-to-b from-zinc-100 via-zinc-100 to-zinc-200/80 dark:from-zinc-900/80 dark:via-zinc-900/60 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-cyan-500/10 via-sky-500/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 shadow-md border border-zinc-200/60 dark:border-zinc-700 flex items-center justify-center mx-auto mb-6 text-cyan-500">
              <Sparkles className="w-6 h-6" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">
              Let's Build Something Exceptional.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
              Interested in collaborating on high-throughput backend systems, secure APIs, or distributed services? I'm actively open to engineering roles.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-bold shadow-xl shadow-zinc-950/10 hover:opacity-95 active:scale-97 transition-all"
              >
                Get In Touch <ArrowRight className="w-4 h-4" />
              </Link>

              {displayResume && (
                <a
                  href={displayResume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700/80 active:scale-97 transition-all"
                >
                  <Download className="w-4 h-4" /> View Resume
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
