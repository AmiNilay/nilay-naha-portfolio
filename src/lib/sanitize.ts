import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return "";
  
  // This strips out <script>, <style>, onloads, and other malicious injection vectors
  // while keeping safe tags like <p>, <b>, <img>, <a>, etc.
  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}
