"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, FolderGit2, LogOut } from "lucide-react";

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

        // Check for token
        const token = localStorage.getItem("admin_secret");
        if (!token) {
            router.push("/admin/login");
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    if (!authorized) return null;

    // Render simple layout for login page
    if (pathname === "/admin/login") return <>{children}</>;

    return (
        <div className="min-h-screen bg-muted/20 flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 hidden md:block">
                <div className="p-6 border-b border-border">
                    <h1 className="font-bold text-xl">Admin Panel</h1>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md text-sm font-medium">
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link href="/admin/projects" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md text-sm font-medium">
                        <FolderGit2 size={18} /> Projects
                    </Link>
                    <Link href="/admin/blog" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md text-sm font-medium">
                        <FileText size={18} /> Blog Posts
                    </Link>
                    <button 
                        onClick={() => {
                            localStorage.removeItem("admin_secret");
                            router.push("/admin/login");
                        }}
                        className="flex items-center gap-2 p-2 w-full text-left hover:bg-red-500/10 text-red-500 rounded-md text-sm font-medium mt-8"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}