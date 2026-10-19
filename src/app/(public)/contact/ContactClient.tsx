"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Linkedin,
  Github,
  Check,
  Copy,
  MapPin,
  Clock,
  Send,
  ExternalLink,
  Loader2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

// Apple-style critically damped spring constants
const SPRING_DEFAULT = { type: "spring", bounce: 0, duration: 0.45 } as const;
const SPRING_SNAPPY = { type: "spring", bounce: 0, duration: 0.3 } as const;

export default function ContactClient() {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Contact info state with fallback to defaults or hero data
  const [contactInfo, setContactInfo] = useState({
    email: "niloynaha2003@gmail.com",
    github: "https://github.com/AmiNilay",
    linkedin: "https://www.linkedin.com/in/nilay-naha/",
    location: "Siliguri, India",
    timezone: "IST (UTC+5:30)",
  });

  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Attempt to pull latest dynamic social/email links from in-memory cache
    import("@/lib/clientCache").then(({ fetchWithSessionCache }) => {
      fetchWithSessionCache<any>("hero_data", "/api/hero")
        .then((data) => {
          if (data) {
            setContactInfo((prev) => ({
              ...prev,
              email: data.socialEmail || prev.email,
              github: data.socialGithub || prev.github,
              linkedin: data.socialLinkedin || prev.linkedin,
            }));
          }
        })
        .catch(() => {});
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(contactInfo.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus("error");
      setErrorMessage("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitStatus("idle"), 6000);
      } else {
        setSubmitStatus("error");
        setErrorMessage(json.error || "Unable to deliver message. Please retry or copy direct email.");
      }
    } catch {
      setSubmitStatus("error");
      setErrorMessage("Network error occurred. Please verify connection or copy direct email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-full min-h-[100dvh] w-full bg-[#FAFAFA] dark:bg-[#0B0F14] text-[#111827] dark:text-[#F9FAFB] flex flex-col justify-center items-center overflow-y-auto lg:overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-4 select-none">
      
      {/* ── Ambient Radial Atmosphere (Apple Studio Mesh Glow) ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute top-1/4 -left-36 w-[500px] h-[500px] rounded-full bg-[#0F766E]/[0.06] dark:bg-transparent blur-[130px]" />
        <div className="absolute top-1/3 -right-36 w-[480px] h-[480px] rounded-full bg-transparent dark:bg-[#F59E0B]/[0.05] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Floating Translucent Copied Pill HUD (macOS Toast) ── */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.95 }}
            transition={SPRING_SNAPPY}
            className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/95 dark:bg-[#111827]/95 text-[#111827] dark:text-white backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded-full bg-[#0F766E] dark:bg-[#F59E0B] text-white dark:text-[#0B0F14] flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold tracking-tight">
              Email copied to clipboard
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Single Screen Stage Container ── */}
      <main className="relative z-10 w-full max-w-[1180px] mx-auto flex flex-col justify-center my-auto">
        
        {/* ── Compact Header ── */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_DEFAULT, delay: 0.05 }}
          className="mb-4 sm:mb-6 lg:mb-5 text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          {/* Status Capsule */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0F766E]/20 bg-[#0F766E]/[0.06] dark:border-[#F59E0B]/20 dark:bg-[#F59E0B]/[0.06] backdrop-blur-md mb-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.16em] uppercase text-[#0F766E] dark:text-[#F59E0B]">
              Open for Opportunities & Collaborations
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold tracking-[-0.03em] leading-tight text-[#111827] dark:text-[#F9FAFB]">
            Let’s craft something{" "}
            <span className="text-[#0F766E] dark:text-[#F59E0B]">exceptional</span> together.
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm lg:text-[15px] leading-normal text-[#4B5563] dark:text-[#9CA3AF] max-w-xl">
            Have a project in mind, an architectural challenge, or looking to build together? Transmit a message or tap below to connect.
          </p>
        </motion.div>

        {/* ── Single Viewport 2-Column Bento Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
          
          {/* ── LEFT COLUMN (Quick Channels & Direct Access) ── */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_DEFAULT, delay: 0.1 }}
            className="lg:col-span-5 flex flex-col justify-between gap-3"
          >
            {/* Direct Quick Channels (Apple Tactile Surfaces) */}
            <div className="space-y-2.5">
              
              {/* Copy Email Card */}
              <motion.button
                onClick={handleCopy}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                className="w-full group p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/[0.08] hover:border-[#0F766E]/40 dark:hover:border-[#F59E0B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] dark:shadow-none backdrop-blur-xl transition-all duration-150 text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#0F766E]/10 dark:bg-[#F59E0B]/10 text-[#0F766E] dark:text-[#F59E0B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Email</span>
                      <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-[#0F766E]/10 dark:bg-[#F59E0B]/10 text-[#0F766E] dark:text-[#F59E0B] font-semibold">
                        Click to copy
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold truncate text-[#111827] dark:text-white mt-0.5">
                      {contactInfo.email}
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 group-hover:text-[#0F766E] dark:group-hover:text-[#F59E0B] shrink-0 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </div>
              </motion.button>

              {/* LinkedIn Card */}
              <motion.div whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}>
                <Link
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full group p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/[0.08] hover:border-[#0A66C2]/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] dark:shadow-none backdrop-blur-xl transition-all duration-150 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">LinkedIn</span>
                      <p className="text-xs sm:text-sm font-semibold truncate text-[#111827] dark:text-white mt-0.5">
                        linkedin.com/in/nilay-naha
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 group-hover:text-[#0A66C2] shrink-0 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </motion.div>

              {/* GitHub Card */}
              <motion.div whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}>
                <Link
                  href={contactInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full group p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/[0.08] hover:border-gray-400/50 dark:hover:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] dark:shadow-none backdrop-blur-xl transition-all duration-150 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 text-[#111827] dark:text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Github className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">GitHub</span>
                      <p className="text-xs sm:text-sm font-semibold truncate text-[#111827] dark:text-white mt-0.5">
                        github.com/AmiNilay
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 group-hover:text-black dark:group-hover:text-white shrink-0 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Quick Metadata Capsules (Location & Turnaround) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/[0.08] backdrop-blur-md flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0F766E]/10 dark:bg-[#F59E0B]/10 text-[#0F766E] dark:text-[#F59E0B] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">Location</p>
                  <p className="text-xs font-semibold truncate text-[#111827] dark:text-white">
                    {contactInfo.location}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/[0.08] backdrop-blur-md flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0F766E]/10 dark:bg-[#F59E0B]/10 text-[#0F766E] dark:text-[#F59E0B] flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">Replies</p>
                  <p className="text-xs font-semibold truncate text-[#111827] dark:text-white">
                    Within 24h
                  </p>
                </div>
              </div>
            </div>

            {/* Apple Confidentiality Guarantee Capsule */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-white/[0.03] dark:to-white/[0.01] border border-[#E5E7EB] dark:border-white/[0.06] backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] leading-snug text-[#6B7280] dark:text-[#9CA3AF]">
                  <span className="font-semibold text-[#111827] dark:text-white">Privacy Guarantee:</span> Zero third-party telemetry. NDA friendly upon request.
                </div>
              </div>
            </div>

          </motion.div>

          {/* ── RIGHT COLUMN (Frosted Glass macOS Interactive Composer) ── */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_DEFAULT, delay: 0.16 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <div className="relative rounded-3xl p-4 sm:p-6 bg-white/85 dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-2xl overflow-hidden">
              
              {/* macOS Window Top Accent Dots */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#9CA3AF] tracking-wider uppercase">
                  <MessageSquare className="w-3 h-3 text-[#0F766E] dark:text-[#F59E0B]" />
                  Secure Transmission
                </div>
              </div>

              {/* Success Notification Curtain */}
              <AnimatePresence>
                {submitStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 z-20 bg-white/95 dark:bg-[#0B0F14]/95 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mb-3 shadow-inner">
                      <Check className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-[#111827] dark:text-white">
                      Message Dispatched
                    </h3>
                    <p className="mt-1 text-xs text-[#4B5563] dark:text-[#9CA3AF] max-w-xs leading-relaxed">
                      Thank you for reaching out. Your transmission landed in my inbox and I will respond promptly.
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSubmitStatus("idle")}
                      className="mt-4 px-5 py-2 rounded-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Send Another
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Alert */}
              <AnimatePresence>
                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium leading-relaxed">
                      {errorMessage || "Failed to dispatch message. Please try again."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interactive Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] mb-1.5"
                    >
                      Your Name <span className="text-[#0F766E] dark:text-[#F59E0B]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nilay Naha"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-[#111827] dark:text-white placeholder-[#9CA3AF] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] dark:focus:ring-[#F59E0B] focus:border-transparent transition-all duration-150"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-[11px] font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] mb-1.5"
                    >
                      Email Address <span className="text-[#0F766E] dark:text-[#F59E0B]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nilay@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-[#111827] dark:text-white placeholder-[#9CA3AF] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] dark:focus:ring-[#F59E0B] focus:border-transparent transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-[11px] font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] mb-1.5"
                  >
                    Your Message <span className="text-[#0F766E] dark:text-[#F59E0B]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your project, timeline, or idea..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-[#111827] dark:text-white placeholder-[#9CA3AF] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] dark:focus:ring-[#F59E0B] focus:border-transparent transition-all duration-150 resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Action Button — Tactile Spring Feedback */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  className="w-full group py-3 px-5 rounded-xl bg-[#111827] dark:bg-[#F59E0B] text-white dark:text-[#0B0F14] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(15,118,110,0.2)] dark:shadow-[0_2px_12px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_18px_rgba(15,118,110,0.35)] dark:hover:shadow-[0_4px_18px_rgba(245,158,11,0.35)] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white dark:text-[#0B0F14]" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    </>
                  )}
                </motion.button>
              </form>

            </div>
          </motion.div>

        </div>

      </main>

    </div>
  );
}
