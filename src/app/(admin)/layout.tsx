"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar"; 
import { Menu } from "lucide-react"; // 🟢 Import Hamburger Icon

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    
    // 🟢 STATE: Controls mobile sidebar visibility
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (pathname === "/admin/login") {
            setAuthorized(true);
            return;
        }

        const token = localStorage.getItem("admin_secret");
        
        if (!token) {
            router.push("/admin/login");
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    if (!authorized) return null;

    if (pathname === "/admin/login") return <>{children}</>;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
            
            {/* 🟢 MOBILE TOP BAR: Visible only on mobile */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center shadow-sm">
                <button 
                    onClick={() => setSidebarOpen(true)} 
                    className="p-2 -ml-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
                <span className="ml-3 font-bold text-lg">Admin Panel</span>
            </div>

            {/* Sidebar Component with Control Props */}
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* 🟢 MAIN CONTENT: Adjusted margins for mobile/desktop */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen md:ml-64 pt-20 md:pt-8 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}