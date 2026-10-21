import { connectToDB } from "@/lib/connectToDB";
import Hero from "@/models/Hero";
import About from "@/models/About";
import Project from "@/models/Project";
import Post from "@/models/Post";
import Chatbot from "@/models/Chatbot";
import Testimonial from "@/models/Testimonial";

/**
 * Free, self-contained portfolio assistant (no LLM, no API key). Answers are
 * composed from live CMS content, so factual answers never go stale:
 *   1. small talk (greetings, thanks)
 *   2. a specific entity named in the question (project, post, company, skill)
 *   3. follow-ups ("tell me more") about the previous entity
 *   4. live intents (projects, experience, education, skills, contact, …)
 *   5. curated admin rules (soft questions: strengths, teamwork, …)
 *   6. ranked full-text search over all site content
 */

export interface ChatLink {
  label: string;
  url: string;
}

export interface ChatReply {
  reply: string;
  links: ChatLink[];
  quickReplies: string[];
  context?: string;
  emotion: "happy" | "thinking" | "confused" | "excited";
}

const NAME = "Nilay";

// ── Text utilities ────────────────────────────────────────────────────────────
const STOPWORDS = new Set(
  ("a an the is are was were be been am do does did have has had i you your yours me my we our us he his him she her " +
    "it its they them their what which who whom whose when where why how can could would should will shall may might " +
    "must of to in on at for from by with about as into like through over after before under again further then once " +
    "here there all any both each few more most other some such no nor not only own same so than too very just also " +
    "and or but if because until while tell show give know please hey hi hello nilay nilays naha s t").split(" ")
);

const SYNONYMS: Record<string, string> = {
  cv: "resume", résumé: "resume", uni: "university", college: "university", school: "university",
  gpa: "cgpa", grade: "cgpa", grades: "cgpa", marks: "cgpa", job: "work", jobs: "work", career: "work",
  employment: "work", employer: "company", companies: "company", firm: "company", internship: "intern",
  internships: "intern", projects: "project", portfolio: "project", built: "build", made: "build",
  created: "build", apps: "app", articles: "blog", article: "blog", posts: "blog", post: "blog", writing: "blog",
  stack: "skill", skills: "skill", tech: "skill", technologies: "skill", technology: "skill", tools: "tool",
  languages: "language", reach: "contact", email: "contact", mail: "contact", phone: "contact", hire: "hire",
  hiring: "hire", recommendation: "testimonial", recommendations: "testimonial", reviews: "testimonial",
  testimonials: "testimonial", certificates: "certification", certificate: "certification",
  certifications: "certification", certified: "certification", llm: "ai", llms: "ai", genai: "ai",
  ml: "machinelearning", based: "location", live: "location", located: "location", city: "location",
};

const stem = (w: string) => {
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^\.+|\.+$/g, ""))
    .filter((w) => w && !STOPWORDS.has(w))
    .map((w) => SYNONYMS[w] || w)
    .map(stem);
}

const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#]/g, "");

const stripHtml = (s: unknown) =>
  String(s ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

function editDistanceAtMost1(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

const tokenMatches = (q: string, k: string) =>
  q === k || (q.length >= 5 && k.length >= 5 && editDistanceAtMost1(q, k));

/** First few sentences of plain text, capped at roughly `max` characters. */
function summarize(text: string, max = 320) {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > max) break;
    out += s;
  }
  return (out || clean.slice(0, max)).trim() + (out ? "" : "…");
}

/** Appends a period unless the text already ends with sentence punctuation. */
const sentence = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : s.trim() + ".");

const listJoin = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

// ── Knowledge base ────────────────────────────────────────────────────────────
interface Doc {
  key: string;
  kind: "project" | "post" | "experience" | "education" | "testimonial" | "profile" | "about" | "rule";
  title: string;
  text: string;
  url?: string;
  tokens: string[];
}

interface Knowledge {
  hero: any;
  about: any;
  projects: any[];
  posts: any[];
  testimonials: any[];
  rules: any[];
  docs: Doc[];
  df: Map<string, number>;
  avgLen: number;
}

let cache: { kb: Knowledge; at: number } | null = null;
const TTL_MS = 2 * 60 * 1000;

const projectTech = (p: any): string[] => {
  const raw = [].concat(p.techStack || [], p.tags || []) as unknown[];
  return Array.from(new Set(raw.flatMap((t) => String(t).split(",")).map((t) => t.trim()).filter(Boolean)));
};

