import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { connectToDB } from "@/lib/connectToDB";
import About from "@/models/About";
import { processContent } from "@/lib/markdownProcessor";
import { SKILL_CATEGORIES } from "@/lib/skillData";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "How I Use AI",
  description:
    "How Nilay Naha works with AI as a software engineer: the AI tools, coding agents and LLMs in his daily workflow.",
  openGraph: {
    title: "How Nilay Naha Uses AI",
    description: "AI tools, coding agents and LLM workflow of software engineer Nilay Naha.",
    url: "/ai",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/ai" },
};

const AI_CATEGORY_TITLES = ["AI Tools & LLMs", "AI / ML & Data Science"];

/** Honest fallback when no workflow is written: only lists tools selected in the CMS. */
function defaultMarkdown(skills: string[]) {
  const sections = SKILL_CATEGORIES.filter((c) => AI_CATEGORY_TITLES.includes(c.title))
    .map((c) => ({ title: c.title, items: c.skills.map((s) => s.name).filter((n) => skills.includes(n)) }))
    .filter((c) => c.items.length);
  if (!sections.length) return "Nilay hasn't published his AI workflow yet. Check back soon.";
  return [
    "These are the AI tools and technologies Nilay lists on his portfolio.",
    ...sections.map((c) => `## ${c.title}\n\n${c.items.map((n) => `- ${n}`).join("\n")}`),
  ].join("\n\n");
}

export default async function AiPage() {
  let about: any = null;
  try {
    await connectToDB();
    about = await About.findOne({}, { aiWorkflow: 1, skills: 1 }).lean();
  } catch {}
  const source = String(about?.aiWorkflow || "").trim() || defaultMarkdown(about?.skills || []);
  const html = await processContent(source);

  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F14] pt-28 sm:pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> About
        </Link>
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">How I Use AI</h1>
            <p className="text-xs text-zinc-400 font-medium mt-1">Tools, agents and workflow in the AI era.</p>
          </div>
        </div>
        <article
          className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-a:text-cyan-600 dark:prose-a:text-cyan-400"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  );
}
