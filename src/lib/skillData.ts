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

// ✅ CATEGORY-BASED SKILLS (industry standard)
export const SKILL_CATEGORIES = [
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