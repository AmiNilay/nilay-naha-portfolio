"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Places where visitors legitimately type, paste or copy: form fields, the chat
// window (answers, emails, links) and anything explicitly opted in.
const INTERACTIVE = 'input, textarea, select, [contenteditable="true"], [role="dialog"], [data-allow-select]';

const isInteractive = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest(INTERACTIVE));

/**
 * Anti-theft guard for public pages: blocks right-click, copy/cut/save/view-source
 * shortcuts, F12, image dragging and text selection. Form fields and the chat
 * dialog stay fully usable. Disabled on /admin and on the résumé pages, which
 * need Ctrl+P / print-to-PDF.
 */
export default function ContentProtection() {
  const pathname = usePathname() || "";
  const enabled = !pathname.startsWith("/admin") && !pathname.startsWith("/resume");

  useEffect(() => {
    if (!enabled) return;

    // 1. Disable Right Click (except in fields, so right-click → Paste works)
    const handleContextMenu = (e: MouseEvent) => {
      if (!isInteractive(e.target)) e.preventDefault();
    };

    // 2. Disable Keyboard Shortcuts (Ctrl+C, Ctrl+U, F12, etc.) outside fields
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      // Ctrl+U (view source), Ctrl+S (save) and F12 are blocked everywhere;
      // copy/cut/print only outside fields and the chat dialog.
      if ((mod && (key === "u" || key === "s")) || e.key === "F12") {
        e.preventDefault();
        return;
      }
      if (mod && (key === "c" || key === "x" || key === "p") && !isInteractive(e.target)) {
        e.preventDefault();
      }
    };

    // 3. Disable Image Dragging (Prevents "Drag to new tab")
    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };

    // 4. Suppress Third-Party Browser Extension Errors (e.g. Urban VPN M_ID crash, injector scripts)
    const handleExtensionErrors = (e: ErrorEvent) => {
      if (
        (e.filename && (e.filename.includes("chrome-extension://") || e.filename.includes("moz-extension://") || e.filename.includes("safari-extension://"))) ||
        (e.message && (e.message.includes("M_ID") || e.message.includes("chrome-extension")))
      ) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return true;
      }
    };

    const handleExtensionRejections = (e: PromiseRejectionEvent) => {
      const stack = String(e.reason?.stack || e.reason || "");
      if (stack.includes("chrome-extension://") || stack.includes("moz-extension://") || stack.includes("M_ID")) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);
    window.addEventListener("error", handleExtensionErrors, true);
    window.addEventListener("unhandledrejection", handleExtensionRejections, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("error", handleExtensionErrors, true);
      window.removeEventListener("unhandledrejection", handleExtensionRejections, true);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <style jsx global>{`
      /* 4. CSS: Disable Text Selection Globally */
      body {
        user-select: none; /* Chrome/Opera/Safari */
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE/Edge */
      }

      /* Allow selection in fields and the chat dialog so they stay usable */
      input,
      textarea,
      select,
      [contenteditable="true"],
      [role="dialog"],
      [role="dialog"] *,
      [data-allow-select],
      [data-allow-select] * {
        user-select: text;
        -webkit-user-select: text;
      }

      /* 5. CSS: prevent dragging images (clicks still reach wrapping links) */
      img {
        -webkit-user-drag: none;
      }
    `}</style>
  );
}
