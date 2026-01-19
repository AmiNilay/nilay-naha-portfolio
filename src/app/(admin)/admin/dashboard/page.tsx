"use client";

import Link from "next/link";
import { FolderKanban, FileText, Home, User } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      {/* Fixed: Adaptive Title Color */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Dashboard Overview
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Projects */}
        <Link 
          href="/admin/projects"
          className="group p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex flex-col items-center gap-4">
            <FolderKanban className="w-12 h-12 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
            {/* Fixed: Adaptive Text Color */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage Projects
            </h2>
          </div>
        </Link>

        {/* Card 2: Blog Posts */}
        <Link 
          href="/admin/blog"
          className="group p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex flex-col items-center gap-4">
            <FileText className="w-12 h-12 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage Blog Posts
            </h2>
          </div>
        </Link>

        {/* Card 3: Edit Home */}
        <Link 
          href="/admin/home"
          className="group p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex flex-col items-center gap-4">
            <Home className="w-12 h-12 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Home Page
            </h2>
          </div>
        </Link>

        {/* Card 4: Edit About */}
        <Link 
          href="/admin/about"
          className="group p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex flex-col items-center gap-4">
            <User className="w-12 h-12 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit About Page
            </h2>
          </div>
        </Link>

      </div>
    </div>
  );
}