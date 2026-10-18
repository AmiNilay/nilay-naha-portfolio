"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  Home,
  User,
  LogOut,
  Bot,
  BellRing,
  X,
  ExternalLink,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Content Studio",
    items: [
      { name: "Projects", href: "/admin/projects", icon: FolderGit2 },
      { name: "Blog Posts", href: "/admin/blog", icon: FileText },
      { name: "Home Page", href: "/admin/home", icon: Home },
      { name: "About Page", href: "/admin/about", icon: User },
    ],
  },
  {
    title: "Intelligence & Alerts",
    items: [
      { name: "Train Chatbot", href: "/admin/chatbot", icon: Bot },
      { name: "Push Alerts", href: "/admin/notifications", icon: BellRing },
    ],
  },
];

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Continue even if request fails
    }
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-72 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-r border-zinc-200/80 dark:border-zinc-800/80 h-screen flex flex-col justify-between shadow-2xl lg:shadow-none select-none">
      {/* Top Header: macOS Window Traffic Lights & Brand */}
      <div>
        <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            {/* macOS Window Traffic Lights */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/90 shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-amber-400/90 shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm" />
            </div>
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
                  Dev<span className="text-cyan-500">.Studio</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                  CMS
                </span>
              </div>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Admin Status Capsule */}
        <div className="px-6 pt-5 pb-2">
          <div className="px-3.5 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                Connected
              </span>
            </div>
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
              Admin Session
            </span>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="px-4 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 mb-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold tracking-tight transition-all duration-200 ${
                      isActive
                        ? "text-zinc-950 dark:text-white"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="adminSidebarPill"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        className="absolute inset-0 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/60 shadow-sm"
                      />
                    )}
                    <Icon
                      className={`relative z-10 w-4 h-4 transition-colors ${
                        isActive
                          ? "text-cyan-500 dark:text-cyan-400"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    />
                    <span className="relative z-10 flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="relative z-10 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Controls: Live Site Link & Sign Out */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            View Live Portfolio
          </span>
          <span className="text-[10px] text-zinc-400">Public ↗</span>
        </a>

        <button
          onClick={handleSignOut}
          type="button"
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of CMS
        </button>
      </div>
    </aside>
  );
}
