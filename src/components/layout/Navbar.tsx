"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import PushNotificationButton from "@/components/ui/PushNotificationButton";

export default function Navbar() {
  const pathname = usePathname();
  
  // If we are in the admin panel, do not show this public navbar
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", slideIndex: 0 },
    { name: "Projects", href: "/projects", slideIndex: 1 },
    { name: "Blog", href: "/blog", slideIndex: 2 },
    { name: "About", href: "/about", slideIndex: 3 },
    { name: "Contact", href: "/contact", slideIndex: 4 },
  ];

  // Helper to handle navigation on both desktop and mobile
  const handleNavClick = (link: typeof navLinks[0], e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent("portfolio-navigate-slide", {
          detail: { slideIndex: link.slideIndex },
        })
      );
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800 select-none">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          prefetch={true}
          onClick={(e) => handleNavClick(navLinks[0], e)}
          className="text-xl font-bold tracking-tighter active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          Dev.<span className="text-primary">Portfolio</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                prefetch={true}
                onClick={(e) => handleNavClick(link, e)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95 select-none cursor-pointer ${
                  isActive 
                    ? "bg-primary/10 text-primary font-bold shadow-[0_0_15px] shadow-primary/50 border border-primary/30" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
            <PushNotificationButton />
            
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all duration-150 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {!mounted ? (
                <div className="w-5 h-5" /> 
              ) : theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <PushNotificationButton />
          
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all duration-150 cursor-pointer"
            aria-label="Toggle Theme"
          >
             {mounted && theme === "dark" ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-700" />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 active:scale-90 transition-transform duration-150 cursor-pointer"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2 shadow-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                prefetch={true}
                onClick={(e) => {
                  setIsOpen(false);
                  handleNavClick(link, e);
                }}
                className={`block px-4 py-3 rounded-xl text-base transition-all duration-150 active:scale-98 cursor-pointer select-none ${
                  isActive 
                    ? "bg-primary/10 text-primary font-bold border-l-4 border-primary shadow-[inset_0_0_20px] shadow-primary/20" 
                    : "text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
