"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  User, 
  Home, 
  LogOut 
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0 bottom-0 z-50 flex flex-col">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
         <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/admin/dashboard") ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"}`}>
           <LayoutDashboard size={20} /> Dashboard
        </Link>

        {/* THESE ARE THE NEW LINKS */}
        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase">Pages</div>
        
        <Link href="/admin/home" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/admin/home") ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"}`}>
           <Home size={20} /> Edit Home
        </Link>

        <Link href="/admin/about" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/admin/about") ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"}`}>
           <User size={20} /> Edit About
        </Link>

        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase">Content</div>
        
        <Link href="/admin/projects" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/admin/projects") ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"}`}>
           <FolderKanban size={20} /> Projects
        </Link>

        <Link href="/admin/blog" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/admin/blog") ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"}`}>
           <FileText size={20} /> Blog Posts
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-3 text-red-500 hover:bg-red-50 w-full px-4 py-3 rounded-lg">
           <LogOut size={20} /> Logout
        </Link>
      </div>
    </aside>
  );
}