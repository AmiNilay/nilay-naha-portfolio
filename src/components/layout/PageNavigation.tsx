"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function PageNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Define site structure
  const pages = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const safePathname = pathname || "";
  const currentIndex = pages.findIndex((page) => page.path === safePathname);
  const totalPages = pages.length;

  // Calculate paths
  const prevIndex = (currentIndex - 1 + totalPages) % totalPages;
  const nextIndex = (currentIndex + 1) % totalPages;

  const prevPage = currentIndex !== -1 ? pages[prevIndex] : pages[0];
  const nextPage = currentIndex !== -1 ? pages[nextIndex] : pages[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || safePathname.startsWith("/admin") || currentIndex === -1) return;

    // --- KEYBOARD LOGIC (Desktop) ---
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      if (e.key === "ArrowRight") router.push(nextPage.path);
      if (e.key === "ArrowLeft") router.push(prevPage.path);
    };

    // --- TOUCH SWIPE LOGIC (Mobile) ---
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;

      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Logic: Only navigate if the swipe is mostly HORIZONTAL
      // If user swipes vertically (to scroll), we do nothing.
      if (Math.abs(diffX) > Math.abs(diffY)) {
        
        // Threshold: Swipe must be longer than 50px
        if (Math.abs(diffX) > 50) {
          if (diffX > 0) {
            // Swiped LEFT (Finger moved Right -> Left) => Go NEXT
            router.push(nextPage.path);
          } else {
            // Swiped RIGHT (Finger moved Left -> Right) => Go PREV
            router.push(prevPage.path);
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
  }, [mounted, safePathname, currentIndex, router, nextPage.path, prevPage.path]);

  // RETURN NULL: No visual buttons, logic only.
  return null;
}