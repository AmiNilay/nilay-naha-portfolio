"use client";

import Link from "next/link";
import { FolderKanban, FileText, Home, User, ExternalLink } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <Link 
          href="/" 
          target="_blank" 
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          View Live Site <ExternalLink size={16} />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Projects */}
        <Link 
          href="/admin/projects"
          className="group p-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex flex-col items-center gap-4">
            <FolderKanban className="w-12 h-12 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage Projects
            </h2>
            <p className="text-sm text-gray-500 text-center">Add, edit, or remove portfolio projects.</p>
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
            <p className="text-sm text-gray-500 text-center">Write and publish articles.</p>
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
            <p className="text-sm text-gray-500 text-center">Update Hero section, headlines, and profile pic.</p>
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
            <p className="text-sm text-gray-500 text-center">Update bio, skills, and education history.</p>
          </div>
        </Link>

      </div>
    </div>
  );
}