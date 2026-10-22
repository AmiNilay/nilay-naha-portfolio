import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { visit, SKIP } from "unist-util-visit";
import { driveGifUrl, driveImageUrl, drivePreviewUrl, extractDriveId, mediaKindFromUrl } from "@/lib/driveMedia";

/**
 * Long-form content pipeline (blog posts, project descriptions & case studies,
 * About bio, /ai page). Accepts Markdown, raw HTML, or both mixed:
 *
 *  1. Media lines → HTML figures (see expandMediaLines): `::image[Caption](url)`,
 *     `::gif[…](…)`, `::video[…](…)`, `::embed[…](…)`, or a bare Drive /
 *     YouTube / media URL alone on a line.
 *  2. Markdown → HTML with KaTeX + syntax highlighting (raw HTML kept).
 *  3. Sanitize + enhance the tree: drop scripts/handlers/forms, whitelist
 *     iframe hosts, clean inline styles, scope <style> blocks to
 *     `.rich-content`, rewrite Google Drive image/video links, lazy-load media.
 *  4. Slug IDs on headings for the sticky table of contents.
 *
 * Styling for the ready-made content classes (.callout, .card, .grid-2, …)
 * lives in globals.css under "Rich content". Documented for authors in
 * AI_CONTENT_PROMPT.md.
 */

// ── Slug IDs ─────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Post-processor to add IDs to headings
function addHeadingIds(html: string): string {
  const usedIds = new Set<string>();
  return html.replace(
    /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, content) => {
      // Skip if already has an id
      if (/\sid=["']/i.test(attrs)) return match;

      // Extract plain text from content (strip inner tags)
      const plainText = content.replace(/<[^>]+>/g, "").trim();
      if (!plainText) return match;

      let id = slugify(plainText);
      if (!id) return match;

      // Ensure unique
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      usedIds.add(uniqueId);

      return `<${tag}${attrs} id="${uniqueId}">${content}</${tag}>`;
    }
  );
}

// ── Media embeds ─────────────────────────────────────────────────────────────
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function youtubeEmbed(url: string): string | null {
  const id = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1];
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

const frame = (src: string, caption: string) =>
  `<div class="media-embed"><iframe src="${esc(src)}" title="${esc(caption || "Embedded media")}" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;

/** One media item → a self-contained <figure> HTML block. */
export function mediaFigure(kind: string, url: string, caption = ""): string {
  const cap = caption ? `<figcaption>${esc(caption)}</figcaption>` : "";
  const isDrive = !!extractDriveId(url);
  const yt = youtubeEmbed(url);
  let body: string;
  let variant = kind;

  if (kind === "embed" || kind === "video" || yt) {
    if (yt) {
      body = frame(yt, caption);
      variant = "video";
    } else if (isDrive) {
      body = frame(drivePreviewUrl(url), caption);
    } else if (/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(url)) {
      body = `<video src="${esc(url)}" controls playsinline preload="metadata"></video>`;
    } else {
      body = frame(url, caption);
    }
  } else {
    const src = kind === "gif" ? driveGifUrl(url) : driveImageUrl(url);
    body = `<img src="${esc(src)}" alt="${esc(caption)}" loading="lazy" decoding="async" />`;
  }
  return `<figure class="media-frame media-${variant}">${body}${cap}</figure>`;
}

const DIRECTIVE = /^\s*::(image|gif|video|embed)\[([^\]]*)\]\(\s*(\S+?)\s*\)\s*$/i;
const BARE_URL = /^\s*<?(https?:\/\/\S+?)>?\s*$/;

/**
 * Expands media lines (outside fenced code) into HTML blocks surrounded by
 * blank lines, so Markdown treats them as raw HTML.
 */
function expandMediaLines(source: string): string {
  let inFence = false;
  return source
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      if (inFence) return line;

      const d = line.match(DIRECTIVE);
      if (d) return `\n${mediaFigure(d[1].toLowerCase(), d[3], d[2])}\n`;

      const bare = line.match(BARE_URL);
      if (bare) {
        const url = bare[1];
        if (youtubeEmbed(url)) return `\n${mediaFigure("video", url)}\n`;
        if (extractDriveId(url)) {
          const kind = mediaKindFromUrl(url);
          return `\n${mediaFigure(kind === "gif" ? "gif" : kind === "image" && /#image\b/.test(url) ? "image" : "embed", url)}\n`;
        }
        const kind = mediaKindFromUrl(url);
        if (/\.(png|jpe?g|webp|avif|gif|svg|mp4|webm|mov|m4v)(\?|#|$)/i.test(url)) {
          return `\n${mediaFigure(kind === "video" ? "video" : kind === "gif" ? "gif" : "image", url)}\n`;
        }
      }
      return line;
    })
    .join("\n");
}

