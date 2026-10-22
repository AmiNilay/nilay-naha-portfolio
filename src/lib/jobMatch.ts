import { getPublicKnowledge, searchPortfolio, stripPortfolioHtml, portfolioProjectTech, type PortfolioHit } from "@/lib/chatEngine";

/**
 * Deterministic job-description matcher. Extracts known skills from a JD,
 * compares them with skills evidenced on the portfolio (About skills, project
 * tech, experience text), and ranks relevant work with BM25. No LLM: every
 * claim in the result points at real portfolio content.
 */

// Canonical skill → aliases (lowercase). Matched on word boundaries.
const SKILLS: Record<string, string[]> = {
  JavaScript: ["javascript", "js", "es6", "ecmascript"],
  TypeScript: ["typescript", "ts"],
  Python: ["python", "python3"],
  Java: ["java"],
  "C++": ["c++", "cpp"],
  "C#": ["c#", "csharp", ".net", "dotnet"],
  Go: ["golang"],
  Rust: ["rust"],
  Kotlin: ["kotlin"],
  Swift: ["swift"],
  Dart: ["dart"],
  PHP: ["php"],
  SQL: ["sql"],
  React: ["react", "react.js", "reactjs"],
  "React Native": ["react native", "react-native"],
  Expo: ["expo"],
  Flutter: ["flutter"],
  "Next.js": ["next.js", "nextjs", "next js"],
  "Vue.js": ["vue", "vue.js", "vuejs"],
  Angular: ["angular"],
  Svelte: ["svelte", "sveltekit"],
  Redux: ["redux"],
  "Tailwind CSS": ["tailwind", "tailwindcss", "tailwind css"],
  HTML: ["html", "html5"],
  CSS: ["css", "css3", "scss", "sass"],
  "Node.js": ["node", "node.js", "nodejs"],
  Express: ["express", "express.js", "expressjs"],
  NestJS: ["nestjs", "nest.js"],
  FastAPI: ["fastapi"],
  Flask: ["flask"],
  Django: ["django"],
  "Spring Boot": ["spring", "spring boot", "springboot"],
  "REST APIs": ["rest", "restful", "rest api", "rest apis", "api integration"],
  GraphQL: ["graphql"],
  MongoDB: ["mongodb", "mongo", "mongoose"],
  PostgreSQL: ["postgresql", "postgres", "psql"],
  MySQL: ["mysql"],
  SQLite: ["sqlite"],
  Redis: ["redis"],
  Firebase: ["firebase", "firestore"],
  Supabase: ["supabase"],
  Docker: ["docker", "containers", "containerization"],
  Kubernetes: ["kubernetes", "k8s"],
  AWS: ["aws", "amazon web services", "ec2", "s3", "lambda"],
  Azure: ["azure"],
  GCP: ["gcp", "google cloud"],
  Vercel: ["vercel"],
  "CI/CD": ["ci/cd", "cicd", "github actions", "jenkins", "gitlab ci"],
  Git: ["git"],
  GitHub: ["github"],
  Bitbucket: ["bitbucket"],
  Jira: ["jira"],
  Linux: ["linux", "bash", "shell scripting"],
  Postman: ["postman"],
  Swagger: ["swagger", "openapi"],
  Jest: ["jest"],
  Testing: ["unit testing", "testing", "tdd", "pytest", "cypress", "playwright"],
  "Machine Learning": ["machine learning", "ml"],
  "Deep Learning": ["deep learning", "neural network", "neural networks"],
  TensorFlow: ["tensorflow", "keras"],
  PyTorch: ["pytorch", "torch"],
  "scikit-learn": ["scikit-learn", "sklearn"],
  OpenCV: ["opencv", "computer vision"],
  NLP: ["nlp", "natural language processing"],
  "LLMs / GenAI": ["llm", "llms", "genai", "generative ai", "gpt", "openai", "langchain", "rag", "prompt engineering"],
  Pandas: ["pandas"],
  NumPy: ["numpy"],
  "Web Scraping": ["web scraping", "scraping", "beautifulsoup", "scrapy", "puppeteer", "selenium"],
  Agile: ["agile", "scrum"],
  "System Design": ["system design", "microservices", "distributed systems"],
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PATTERNS = Object.entries(SKILLS).map(([name, aliases]) => ({
  name,
  re: new RegExp(`(^|[^a-z0-9+#.])(${[name.toLowerCase(), ...aliases].map(escape).join("|")})(?=$|[^a-z0-9+#])`, "i"),
}));

/** Canonical skills mentioned in free text. */
export function extractSkills(text: string): string[] {
  const t = ` ${text.toLowerCase()} `;
  return PATTERNS.filter((p) => p.re.test(t)).map((p) => p.name);
}

export interface MatchResult {
  score: number;
  verdict: string;
  summary: string;
  requiredSkills: string[];
  matchedSkills: { skill: string; evidence: string[] }[];
  missingSkills: string[];
  relevant: PortfolioHit[];
}

export async function matchJobDescription(jd: string): Promise<MatchResult> {
  const text = jd.slice(0, 20000);
  const kb = await getPublicKnowledge();
  const required = extractSkills(text);

  // Where each skill is evidenced on the portfolio.
  const sources: { label: string; text: string }[] = [
    { label: "Skills list", text: (kb.about.skills || []).join(", ") },
    { label: "About bio", text: stripPortfolioHtml(kb.about.bio) },
    ...kb.projects.map((p: any) => ({
      label: `Project: ${p.title}`,
      text: `${portfolioProjectTech(p).join(", ")} ${stripPortfolioHtml(p.description)}`,
    })),
    ...(kb.about.experience || []).map((e: any) => ({
      label: `Experience: ${e.role} at ${e.company}`,
      text: `${e.role} ${e.description || ""}`,
    })),
  ];
  const evidenceFor = (skill: string) =>
    sources.filter((s) => extractSkills(s.text).includes(skill)).map((s) => s.label);

  const matchedSkills = required.map((skill) => ({ skill, evidence: evidenceFor(skill) })).filter((m) => m.evidence.length);
  const missingSkills = required.filter((s) => !matchedSkills.some((m) => m.skill === s));
  const relevant = await searchPortfolio(text, 5, ["project", "experience", "post"]);

  // 75% skill coverage (skills backed by projects count a bit more) + 25% content relevance.
  const coverage = required.length
    ? matchedSkills.reduce((s, m) => s + (m.evidence.some((e) => e.startsWith("Project") || e.startsWith("Experience")) ? 1 : 0.8), 0) / required.length
    : 0;
  const relevance = Math.min(1, (relevant[0]?.score || 0) / 12);
  const score = required.length ? Math.round((coverage * 0.75 + relevance * 0.25) * 100) : Math.round(relevance * 60);

  const verdict = score >= 75 ? "Strong match" : score >= 50 ? "Good match" : score >= 30 ? "Partial match" : "Limited match";
  const summary = required.length
    ? `Nilay's portfolio shows ${matchedSkills.length} of the ${required.length} skills this role mentions` +
      (matchedSkills.length ? ` (${matchedSkills.slice(0, 6).map((m) => m.skill).join(", ")})` : "") +
      (missingSkills.length ? `. Not shown on the portfolio: ${missingSkills.join(", ")}.` : ".") +
      (relevant.length ? ` Most relevant work: ${relevant.slice(0, 2).map((r) => r.title).join(" and ")}.` : "")
    : "No recognisable technical skills were found in this text — try pasting the full job description.";

  return { score, verdict, summary, requiredSkills: required, matchedSkills, missingSkills, relevant };
}

export interface TailoredResume {
  name: string;
  headline: string;
  contact: { label: string; url: string }[];
  location: string;
  summary: string;
  skills: { name: string; matched: boolean }[];
  experience: { role: string; company: string; duration: string; description: string }[];
  projects: { title: string; url: string; tech: string[]; summary: string; matched: boolean }[];
  education: { degree: string; institution: string; year: string; grade: string }[];
  certifications: { name: string; issuer: string }[];
}

/** One-page résumé from CMS data, reordered so the JD's skills and work come first. */
export async function buildTailoredResume(match: MatchResult | null): Promise<TailoredResume> {
  const { hero, about, projects } = await getPublicKnowledge();
  const site = "https://nilay-naha-portfolio.vercel.app";
  const matched = new Set(match?.matchedSkills.map((m) => m.skill) || []);
  const relevantTitles = new Set(match?.relevant.map((r) => r.title) || []);

  const skillList: string[] = about.skills || [];
  const skills = skillList
    .map((name) => ({ name, matched: extractSkills(name).some((s) => matched.has(s)) }))
    .sort((a, b) => Number(b.matched) - Number(a.matched));

  const rankedProjects = projects
    .map((p: any) => {
      const tech = portfolioProjectTech(p);
      const hit = relevantTitles.has(p.title) || extractSkills(tech.join(" ")).some((s) => matched.has(s));
      return { p, tech, hit };
    })
    .sort((a: any, b: any) => Number(b.hit) - Number(a.hit) || Number(!!b.p.featured) - Number(!!a.p.featured))
    .slice(0, 4);

  const current = (about.experience || []).find((e: any) => /present|current/i.test(e.duration || ""));
  const contact = [
    hero.socialEmail && { label: hero.socialEmail, url: `mailto:${hero.socialEmail}` },
    hero.socialLinkedin && { label: "LinkedIn", url: hero.socialLinkedin },
    hero.socialGithub && { label: "GitHub", url: hero.socialGithub },
    { label: site.replace("https://", ""), url: site },
  ].filter(Boolean) as { label: string; url: string }[];

  return {
    name: "Nilay Naha",
    headline: current ? `${current.role} · ${String(current.company).replace(/\.$/, "")}` : "Software Engineer",
    contact,
    location: about.location || "",
    summary: stripPortfolioHtml(about.bio).slice(0, 480),
    skills,
    experience: (about.experience || []).map((e: any) => ({
      role: e.role, company: e.company, duration: e.duration || "", description: e.description || "",
    })),
    projects: rankedProjects.map(({ p, tech, hit }: any) => ({
      title: p.title,
      url: `${site}/projects/${p.slug}`,
      tech: tech.slice(0, 8),
      summary: stripPortfolioHtml(p.description).slice(0, 260),
      matched: hit,
    })),
    education: (about.education || []).map((e: any) => ({
      degree: e.degree, institution: e.institution, year: e.year || "",
      grade: e.cgpa ? `CGPA ${e.cgpa}` : e.percentage ? `${e.percentage}%` : "",
    })),
    certifications: (about.certifications || []).map((c: any) => ({ name: c.name, issuer: c.issuer })),
  };
}
