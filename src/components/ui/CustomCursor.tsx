"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // 1. Track Mouse Movement
  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    // 2. Check if hovering over clickable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Main Cursor (Small Dot) */}
      <div
        className="fixed top-0 left-0 w-3 h-3 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-0"
        // eslint-disable-next-line
        style={{
          transform: `translate3d(${position.x - 6}px, ${position.y - 6}px, 0) scale(${
            isHovering ? 1.5 : 1
          })`,
        }}
      />

      {/* Trailing Ring (Larger Circle) */}
      <div
        className="fixed top-0 left-0 w-8 h-8 border border-primary rounded-full pointer-events-none z-[9998] transition-transform duration-100 ease-out"
        // eslint-disable-next-line
        style={{
          transform: `translate3d(${position.x - 16}px, ${position.y - 16}px, 0) scale(${
            isHovering ? 1.5 : 1
          })`,
          opacity: isHovering ? 0.5 : 1,
        }}
      />
    </>
  );
}