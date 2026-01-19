"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";

// Import your sections
import Hero from "@/components/sections/Hero";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import AboutPreview from "@/components/sections/AboutPreview";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Define your slides here
  const slides = [
    { id: "hero", component: <Hero /> },
    { id: "projects", component: <FeaturedProjects /> },
    { id: "about", component: <AboutPreview /> },
  ];

  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Keyboard Navigation Support (Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextSlide();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    // h-screen + overflow-hidden = NO SCROLLING ALLOWED
    <main className="h-screen w-full overflow-hidden bg-background relative flex flex-col pt-16">
      
      {/* --- SLIDE CONTENT AREA --- */}
      {/* We use flex-1 to fill the remaining space below navbar */}
      <div className="flex-1 w-full h-full relative">
        {/* Render only the active slide */}
        <div className="absolute inset-0 w-full h-full animate-in fade-in slide-in-from-right-4 duration-500">
           {/* If a slide is too tall, we allow internal scroll, but hide the bar to keep it clean */}
           <div className="w-full h-full overflow-y-auto no-scrollbar flex items-center justify-center">
              {slides[currentSlide].component}
           </div>
        </div>
      </div>

      {/* --- NAVIGATION CONTROLS (Floating) --- */}
      <div className="absolute bottom-8 right-8 z-50 flex items-center gap-4">
        
        {/* Hint Text */}
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest animate-pulse mr-2 hidden md:block">
          {currentSlide === 0 ? "Start Tour" : "Navigate"}
        </span>

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="p-3 rounded-full border border-gray-300 dark:border-gray-700 bg-background/50 backdrop-blur-md hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Slide Indicator (1 / 3) */}
        <div className="text-sm font-bold font-mono w-12 text-center">
          {currentSlide + 1} / {totalSlides}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="p-3 rounded-full border border-gray-300 dark:border-gray-700 bg-background/50 backdrop-blur-md hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group shadow-lg"
          aria-label="Next Slide"
        >
           {currentSlide === totalSlides - 1 ? (
             // Show a different icon on the last slide if you want (or loop back)
             <ArrowRight className="w-6 h-6" /> 
           ) : (
             <ChevronRight className="w-6 h-6" />
           )}
        </button>

      </div>

      {/* --- PROGRESS BAR (Optional visual cue) --- */}
      <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-500" 
           style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }} 
      />

    </main>
  );
}