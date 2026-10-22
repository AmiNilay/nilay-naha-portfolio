"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import AdminSidebar from "./AdminSidebar";
import { Menu, ExternalLink, Sparkles } from "lucide-react";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  // The admin panel is always light. Strip `dark` from <html> while mounted
  // (and whenever next-themes re-adds it) without touching the visitor's
  // saved public theme; restore it on the way back to the public site.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const forceLight = () => {
      if (root.classList.contains("dark")) root.classList.remove("dark");
      if (root.style.colorScheme !== "light") root.style.colorScheme = "light";
    };
    forceLight();
    const observer = new MutationObserver(forceLight);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "style"] });
    return () => {
      observer.disconnect();
      if (resolvedTheme === "dark") {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      }
    };
  }, [resolvedTheme]);

  // Derive section name from pathname
  const sectionName = (() => {
    if (pathname.includes("/admin/projects")) return "Projects Inventory";
    if (pathname.includes("/admin/blog")) return "Blog Publications";
    if (pathname.includes("/admin/home")) return "Hero & Home Studio";
    if (pathname.includes("/admin/about")) return "About Me Profile";
    if (pathname.includes("/admin/chatbot")) return "Chatbot Intelligence";
    if (pathname.includes("/admin/notifications")) return "Push Notifications";
    if (pathname.includes("/admin/dashboard")) return "Command Center";
    if (pathname.includes("/admin/analytics")) return "User Flow Analytics";
    if (pathname.includes("/admin/testimonials")) return "Testimonials";
    return "Admin Studio";
  })();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex text-zinc-900 dark:text-zinc-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-800 dark:selection:text-cyan-200">
      {/* Mobile Sidebar Overlay with Apple Backdrop Blur */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Fixed on Desktop, Slide-over on Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:block ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar (Desktop & Mobile) */}
        <header className="h-16 px-6 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between sticky top-0 z-30">
          {/* Mobile Menu Trigger & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors border border-zinc-200/70 dark:border-zinc-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                Admin /
              </span>
              <span className="text-sm md:text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {sectionName}
              </span>
            </div>
          </div>

          {/* Quick Header Right Actions */}
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-500" />
              Live Site
            </a>

            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Production
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 w-full">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
