"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import Hero from "@/components/sections/Hero";
import ProjectsPage from "./projects/ProjectsClient";
import BlogPage from "./blog/BlogClient";
import AboutPage from "./about/AboutClient";
import ContactPage from "./contact/ContactClient";

// Apple-spec: critically damped, no bounce
const SLIDE_SPRING = { type: "spring", bounce: 0, duration: 0.45 } as const;

export default function HomeClient() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const shouldReduce = useReducedMotion();

  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const totalSlides = 5;

  const paginate = (newDirection: number) => {
    if (currentSlide === 0 && newDirection === -1) return;
    if (currentSlide === totalSlides - 1 && newDirection === 1) return;
    setDirection(newDirection);
    setCurrentSlide((prev) => prev + newDirection);
  };

  // ── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentSlide]);

  // ── Custom event navigation from Navbar or PageNavigation ────────────────
  useEffect(() => {
    const handleCustomNav = (e: Event) => {
      const customEvt = e as CustomEvent<{ slideIndex: number }>;
      const targetIdx = customEvt.detail?.slideIndex;
      if (typeof targetIdx === "number" && targetIdx >= 0 && targetIdx < totalSlides) {
        if (targetIdx !== currentSlide) {
          setDirection(targetIdx > currentSlide ? 1 : -1);
          setCurrentSlide(targetIdx);
        }
      }
    };
    window.addEventListener("portfolio-navigate-slide", handleCustomNav);
    return () => window.removeEventListener("portfolio-navigate-slide", handleCustomNav);
  }, [currentSlide, totalSlides]);

  // ── Touch navigation — with ghost-swipe thresholds from CLAUDE.md ───────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      t: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = touchStart.current.x - e.changedTouches[0].clientX;
    const dy = touchStart.current.y - e.changedTouches[0].clientY;
    const dt = Date.now() - touchStart.current.t;
    touchStart.current = null;

    // Respect CLAUDE.md invariants: |Δx| > 100px, duration < 600ms, |Δx| > 2|Δy|
    if (Math.abs(dx) < 100) return;
    if (dt > 600) return;
    if (Math.abs(dx) <= 2 * Math.abs(dy)) return;

    paginate(dx > 0 ? 1 : -1);
  };

  // Slide motion props
  const transition = shouldReduce
    ? { duration: 0 }
    : SLIDE_SPRING;

  return (
    <main
      className="h-screen w-full overflow-hidden bg-[#FAFAFA] dark:bg-[#0B0F14] text-foreground relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? "16%" : "-16%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={shouldReduce ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? "-16%" : "16%" }}
          transition={transition}
          className="absolute inset-0 w-full h-full"
          style={{ willChange: "transform, opacity" }}
        >
          {/* Each slide fills the full screen; individual pages handle their own scroll */}
          <div className="w-full h-full overflow-y-auto">
            {currentSlide === 0 && <Hero />}
            {currentSlide === 1 && <ProjectsPage />}
            {currentSlide === 2 && <BlogPage />}
            {currentSlide === 3 && <AboutPage />}
            {currentSlide === 4 && <ContactPage />}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Apple-style progress bar ── bottom edge, primary color glow ── */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-[#0F766E] dark:bg-[#F59E0B]
          transition-[width] duration-500 ease-out z-50
          shadow-[0_0_8px_rgba(15,118,110,0.6)] dark:shadow-[0_0_8px_rgba(245,158,11,0.6)]"
        style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
      />

      {/* ── Slide dots navigation (mobile-only) ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50 md:hidden">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentSlide ? 1 : -1);
              setCurrentSlide(i);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ease-out
              ${i === currentSlide
                ? "w-5 h-2 bg-[#0F766E] dark:bg-[#F59E0B]"
                : "w-2 h-2 bg-[#D1D5DB] dark:bg-[#374151] hover:bg-[#9CA3AF] dark:hover:bg-[#6B7280]"
              }`}
          />
        ))}
      </div>
    </main>
  );
}