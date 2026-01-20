"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- IMPORTS ---
import Hero from "@/components/sections/Hero";

// 👇 IMPORTING YOUR REAL PAGES DIRECTLY
import ProjectsPage from "./projects/page"; 
import BlogPage from "./blog/page";
import AboutPage from "./about/page";
import ContactPage from "./contact/page";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  // 5 Slides: Hero -> Projects -> Blog -> About -> Contact
  const totalSlides = 5;

  const paginate = (newDirection: number) => {
    if (currentSlide === 0 && newDirection === -1) return;
    if (currentSlide === totalSlides - 1 && newDirection === 1) return;

    setDirection(newDirection);
    setCurrentSlide((prev) => prev + newDirection);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const handleTouchStart = (e: React.TouchEvent) => (touchStart.current = e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => (touchEnd.current = e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    
    if (distance > 50) paginate(1);   // Swipe Left -> Next
    if (distance < -50) paginate(-1); // Swipe Right -> Prev

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
            
            {/* Slide 0: Hero */}
            {currentSlide === 0 && <Hero />}
            
            {/* Slide 1: Real Projects Page */}
            {currentSlide === 1 && <ProjectsPage />}

            {/* Slide 2: Real Blog Page */}
            {currentSlide === 2 && <BlogPage />}

            {/* Slide 3: Real About Page */}
            {currentSlide === 3 && <AboutPage />}

            {/* Slide 4: Real Contact Page */}
            {currentSlide === 4 && <ContactPage />}

          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-1.5 bg-primary transition-all duration-500 z-50 shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
        style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` } as React.CSSProperties}
      />
    </main>
  );
}