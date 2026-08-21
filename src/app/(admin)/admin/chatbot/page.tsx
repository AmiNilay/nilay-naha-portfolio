"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Plus,
  Trash2,
  Loader2,
  Edit2,
  Link as LinkIcon,
  Save,
} from "lucide-react";

interface LinkItem {
  label: string;
  url: string;
}

interface Rule {
  _id: string;
  keywords: string[];
  suggestedQuestion?: string;
  answer: string;
  quickReplies: string[];
  links: LinkItem[];
}

export default function ManageChatbot() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const [suggestedQuestion, setSuggestedQuestion] = useState("");
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

    if ((!keywords.trim() && !suggestedQuestion.trim()) || !answer.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const body = JSON.stringify({
        id: editingId,
        suggestedQuestion,
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
        await fetchRules();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingId(rule._id);
    setSuggestedQuestion(rule.suggestedQuestion || "");
    setKeywords(rule.keywords.join(", "));
    setAnswer(rule.answer);
    setQuickReplies(rule.quickReplies?.join(", ") || "");
    setLinks(rule.links || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSuggestedQuestion("");
    setKeywords("");
    setAnswer("");
    setQuickReplies("");
    setLinks([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rule?")) return;

    await fetch(`/api/chatbot?id=${id}`, { method: "DELETE" });
    await fetchRules();
  };

  const addLink = () => setLinks([...links, { label: "", url: "" }]);

  const updateLink = (
    index: number,
    field: "label" | "url",
    value: string
  ) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) =>
    setLinks(links.filter((_, i) => i !== index));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 bg-white pb-12 text-gray-900">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <Bot className="h-8 w-8 text-blue-600" />
          Train Chatbot
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Create answers and optional suggested questions that visitors can
          click in the public chatbot.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-white p-6 shadow-sm"
      >
        <h2 className="text-xl font-bold text-gray-900">
          {editingId ? "Edit Rule" : "Add New Rule"}
        </h2>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">
            Suggested Question
          </label>
          <input
            type="text"
            value={suggestedQuestion}
            onChange={(e) => setSuggestedQuestion(e.target.value)}
            placeholder="e.g., What projects have you built?"
            className="w-full rounded-lg border bg-white p-3 text-gray-900 placeholder:text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-600">
            This question appears as a clickable suggestion in the public
            chatbot and uses the answer below.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">
            Trigger Phrases (Comma separated)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., projects, portfolio, work"
            className="w-full rounded-lg border bg-white p-3 text-gray-900 placeholder:text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-600">
            Add words visitors may type. The suggested question is also added
            automatically as a matching phrase.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">
            Bot Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="h-24 w-full rounded-lg border bg-white p-3 text-gray-900 placeholder:text-gray-500"
            placeholder="Write the answer the chatbot should provide."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-gray-700">
            Dynamic Quick Replies (Comma separated)
          </label>
          <input
            type="text"
            value={quickReplies}
            onChange={(e) => setQuickReplies(e.target.value)}
            placeholder="e.g., View GitHub, Contact Nilay"
            className="w-full rounded-lg border bg-white p-3 text-gray-900 placeholder:text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-600">
            These appear as additional clickable buttons after the bot answers.
          </p>
        </div>

        <div className="space-y-2 border-t border-gray-200 pt-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <LinkIcon className="h-4 w-4" />
            Inline Links (Optional)
          </label>

          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="Button Label (e.g. View Project)"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                className="flex-1 rounded-lg border bg-white p-2 text-sm text-gray-900 placeholder:text-gray-500"
              />
              <input
                type="text"
                placeholder="URL (https://...)"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                className="flex-1 rounded-lg border bg-white p-2 text-sm text-gray-900 placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                aria-label="Remove link"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addLink}
            className="mt-2 flex items-center gap-1 text-sm font-bold text-blue-600"
          >
            <Plus className="h-4 w-4" />
            Add Link Button
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              (!keywords.trim() && !suggestedQuestion.trim()) ||
              !answer.trim()
            }
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {editingId ? "Update Rule" : "Save Rule"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-gray-300 px-6 py-2.5 font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Current Knowledge Base
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {rules.length === 0 && (
            <p className="p-6 text-sm text-gray-600">
              No chatbot rules have been added yet.
            </p>
          )}

          {rules.map((rule) => (
            <div
              key={rule._id}
              className="flex items-start justify-between gap-4 p-6 hover:bg-gray-50"
            >
              <div className="flex-1 space-y-2">
                {rule.suggestedQuestion && (
                  <div>
                    <span className="mb-2 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                      Suggested Question
                    </span>
                    <p className="font-semibold text-gray-900">
                      {rule.suggestedQuestion}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {rule.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                <p className="rounded-lg border bg-gray-100 p-3 text-sm text-gray-800">
                  <strong>Bot says:</strong> {rule.answer}
                </p>

                {rule.quickReplies?.length > 0 && (
                  <p className="text-xs text-gray-600">
                    <strong>Quick Replies:</strong>{" "}
                    {rule.quickReplies.join(", ")}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(rule)}
                  className="p-2 text-gray-500 hover:text-blue-600"
                  aria-label="Edit chatbot rule"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(rule._id)}
                  className="p-2 text-gray-500 hover:text-red-600"
                  aria-label="Delete chatbot rule"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
