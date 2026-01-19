"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Login failed");

            // Store the secret token
            localStorage.setItem("admin_secret", data.token);
            router.push("/admin/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40">
            <div className="w-full max-w-md p-8 bg-card border border-border rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Password</label>
                        <Input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </div>
        </div>
    );
}