async function loadKnowledge(): Promise<Knowledge> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.kb;
  await connectToDB();
  const [hero, about, projects, posts, testimonials, rules] = await Promise.all([
    Hero.findOne().lean(),
    About.findOne({}).lean(),
    Project.find().sort({ featured: -1, publishDate: -1, createdAt: -1 }).lean(),
    Post.find().sort({ publishDate: -1, createdAt: -1 }).lean(),
    Testimonial.find({ published: true }).sort({ order: 1 }).lean(),
    Chatbot.find().lean(),
  ]);

  const docs: Doc[] = [];
  const add = (d: Omit<Doc, "tokens">) => docs.push({ ...d, tokens: tokenize(`${d.title} ${d.title} ${d.text}`) });

  for (const p of projects as any[]) {
    add({
      key: `project:${p.slug}`, kind: "project", title: p.title, url: `/projects/${p.slug}`,
      text: `${projectTech(p).join(" ")} ${p.role || ""} ${stripHtml(p.description || p.content)}`,
    });
  }
  for (const p of posts as any[]) {
    add({
      key: `post:${p.slug}`, kind: "post", title: p.title, url: `/blog/${p.slug}`,
      text: `${p.category || ""} ${(p.tags || []).join(" ")} ${p.excerpt || ""} ${stripHtml(p.content)}`,
    });
  }
  (about as any)?.experience?.forEach((e: any, i: number) =>
    add({ key: `experience:${i}`, kind: "experience", title: `${e.role} at ${e.company}`, url: "/about", text: `${e.duration} ${e.description}` })
  );
  (about as any)?.education?.forEach((e: any, i: number) =>
    add({ key: `education:${i}`, kind: "education", title: e.degree, url: "/about", text: `${e.institution} ${e.year} ${(e.relevantCoursework || []).join(" ")}` })
  );
  for (const t of testimonials as any[]) {
    add({ key: `testimonial:${t._id}`, kind: "testimonial", title: `Recommendation from ${t.name}`, url: "/about", text: `${t.role} ${t.company} ${t.quote}` });
  }
  if (about) add({ key: "about", kind: "about", title: "About Nilay", url: "/about", text: stripHtml((about as any).bio) });
  if (hero) add({ key: "profile", kind: "profile", title: "Profile", url: "/", text: `${stripHtml((hero as any).subtitle)} ${(hero as any).techStack || ""}` });

  const df = new Map<string, number>();
  for (const d of docs) new Set(d.tokens).forEach((t) => df.set(t, (df.get(t) || 0) + 1));
  const avgLen = docs.reduce((s, d) => s + d.tokens.length, 0) / Math.max(1, docs.length);

  const kb: Knowledge = {
    hero: hero || {}, about: about || {}, projects: projects as any[], posts: posts as any[],
    testimonials: testimonials as any[], rules: rules as any[], docs, df, avgLen,
  };
  cache = { kb, at: Date.now() };
  return kb;
}

function bm25(kb: Knowledge, query: string[], doc: Doc) {
  const k1 = 1.4, b = 0.75, N = kb.docs.length;
  let score = 0;
  for (const q of Array.from(new Set(query))) {
    const tf = doc.tokens.filter((t) => tokenMatches(q, t)).length;
    if (!tf) continue;
    const n = kb.df.get(q) || 1;
    const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
    score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * doc.tokens.length) / kb.avgLen)));
  }
  return score;
}

// ── Intents ───────────────────────────────────────────────────────────────────
type IntentName =
  | "greeting" | "thanks" | "farewell" | "projects" | "experience" | "currentRole" | "education" | "skills"
  | "aiTools" | "contact" | "location" | "availability" | "certifications" | "blog" | "testimonials"
  | "summary" | "resume" | "github" | "linkedin";

