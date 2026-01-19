"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const pages = ["/", "/projects", "/blog", "/about", "/contact"];

export default function PageNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showHints, setShowHints] = useState(false);

  // Refs for touch coordinates to avoid stale closures in event listeners
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const safePathname = pathname || "";
  const currentIndex = pages.indexOf(safePathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Show Hints Logic (Mobile Only)
  useEffect(() => {
    if (!mounted || safePathname.startsWith("/admin")) return;

    if (window.innerWidth < 768) {
      setShowHints(true);
      const timer = setTimeout(() => setShowHints(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [safePathname, mounted]);

  // 2. Navigation Logic (Keyboard + Touch)
  useEffect(() => {
    if (!mounted || safePathname.startsWith("/admin") || currentIndex === -1) return;

    // --- KEYBOARD ---
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key === "ArrowRight" && currentIndex < pages.length - 1) router.push(pages[currentIndex + 1]);
      if (e.key === "ArrowLeft" && currentIndex > 0) router.push(pages[currentIndex - 1]);
    };

    // --- TOUCH ---
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.changedTouches[0].screenX,
        y: e.changedTouches[0].screenY
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;

      const diffX = touchStart.current.x - touchEndX;
      const diffY = touchStart.current.y - touchEndY;

      // Reset
      touchStart.current = null;

      // Logic: Only navigate if swipe is mostly HORIZONTAL (prevents interference with scrolling)
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Threshold > 50px
        if (Math.abs(diffX) > 50) {
          if (diffX > 0) {
            // Swiped LEFT (Next)
            if (currentIndex < pages.length - 1) router.push(pages[currentIndex + 1]);
          } else {
            // Swiped RIGHT (Prev)
            if (currentIndex > 0) router.push(pages[currentIndex - 1]);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [mounted, safePathname, currentIndex, router]);

  // Don't render anything if not mounted or on admin
  if (!mounted || safePathname.startsWith("/admin")) return null;

  return (
    <>
      {/* --- MOBILE VISUAL HINTS (Animated Overlay) --- */}
      <div 
        className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-between px-4 transition-opacity duration-700 md:hidden ${
          showHints ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Left Hint (Swipe Right to go Prev) */}
        <div className={`transition-transform duration-500 ${showHints ? "translate-x-0" : "-translate-x-8"}`}>
          {currentIndex > 0 && (
            <div className="bg-black/40 dark:bg-white/10 backdrop-blur-md p-3 rounded-full text-white shadow-lg animate-pulse">
              <ChevronLeft size={32} />
            </div>
          )}
        </div>

        {/* Right Hint (Swipe Left to go Next) */}
        <div className={`transition-transform duration-500 ${showHints ? "translate-x-0" : "translate-x-8"}`}>
          {currentIndex < pages.length - 1 && (
            <div className="bg-black/40 dark:bg-white/10 backdrop-blur-md p-3 rounded-full text-white shadow-lg animate-pulse">
              <ChevronRight size={32} />
            </div>
          )}
        </div>
      </div>

      {/* --- DESKTOP DOT NAVIGATION --- */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
        {pages.map((path, idx) => (
          <div
            key={path}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "bg-primary scale-125"
                : "bg-gray-400 dark:bg-gray-600 hover:bg-primary/50"
            }`}
          />
        ))}
      </div>
    </>
  );
}