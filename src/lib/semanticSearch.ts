/**
 * On-device semantic search for the Command Palette.
 * Transformers.js and the MiniLM model are fetched from a CDN only when the
 * visitor turns "Smart search" on, so they never touch the initial bundle.
 * Runs entirely in the browser: no API, no key, no cost.
 */

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/+esm";
const MODEL = "Xenova/all-MiniLM-L6-v2";

export interface SearchItem {
  id: string;
  title: string;
  text: string;
  url: string;
  kind: "page" | "project" | "post";
}

type Extractor = (text: string | string[], opts: Record<string, unknown>) => Promise<{ tolist: () => number[][] }>;

let extractorPromise: Promise<Extractor> | null = null;
const vectors = new Map<string, number[]>(); // item id + text → embedding (per page load)

/** Loads the model once; `onProgress` receives 0–100 while weights download. */
export function loadModel(onProgress?: (pct: number) => void): Promise<Extractor> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const lib: any = await import(/* webpackIgnore: true */ TRANSFORMERS_URL as string);
      return lib.pipeline("feature-extraction", MODEL, {
        dtype: "q8",
        progress_callback: (p: any) => {
          if (p?.status === "progress" && typeof p.progress === "number") onProgress?.(Math.round(p.progress));
        },
      });
    })().catch((err) => {
      extractorPromise = null; // allow a retry
      throw err;
    });
  }
  return extractorPromise;
}

const cosine = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0); // vectors are normalized

async function embed(extractor: Extractor, texts: string[]) {
  const out = await extractor(texts, { pooling: "mean", normalize: true });
  return out.tolist();
}

/** Ranks items by meaning, not keywords. Item embeddings are computed once and reused. */
export async function semanticRank(query: string, items: SearchItem[], limit = 8) {
  const extractor = await loadModel();
  const key = (i: SearchItem) => `${i.id}:${i.text.length}`;
  const missing = items.filter((i) => !vectors.has(key(i)));
  if (missing.length) {
    const embs = await embed(extractor, missing.map((i) => `${i.title}. ${i.text}`.slice(0, 1000)));
    missing.forEach((item, idx) => vectors.set(key(item), embs[idx]));
  }
  const [q] = await embed(extractor, [query]);
  return items
    .map((item) => ({ item, score: cosine(q, vectors.get(key(item))!) }))
    .filter((r) => r.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
