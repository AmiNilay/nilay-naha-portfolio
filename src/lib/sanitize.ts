// We removed isomorphic-dompurify to fix Vercel ESM crashes.
// This is now a simple pass-through function to prevent import errors.

export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return "";
  return dirtyHtml;
}
