"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-root min-h-screen bg-gray-50 flex text-gray-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Hidden on mobile by default, fixed on desktop) */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-gray-50">
        
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="font-extrabold text-xl tracking-tight text-gray-900">
            Dev<span className="text-blue-600">.Admin</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Page Content (Centered and constrained) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 w-full text-black">
          <div className="max-w-6xl mx-auto w-full bg-transparent">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
