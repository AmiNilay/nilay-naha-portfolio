"use client";

import { useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Hero from "@/components/sections/Hero";
import FeaturedProjects from "@/components/sections/FeaturedProjects";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="snap-container bg-background w-full relative">
      
      {/* --- SECTION 1: HERO --- */}
      <section ref={heroRef} className="snap-section flex items-center justify-center">
        <div className="w-full max-w-7xl px-4">
           <Hero />
        </div>
        
        {/* FIX: Added aria-label here */}
        <button 
          onClick={() => scrollToSection(projectsRef)}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce p-2 bg-white/80 dark:bg-black/50 rounded-full shadow-md hover:bg-white transition-colors"
          aria-label="Scroll down to projects" 
        >
          <ChevronDown className="w-6 h-6 text-primary" />
        </button>
      </section>

      {/* --- SECTION 2: PROJECTS --- */}
      <section ref={projectsRef} className="snap-section flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/20">
        <div className="w-full h-full pt-16">
           <FeaturedProjects />
        </div>
        
        {/* FIX: Added aria-label here */}
        <button 
           onClick={() => scrollToSection(heroRef)}
           className="absolute bottom-10 right-10 p-3 bg-white/80 dark:bg-black/50 rounded-full shadow-lg hover:scale-110 transition-transform hidden md:block"
           aria-label="Scroll up to home"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </section>

    </main>
  );
}