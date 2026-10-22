"use client";
import { driveImageUrl } from "@/lib/driveMedia";

import { useState } from "react";

/** Converts Google Drive share links to direct thumbnail URLs; leaves other URLs untouched. */
export function resolveLogoUrl(url?: string) {
  const value = url?.trim();
  if (!value) return "";
  return driveImageUrl(value, 600);
}

const SIZES = {
  sm: { box: "h-10 p-1.5 rounded-xl text-xs", square: "w-10", wide: "w-20" },
  md: { box: "h-14 p-2 rounded-2xl text-sm", square: "w-14", wide: "w-28" },
} as const;

/**
 * Fixed-size tile with object-contain, so logos of any aspect ratio (wide
 * wordmarks, square icons, tall marks) are fully visible — never cropped or
 * stretched. White backing keeps dark logos readable in dark mode.
 */
export default function CompanyLogo({
  src,
  company,
  size = "md",
}: {
  src?: string;
  company: string;
  size?: keyof typeof SIZES;
}) {
  const [failed, setFailed] = useState(false);
  // Wordmarks (wider than ~1.6:1) get a wider tile so they stay legible.
  const [isWide, setIsWide] = useState(false);
  const url = resolveLogoUrl(src);
  const sizing = SIZES[size];
  const initials = company
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div
      className={`${sizing.box} ${isWide && url && !failed ? sizing.wide : sizing.square} shrink-0 flex transition-[width] duration-200 items-center justify-center bg-white border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden`}
    >
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin-provided URLs can be any host
        <img
          src={url}
          alt={`${company} logo`}
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            setIsWide(h > 0 && w / h > 1.6);
          }}
          className="max-w-full max-h-full w-auto h-auto object-contain"
        />
      ) : (
        <span className="font-black text-zinc-500">{initials || "•"}</span>
      )}
    </div>
  );
}