const INTENT_KEYWORDS: Record<IntentName, string[]> = {
  greeting: ["hi", "hello", "hey", "morning", "evening", "yo", "namaste", "sup"],
  thanks: ["thank", "thanks", "thx", "appreciate", "great", "awesome", "helpful", "cool"],
  farewell: ["bye", "goodbye", "later", "cya"],
  projects: ["project", "build", "app", "showcase", "develop"],
  experience: ["experience", "work", "intern", "company", "role", "professional", "industry", "employ"],
  currentRole: ["current", "currently", "now", "present"],
  education: ["education", "study", "degree", "university", "btech", "b.tech", "diploma", "cgpa", "graduate", "graduation", "academic", "qualification"],
  skills: ["skill", "language", "framework", "proficient", "expertise", "know", "familiar", "backend", "frontend", "database"],
  aiTools: ["ai", "tool", "claude", "chatgpt", "copilot", "cursor", "gemini", "machinelearning", "deep", "learning"],
  contact: ["contact", "touch", "message", "connect", "call"],
  location: ["location", "where", "from", "relocate", "relocation", "remote", "country"],
  availability: ["available", "availability", "open", "opportunity", "notice", "start", "join", "hire", "freelance"],
  certifications: ["certification", "course", "training", "credential", "badge"],
  blog: ["blog", "write", "publication", "read", "latest"],
  testimonial: [] as never,
  testimonials: ["testimonial", "say", "colleague", "reference", "feedback", "endorse"],
  summary: ["who", "yourself", "introduce", "summary", "overview", "background", "profile", "bio"],
  resume: ["resume"],
  github: ["github", "repo", "repository", "code", "source"],
  linkedin: ["linkedin"],
} as Record<IntentName, string[]>;

function detectIntents(raw: string, tokens: string[]) {
  const scores = new Map<IntentName, number>();
  const lower = raw.toLowerCase();
  (Object.keys(INTENT_KEYWORDS) as IntentName[]).forEach((intent) => {
    const words = INTENT_KEYWORDS[intent] || [];
    let s = 0;
    for (const w of words) {
      if (tokens.some((t) => tokenMatches(t, stem(w)))) s += 1;
      else if (/^[a-z]+$/.test(w) && new RegExp(`\\b${w}\\b`).test(lower)) s += 1; // stopword-like cues ("who", "where")
    }
    if (s) scores.set(intent, s);
  });
  // "Who / overview" only means *him* when the question is about him or the assistant.
  if (scores.has("summary") && !/\b(he|him|his|nilay|you|your|yourself|candidate|developer|engineer)\b/i.test(lower)) {
    scores.delete("summary");
  }
  return Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
}

// ── Answer builders ───────────────────────────────────────────────────────────
const firstName = (kb: Knowledge) => NAME;

function currentExperience(kb: Knowledge) {
  const exp: any[] = kb.about.experience || [];
  return exp.find((e) => /present|current|now/i.test(e.duration || "")) || null;
}

function resumeUrl(kb: Knowledge) {
  const h = kb.hero;
  if (h.resumeUrl) return h.resumeUrl;
  if (h.gDriveResume) {
    const id = String(h.gDriveResume).match(/[-\w]{25,}/)?.[0];
    return id ? `https://drive.google.com/file/d/${id}/view` : h.gDriveResume;
  }
  return "";
}

function contactLinks(kb: Knowledge): ChatLink[] {
  const h = kb.hero;
  const links: ChatLink[] = [{ label: "Contact page", url: "/contact" }];
  if (h.socialEmail) links.push({ label: "Email", url: `mailto:${h.socialEmail}` });
  if (h.socialLinkedin) links.push({ label: "LinkedIn", url: h.socialLinkedin });
  if (h.socialGithub) links.push({ label: "GitHub", url: h.socialGithub });
  return links;
}

function answerProject(p: any): ChatReply {
  const tech = projectTech(p);
  const lines = [`**${p.title}**${p.role ? ` (${p.role})` : ""}`, summarize(p.description || p.content, 420)];
  if (tech.length) lines.push(`Built with ${listJoin(tech.slice(0, 8))}.`);
  const links: ChatLink[] = [{ label: "Read the case study", url: `/projects/${p.slug}` }];
  if (p.liveLink) links.push({ label: "Live demo", url: p.liveLink });
  if (p.githubLink) links.push({ label: "Source code", url: p.githubLink });
  return {
    reply: lines.join("\n\n"),
    links,
    quickReplies: ["What other projects?", "What's his tech stack?", "How can I contact him?"],
    context: `project:${p.slug}`,
    emotion: "excited",
  };
}

function answerPost(p: any): ChatReply {
  return {
    reply: `**${p.title}**${p.readTime ? ` · ${p.readTime}` : ""}\n\n${summarize(p.excerpt || p.content, 380)}`,
    links: [{ label: "Read the article", url: `/blog/${p.slug}` }],
    quickReplies: ["Show his other articles", "What projects has he built?"],
    context: `post:${p.slug}`,
    emotion: "happy",
  };
}

