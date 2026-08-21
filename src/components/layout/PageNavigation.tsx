"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Hand, MoveHorizontal } from "lucide-react";
import { setPendingNavigationDirection } from "@/lib/navigationDirection";

const pages = ["/", "/projects", "/blog", "/about", "/contact"];

interface PointerStart {
  x: number;
  y: number;
  time: number;
  id: number;
}

export default function PageNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showGlobalHint, setShowGlobalHint] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const pointerStart = useRef<PointerStart | null>(null);
  const wheelDistance = useRef(0);
  const wheelLocked = useRef(false);

  const safePathname = pathname || "";
  const currentIndex = pages.indexOf(safePathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || safePathname.startsWith("/admin") || safePathname !== "/") return;

    setShowGlobalHint(true);
    const timer = setTimeout(() => setShowGlobalHint(false), 4000);
    return () => clearTimeout(timer);
  }, [safePathname, mounted]);

  useEffect(() => {
    if (!mounted || safePathname.startsWith("/admin")) return;
    if (window.innerWidth < 768) {
      setShowHints(true);
      const timer = setTimeout(() => setShowHints(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [safePathname, mounted]);

  const navigateTo = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= pages.length || nextIndex === currentIndex) return;

    const direction = nextIndex > currentIndex ? 1 : -1;
    setPendingNavigationDirection(direction);
    setShowGlobalHint(false);
    router.push(pages[nextIndex]);
  };

  useEffect(() => {
    if (!mounted || safePathname.startsWith("/admin") || currentIndex === -1) return;

    const targetIsInteractive = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      return Boolean(
        element?.closest("a, button, input, textarea, select, [contenteditable='true']")
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (e.key === "ArrowRight") navigateTo(currentIndex + 1);
      if (e.key === "ArrowLeft") navigateTo(currentIndex - 1);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (targetIsInteractive(e.target)) return;

      pointerStart.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
        id: e.pointerId,
      };
      setDragX(0);
      setIsDragging(true);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const start = pointerStart.current;
      if (!start || start.id !== e.pointerId) return;

      const diffX = e.clientX - start.x;
      const diffY = e.clientY - start.y;

      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 12) {
        pointerStart.current = null;
        setDragX(0);
        setIsDragging(false);
        return;
      }

      if (Math.abs(diffX) > 8) setDragX(Math.max(-180, Math.min(180, diffX)));
    };

    const finishPointerGesture = (e: PointerEvent) => {
      const start = pointerStart.current;
      if (!start || start.id !== e.pointerId) return;

      const diffX = e.clientX - start.x;
      const diffY = e.clientY - start.y;
      const duration = Date.now() - start.time;

      pointerStart.current = null;
      setDragX(0);
      setIsDragging(false);

      if (
        duration > 900 ||
        Math.abs(diffX) < 80 ||
        Math.abs(diffX) <= Math.abs(diffY) * 1.35
      ) {
        return;
      }

      if (diffX < 0) navigateTo(currentIndex + 1);
      if (diffX > 0) navigateTo(currentIndex - 1);
    };

    const handlePointerCancel = () => {
      pointerStart.current = null;
      setDragX(0);
      setIsDragging(false);
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 4) return;

      wheelDistance.current += e.deltaX;
      if (Math.abs(wheelDistance.current) < 80 || wheelLocked.current) return;

      const direction = wheelDistance.current > 0 ? 1 : -1;
      wheelDistance.current = 0;
      wheelLocked.current = true;
      navigateTo(currentIndex + direction);
      window.setTimeout(() => {
        wheelLocked.current = false;
      }, 700);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", finishPointerGesture, { passive: true });
    window.addEventListener("pointercancel", handlePointerCancel, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishPointerGesture);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [mounted, safePathname, currentIndex, router]);

  if (!mounted || safePathname.startsWith("/admin")) return null;

  return (
    <>
      <div
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-out pointer-events-none ${
          showGlobalHint ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-full shadow-2xl border border-primary/50">
          <MoveHorizontal className="w-5 h-5 animate-pulse text-white" />
          <span className="text-sm font-bold tracking-wide text-white">
            Swipe, drag, or use arrow keys to navigate
          </span>
        </div>
      </div>

      <div
        className={`fixed left-1/2 bottom-24 -translate-x-1/2 z-[100] md:hidden pointer-events-none transition-all duration-200 ${
          isDragging ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <div
          className="flex items-center gap-3 rounded-2xl border border-white/30 bg-gray-950/80 px-5 py-3 text-white shadow-2xl backdrop-blur-md"
          style={{
            transform: `translateX(${dragX * 0.2}px) rotate(${dragX * 0.02}deg)`,
          }}
        >
          <Hand className="h-5 w-5" />
          <span className="text-sm font-semibold whitespace-nowrap">
            {dragX < 0 ? "Next page" : "Previous page"}
          </span>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-between px-4 transition-opacity duration-700 md:hidden ${
          showHints ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className={`transition-transform duration-500 ${showHints ? "translate-x-0" : "-translate-x-8"}`}>
          {currentIndex > 0 && (
            <div className="bg-black/40 dark:bg-white/10 backdrop-blur-md p-3 rounded-full text-white shadow-lg animate-pulse">
              <ChevronLeft size={32} />
            </div>
          )}
        </div>

        <div className={`transition-transform duration-500 ${showHints ? "translate-x-0" : "translate-x-8"}`}>
          {currentIndex < pages.length - 1 && (
            <div className="bg-black/40 dark:bg-white/10 backdrop-blur-md p-3 rounded-full text-white shadow-lg animate-pulse">
              <ChevronRight size={32} />
            </div>
          )}
        </div>
      </div>

      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
        {pages.map((path, idx) => (
          <div
            key={path}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "bg-primary scale-125"
                : "bg-gray-400 dark:bg-gray-600 hover:bg-primary/50"
            }`}
          />
        ))}
      </div>
    </>
  );
}
