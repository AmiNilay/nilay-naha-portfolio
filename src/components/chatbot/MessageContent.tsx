"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";

/** Renders **bold** spans inside a line of text. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-zinc-900 dark:text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

/**
 * Minimal, safe markdown for assistant replies: paragraphs, "•"/"-" bullet
 * lists, and **bold**. Built from React nodes — never dangerouslySetInnerHTML.
 */
function render(text: string) {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, bi) => {
    const lines = block.split("\n").filter((l) => l.trim());
    const isList = lines.length > 0 && lines.every((l) => /^\s*[•\-*]\s+/.test(l));
    if (isList) {
      return (
        <ul key={bi} className="space-y-1.5 my-1">
          {lines.map((l, li) => (
            <li key={li} className="flex gap-2">
              <span className="mt-[0.55em] w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" aria-hidden />
              <span>{inline(l.replace(/^\s*[•\-*]\s+/, ""))}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={bi} className="whitespace-pre-line">
        {inline(block)}
      </p>
    );
  });
}

/**
 * Assistant message body. When `animate`, reveals the text progressively
 * (word by word, ~25s of reading compressed into well under 2s) like a
 * streaming AI response.
 */
export default function MessageContent({
  text,
  animate = false,
  onProgress,
  onDone,
}: {
  text: string;
  animate?: boolean;
  onProgress?: () => void;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) {
      setShown(text.length);
      return;
    }
    const step = Math.max(2, Math.ceil(text.length / 70));
    let i = 0;
    const id = setInterval(() => {
      // Advance to the end of the next word so words never appear cut in half.
      i = Math.min(text.length, i + step);
      while (i < text.length && !/\s/.test(text[i])) i++;
      setShown(i);
      onProgress?.();
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, 22);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animate]);

  const visible = text.slice(0, shown);
  // Close an unbalanced ** while typing so bold doesn't flicker as raw asterisks.
  const balanced = (visible.match(/\*\*/g) || []).length % 2 ? `${visible}**` : visible;

  return (
    <div className="space-y-2.5 text-[14px] leading-relaxed">
      {render(balanced)}
      {shown < text.length && <span className="inline-block w-1.5 h-4 align-middle bg-cyan-500 animate-pulse rounded-sm" />}
    </div>
  );
}
