/**
 * Sanitizes React-Quill / rich-text HTML for clean dark-mode rendering.
 *
 * Strips:
 *  - All inline style="" attributes (editor colors, fonts, sizes)
 *  - Quill-specific classes (ql-editor, ql-align-center, ql-indent-1, etc.)
 *  - Empty span/div wrappers that only carried inline styles
 *  - Font-family inline declarations
 *  - Background-color inline declarations
 *  - Color inline declarations
 *
 * Preserves:
 *  - Semantic structure (h1-h6, p, ul, ol, li, blockquote, pre, code, table, a, img)
 *  - Non-Quill classes (your own blog-content classes, custom IDs for ToC)
 *  - href, src, alt, colspan, rowspan, target, rel attributes
 *  - Pre/code blocks with language classes
 */

export function sanitizeRichText(html: string): string {
  if (!html) return "";

  let clean = html;

  // Step 1: Remove <style> blocks entirely (Quill sometimes embeds CSS)
  clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Step 2: Remove <script> blocks (safety)
  clean = clean.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  // Step 3: Remove all style="" attributes
  clean = clean.replace(/\s+style\s*=\s*"[^"]*"/gi, "");
  clean = clean.replace(/\s+style\s*=\s*'[^']*'/gi, "");

  // Step 4: Remove Quill-specific classes
  // Matches: ql-editor, ql-syntax, ql-align-center, ql-align-right,
  //          ql-align-justify, ql-indent-1 through ql-indent-9,
  //          ql-direction-rtl, ql-video, ql-formats, etc.
  clean = clean.replace(
    /\s+class\s*=\s*"([^"]*)"/gi,
    (_match, classValue: string) => {
      const kept = classValue
        .split(/\s+/)
        .filter((cls) => {
          // Remove any class starting with "ql-"
          if (cls.startsWith("ql-")) return false;
          // Remove empty strings
          if (!cls.trim()) return false;
          return true;
        })
        .join(" ");

      if (!kept.trim()) return "";
      return ` class="${kept}"`;
    },
  );

  // Step 5: Remove empty spans that had only inline styles
  // Match <span></span> or <span> </span> that are now empty after style removal
  clean = clean.replace(/<span[^>]*>\s*<\/span>/gi, "");

  // Step 6: Unwrap single-child span wrappers that lost their styles
  // <span>some text</span> -> some text (if the span has no attributes left)
  clean = clean.replace(/<span>([^<]+)<\/span>/gi, "$1");

  // Step 7: Remove Quill's weird nested empty divs
  clean = clean.replace(/<div>\s*<\/div>/gi, "");

  // Step 8: Clean up multiple consecutive whitespace/newlines from removals
  clean = clean.replace(/\n{3,}/g, "\n\n");
  clean = clean.replace(/\s{3,}/g, "  ");

  // Step 9: Remove trailing whitespace inside block elements
  clean = clean.replace(/>\s+</g, "><");

  // Step 10: Ensure code blocks have proper structure
  // Quill sometimes wraps code in <pre class="ql-syntax"> which we stripped
  // Make sure <pre> blocks still have their code content
  clean = clean.replace(
    /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    (_match, inner: string) => {
      // If it doesn't contain a <code> tag, wrap the content
      if (!/<code/i.test(inner)) {
        return `<pre><code>${inner.trim()}</code></pre>`;
      }
      return `<pre>${inner}</pre>`;
    },
  );

  return clean;
}

/**
 * Extracts plain text from HTML for excerpts, descriptions, etc.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";
  let text = html;
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<[^>]*>?/gm, "");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]+/g, " ");
  text = text.trim();
  return text;
}