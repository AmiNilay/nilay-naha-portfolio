import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

// Slugify helper
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

export async function processContent(content: string): Promise<string> {
  const isHTML = /<\/?[a-z][\s\S]*>/i.test(content);

  let result: string;

  if (isHTML) {
    const processed = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeKatex)
      .use(rehypeHighlight, { detect: true, ignoreMissing: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(content);
    result = String(processed);
  } else {
    const processed = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeKatex)
      .use(rehypeHighlight, { detect: true, ignoreMissing: true })
      .use(rehypeStringify)
      .process(content);
    result = String(processed);
  }

  // Add IDs to all headings BEFORE injecting into DOM
  return addHeadingIds(result);
}