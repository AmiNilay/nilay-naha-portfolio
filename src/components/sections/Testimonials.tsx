"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Linkedin, MessageSquareQuote } from "lucide-react";
import { fetchWithSessionCache } from "@/lib/clientCache";

export interface TestimonialItem {
  _id: string;
  name: string;
  role?: string;
  company?: string;
  relationship?: string;
  quote: string;
  avatarUrl?: string;
  linkedinUrl?: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Avatar({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- admin-entered URLs can be any host
      <img
        src={src}
        alt=""
        width={44}
        height={44}
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        className="w-11 h-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
      />
    );
  }
  return (
    <div className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 text-primary flex items-center justify-center text-sm font-bold">
      {initials(name)}
    </div>
  );
}

/** Recommendations managed in the CMS (/admin/testimonials). Renders nothing until at least one is published. */
export default function Testimonials() {
  const [items, setItems] = useState<TestimonialItem[]>([]);

  useEffect(() => {
    fetchWithSessionCache<{ testimonials: TestimonialItem[] }>("testimonials", "/api/testimonials")
      .then((data) => setItems(data.testimonials || []))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mb-28 scroll-mt-32" aria-labelledby="testimonials-heading">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-primary">
          <MessageSquareQuote className="w-6 h-6" />
        </div>
        <div>
          <h2 id="testimonials-heading" className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Recommendations
          </h2>
          <p className="text-xs text-zinc-400 font-medium">What colleagues, mentors, and clients say.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((t, idx) => (
          <motion.figure
            key={t._id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.25) }}
            className="relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            <Quote className="absolute top-5 right-5 w-8 h-8 text-zinc-200 dark:text-zinc-800" aria-hidden />
            <blockquote className="text-sm sm:text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 mb-6 whitespace-pre-line">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              <Avatar name={t.name} src={t.avatarUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">{t.name}</span>
                  {t.linkedinUrl && (
                    <a
                      href={t.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t.name} on LinkedIn`}
                      className="text-zinc-400 hover:text-[#0A66C2] transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {[t.role, t.company].filter(Boolean).join(" · ")}
                </p>
                {t.relationship && (
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{t.relationship}</p>
                )}
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
