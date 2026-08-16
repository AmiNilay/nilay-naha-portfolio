"use client";

import { useState, useEffect } from "react";
import { Bot, Plus, Trash2, Loader2, Edit2, X, Link as LinkIcon, Save } from "lucide-react"; // ✅ Added Save here

interface LinkItem { label: string; url: string; }
interface Rule { _id: string; keywords: string[]; answer: string; quickReplies: string[]; links: LinkItem[]; }

export default function ManageChatbot() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [keywords, setKeywords] = useState("");
  const [answer, setAnswer] = useState("");
  const [quickReplies, setQuickReplies] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { fetchRules(); }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/chatbot");
      const data = await res.json();
      if (data.rules) setRules(data.rules);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords || !answer) return;
    setIsSubmitting(true);

    try {
      const body = JSON.stringify({ id: editingId, keywords, answer, quickReplies, links });
      const res = await fetch("/api/chatbot", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (res.ok) { cancelEdit(); fetchRules(); }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
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
    setEditingId(null); setKeywords(""); setAnswer(""); setQuickReplies(""); setLinks([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rule?")) return;
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Bot className="w-8 h-8 text-blue-600" /> Train Chatbot</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-xl border shadow-sm bg-white space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Rule" : "Add New Rule"}</h2>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Trigger Phrases (Comma separated)</label>
          <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., projects, portfolio, work" className="w-full p-3 border rounded-lg" required />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Bot Answer</label>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full p-3 border rounded-lg h-24" required />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Dynamic Quick Replies (Comma separated)</label>
          <input type="text" value={quickReplies} onChange={(e) => setQuickReplies(e.target.value)} placeholder="e.g., View GitHub, Contact Nilay" className="w-full p-3 border rounded-lg" />
          <p className="text-xs text-gray-500 mt-1">These appear as clickable buttons after the bot answers.</p>
        </div>

        <div className="space-y-2 border-t pt-4">
          <label className="block text-sm font-bold text-gray-700 flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Inline Links (Optional)</label>
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" placeholder="Button Label (e.g. View Project)" value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" />
              <input type="text" placeholder="URL (https://... )" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" />
              <button type="button" onClick={() => removeLink(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
          <button type="button" onClick={addLink} className="text-sm text-blue-600 font-bold flex items-center gap-1 mt-2"><Plus className="w-4 h-4"/> Add Link Button</button>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} {editingId ? "Update Rule" : "Save Rule"}
          </button>
          {editingId && <button type="button" onClick={cancelEdit} className="px-6 py-2.5 border rounded-lg font-bold text-gray-700 hover:bg-gray-50">Cancel</button>}
        </div>
      </form>

      {/* Existing Rules List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b"><h2 className="text-xl font-bold text-gray-900">Current Knowledge Base</h2></div>
        <div className="divide-y">
          {rules.map((rule) => (
            <div key={rule._id} className="p-6 flex justify-between items-start gap-4 hover:bg-gray-50">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap gap-2">{rule.keywords.map((kw, i) => <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{kw}</span>)}</div>
                <p className="text-gray-700 bg-gray-100 p-3 rounded-lg text-sm border"><strong>Bot says:</strong> {rule.answer}</p>
                {rule.quickReplies?.length > 0 && <p className="text-xs text-gray-500"><strong>Quick Replies:</strong> {rule.quickReplies.join(", ")}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(rule)} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="w-5 h-5" /></button>
                <button onClick={() => handleDelete(rule._id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
