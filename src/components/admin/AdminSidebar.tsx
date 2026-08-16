"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderGit2, FileText, Home, User, LogOut, Bot, Command, X } from "lucide-react";

const navLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/admin/projects", icon: FolderGit2 },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Home Page", href: "/admin/home", icon: Home },
  { name: "About Page", href: "/admin/about", icon: User },
  { name: "Train Chatbot", href: "/admin/chatbot", icon: Bot },
];

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white border-r border-gray-200 h-screen flex flex-col shadow-2xl lg:shadow-none">
      {/* Premium Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm">
            <Command className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            Dev<span className="text-blue-600">.Admin</span>
          </span>
        </div>
        {/* Mobile Close Button */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 flex flex-col gap-1.5 overflow-y-auto">
        <div className="px-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          Menu
        </div>
        
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onClose} // Close sidebar on mobile when a link is clicked
              className={`flex items-center gap-3 mx-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <link.icon 
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600"
                }`} 
              />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors group">
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
