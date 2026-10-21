import {
  SiPython, SiFastapi, SiFlask, SiDjango, SiKotlin, SiDocker, SiGit,
  SiNodedotjs, SiExpress, SiMongodb, SiPostgresql, SiSqlite, SiRedis,
  SiJsonwebtokens, SiOpenapiinitiative, SiGithub, SiVercel, SiRender,
  SiLinux, SiReact, SiNextdotjs, SiTailwindcss, SiHtml5, SiCss3,
  SiJavascript, SiTypescript, SiPostman, SiSwagger,
  // NEW IMPORTS FOR AI/ML & C/C++
  SiTensorflow, SiPytorch, SiKeras, SiScikitlearn, SiPandas, SiNumpy,
  SiC, SiCplusplus, SiArduino, SiOpencv
} from "react-icons/si";

import { FaDatabase, FaSearch, FaEye, FaBrain } from "react-icons/fa";
import { createElement, type CSSProperties } from "react";

type IconProps = { className?: string; style?: CSSProperties };

/**
 * Brand SVGs vendored from @lobehub/icons-static-svg (MIT) into public/icons/ai/,
 * for AI tools react-icons doesn't ship. Single-color marks render as a CSS mask
 * filled with currentColor so they take `color` exactly like react-icons;
 * multi-color logos render as images.
 */
