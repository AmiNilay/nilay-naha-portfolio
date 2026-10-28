import { unstable_cache } from "next/cache";

/** Tag on every cached public dataset; purged by revalidatePublicPages(). */
export const PUBLIC_DATA_TAG = "public-data";

/**
 * Caches a public (visitor-facing, draft-free) database read in the Next.js
 * data cache, so API calls are served without a MongoDB round trip. Results
 * are JSON-cloned (must be serializable). CMS writes purge the tag, so edits
 * show up immediately; `revalidate` is only a safety net.
 * Never wrap admin / draft-including reads with this.
 */
export function cachedPublic<T>(key: string, fn: () => Promise<T>) {
  return unstable_cache(async () => JSON.parse(JSON.stringify(await fn())) as T, ["public", key], {
    tags: [PUBLIC_DATA_TAG],
    revalidate: 300,
  });
}
