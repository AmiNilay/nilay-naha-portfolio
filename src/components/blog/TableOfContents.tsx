"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ contentSelector = ".blog-content" }: { contentSelector?: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Wait a tick for React to finish rendering
    const timer = setTimeout(() => {
      const container = document.querySelector(contentSelector);
      if (!container) return;

      const found = Array.from(container.querySelectorAll("h2, h3, h4")) as HTMLElement[];

      const items: Heading[] = found
        .filter((el) => el.id && el.textContent?.trim()) // Only headings with IDs
        .map((el) => ({
          id: el.id,
          text: el.textContent?.trim() || "",
          level: Number(el.tagName[1]),
        }));

      setHeadings(items);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: "-100px 0px -70% 0px" }
      );

      found.forEach((el) => {
        if (el.id) observer.observe(el);
      });

      return () => observer.disconnect();
    }, 200);

    return () => clearTimeout(timer);
  }, [contentSelector]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const el = document.getElementById(id);
    if (!el) {
      console.warn("TOC: Heading not found for id:", id);
      return;
    }

    const yOffset = -100;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.pushState(null, "", `#${id}`);
    setActiveId(id);
  };

  if (headings.length < 2) return null;

  return (
    <nav className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar">
      <div className="bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
          <List className="w-3.5 h-3.5" />
          On this page
        </h3>
        <ul className="space-y-1">
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: `${Math.max(0, h.level - 2) * 12}px` }}>
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                className={`block py-1.5 px-3 text-sm rounded-md transition-all border-l-2 cursor-pointer ${
                  activeId === h.id
                    ? "border-primary text-primary font-semibold bg-primary/5"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-primary hover:border-primary/40"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}