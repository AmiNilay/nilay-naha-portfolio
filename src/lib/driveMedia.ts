/**
 * Google Drive media helpers. Drive share links ("/file/d/<id>/view",
 * "open?id=", "thumbnail?id=", "uc?id=") become URLs that actually render:
 * lh3.googleusercontent.com for images/GIFs, the /preview embed for video.
 * Never use the deprecated `uc?export=view`.
 */

export type MediaKind = "image" | "gif" | "video" | "youtube" | "unknown";

const isDrive = (url: string) => /(?:drive|docs)\.google\.com|googleusercontent\.com/.test(url);

export function extractDriveId(url?: string | null): string | null {
  if (!url || !isDrive(url)) return null;
  const m =
    url.match(/\/file\/d\/([-\w]{20,})/) ||
    url.match(/[?&]id=([-\w]{20,})/) ||
    url.match(/googleusercontent\.com\/d\/([-\w]{20,})/) ||
    url.match(/([-\w]{25,})/);
  return m ? m[1] : null;
}

export function driveImageUrl(url?: string | null, width = 2000): string {
  const value = url?.trim() || "";
  const id = extractDriveId(value);
  return id ? `https://lh3.googleusercontent.com/d/${id}=w${width}` : value;
}

/** No size suffix, so animated GIFs keep animating. */
export function driveGifUrl(url?: string | null): string {
  const value = url?.trim() || "";
  const id = extractDriveId(value);
  return id ? `https://lh3.googleusercontent.com/d/${id}` : value;
}

export function drivePreviewUrl(url?: string | null): string {
  const value = url?.trim() || "";
  const id = extractDriveId(value);
  return id ? `https://drive.google.com/file/d/${id}/preview` : value;
}

/**
 * Best guess from the URL alone. Drive links carry no extension, so callers
 * can force a kind with a `#gif` / `#video` hint on the URL.
 */
export function mediaKindFromUrl(url?: string | null): MediaKind {
  const value = (url || "").trim().toLowerCase();
  if (!value) return "unknown";
  if (/youtube\.com|youtu\.be/.test(value)) return "youtube";
  if (/#video\b|\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/.test(value)) return "video";
  if (/#gif\b|\.gif(\?|#|$)/.test(value)) return "gif";
  if (/\.(png|jpe?g|webp|avif|svg)(\?|#|$)/.test(value) || isDrive(value) || /^https?:\/\//.test(value)) return "image";
  return "unknown";
}