// ── Sanitize & enhance ───────────────────────────────────────────────────────
const DROP_TAGS = new Set([
  "script", "noscript", "object", "embed", "applet", "form", "input", "button", "textarea",
  "select", "option", "base", "meta", "link", "frame", "frameset", "portal",
]);

const IFRAME_HOSTS =
  /^https:\/\/(drive\.google\.com\/file\/d\/[-\w]+\/preview|docs\.google\.com\/|www\.youtube(-nocookie)?\.com\/embed\/|youtube(-nocookie)?\.com\/embed\/|player\.vimeo\.com\/video\/|codepen\.io\/|codesandbox\.io\/embed\/|stackblitz\.com\/)/i;

const BAD_URL = /^\s*(javascript|vbscript|data:(?!image\/(png|jpe?g|gif|webp|avif|svg\+xml)))/i;

function cleanStyle(style: string): string {
  return style
    .split(";")
    .filter((decl) => {
      const d = decl.toLowerCase();
      if (/expression\s*\(|javascript:|vbscript:|behavior\s*:|-moz-binding|@import/.test(d)) return false;
      if (/url\s*\(\s*['"]?\s*(javascript|vbscript)/.test(d)) return false;
      if (/position\s*:\s*fixed/.test(d)) return false;
      return d.trim().length > 0;
    })
    .join(";");
}

/** Prefix every selector in a <style> block with `.rich-content` so AI-written CSS can't restyle the site. */
export function scopeCss(css: string, scope = ".rich-content"): string {
  const cleaned = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@import[^;]*;/gi, "")
    .replace(/expression\s*\(|javascript:|behavior\s*:|-moz-binding/gi, "")
    .replace(/position\s*:\s*fixed/gi, "position:absolute");

  let out = "";
  let i = 0;
  const scopeSelectors = (sel: string) =>
    sel
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        if (/^(html|body|:root)$/i.test(s)) return scope;
        const rest = s.replace(/^(html|body|:root)\b\s*/i, "");
        return rest.startsWith(scope) ? rest : `${scope} ${rest}`;
      })
      .join(", ");

  while (i < cleaned.length) {
    const open = cleaned.indexOf("{", i);
    if (open === -1) break;
    const head = cleaned.slice(i, open).trim();
    // Find matching close brace.
    let depth = 1;
    let j = open + 1;
    while (j < cleaned.length && depth > 0) {
      if (cleaned[j] === "{") depth++;
      else if (cleaned[j] === "}") depth--;
      j++;
    }
    const body = cleaned.slice(open + 1, j - 1);
    if (/^@(media|supports|container|layer)/i.test(head)) {
      out += `${head}{${scopeCss(body, scope)}}`;
    } else if (/^@(keyframes|-webkit-keyframes|font-face|property|page)/i.test(head)) {
      out += `${head}{${body}}`;
    } else if (head) {
      out += `${scopeSelectors(head)}{${body}}`;
    }
    i = j;
  }
  return out;
}

const textOf = (node: any): string =>
  node.type === "text" ? node.value : (node.children || []).map(textOf).join("");

function rehypeRichContent() {
  return (tree: any) => {
    visit(tree, (node: any, index: number | undefined, parent: any) => {
      if (node.type === "comment" && parent && index !== undefined) {
        parent.children.splice(index, 1);
        return [SKIP, index];
      }
      if (node.type !== "element") return;
      const tag = node.tagName.toLowerCase();
      const props = node.properties || (node.properties = {});

      if (DROP_TAGS.has(tag) && parent && index !== undefined) {
        parent.children.splice(index, 1);
        return [SKIP, index];
      }

      // Event handlers, srcdoc, form actions.
      for (const key of Object.keys(props)) {
        const k = key.toLowerCase();
        if (k.startsWith("on") || k === "srcdoc" || k === "formaction" || k === "action") delete props[key];
      }
      for (const key of ["href", "src", "poster", "xLinkHref"]) {
        if (typeof props[key] === "string" && BAD_URL.test(props[key])) delete props[key];
      }
      if (typeof props.style === "string") props.style = cleanStyle(props.style);

      if (tag === "style") {
        node.children = [{ type: "text", value: scopeCss(textOf(node)) }];
        return SKIP;
      }

      if (tag === "img" && typeof props.src === "string") {
        const isGif = /gif/i.test(`${props.alt || ""} ${props.title || ""}`) || mediaKindFromUrl(props.src) === "gif";
        // Only raw Drive share links; already-converted googleusercontent URLs keep their (gif) form.
        if (/(drive|docs)\.google\.com/.test(props.src) && extractDriveId(props.src)) {
          props.src = isGif ? driveGifUrl(props.src) : driveImageUrl(props.src);
        }
        props.loading = props.loading || "lazy";
        props.decoding = "async";
      }

      if (tag === "video" && typeof props.src === "string" && extractDriveId(props.src)) {
        // Drive can't stream into <video>; use its player instead.
        node.tagName = "iframe";
        node.properties = {
          src: drivePreviewUrl(props.src),
          loading: "lazy",
          allow: "autoplay; fullscreen",
          allowFullScreen: true,
          className: ["media-iframe"],
        };
        node.children = [];
      } else if (tag === "video") {
        props.preload = props.preload || "metadata";
        props.playsInline = true;
      }

      if (tag === "source" && typeof props.src === "string" && extractDriveId(props.src)) {
        props.src = drivePreviewUrl(props.src);
      }

      if (node.tagName === "iframe") {
        let src = typeof node.properties.src === "string" ? node.properties.src : "";
        if (extractDriveId(src)) src = node.properties.src = drivePreviewUrl(src);
        const yt = youtubeEmbed(src);
        if (yt && !/\/embed\//.test(src)) src = node.properties.src = yt;
        if (!IFRAME_HOSTS.test(src) && parent && index !== undefined) {
          parent.children.splice(index, 1);
          return [SKIP, index];
        }
        node.properties.loading = "lazy";
      }

      if (tag === "a" && typeof props.href === "string" && /^https?:\/\//.test(props.href)) {
        props.target = props.target || "_blank";
        props.rel = ["noopener", "noreferrer"];
      }
    });
  };
}

// ── Public API ───────────────────────────────────────────────────────────────
const LEADING_HTML = /^\s*<(style|div|section|article|h[1-6]|p|table|figure|header|main)\b/i;

/** Markdown and/or HTML → sanitized, enhanced HTML (server-side only). */
export async function processContent(content: string): Promise<string> {
  if (!content || !content.trim()) return "";
  const source = expandMediaLines(content);

  let result: string;
  if (LEADING_HTML.test(content)) {
    // Authored as HTML (rich editor or AI): don't run Markdown over it, which
    // would turn indented HTML into code blocks.
    const tree = fromHtml(source, { fragment: true });
    rehypeRichContent()(tree);
    result = toHtml(tree as any, { allowDangerousHtml: true });
  } else {
    const processed = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeKatex)
      .use(rehypeHighlight, { detect: true, ignoreMissing: true })
      .use(rehypeRichContent)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(source);
    result = String(processed);
  }

  // Add IDs to all headings BEFORE injecting into DOM
  return addHeadingIds(result);
}
