"use client";

import { driveGifUrl, driveImageUrl, drivePreviewUrl, extractDriveId, mediaKindFromUrl } from "@/lib/driveMedia";

/**
 * Fills its (relatively positioned) parent with an image, animated GIF or
 * video from a direct URL or a Google Drive link. Drive videos need a `#video`
 * hint (Drive links carry no extension) and render through the /preview embed.
 * Legacy `<iframe>` embed strings stored by older admin versions still render.
 */
export default function MediaFrame({
  src,
  alt,
  className = "",
  width = 1200,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  onError?: () => void;
}) {
  const value = src.trim();
  const protect = { onContextMenu: (e: React.MouseEvent) => e.preventDefault(), draggable: false };

  if (value.includes("<iframe")) {
    return (
      <div
        className={`absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full pointer-events-none ${className}`}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  const kind = mediaKindFromUrl(value);
  if (kind === "video" || kind === "youtube") {
    if (extractDriveId(value) || kind === "youtube") {
      const embed =
        kind === "youtube"
          ? `https://www.youtube.com/embed/${value.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/)?.[1] || ""}?autoplay=1&mute=1&loop=1&controls=0`
          : drivePreviewUrl(value);
      return (
        <iframe
          src={embed}
          title={alt}
          allow="autoplay; encrypted-media"
          className={`absolute inset-0 w-full h-full border-0 pointer-events-none scale-[1.35] ${className}`}
        />
      );
    }
    return (
      <video
        src={value.replace(/#video\b/, "")}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
        onError={onError}
        {...protect}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={kind === "gif" ? driveGifUrl(value.replace(/#gif\b/, "")) : driveImageUrl(value, width)}
      alt={alt}
      loading="lazy"
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      onError={onError}
      {...protect}
    />
  );
}
