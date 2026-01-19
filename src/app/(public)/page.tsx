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

  // --- NAVIGATION WITH GUARDS ---
  const paginate = (newDirection: number) => {
    // Prevent going left/backwards if already on the first slide (Home)
    if (currentSlide === 0 && newDirection === -1) return;
    
    // Prevent going right/forwards if already on the last slide
    if (currentSlide === totalSlides - 1 && newDirection === 1) return;

    setDirection(newDirection);
    setCurrentSlide((prev) => prev + newDirection);
  };

  // PC: Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]); // Re-run effect when slide changes to check guards

  // Mobile: Swipe Logic
  const handleTouchStart = (e: React.TouchEvent) => (touchStart.current = e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => (touchEnd.current = e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    
    // Swipe Left (Goes to Next)
    if (distance > 50) paginate(1); 
    // Swipe Right (Goes to Previous)
    if (distance < -50) paginate(-1); 

    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <main 
      className="h-screen w-full overflow-hidden bg-background text-foreground relative" 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? "20%" : "-20%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? "-20%" : "20%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full bg-background z-10 flex items-center justify-center pt-16"
        >
          <div className="w-full h-full overflow-y-auto no-scrollbar">
            {currentSlide === 0 && <Hero />}
            {currentSlide === 1 && <FeaturedProjects />}
            {currentSlide === 2 && <AboutPreview />}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hero-specific Down Arrow */}
      {currentSlide === 0 && (
        <button 
          onClick={() => paginate(1)}
          aria-label="Scroll down"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce p-2 bg-foreground/5 dark:bg-white/10 rounded-full z-50"
        >
          <ChevronDown className="w-6 h-6 text-primary" />
        </button>
      )}

      {/* Progress Bar (Dynamic Width) */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-500 z-50" 
        style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` } as React.CSSProperties}
      />
    </main>
  );
}