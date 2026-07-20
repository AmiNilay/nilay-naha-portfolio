"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Hero from "@/components/sections/Hero";
import ProjectsPage from "./projects/ProjectsClient";
import BlogPage from "./blog/BlogClient";
import AboutPage from "./about/AboutClient";
import ContactPage from "./contact/ContactClient";

export default function HomeClient() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

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
    if (distance > 50) paginate(1);
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
            {currentSlide === 1 && <ProjectsPage />}
            {currentSlide === 2 && <BlogPage />}
            {currentSlide === 3 && <AboutPage />}
            {currentSlide === 4 && <ContactPage />}
          </div>
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute bottom-0 left-0 h-1.5 bg-primary transition-all duration-500 z-50 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
        style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` } as React.CSSProperties}
      />
    </main>
  );
}