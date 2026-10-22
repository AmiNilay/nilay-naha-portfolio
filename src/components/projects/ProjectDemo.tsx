"use client";

import { useRef, useState } from "react";
import { Play, Maximize2, ExternalLink, MonitorPlay } from "lucide-react";
import { drivePreviewUrl, extractDriveId } from "@/lib/driveMedia";

/**
 * Turns a demo URL into an embeddable one. Known hosts get their embed form;
 * any other https URL (e.g. a deployed Vercel app) is embedded as-is.
 */
export function toEmbedUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "youtu.be") {
    const id = host === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v") || url.pathname.split("/").pop();
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "codepen.io") return url.href.replace("/pen/", "/embed/");
  if (host === "codesandbox.io" && url.pathname.startsWith("/s/")) return url.href.replace("/s/", "/embed/");
  if (host === "stackblitz.com" && !url.searchParams.has("embed")) {
    url.searchParams.set("embed", "1");
    return url.href;
  }
  if (host === "huggingface.co" && url.pathname.startsWith("/spaces/")) {
    const [, , owner, space] = url.pathname.split("/");
    return owner && space ? `https://${owner}-${space}.hf.space`.toLowerCase().replace(/_/g, "-") : url.href;
  }
  if (host === "replit.com" && !url.searchParams.has("embed")) {
    url.searchParams.set("embed", "true");
    return url.href;
  }
  if (host.endsWith("drive.google.com") && extractDriveId(url.href)) return drivePreviewUrl(url.href);
  return url.href;
}

/** "Try the live demo": the iframe isn't created until the visitor clicks, so it costs nothing on page load. */
export default function ProjectDemo({ url, title }: { url?: string; title: string }) {
  const [active, setActive] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const embed = url ? toEmbedUrl(url) : null;
  if (!url || !embed) return null;

  return (
    <section className="mt-12" aria-labelledby="project-demo-heading">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 id="project-demo-heading" className="flex items-center gap-2 text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
          <MonitorPlay className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Try the live demo
        </h2>
        <div className="flex items-center gap-2">
          {active && (
            <button
              onClick={() => frameRef.current?.requestFullscreen?.()}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              aria-label="Fullscreen demo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            Open <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900 shadow-xl">
        {active ? (
          <iframe
            ref={frameRef}
            src={embed}
            title={`${title} live demo`}
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            allow="fullscreen; clipboard-write; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation allow-downloads"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            onClick={() => setActive(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950"
            aria-label={`Load the ${title} live demo`}
          >
            <span className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 translate-x-0.5" />
            </span>
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Click to load the interactive demo</span>
            <span className="text-[11px] text-zinc-500">Loads only when you ask, to keep this page fast</span>
          </button>
        )}
      </div>
    </section>
  );
}
