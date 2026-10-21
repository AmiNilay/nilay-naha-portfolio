"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, X, Save } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { clearMemoryCache } from "@/lib/clientCache";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  company: string;
  relationship: string;
  quote: string;
  avatarUrl: string;
  linkedinUrl: string;
  published: boolean;
  order: number;
}

type FormState = Omit<Testimonial, "_id"> & { _id?: string };

const EMPTY_FORM: FormState = {
  name: "", role: "", company: "", relationship: "", quote: "",
  avatarUrl: "", linkedinUrl: "", published: true, order: 0,
};

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40";
const cardClass =
  "rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.3)]";

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials?all=1");
      const data = await res.json();
      setItems(data.testimonials || []);
    } catch {
      setToast({ message: "Couldn't load testimonials.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const afterChange = async (message: string) => {
    clearMemoryCache("testimonials");
    setToast({ message, type: "success" });
    await load();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const isEdit = Boolean(form._id);
      const res = await fetch("/api/testimonials", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...form, id: form._id } : form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setForm(null);
      await afterChange(isEdit ? "Testimonial updated." : "Testimonial added.");
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (t: Testimonial) => {
    const res = await fetch("/api/testimonials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t._id, published: !t.published }),
    });
    if (res.ok) await afterChange(t.published ? "Hidden from site." : "Published to site.");
    else setToast({ message: "Update failed.", type: "error" });
  };

  const remove = async (t: Testimonial) => {
    if (!confirm(`Delete the recommendation from ${t.name}? This can't be undone.`)) return;
    const res = await fetch(`/api/testimonials?id=${t._id}`, { method: "DELETE" });
    if (res.ok) await afterChange("Testimonial deleted.");
    else setToast({ message: "Delete failed.", type: "error" });
  };

  const field = (key: keyof FormState) => ({
    value: (form?.[key] as string | number) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => f && { ...f, [key]: key === "order" ? Number(e.target.value) : e.target.value }),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Testimonials</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Recommendations shown on the About page. Lower order numbers appear first.
          </p>
        </div>
        <button
          onClick={() => setForm({ ...EMPTY_FORM, order: items.length })}
          className="px-4 py-2 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Add recommendation
        </button>
      </div>

      {form && (
        <form onSubmit={save} className={`${cardClass} p-6 sm:p-8 space-y-4`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              {form._id ? "Edit recommendation" : "New recommendation"}
            </h2>
            <button type="button" onClick={() => setForm(null)} aria-label="Close" className="text-zinc-400 hover:text-zinc-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Name *" className={inputClass} {...field("name")} />
            <input placeholder="Role (e.g. Senior Engineer)" className={inputClass} {...field("role")} />
            <input placeholder="Company" className={inputClass} {...field("company")} />
            <input placeholder="Relationship (e.g. Mentored Nilay at …)" className={inputClass} {...field("relationship")} />
            <input type="url" placeholder="Photo URL (optional)" className={inputClass} {...field("avatarUrl")} />
            <input type="url" placeholder="LinkedIn URL (optional)" className={inputClass} {...field("linkedinUrl")} />
          </div>
          <textarea required rows={5} placeholder="Recommendation text *" className={inputClass} {...field("quote")} />
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => f && { ...f, published: e.target.checked })}
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              Order
              <input type="number" className={`${inputClass} w-24`} {...field("order")} />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="ml-auto px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className={`${cardClass} p-10 text-center text-sm text-zinc-500`}>
          No recommendations yet. The section stays hidden on the site until you publish one.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((t) => (
            <div key={t._id} className={`${cardClass} p-6 flex flex-col gap-3 ${t.published ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 dark:text-white truncate">{t.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{[t.role, t.company].filter(Boolean).join(" · ")}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.published
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {t.published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-4">“{t.quote}”</p>
              <div className="flex items-center gap-2 mt-auto pt-2">
                <button onClick={() => setForm({ ...t })} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300" aria-label="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => togglePublished(t)} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300" aria-label={t.published ? "Unpublish" : "Publish"}>
                  {t.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => remove(t)} className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 ml-auto" aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
