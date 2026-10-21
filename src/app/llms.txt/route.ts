import { getProfile, SITE_URL } from "@/lib/profileData";

// /llms.txt — plain-markdown summary for AI assistants and crawlers
// (https://llmstxt.org). Generated from live CMS content, refreshed hourly.
export const revalidate = 3600;

export async function GET() {
  const p = await getProfile();
  if (!p) return new Response("# Nilay Naha\n\nPortfolio temporarily unavailable.\n", { status: 503 });

  const lines: string[] = [
    "# Nilay Naha — Software Engineer",
    "",
    `> ${[p.current ? `${p.current.role} at ${p.current.company}` : "Software engineer", p.location && `based in ${p.location}`].filter(Boolean).join(", ")}. Full-stack and backend development with an AI/ML specialization.${p.availability ? ` Status: ${p.availability}.` : ""}`,
    "",
  ];
  if (p.bio) lines.push(p.bio, "");

  if (p.experience.length) {
    lines.push("## Experience", "");
    for (const e of p.experience) lines.push(`- **${e.role}**, ${e.company}${e.duration ? ` (${e.duration})` : ""}${e.description ? ` — ${e.description}` : ""}`);
    lines.push("");
  }
  if (p.education.length) {
    lines.push("## Education", "");
    for (const e of p.education) lines.push(`- **${e.degree}**, ${e.institution}${e.year ? ` (${e.year})` : ""}${e.cgpa ? `, CGPA ${e.cgpa}` : ""}`);
    lines.push("");
  }
  if (p.skills.length) lines.push("## Skills", "", p.skills.join(", "), "");

  if (p.projects.length) {
    lines.push("## Projects", "");
    for (const pr of p.projects) {
      const extra = [pr.githubLink && `[source](${pr.githubLink})`, pr.liveLink && `[live](${pr.liveLink})`].filter(Boolean).join(" · ");
      lines.push(`- [${pr.title}](${SITE_URL}/projects/${pr.slug}): ${pr.summary}${extra ? ` (${extra})` : ""}`);
    }
    lines.push("");
  }
  if (p.posts.length) {
    lines.push("## Articles", "");
    for (const post of p.posts) lines.push(`- [${post.title}](${SITE_URL}/blog/${post.slug})${post.excerpt ? `: ${post.excerpt}` : ""}`);
    lines.push("");
  }

  const h = p.hero;
  lines.push(
    "## Contact",
    "",
    `- Contact form: ${SITE_URL}/contact`,
    ...(h.socialEmail ? [`- Email: ${h.socialEmail}`] : []),
    ...(h.socialLinkedin ? [`- LinkedIn: ${h.socialLinkedin}`] : []),
    ...(h.socialGithub ? [`- GitHub: ${h.socialGithub}`] : []),
    ""
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
