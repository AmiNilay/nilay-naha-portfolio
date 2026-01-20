"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, FolderGit2, LogOut, Home, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// UPDATED: Added Home and About items to match your new admin routes
const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Home Page", href: "/admin/home", icon: Home },
    { name: "About Page", href: "/admin/about", icon: UserCircle },
    { name: "Projects", href: "/admin/projects", icon: FolderGit2 },
    { name: "Blog Posts", href: "/admin/blog", icon: FileText },
];

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        // Ensure this matches your login logic (Admin Secret vs. Auth Token)
        localStorage.removeItem("admin_secret");
        router.push("/admin/login");
    };

    return (
        <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 hidden md:flex flex-col">
            <div className="p-6 border-b border-border">
                <h1 className="font-bold text-xl tracking-tight italic">Nilay Admin</h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // FIX: Strict path checking to prevent multiple items looking "active"
                    const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                    
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href} 
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors",
                                isActive 
                                    ? "bg-primary text-primary-foreground shadow-md" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 w-full text-left text-red-500 hover:bg-red-500/10 rounded-md text-sm font-medium transition-colors"
                >
                    <LogOut size={18} /> 
                    Logout
                </button>
            </div>
        </aside>
    );
}