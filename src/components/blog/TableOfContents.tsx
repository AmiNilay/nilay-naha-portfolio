"use client";

import { useEffect, useState, useCallback } from "react";
import { List, ChevronDown } from "lucide-react";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const found = Array.from(
      container.querySelectorAll("h1, h2, h3, h4, h5, h6"),
    ) as HTMLElement[];

    found.forEach((el, i) => {
      if (!el.id) {
        const text = el.textContent?.trim() || "";
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-")
          .replace(/(^-|-$)/g, "");
        el.id = slug || `section-${i}`;
      }
      el.style.scrollMarginTop = "120px";
    });

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
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-100px 0px -75% 0px",
        threshold: 0,
      },
    );

    found.forEach((el) => {
      if (el.id) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [contentSelector]);

  /**
   * FIX: Use window.scrollTo with calculated offset instead of scrollIntoView.
   * scrollIntoView fails on second click because the element is already in view.
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (!el) return;

      const yOffset = -110;
      const y =
        el.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);

      // Update URL hash without causing a page jump
      const newUrl = `${window.location.pathname}${window.location.search}#${id}`;
      window.history.replaceState(null, "", newUrl);
    },
    [],
  );

  if (headings.length < 2) return null;

  return (
    <nav className="max-h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            <List className="w-4 h-4" /> On this page
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">
              {headings.length}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isCollapsed ? "-rotate-90" : ""
              }`}
            />
          </div>
        </button>

        {!isCollapsed && (
          <div className="px-3 pb-3">
            <ul className="space-y-0.5">
              {headings.map((h) => {
                const isActive = activeId === h.id;
                const indent = Math.max(0, h.level - 2);

                return (
                  <li
                    key={h.id}
                    style={{ paddingLeft: `${indent * 12}px` }}
                  >
                    <a
                      href={`#${h.id}`}
                      onClick={(e) => handleClick(e, h.id)}
                      className={`block py-1.5 px-3 text-[13px] rounded-lg transition-all cursor-pointer leading-snug ${
                        isActive
                          ? "text-primary font-bold bg-primary/10 border-l-2 border-primary"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border-l-2 border-transparent"
                      }`}
                    >
                      {h.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}