function svgIcon(file: string, { mono = false } = {}) {
  const src = `/icons/ai/${file}.svg`;
  const Icon = ({ className, style }: IconProps) =>
    mono
      ? createElement("span", {
          "aria-hidden": true,
          className: `inline-block shrink-0 ${className ?? ""}`,
          style: {
            ...style,
            backgroundColor: "currentColor",
            WebkitMaskImage: `url(${src})`,
            maskImage: `url(${src})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          },
        })
      : createElement("img", {
          src,
          alt: "",
          "aria-hidden": true,
          draggable: false,
          loading: "lazy",
          className: `shrink-0 object-contain ${className ?? ""}`,
        });
  Icon.displayName = `SvgIcon(${file})`;
  return Icon;
}

/**
 * Brand colors are tuned for white backgrounds; near-black brands disappear in
 * dark mode and yellows wash out in light mode. Returns a readable color per theme.
 */
export function readableIconColors(hex: string): { light: string; dark: string } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { light: hex, dark: hex };
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const darken = (f: number) =>
    "#" + [r, g, b].map((c) => Math.round(c * f).toString(16).padStart(2, "0")).join("");
  return {
    light: luminance > 0.55 ? darken(0.62) : hex,
    dark: luminance < 0.06 ? "#E5E7EB" : hex,
  };
}

// ✅ CATEGORY-BASED SKILLS (industry standard)
export const SKILL_CATEGORIES = [
  {
    title: "AI Tools & LLMs",
    skills: [
      { name: "Claude", color: "#D97757", Icon: svgIcon("claude-color") },
      { name: "Claude Code", color: "#D97757", Icon: svgIcon("claudecode-color") },
      { name: "Anthropic API", color: "#191919", Icon: svgIcon("anthropic", { mono: true }) },
      { name: "OpenAI / ChatGPT", color: "#000000", Icon: svgIcon("openai", { mono: true }) },
      { name: "Gemini", color: "#4285F4", Icon: svgIcon("gemini-color") },
      { name: "GitHub Copilot", color: "#000000", Icon: svgIcon("githubcopilot", { mono: true }) },
      { name: "Cursor", color: "#000000", Icon: svgIcon("cursor", { mono: true }) },
      { name: "Windsurf", color: "#0B100F", Icon: svgIcon("windsurf", { mono: true }) },
      { name: "Lovable", color: "#FF4D8D", Icon: svgIcon("lovable-color") },
      { name: "v0", color: "#000000", Icon: svgIcon("v0", { mono: true }) },
      { name: "Replit", color: "#F26207", Icon: svgIcon("replit-color") },
      { name: "DeepSeek", color: "#4D6BFE", Icon: svgIcon("deepseek-color") },
      { name: "Qwen", color: "#615CED", Icon: svgIcon("qwen-color") },
      { name: "Mistral", color: "#FA520F", Icon: svgIcon("mistral-color") },
      { name: "Grok", color: "#000000", Icon: svgIcon("grok", { mono: true }) },
      { name: "Kimi", color: "#1783FF", Icon: svgIcon("kimi-color") },
      { name: "Llama (Meta)", color: "#0467DF", Icon: svgIcon("meta-color") },
      { name: "Ollama", color: "#000000", Icon: svgIcon("ollama", { mono: true }) },
      { name: "Hugging Face", color: "#FFD21E", Icon: svgIcon("huggingface-color") },
      { name: "LangChain", color: "#1C3C3C", Icon: svgIcon("langchain-color") },
      { name: "Perplexity", color: "#20808D", Icon: svgIcon("perplexity-color") },
      { name: "n8n", color: "#EA4B71", Icon: svgIcon("n8n-color") },
    ],
  },
  {
    title: "AI / ML & Data Science",
    skills: [
      { name: "TensorFlow", color: "#FF6F00", Icon: SiTensorflow },
      { name: "PyTorch", color: "#EE4C2C", Icon: SiPytorch },
      { name: "Keras", color: "#D00000", Icon: SiKeras },
      { name: "Scikit-Learn", color: "#F7931E", Icon: SiScikitlearn },
      { name: "OpenCV", color: "#5C3EE8", Icon: SiOpencv },
      { name: "Pandas", color: "#150458", Icon: SiPandas },
      { name: "NumPy", color: "#013243", Icon: SiNumpy },
      { name: "Deep Learning", color: "#FFD700", Icon: FaBrain },
    ],
  },
  {
    title: "Backend & Core Languages",
    skills: [
      { name: "Python", color: "#3776AB", Icon: SiPython },
      { name: "C", color: "#A8B9CC", Icon: SiC },
      { name: "C++", color: "#00599C", Icon: SiCplusplus },
      { name: "Node.js", color: "#339933", Icon: SiNodedotjs },
      { name: "FastAPI", color: "#009688", Icon: SiFastapi },
      { name: "Flask", color: "#000000", Icon: SiFlask },
      { name: "Express.js", color: "#000000", Icon: SiExpress },
      { name: "REST APIs", color: "#6BA539", Icon: SiOpenapiinitiative },
      { name: "JWT Auth", color: "#000000", Icon: SiJsonwebtokens },
    ],
  },
  {
    title: "Databases",
    skills: [
      { name: "PostgreSQL", color: "#4169E1", Icon: SiPostgresql },
      { name: "MongoDB", color: "#47A248", Icon: SiMongodb },
      { name: "SQLite", color: "#003B57", Icon: SiSqlite },
      { name: "SQL", color: "#2563EB", Icon: FaDatabase },
      { name: "Redis", color: "#DC382D", Icon: SiRedis },
    ],
  },
  {
    title: "DevOps & Tools",
    skills: [
      { name: "Git", color: "#F05032", Icon: SiGit },
      { name: "GitHub", color: "#181717", Icon: SiGithub },
      { name: "Docker", color: "#2496ED", Icon: SiDocker },
      { name: "Linux", color: "#FCC624", Icon: SiLinux },
      { name: "Vercel", color: "#000000", Icon: SiVercel },
      { name: "Render", color: "#46E3B7", Icon: SiRender },
      { name: "Postman", color: "#FF6C37", Icon: SiPostman },
      { name: "Swagger", color: "#85EA2D", Icon: SiSwagger },
      { name: "Arduino", color: "#00979D", Icon: SiArduino },
    ],
  },
  {
    title: "Frontend (Support)",
    skills: [
      { name: "Next.js", color: "#000000", Icon: SiNextdotjs },
      { name: "React", color: "#61DAFB", Icon: SiReact },
      { name: "Tailwind CSS", color: "#06B6D4", Icon: SiTailwindcss },
      { name: "TypeScript", color: "#3178C6", Icon: SiTypescript },
      { name: "JavaScript", color: "#F7DF1E", Icon: SiJavascript },
      { name: "HTML5", color: "#E34F26", Icon: SiHtml5 },
      { name: "CSS3", color: "#1572B6", Icon: SiCss3 },
    ],
  },
  {
    title: "Automation & Web Scraping",
    skills: [
      { name: "Web Extract", color: "#16A34A", Icon: FaSearch },
    ],
  },
  {
    title: "Mobile (Optional)",
    skills: [
      { name: "Kotlin", color: "#7F52FF", Icon: SiKotlin },
    ],
  },
];

export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((cat) => cat.skills);