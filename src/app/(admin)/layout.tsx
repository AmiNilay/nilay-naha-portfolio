"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar"; // Import the component

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Skip check for login page
        if (pathname === "/admin/login") {
            setAuthorized(true);
            return;
        }

        // Check for token (supporting both localStorage and cookies for compatibility)
        const token = localStorage.getItem("admin_secret");
        
        // Simple check: if no token found in localStorage, redirect
        if (!token) {
            router.push("/admin/login");
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    if (!authorized) return null;

    // Render simple layout for login page (No Sidebar)
    if (pathname === "/admin/login") return <>{children}</>;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
            {/* FIX: Replaced the hardcoded <aside> with the component.
               This ensures your new "Home" and "About" links appear.
            */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
}