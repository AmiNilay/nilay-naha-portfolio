"use client";

import { useEffect } from "react";

export default function ContentProtection() {
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable Keyboard Shortcuts (Ctrl+C, Ctrl+U, F12, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C (Copy), Ctrl+X (Cut), Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print)
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "C" || e.key === "x" || e.key === "u" || e.key === "s" || e.key === "p")) ||
        e.key === "F12" // Block Developer Tools (F12)
      ) {
        e.preventDefault();
      }
    };

    // 3. Disable Image Dragging (Prevents "Drag to new tab")
    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  return (
    <style jsx global>{`
      /* 4. CSS: Disable Text Selection Globally */
      body {
        user-select: none; /* Chrome/Opera/Safari */
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE/Edge */
      }

      /* Allow selection inside Inputs/Textareas so contact form works */
      input, textarea {
        user-select: text;
        -webkit-user-select: text;
      }

      /* 5. CSS: prevent clicking/dragging images specifically */
      img {
        pointer-events: none; /* Makes image 'invisible' to clicks/drags */
        -webkit-user-drag: none;
      }
    `}</style>
  );
}