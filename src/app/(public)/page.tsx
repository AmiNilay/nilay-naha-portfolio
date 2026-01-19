"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "@/components/sections/Hero";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import AboutPreview from "@/components/sections/AboutPreview";
import { ChevronDown } from "lucide-react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const totalSlides = 3;

  // FIX: This ensures ONLY the correct component is ever created in memory
  const renderActiveSlide = () => {
    switch (currentSlide) {
      case 0: return <Hero key="hero-main" />;
      case 1: return <FeaturedProjects key="projects-main" />;
      case 2: return <AboutPreview key="about-main" />;
      default: return null;
    }
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => (prev + newDirection + totalSlides) % totalSlides);
  };

  // PC & Mobile Listeners...
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => (touchStart.current = e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => (touchEnd.current = e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > 50) paginate(1);
    if (distance < -50) paginate(-1);
    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <main 
      className="h-screen w-full overflow-hidden bg-background relative flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 w-full h-full relative overflow-hidden bg-background">
        {/* CRITICAL: mode="wait" kills the "Demo" ghosting immediately */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full flex items-center justify-center pt-16 px-4 bg-background z-10"
          >
            <div className="w-full h-full overflow-y-auto no-scrollbar">
              {renderActiveSlide()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {currentSlide === 0 && (
        <button 
          onClick={() => paginate(1)}
          aria-label="Scroll to projects"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce p-2 bg-white/10 dark:bg-black/20 rounded-full z-50"
        >
          <ChevronDown className="w-6 h-6 text-primary" />
        </button>
      )}

      {/* Clean UI Bar */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-500 z-50" 
        style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` } as React.CSSProperties}
      />
    </main>
  );
}