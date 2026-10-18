"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Plus,
  Trash2,
  Loader2,
  Edit2,
  X,
  Link as LinkIcon,
  Save,
  Sparkles,
  MessageSquare,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LinkItem {
  label: string;
  url: string;
}

interface Rule {
  _id: string;
  keywords: string[];
  answer: string;
  quickReplies: string[];
  links: LinkItem[];
}

export default function ManageChatbot() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const [keywords, setKeywords] = useState("");
  const [answer, setAnswer] = useState("");
  const [quickReplies, setQuickReplies] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/chatbot");
      const data = await res.json();
      if (data.rules) setRules(data.rules);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords || !answer) return;
    setIsSubmitting(true);

    try {
      const body = JSON.stringify({
        id: editingId,
        keywords,
        answer,
        quickReplies,
        links,
      });
      const res = await fetch("/api/chatbot", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (res.ok) {
        cancelEdit();
        fetchRules();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingId(rule._id);
    setKeywords(rule.keywords.join(", "));
    setAnswer(rule.answer);
    setQuickReplies(rule.quickReplies?.join(", ") || "");
    setLinks(rule.links || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setKeywords("");
    setAnswer("");
    setQuickReplies("");
    setLinks([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chatbot rule?")) return;
    await fetch(`/api/chatbot?id=${id}`, { method: "DELETE" });
    fetchRules();
  };

  const addLink = () => setLinks([...links, { label: "", url: "" }]);
  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Loading Knowledge Base...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 select-none">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Bot className="w-3.5 h-3.5" /> Conversational AI Engine
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Train Chatbot Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Configure fuzzy matching keywords, automated answers, and contextual quick replies.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {rules.length} Active Rules
        </div>
      </div>

      {/* Form Card */}
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="rounded-[32px] p-6 sm:p-8 bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-5"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            {editingId ? "Edit Response Rule" : "Add New Knowledge Rule"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
            Trigger Keywords & Phrases (Comma separated)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. projects, portfolio, github, work, build"
            className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
            required
          />
          <p className="text-[11px] text-zinc-400">
            Fuzzy matching (Levenshtein distance $\le 2$) is automatically applied to these tokens.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
            Bot Response Content
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write the clear, concise answer the bot should provide..."
            className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium h-28 leading-relaxed"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
            Suggested Quick Replies (Comma separated)
          </label>
          <input
            type="text"
            value={quickReplies}
            onChange={(e) => setQuickReplies(e.target.value)}
            placeholder="e.g. View GitHub, Browse Projects, Contact Nilay"
            className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
          />
          <p className="text-[11px] text-zinc-400">
            Rendered as interactive clickable pill buttons inside the chat window.
          </p>
        </div>

        {/* Links Array Manager */}
        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-cyan-500" /> Action Button Links (Optional)
            </label>
            <button
              type="button"
              onClick={addLink}
              className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Link
            </button>
          </div>

          {links.map((link, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Button Label (e.g. View Project)"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                className="flex-1 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 font-medium"
              />
              <input
                type="text"
                placeholder="URL (https://...)"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                className="flex-1 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 font-medium"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="p-2.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs sm:text-sm shadow-lg shadow-zinc-950/10 hover:opacity-95 active:scale-98 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {editingId ? "Update Rule" : "Save Knowledge Rule"}
          </button>
        </div>
      </motion.form>

      {/* Rules Inventory List */}
      <div className="rounded-[32px] bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
            Registered Rules Knowledge Base
          </h2>
          <span className="text-xs text-zinc-400 font-medium">{rules.length} items</span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {rules.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 font-medium">
              No custom rules registered yet. Default fallback response will be returned.
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule._id}
                className="p-6 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 transition-colors flex flex-col md:flex-row justify-between items-start gap-4"
              >
                <div className="space-y-3 flex-1">
                  {/* Keyword Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {rule.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-bold rounded-lg border border-cyan-500/20"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Bot Answer Preview */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold block mb-1">
                      Bot Response:
                    </span>
                    {rule.answer}
                  </div>

                  {/* Quick Replies & Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {rule.quickReplies &&
                      rule.quickReplies.length > 0 &&
                      rule.quickReplies.map((qr, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
                        >
                          💬 {qr}
                        </span>
                      ))}

                    {rule.links &&
                      rule.links.length > 0 &&
                      rule.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[11px] font-bold flex items-center gap-1"
                        >
                          🔗 {link.label}
                        </a>
                      ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-2 text-zinc-400 hover:text-cyan-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    title="Edit Rule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule._id)}
                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Delete Rule"
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
