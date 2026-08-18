"use client";

import { useState, useEffect } from "react";
import { Send, Users, Loader2, BellRing, Link as LinkIcon } from "lucide-react";
import Toast from "@/components/ui/Toast";

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
      setToast({ message: "Title and Message are required.", type: "error" });
      return;
    }

    if (!confirm(`Are you sure you want to send this notification to ${subscriberCount} users?`)) {
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
        setToast({ message: data.message || "Broadcast sent successfully!", type: "success" });
        setFormData({ title: "", body: "", url: "/" }); // Reset form
      } else {
        throw new Error(data.error || "Failed to send broadcast");
      }
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <BellRing className="w-8 h-8 text-blue-600" /> Push Notifications
        </h1>
        <p className="text-gray-600 mt-2 font-medium">
          Send real-time alerts to users who have installed your portfolio app or allowed notifications.
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8 flex items-center gap-4">
        <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
          <Users className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Subscribers</p>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {loadingCount ? <Loader2 className="w-6 h-6 animate-spin text-blue-600 mt-2" /> : subscriberCount}
          </h2>
        </div>
      </div>

      {/* Compose Form */}
      <form onSubmit={handleSendBroadcast} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Compose Broadcast</h3>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">Notification Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. New Project Published!"
            className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">Message Body</label>
          <textarea
            required
            rows={3}
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="e.g. I just released a new AI Yield Predictor. Check it out!"
            className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1">
            <LinkIcon className="w-3 h-3" /> Target URL (Where they go when they click)
          </label>
          <input
            type="text"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="e.g. /projects/ai-yield-predictor"
            className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-500 font-medium">Use a relative path (like <code className="bg-gray-100 px-1 rounded">/blog</code>) or a full URL.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={sending || subscriberCount === 0}
            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {sending ? "Sending Broadcast..." : `Send to ${subscriberCount} Subscribers`}
          </button>
        </div>
      </form>
    </div>
  );
}