function answerExperienceEntry(e: any): ChatReply {
  const links: ChatLink[] = [{ label: "See full experience", url: "/about" }];
  if (e.companyLinkedin) links.push({ label: `${e.company} on LinkedIn`, url: e.companyLinkedin });
  return {
    reply: `**${e.role} — ${e.company}**${e.duration ? ` (${e.duration})` : ""}\n\n${e.description || ""}`.trim(),
    links,
    quickReplies: ["What's his education?", "What projects has he built?"],
    context: "experience",
    emotion: "happy",
  };
}

const INTENT_ANSWERS: Partial<Record<IntentName, (kb: Knowledge) => ChatReply | null>> = {
  greeting: () => ({
    reply: `Hi there! 👋 I'm ${NAME}'s portfolio assistant. I can tell you about his projects, experience, skills, education, or how to get in touch. What would you like to know?`,
    links: [],
    quickReplies: ["Give me a quick overview", "What projects has he built?", "What's his tech stack?"],
    emotion: "happy",
  }),
  thanks: () => ({
    reply: `You're welcome! If there's anything else you'd like to know about ${NAME}'s work, just ask. 😊`,
    links: [],
    quickReplies: ["How can I contact him?", "Show me his projects"],
    emotion: "happy",
  }),
  farewell: () => ({
    reply: `Thanks for stopping by! Feel free to reach out to ${NAME} anytime through the contact page.`,
    links: [{ label: "Contact page", url: "/contact" }],
    quickReplies: [],
    emotion: "happy",
  }),
  summary: (kb) => {
    const cur = currentExperience(kb);
    const edu = (kb.about.education || [])[0];
    const parts = [
      `${NAME} Naha is a software engineer${kb.about.location ? ` based in ${kb.about.location}` : ""}.`,
      cur ? sentence(`He's currently a ${cur.role} at ${cur.company}`) : "",
      edu ? `He holds a ${edu.degree} from ${edu.institution}${edu.year ? ` (${edu.year})` : ""}.` : "",
      kb.projects.length ? `He has built ${kb.projects.length} featured projects, including ${listJoin(kb.projects.slice(0, 3).map((p) => p.title))}.` : "",
      summarize(kb.about.bio || kb.hero.subtitle, 260),
    ].filter(Boolean);
    return {
      reply: parts.join(" "),
      links: [{ label: "About page", url: "/about" }],
      quickReplies: ["What projects has he built?", "What's his tech stack?", "What's his experience?"],
      context: "summary",
      emotion: "happy",
    };
  },
  projects: (kb) => {
    if (!kb.projects.length) return null;
    const lines = kb.projects.slice(0, 6).map((p) => {
      const tech = projectTech(p).slice(0, 4);
      return `• **${p.title}**${tech.length ? ` — ${tech.join(", ")}` : ""}`;
    });
    return {
      reply: `Here are ${NAME}'s projects:\n\n${lines.join("\n")}\n\nAsk me about any of them by name for details.`,
      links: [{ label: "Browse all projects", url: "/projects" }],
      quickReplies: kb.projects.slice(0, 3).map((p) => `Tell me about ${p.title}`),
      context: "projects",
      emotion: "excited",
    };
  },
  experience: (kb) => {
    const exp: any[] = kb.about.experience || [];
    if (!exp.length) return null;
    const lines = exp.map((e) => `• **${e.role}** at ${e.company}${e.duration ? ` (${e.duration})` : ""}`);
    return {
      reply: `${NAME}'s professional experience:\n\n${lines.join("\n")}\n\n${summarize(exp[0].description, 220)}`,
      links: [{ label: "Full experience", url: "/about" }],
      quickReplies: ["What's his education?", "What projects has he built?"],
      context: "experience",
      emotion: "happy",
    };
  },
  currentRole: (kb) => {
    const cur = currentExperience(kb);
    if (!cur) return null;
    return {
      reply: `${NAME} is currently working as a **${cur.role}** at **${cur.company}**${cur.duration ? ` (${cur.duration})` : ""}. ${cur.description || ""}`.trim(),
      links: [{ label: "Experience", url: "/about" }],
      quickReplies: ["What's his previous experience?", "Is he open to opportunities?"],
      context: "experience",
      emotion: "happy",
    };
  },
  education: (kb) => {
    const edu: any[] = kb.about.education || [];
    if (!edu.length) return null;
    const lines = edu.map((e) => {
      const score = e.cgpa ? ` — CGPA ${e.cgpa}` : e.percentage ? ` — ${e.percentage}` : "";
      return `• **${e.degree}**, ${e.institution}${e.year ? ` (${e.year})` : ""}${score}`;
    });
    return {
      reply: `${NAME}'s education:\n\n${lines.join("\n")}`,
      links: [{ label: "Education details", url: "/about" }],
      quickReplies: ["What's his experience?", "What's his tech stack?"],
      context: "education",
      emotion: "happy",
    };
  },
  skills: (kb) => {
    const skills: string[] = kb.about.skills || [];
    const stack = skills.length ? skills : String(kb.hero.techStack || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!stack.length) return null;
    return {
      reply: `${NAME}'s technical stack includes ${listJoin(stack.slice(0, 18))}.${stack.length > 18 ? ` (${stack.length} technologies in total.)` : ""}`,
      links: [{ label: "Technical Arsenal", url: "/about" }],
      quickReplies: ["Which AI tools does he use?", "Show me projects using Python"],
      context: "skills",
      emotion: "happy",
    };
  },
  aiTools: (kb) => {
    const ai = /claude|openai|chatgpt|gemini|copilot|cursor|windsurf|lovable|v0|replit|deepseek|qwen|mistral|grok|kimi|llama|ollama|hugging|langchain|perplexity|n8n|anthropic|tensorflow|pytorch|keras|scikit|opencv|deep learning|pandas|numpy/i;
    const found = (kb.about.skills || []).filter((s: string) => ai.test(s));
    if (!found.length) return null;
    return {
      reply: `On the AI side, ${NAME} works with ${listJoin(found)}. He uses AI-assisted development tools in his day-to-day engineering workflow alongside applied ML for computer vision.`,
      links: [{ label: "Full stack", url: "/about" }],
      quickReplies: ["Show me his AI/ML projects", "What's his full tech stack?"],
      context: "skills",
      emotion: "excited",
    };
  },
  contact: (kb) => ({
    reply: `The best way to reach ${NAME} is through the contact form${kb.hero.socialEmail ? ` or by email at ${kb.hero.socialEmail}` : ""}. He typically replies within 24 hours.`,
    links: contactLinks(kb),
    quickReplies: ["Is he open to opportunities?", "Where is he based?"],
    context: "contact",
    emotion: "happy",
  }),
  location: (kb) =>
    kb.about.location
      ? {
          reply: `${NAME} is based in ${kb.about.location}, and is open to remote work as well as relocation for the right opportunity.`,
          links: [],
          quickReplies: ["Is he open to opportunities?", "How can I contact him?"],
          context: "location",
          emotion: "happy",
        }
      : null,
  availability: (kb) => {
    const cur = currentExperience(kb);
    const status = kb.about.availability ? `His current status: **${kb.about.availability.trim().replace(/.$/, "")}**. ` : "";
    return {
      reply: `${status}${cur ? `He's currently a ${cur.role} at ${cur.company.trim().replace(/.$/, "")}, and is open to discussing new opportunities. ` : ""}The quickest way to start a conversation is the contact page.`,
      links: contactLinks(kb).slice(0, 2),
      quickReplies: ["What roles is he looking for?", "Can I see his resume?"],
      context: "availability",
      emotion: "happy",
    };
  },
  certifications: (kb) => {
    const certs: any[] = kb.about.certifications || [];
    if (!certs.length) return null;
    return {
      reply: `${NAME}'s certifications:\n\n${certs.map((c) => `• **${c.name}**${c.issuer ? ` — ${c.issuer}` : ""}${c.date ? ` (${c.date})` : ""}`).join("\n")}`,
      links: [{ label: "Credentials", url: "/about" }],
      quickReplies: ["What's his education?"],
      context: "certifications",
      emotion: "happy",
    };
  },
  blog: (kb) => {
    if (!kb.posts.length) return null;
    return {
      reply: `${NAME} writes about engineering and the projects he builds. Recent articles:\n\n${kb.posts.slice(0, 5).map((p) => `• **${p.title}**`).join("\n")}`,
      links: [{ label: "Read the blog", url: "/blog" }],
      quickReplies: kb.posts.slice(0, 2).map((p) => `Tell me about ${p.title}`),
      context: "blog",
      emotion: "happy",
    };
  },
  testimonials: (kb) => {
    if (!kb.testimonials.length) return null;
    const t = kb.testimonials[0];
    return {
      reply: `Here's what people say about working with ${NAME}:\n\n“${summarize(t.quote, 280)}”\n— ${t.name}${t.role ? `, ${t.role}` : ""}${t.company ? ` at ${t.company}` : ""}`,
      links: [{ label: "All recommendations", url: "/about" }],
      quickReplies: ["What's his experience?"],
      context: "testimonials",
      emotion: "happy",
    };
  },
  github: (kb) =>
    kb.hero.socialGithub
      ? {
          reply: `You can explore ${NAME}'s code on GitHub. Most projects on this site also link directly to their source repositories.`,
          links: [{ label: "GitHub profile", url: kb.hero.socialGithub }, { label: "Projects", url: "/projects" }],
          quickReplies: ["What projects has he built?"],
          context: "github",
          emotion: "happy",
        }
      : null,
  linkedin: (kb) =>
    kb.hero.socialLinkedin
      ? {
          reply: `Here's ${NAME}'s LinkedIn profile — feel free to connect.`,
          links: [{ label: "LinkedIn", url: kb.hero.socialLinkedin }],
          quickReplies: ["How else can I contact him?"],
          context: "linkedin",
          emotion: "happy",
        }
      : null,
};

