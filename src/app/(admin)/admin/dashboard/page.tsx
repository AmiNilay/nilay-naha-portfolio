"use client";

import { useState, useEffect } from "react";
import { Mail, MailOpen, Trash2, FileText, FolderGit2, Users, Loader2, CheckCircle } from "lucide-react";

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
  const [stats, setStats] = useState({ projects: 0, blogs: 0, totalMessages: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Messages
      const msgRes = await fetch("/api/contact");
      const msgData = await msgRes.json();
      const fetchedMessages = msgData.messages || [];
      
      // Fetch Projects count
      const projRes = await fetch("/api/projects");
      const projData = await projRes.json();
      
      // Fetch Blogs count
      const blogRes = await fetch("/api/blog");
      const blogData = await blogRes.json();

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
        fetchDashboardData(); // Refresh data
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
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
        <p className="text-gray-600 mt-2">Overview of your portfolio's performance and messages.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Projects</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.projects}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Published Blogs</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.blogs}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Messages</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalMessages}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Unread Messages</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</h3>
          </div>
        </div>
      </div>

      {/* MESSAGES TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Sender</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Message</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No messages received yet.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg._id} className={`hover:bg-gray-50 transition-colors ${!msg.read ? 'bg-blue-50/30' : ''}`}>
                    <td className="p-4">
                      {!msg.read ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <Mail className="w-3.5 h-3.5" /> New
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <MailOpen className="w-3.5 h-3.5" /> Read
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{msg.name}</p>
                      <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline">{msg.email}</a>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="text-sm text-gray-700 line-clamp-2" title={msg.message}>
                        {msg.message}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                      })}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => toggleReadStatus(msg._id, msg.read)}
                        className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={msg.read ? "Mark as unread" : "Mark as read"}
                      >
                        {msg.read ? <Mail className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteMessage(msg._id)}
                        className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
