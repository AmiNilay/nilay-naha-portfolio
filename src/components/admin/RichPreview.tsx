"use client";

import { useEffect, useState } from "react";

/** Live preview of long-form content, rendered server-side exactly as the public page renders it. */
export default function RichPreview({ content, empty, className = "" }: { content: string; empty: string; className?: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!content?.trim()) {
      setHtml("");
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      fetch("/api/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((d) => setHtml(d.html ?? content))
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [content]);

  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html || `<p class='text-zinc-400 italic'>${empty}</p>` }}
    />
  );
}

/** One-line syntax reminder shown under content editors. */
export function ContentSyntaxHint() {
  return (
    <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
      Markdown or HTML/CSS. Media from Google Drive (share: &ldquo;Anyone with the link&rdquo;) on its own line:{" "}
      <code>::image[Caption](link)</code> · <code>::gif[Caption](link)</code> · <code>::video[Caption](link)</code>{" "}
      — or paste a bare Drive / YouTube link. Classes: <code>callout tip</code>, <code>card</code>, <code>grid-2</code>,{" "}
      <code>stat</code>, <code>badge</code>, <code>gradient-text</code>, <code>timeline</code>. Full guide: AI_CONTENT_PROMPT.md
    </p>
  );
}
