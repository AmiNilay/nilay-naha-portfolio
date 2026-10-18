"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Users,
  Loader2,
  BellRing,
  Link as LinkIcon,
  Sparkles,
  Smartphone,
  Radio,
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import { motion } from "framer-motion";

export default function NotificationsAdminPage() {
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "/",
  });

  // Fetch total subscribers on load
  useEffect(() => {
    fetch("/api/push/broadcast")
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) setSubscriberCount(data.count);
        setLoadingCount(false);
      })
      .catch(() => setLoadingCount(false));
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      setToast({ message: "Title and Message body are required.", type: "error" });
      return;
    }

    if (!confirm(`Are you sure you want to broadcast this alert to ${subscriberCount} registered devices?`)) {
      return;
    }

    setSending(true);
    setToast(null);

    try {
      const res = await fetch("/api/push/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ message: data.message || "Broadcast transmitted successfully!", type: "success" });
        setFormData({ title: "", body: "", url: "/" });
      } else {
        throw new Error(data.error || "Failed to transmit broadcast");
      }
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 select-none">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-500" /> Web Push Subsystem
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Push Notification Broadcast
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Dispatch real-time web notifications directly to installed devices and browser subscribers.
          </p>
        </div>

        {/* Live Audience Stat Pill */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center gap-3 w-fit">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Audience Reach
            </span>
            <span className="text-lg font-black text-zinc-900 dark:text-white">
              {loadingCount ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500 inline" />
              ) : (
                `${subscriberCount} Devices`
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Compose Form (7 cols) */}
        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSendBroadcast}
          className="lg:col-span-7 rounded-[32px] p-6 sm:p-8 bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-5"
        >
          <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" /> Compose Message
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Notification Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. New Case Study Published!"
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Notification Body
            </label>
            <textarea
              required
              rows={3}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="e.g. Explore the architecture of my newest high-throughput FastAPI service..."
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-cyan-500" /> Target URL Destination
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="e.g. /projects/shortdesk or /blog/fastapi-patterns"
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
            />
            <p className="text-[11px] text-zinc-400">
              Users will navigate to this relative path or URL when they tap the notification.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              type="submit"
              disabled={sending || subscriberCount === 0}
              className="w-full py-4 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs sm:text-sm shadow-xl shadow-zinc-950/10 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? "Transmitting Alert..." : `Broadcast to ${subscriberCount} Subscribers`}
            </button>
          </div>
        </motion.form>

        {/* Right: Live Apple iOS Notification Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Smartphone className="w-4 h-4 text-cyan-500" /> Apple Device Preview
          </div>

          {/* iOS Lock Screen Notification Widget */}
          <div className="rounded-[32px] p-6 bg-gradient-to-b from-zinc-200/60 via-zinc-200/40 to-zinc-300/60 dark:from-zinc-900/80 dark:via-zinc-900/60 dark:to-zinc-950/90 border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <div className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-6">
              Lock Screen Banner
            </div>

            {/* Apple Notification Bubble */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-white/60 dark:border-zinc-700/60 shadow-lg space-y-1.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-[9px] font-black text-white">
                    N
                  </div>
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
                    NILAY NAHA
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">now</span>
              </div>

              <h4 className="text-xs font-bold text-zinc-900 dark:text-white pt-1">
                {formData.title || "Your Notification Title"}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                {formData.body || "Your message body will appear here on recipients' phones and desktops."}
              </p>
            </div>

            <p className="text-[10px] text-center text-zinc-400 mt-6 font-medium">
              Real-time representation of the Web Push payload banner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
