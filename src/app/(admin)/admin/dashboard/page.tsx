"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  MailOpen,
  Trash2,
  FileText,
  FolderGit2,
  Users,
  Loader2,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Inbox,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [msgRes, projRes, blogRes] = await Promise.all([
        fetch("/api/contact"),
        fetch("/api/projects"),
        fetch("/api/blog"),
      ]);

      const msgData = await msgRes.json();
      const projData = await projRes.json();
      const blogData = await blogRes.json();

      const fetchedMessages = msgData.messages || [];

      setMessages(fetchedMessages);
      setStats({
        projects: projData.projects?.length || 0,
        blogs: blogData.posts?.length || 0,
        totalMessages: fetchedMessages.length,
        unreadMessages: fetchedMessages.filter((m: Message) => !m.read).length,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: !currentStatus }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m._id === id ? { ...m, read: !currentStatus } : m))
        );
        setStats((prev) => ({
          ...prev,
          unreadMessages: currentStatus
            ? prev.unreadMessages + 1
            : Math.max(0, prev.unreadMessages - 1),
        }));
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Loading Metrics...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Operations Overview
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Command Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time analytics, user inquiries, and content inventory status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/projects"
            className="px-4 py-2 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold hover:opacity-95 active:scale-98 transition-all shadow-sm flex items-center gap-1.5"
          >
            <FolderGit2 className="w-3.5 h-3.5" /> Manage Projects
          </Link>
          <Link
            href="/admin/blog"
            className="px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 active:scale-98 transition-all border border-zinc-200/60 dark:border-zinc-700 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Manage Blog
          </Link>
        </div>
      </div>

      {/* STATS BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Metric */}
        <Link
          href="/admin/projects"
          className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.3)] hover:border-cyan-500/40 transition-all duration-200 group flex items-center gap-4"
        >
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-500 group-hover:scale-105 transition-transform">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Total Projects
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
              {stats.projects}
            </h3>
          </div>
        </Link>

        {/* Blogs Metric */}
        <Link
          href="/admin/blog"
          className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.3)] hover:border-purple-500/40 transition-all duration-200 group flex items-center gap-4"
        >
          <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Published Posts
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
              {stats.blogs}
            </h3>
          </div>
        </Link>

        {/* Messages Metric */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Total Inquiries
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
              {stats.totalMessages}
            </h3>
          </div>
        </div>

        {/* Unread Metric */}
        <div
          onClick={() => setFilter(filter === "unread" ? "all" : "unread")}
          className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex items-center gap-4 cursor-pointer hover:border-amber-500/40 transition-all"
        >
          <div className="relative p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <Mail className="w-6 h-6" />
            {stats.unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 animate-pulse border-2 border-white dark:border-zinc-900" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Unread Inbox
            </p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
              {stats.unreadMessages}
            </h3>
          </div>
        </div>
      </div>

      {/* MESSAGES MANAGEMENT SECTION */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
        {/* Messages Header & Filters */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                Visitor Messages
              </h2>
              <span className="text-xs text-zinc-400">
                Inquiries submitted through the public contact form
              </span>
            </div>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
            {(["all", "unread", "read"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight capitalize transition-all ${
                  filter === t
                    ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Message Items List */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No messages found in this filter.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg._id}
                className={`p-5 sm:p-6 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  !msg.read
                    ? "bg-cyan-500/[0.03] dark:bg-cyan-500/[0.04]"
                    : "hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20"
                }`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!msg.read ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        New Inquiry
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        Read
                      </span>
                    )}

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {msg.name}
                    </h4>

                    <span className="text-xs text-zinc-400">•</span>

                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {msg.email}
                    </a>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  <span className="text-[11px] text-zinc-400 block pt-1">
                    Received on{" "}
                    {new Date(msg.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  <a
                    href={`mailto:${msg.email}?subject=Re:%20Inquiry%20from%20Portfolio`}
                    className="p-2 text-zinc-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    title="Reply by email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => toggleReadStatus(msg._id, msg.read)}
                    className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    title={msg.read ? "Mark as unread" : "Mark as read"}
                  >
                    {msg.read ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </button>

                  <button
                    onClick={() => deleteMessage(msg._id)}
                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
