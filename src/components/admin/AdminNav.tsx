"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, FolderGit2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/admin/projects", icon: FolderGit2 },
    { name: "Blog Posts", href: "/admin/blog", icon: FileText },
];

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("admin_secret");
        router.push("/admin/login");
    };

    return (
        <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 hidden md:flex flex-col">
            <div className="p-6 border-b border-border">
                <h1 className="font-bold text-xl tracking-tight">Admin Panel</h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href} 
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors",
                                isActive 
                                    ? "bg-primary text-primary-foreground" 
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