// Factual topics are answered from live content in preference to static rules.
const LIVE_PRIORITY: IntentName[] = [
  "projects", "experience", "currentRole", "education", "skills", "aiTools", "contact", "location",
  "certifications", "blog", "testimonials", "github", "linkedin",
];

const LIVE_WORDS = new Set(LIVE_PRIORITY.flatMap((i) => INTENT_KEYWORDS[i] || []).map(stem));

/**
 * Returns the best phrase-match score (1.25 = every word of a keyword phrase
 * present) and whether that phrase contains a word the live intents don't
 * cover — e.g. "fresher", "website" — meaning the curated answer is more
 * specific than the live one.
 */
const isLiveWord = (k: string) => LIVE_WORDS.has(k) || Array.from(LIVE_WORDS).some((w) => tokenMatches(k, w));
const normalizePhrase = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim()} `;

function scoreRule(rule: any, tokens: string[], raw: string) {
  let best = { score: 0, specific: false };
  if (!tokens.length) return best;
  const question = normalizePhrase(raw);
  for (const phrase of rule.keywords || []) {
    const kt = tokenize(String(phrase));
    if (!kt.length) continue;
    const matched = kt.filter((k) => tokens.some((t) => tokenMatches(t, k)));
    let score = matched.length / kt.length + (matched.length === kt.length ? 0.25 : 0);
    // The question contains this exact phrase: strongest possible signal.
    if (question.includes(normalizePhrase(String(phrase)))) score += 1;
    if (score > best.score) best = { score, specific: matched.some((k) => !isLiveWord(k)) };
  }
  return best;
}

function findEntity(kb: Knowledge, raw: string) {
  const text = compact(raw);
  const byLength = <T,>(items: T[], name: (t: T) => string) =>
    items
      .map((item) => ({ item, key: compact(name(item)) }))
      .filter(({ key }) => key.length >= 3 && text.includes(key))
      .sort((a, b) => b.key.length - a.key.length)[0]?.item;

  const project = byLength(kb.projects, (p) => p.title) || byLength(kb.projects, (p) => String(p.title).split(/[(:–—-]/)[0]);
  if (project) return { type: "project" as const, value: project };
  const post = byLength(kb.posts, (p) => p.title);
  if (post) return { type: "post" as const, value: post };
  const company = byLength<any>(kb.about.experience || [], (e) => e.company) ||
    byLength<any>(kb.about.experience || [], (e) => String(e.company).split(/\s+/)[0]);
  if (company) return { type: "experience" as const, value: company };
  return null;
}

function skillQuestion(kb: Knowledge, raw: string): ChatReply | null {
  // Compare as space-separated words so multi-word names ("Claude Code") match
  // whole words only ("C" must not match inside "React").
  const words = (s: string) => ` ${s.toLowerCase().replace(/\.(?=[a-z])/g, "").replace(/[^a-z0-9+#]+/g, " ").trim()} `;
  const haystack = words(raw);
  const skills: string[] = kb.about.skills || [];
  const skill = skills
    .flatMap((s) => [s, ...s.split(/[/()]/)].map((v) => ({ name: s, key: words(v) })))
    .filter(({ key }) => key.trim().length >= 1 && haystack.includes(key))
    .sort((a, b) => b.key.length - a.key.length)[0];
  if (!skill) return null;
  const used = kb.projects.filter((p) =>
    [...projectTech(p), stripHtml(p.description)].join(" ").toLowerCase().includes(skill.name.toLowerCase().split(/[ /(]/)[0])
  );
  return {
    reply: `Yes — **${skill.name}** is part of ${NAME}'s stack.${used.length ? ` He has used it in ${listJoin(used.slice(0, 3).map((p) => `**${p.title}**`))}.` : ""}`,
    links: used.slice(0, 2).map((p) => ({ label: p.title, url: `/projects/${p.slug}` })),
    quickReplies: ["What's his full tech stack?", "What projects has he built?"],
    context: used[0] ? `project:${used[0].slug}` : "skills",
    emotion: "excited",
  };
}

function followUp(kb: Knowledge, context: string | undefined, raw: string): ChatReply | null {
  if (!context || !/\b(more|detail|details|elaborate|explain|expand|that|it|this one|tell me more|go on)\b/i.test(raw)) return null;
  const [type, slug] = context.split(":");
  if (type === "project") {
    const p = kb.projects.find((x) => x.slug === slug);
    if (!p) return null;
    const full = summarize(p.description || p.content, 900);
    return { ...answerProject(p), reply: `More about **${p.title}**:\n\n${full}` };
  }
  if (type === "post") {
    const p = kb.posts.find((x) => x.slug === slug);
    return p ? { ...answerPost(p), reply: `More about **${p.title}**:\n\n${summarize(p.content, 900)}` } : null;
  }
  return null;
}

// ── Public entry point ────────────────────────────────────────────────────────
export async function answerQuestion(question: string, context?: string): Promise<ChatReply> {
  const kb = await loadKnowledge();
  const raw = question.trim().slice(0, 500);
  const tokens = tokenize(raw);
  const intents = detectIntents(raw, tokens);
  const top = intents[0]?.[0];

  // 1. Pure small talk.
  if (top && ["greeting", "thanks", "farewell"].includes(top) && tokens.length <= 3) {
    return INTENT_ANSWERS[top]!(kb)!;
  }

  // 2. Follow-up on the previous topic.
  const follow = followUp(kb, context, raw);
  if (follow) return follow;

  // 3. A specific project / post / company named in the question.
  const entity = findEntity(kb, raw);
  if (entity?.type === "project") return answerProject(entity.value);
  if (entity?.type === "post") return answerPost(entity.value);
  if (entity?.type === "experience") return answerExperienceEntry(entity.value);

  // 4. "Does he know / use X?" — answer about X specifically, honestly if it's not listed.
  if (/\b(know|knows|use|uses|used|familiar|proficient|skilled|good at|work(?:ed)? with|experience (?:with|in))\b/i.test(raw)) {
    const skill = skillQuestion(kb, raw);
    const intentWords = new Set(Object.values(INTENT_KEYWORDS).flat().map(stem));
    const knownKeys = (kb.about.skills || []).flatMap((x: string) => [x, ...x.split(/[/()]/)]).map(compact);
    const missing = raw
      .split(/[^A-Za-z0-9+#.]+/)
      .filter((w) => w.length >= 2 && tokenize(w).length === 1 && !intentWords.has(tokenize(w)[0]))
      .filter((w) => !/^(use|uses|used|know|knows|familiar|proficient|skilled|good|work|worked|experience|with|in)$/i.test(w))
      .filter((w) => !knownKeys.includes(compact(w)));
    if (skill) {
      if (!missing.length) return skill;
      const names = listJoin(missing.map((m) => `**${m}**`));
      return { ...skill, reply: `${skill.reply} ${names} ${missing.length > 1 ? "aren't" : "isn't"} listed on his portfolio, though.` };
    }
    if (missing.length) {
      const stack: string[] = kb.about.skills || [];
      return {
        reply: `**${missing.join(" ")}** isn't listed on ${NAME}'s portfolio. His current stack includes ${listJoin(stack.slice(0, 8))}. He picks up new technologies quickly, so it's worth asking him directly about your specific needs.`,
        links: [{ label: "Full tech stack", url: "/about" }, { label: "Contact", url: "/contact" }],
        quickReplies: ["What's his full tech stack?", "How can I contact him?"],
        context: "skills",
        emotion: "thinking",
      };
    }
  }

  // 5. Curated rule vs live intent.
  const rules = kb.rules
    .map((rule) => ({ rule, ...scoreRule(rule, tokens, raw) }))
    .filter((r) => r.score >= 0.75)
    .sort((a, b) => b.score - a.score || Number(b.specific) - Number(a.specific));
  const bestRule = rules[0];
  const ruleIsMoreSpecific = Boolean(bestRule && bestRule.score >= 1.25 && bestRule.specific);

  const liveIntent = intents.find(([name, s]) => LIVE_PRIORITY.includes(name) && s >= 1)?.[0];

  // "speed test app", "the password one": descriptive words → the matching project.
  if (liveIntent === "projects") {
    const bySkill = skillQuestion(kb, raw);
    if (bySkill) return bySkill;
    const projectWords = new Set([...(INTENT_KEYWORDS.projects || []), "which", "one", "any"].map(stem));
    const descriptive = Array.from(new Set(tokens.filter((t) => !projectWords.has(t))));
    if (descriptive.length) {
      const best = kb.docs
        .filter((d) => d.kind === "project")
        .map((doc) => ({
          doc,
          score: bm25(kb, descriptive, doc),
          coverage: descriptive.filter((q) => doc.tokens.some((t) => tokenMatches(q, t))).length / descriptive.length,
        }))
        .filter((r) => r.score > 1 && r.coverage >= 0.5)
        .sort((a, b) => b.score - a.score)[0];
      const project = best && kb.projects.find((p) => `project:${p.slug}` === best.doc.key);
      if (project) return answerProject(project);
    }
  }

  // "Best / favorite / strongest project" → describe the featured project.
  if (liveIntent === "projects" && /\b(best|strongest|favou?rite|proudest|top|flagship|impressive|main)\b/i.test(raw)) {
    const flagship = kb.projects.find((p) => p.featured) || kb.projects[0];
    if (flagship) {
      const a = answerProject(flagship);
      return { ...a, reply: `A great one to start with is his flagship project:\n\n${a.reply}` };
    }
  }

  if (liveIntent && !ruleIsMoreSpecific) {
    // "currently working" questions beat the generic experience list.
    const pick = liveIntent === "experience" && intents.some(([n]) => n === "currentRole") ? "currentRole" : liveIntent;
    const answer = INTENT_ANSWERS[pick]?.(kb) || INTENT_ANSWERS[liveIntent]?.(kb);
    if (answer) return answer;
  }

  const skill = skillQuestion(kb, raw);
  if (skill) return skill;

  if (bestRule) {
    const r = bestRule.rule;
    return {
      reply: r.answer,
      links: (r.links || []).map((l: any) => ({ label: l.label, url: l.url })),
      quickReplies: r.quickReplies?.length ? r.quickReplies : ["What projects has he built?", "How can I contact him?"],
      emotion: "happy",
    };
  }

  for (const [name] of intents) {
    const answer = INTENT_ANSWERS[name]?.(kb);
    if (answer) return answer;
  }

  // 5. Full-text search across everything on the site.
  if (tokens.length) {
    const queryTerms = Array.from(new Set(tokens));
    // Fraction of the question's distinct terms the document actually contains;
    // stops one incidental word ("favourite", "weather") from producing an answer.
    const coverage = (doc: Doc) =>
      queryTerms.filter((q) => doc.tokens.some((t) => tokenMatches(q, t))).length / queryTerms.length;
    const ranked = kb.docs
      .map((doc) => ({ doc, score: bm25(kb, tokens, doc), coverage: coverage(doc) }))
      .filter((r) => r.score > 1.2 && r.coverage >= 0.66)
      .sort((a, b) => b.score - a.score);
    const hit = ranked[0]?.doc;
    if (hit) {
      const framed = (a: ChatReply): ChatReply => ({
        ...a,
        reply: `Here's the closest match I found on the site:\n\n${a.reply}`,
        emotion: "thinking",
      });
      if (hit.kind === "project") return framed(answerProject(kb.projects.find((p) => `project:${p.slug}` === hit.key)));
      if (hit.kind === "post") return framed(answerPost(kb.posts.find((p) => `post:${p.slug}` === hit.key)));
      const related = ranked.slice(1, 3).filter((r) => r.doc.url && r.doc.url !== hit.url);
      return {
        reply: `Here's what I found about that:\n\n**${hit.title}** — ${summarize(hit.text, 300)}`,
        links: [hit, ...related.map((r) => r.doc)].filter((d) => d.url).map((d) => ({ label: d.title, url: d.url! })),
        quickReplies: ["Give me a quick overview", "How can I contact him?"],
        context: hit.key,
        emotion: "thinking",
      };
    }
  }

  // 6. Honest fallback.
  return {
    reply: `I don't have information about that on ${NAME}'s portfolio. I can help with his projects, experience, skills, education, or how to reach him — or you can ask ${NAME} directly through the contact page.`,
    links: [{ label: "Contact page", url: "/contact" }],
    quickReplies: ["Give me a quick overview", "What projects has he built?", "What's his tech stack?"],
    emotion: "confused",
  };
}

export async function resumeLink() {
  return resumeUrl(await loadKnowledge());
}
