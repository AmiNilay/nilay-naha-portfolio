"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontally scrollable row (e.g. topic filter pills). Shows left/right
 * arrow buttons and edge fades only when there is more content that way,
 * turns vertical mouse-wheel into sideways scroll, and keeps the element
 * marked `data-active="true"` in view. Touch users swipe natively.
 */
export default function ScrollRow({
  children,
  className,
  innerClassName,
  activeKey,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Changes when the selection changes, to scroll the active item into view. */
  activeKey?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    // Vertical wheel → horizontal scroll (only when the row actually overflows).
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY });
    };
    el.addEventListener("scroll", update, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
    };
  }, [update, children]);

  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeKey]);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.max(160, el.clientWidth * 0.6), behavior: "smooth" });
  };

  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/15 shadow-md text-foreground hover:scale-105 active:scale-95 transition";

  return (
    <div className={cn("relative min-w-0", className)}>
      <div ref={ref} className={cn("flex items-center overflow-x-auto no-scrollbar scroll-smooth", innerClassName)}>
        {children}
      </div>
      {canLeft && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10 bg-gradient-to-r from-white dark:from-[#12161f] to-transparent rounded-l-2xl" />
          <button type="button" aria-label="Scroll topics left" onClick={() => scroll(-1)} className={cn(arrow, "left-0.5")}>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}
      {canRight && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10 bg-gradient-to-l from-white dark:from-[#12161f] to-transparent rounded-r-2xl" />
          <button type="button" aria-label="Scroll topics right" onClick={() => scroll(1)} className={cn(arrow, "right-0.5")}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
