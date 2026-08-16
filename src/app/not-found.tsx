"use client";

import { useRef } from "react";
import Link from "next/link";
import { Home, Search, Compass, ArrowRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Transform mouse position into subtle movement for the 404 text
  const textX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const textY = useTransform(springY, [-0.5, 0.5], [-30, 30]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Programmatically trigger the Command Palette (Cmd+K / Ctrl+K)
  const triggerSearch = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }));
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-[90vh] flex flex-col items-center justify-center bg-white dark:bg-gray-950 text-center px-6 overflow-hidden relative"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-8 shadow-sm border border-blue-100 dark:border-blue-900/30"
      >
        <Compass className="w-10 h-10 animate-pulse" />
      </motion.div>
      
      <motion.h1 
        style={{ x: textX, y: textY }}
        className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-400 dark:from-white dark:to-gray-600 mb-4 tracking-tighter select-none cursor-default"
      >
        404
      </motion.h1>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6"
      >
        Looks like you're lost in space.
      </motion.h2>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 dark:text-gray-400 max-w-md mb-10 text-base md:text-lg"
      >
        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
      </motion.p>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Link 
          href="/" 
          className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold transition-all hover:scale-105 hover:-translate-y-1 shadow-lg w-full sm:w-auto justify-center"
        >
          <Home className="w-5 h-5" /> Return Home
        </Link>
        
        <button 
          onClick={triggerSearch}
          className="flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-full font-bold transition-all hover:scale-105 hover:-translate-y-1 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 w-full sm:w-auto justify-center"
        >
          <Search className="w-5 h-5" /> Search Site
        </button>
      </motion.div>

      {/* Quick Links */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16 flex flex-wrap justify-center items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400"
      >
        <Link href="/projects" className="hover:text-blue-600 transition-colors flex items-center gap-1 group">
          Projects <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform"/>
        </Link>
        <Link href="/blog" className="hover:text-blue-600 transition-colors flex items-center gap-1 group">
          Blog <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform"/>
        </Link>
        <Link href="/contact" className="hover:text-blue-600 transition-colors flex items-center gap-1 group">
          Contact <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform"/>
        </Link>
      </motion.div>
    </div>
  );
}
