import {
  SiPython,
  SiFastapi,
  SiFlask,
  SiDjango,
  SiKotlin,
  SiDocker,
  SiGit,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiPostgresql,
  SiSqlite,
  SiRedis,
  SiJsonwebtokens,
  SiOpenapiinitiative,
  SiGithub,
  SiVercel,
  SiRender,
  SiLinux,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiTypescript,
  SiPostman,
  SiSwagger,
} from "react-icons/si";

import { FaDatabase, FaSearch, FaEye } from "react-icons/fa";

// ✅ CATEGORY-BASED SKILLS (industry standard)
export const SKILL_CATEGORIES = [
  {
    title: "Backend",
    skills: [
      { name: "Python", color: "#3776AB", Icon: SiPython },
      { name: "FastAPI", color: "#009688", Icon: SiFastapi },
      { name: "Flask", color: "#000000", Icon: SiFlask },

      { name: "Node.js", color: "#339933", Icon: SiNodedotjs },
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
      { name: "OpenAPI", color: "#6BA539", Icon: SiOpenapiinitiative },
    ],
  },

  {
    title: "Frontend (Support)",
    skills: [
      { name: "Next.js", color: "#000000", Icon: SiNextdotjs },
      { name: "React", color: "#61DAFB", Icon: SiReact },
      { name: "Tailwind CSS", color: "#06B6D4", Icon: SiTailwindcss },

      { name: "HTML5", color: "#E34F26", Icon: SiHtml5 },
      { name: "CSS3", color: "#1572B6", Icon: SiCss3 },
      { name: "JavaScript", color: "#F7DF1E", Icon: SiJavascript },
    ],
  },

  {
    title: "Python + CV / Automation",
    skills: [
      // ✅ OpenCV
      { name: "OpenCV", color: "#5C3EE8", Icon: FaEye },

      // ✅ Web scraping
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