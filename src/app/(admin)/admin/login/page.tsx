"use client";

import { useState } from "react";
import { Lock, Loader2, Mail, Key, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Hard redirect attaches the cookie seamlessly
        window.location.href = "/admin/dashboard";
      } else {
        setError("Invalid email or password credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError("Network or server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden select-none">
      {/* Ambient Radial Mesh Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-sky-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-[32px] p-8 sm:p-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_24px_70px_rgba(0,0,0,0.08)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.6)]">
          {/* macOS Window Controls Decorator */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/90 shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-amber-400/90 shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Security Clearance
            </span>
          </div>

          {/* Security Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-sky-500/20 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-center text-zinc-900 dark:text-white tracking-tight mb-2">
            Admin Studio
          </h1>
          <p className="text-center text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium mb-8">
            Authenticate to access portfolio management tools.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Security Password
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-zinc-950/10 hover:opacity-95 active:scale-98 flex justify-center items-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Unlock Studio <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Secured with HTTP-only tokens & Next.js Edge Auth
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
