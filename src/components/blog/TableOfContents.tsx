"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({
  contentSelector = ".blog-content",
}: {
  contentSelector?: string;
}) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.querySelector(contentSelector);
      if (!container) return;

      const found = Array.from(container.querySelectorAll("h2, h3, h4")) as HTMLElement[];
      const items: Heading[] = found
        .filter((el) => el.id && el.textContent?.trim())
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
    const el = document.getElementById(id);
    if (!el) return;

    const yOffset = -120;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.pushState(null, "", `#${id}`);
    setActiveId(id);
  };

  if (headings.length < 2) return null;

  return (
    <nav className="max-h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar">
      <div className="bg-white/70 dark:bg-[#12161f]/70 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] border-t-white/80 dark:border-t-white/20 rounded-3xl p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          <List className="w-3.5 h-3.5 text-primary" />
          <span>Table of Contents</span>
        </h3>
        <ul className="space-y-1">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <li key={h.id} style={{ paddingLeft: `${Math.max(0, h.level - 2) * 10}px` }}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => handleClick(e, h.id)}
                  className={`block py-1.5 px-3 text-xs sm:text-sm rounded-xl transition-all select-none cursor-pointer leading-snug ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  }`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
