"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import PushNotificationButton from "@/components/ui/PushNotificationButton";

// Apple-standard fluid spring physics
const appleSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
};

export default function Navbar() {
  const pathname = usePathname();

  // If we are in the admin panel, do not show this public navbar
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to slide changes from HomeClient or PageNavigation
  useEffect(() => {
    const handleSlideChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ slideIndex: number }>;
      if (typeof customEvt.detail?.slideIndex === "number") {
        setActiveSlide(customEvt.detail.slideIndex);
      }
    };

    window.addEventListener("portfolio-slide-change", handleSlideChange);
    return () => window.removeEventListener("portfolio-slide-change", handleSlideChange);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/", slideIndex: 0 },
    { name: "Projects", href: "/projects", slideIndex: 1 },
    { name: "Blog", href: "/blog", slideIndex: 2 },
    { name: "About", href: "/about", slideIndex: 3 },
    { name: "Contact", href: "/contact", slideIndex: 4 },
  ];

  // Precise active tab resolver
  const isLinkActive = (link: typeof navLinks[0]) => {
    if (pathname === "/") {
      return activeSlide === link.slideIndex;
    }
    if (link.href === "/") {
      return pathname === "/";
    }
    // Matches exact route or nested routes (e.g. /projects/slug, /blog/slug)
    return pathname === link.href || pathname?.startsWith(`${link.href}/`);
  };

  // Immediate click response + slide switching
  const handleNavClick = (link: typeof navLinks[0], e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      setActiveSlide(link.slideIndex);
      window.dispatchEvent(
        new CustomEvent("portfolio-navigate-slide", {
          detail: { slideIndex: link.slideIndex },
        })
      );
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-3 sm:pt-4 px-3 sm:px-6 select-none pointer-events-none">
      <nav
        aria-label="Main Navigation"
        className="pointer-events-auto w-full max-w-5xl h-14 sm:h-15 px-3 sm:px-4 rounded-full
          bg-white/80 dark:bg-[#0B0F14]/80
          backdrop-blur-2xl backdrop-saturate-150
          border border-black/[0.08] dark:border-white/[0.12]
          shadow-[0_8px_32px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
          dark:shadow-[0_12px_40px_rgba(0,0,0,0.45),0_1px_2px_rgba(255,255,255,0.05)]
          flex items-center justify-between transition-all duration-300"
      >
        {/* Brand / Logo */}
        <Link
          href="/"
          prefetch={true}
          onClick={(e) => handleNavClick(navLinks[0], e)}
          className="group flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] dark:from-[#F59E0B] dark:to-[#FBBF24] flex items-center justify-center text-white dark:text-[#0B0F14] font-black text-sm shadow-[0_2px_10px_rgba(15,118,110,0.3)] dark:shadow-[0_2px_10px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform">
            N
          </span>
          <span className="text-[15px] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Nilay<span className="text-[#0F766E] dark:text-[#F59E0B]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Links (Floating Glass Pill) */}
        <div className="hidden md:flex items-center p-1 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.name}
                href={link.href}
                prefetch={true}
                onClick={(e) => handleNavClick(link, e)}
                className={`relative px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-200 active:scale-95 select-none cursor-pointer ${
                  active
                    ? "text-[#0F766E] dark:text-[#F59E0B] font-semibold"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
              >
                {/* Active Sliding Spring Pill Indicator */}
                {active && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    transition={appleSpring}
                    className="absolute inset-0 rounded-full bg-white dark:bg-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.6)] border border-black/[0.04] dark:border-white/[0.08]"
                    style={{ zIndex: -1 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Actions (Notifications, Theme Toggle, Mobile Trigger) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <PushNotificationButton />

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:scale-90 transition-all duration-150 cursor-pointer"
            aria-label="Toggle Color Theme"
          >
            {!mounted ? (
              <div className="w-4 h-4" />
            ) : theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#F59E0B] transition-transform duration-200 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700 transition-transform duration-200 rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:scale-90 transition-all duration-150 cursor-pointer"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Floating Glass Sheet Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={appleSpring}
            className="pointer-events-auto md:hidden absolute top-20 left-4 right-4 p-3 rounded-3xl
              bg-white/90 dark:bg-[#0B0F14]/90
              backdrop-blur-3xl backdrop-saturate-150
              border border-black/[0.08] dark:border-white/[0.12]
              shadow-[0_20px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_56px_rgba(0,0,0,0.7)]
              flex flex-col gap-1 z-50"
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  onClick={(e) => {
                    setIsOpen(false);
                    handleNavClick(link, e);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-[15px] font-medium transition-all duration-150 active:scale-98 cursor-pointer ${
                    active
                      ? "bg-[#0F766E]/10 dark:bg-[#F59E0B]/10 text-[#0F766E] dark:text-[#F59E0B] font-semibold"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <span>{link.name}</span>
                  {active && (
                    <motion.span
                      layoutId="mobile-nav-dot"
                      className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#F59E0B]"
                    />
                  )}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
