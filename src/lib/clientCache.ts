/**
 * In-Memory & Session Client Cache Layer
 * Instant access to public data across page navigations in the same tab.
 * Entries expire after MAX_AGE_MS so CMS edits show up without opening a new
 * tab, while navigation within that window stays network-free.
 */

const MAX_AGE_MS = 60_000;

type Entry = { t: number; d: unknown };

const memoryCache = new Map<string, Entry>();
const inFlight = new Map<string, Promise<any>>();

const fresh = (e: Entry | null | undefined): e is Entry => !!e && Date.now() - e.t < MAX_AGE_MS;

function store(cacheKey: string, data: unknown) {
  const entry = { t: Date.now(), d: data };
  memoryCache.set(cacheKey, entry);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`cache_${cacheKey}`, JSON.stringify(entry));
    } catch {}
  }
}

/**
 * Seed the cache with data the server already rendered, so client components
 * reading the same key resolve without a network request. Browser-only: on the
 * server this module is a process-wide singleton shared across requests.
 */
export function primeCache(cacheKey: string, data: unknown) {
  if (typeof window === "undefined" || data == null) return;
  store(cacheKey, data);
}

export async function fetchWithSessionCache<T>(cacheKey: string, url: string, options?: RequestInit): Promise<T> {
  const mem = memoryCache.get(cacheKey);
  if (fresh(mem)) return mem.d as T;

  // Share one request between components asking for the same key at once.
  if (inFlight.has(cacheKey)) return inFlight.get(cacheKey) as Promise<T>;
  const request = loadIntoCache<T>(cacheKey, url, options).finally(() => inFlight.delete(cacheKey));
  inFlight.set(cacheKey, request);
  return request;
}

async function loadIntoCache<T>(cacheKey: string, url: string, options?: RequestInit): Promise<T> {
  // Tab session storage survives full reloads within the same tab.
  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(sessionStorage.getItem(`cache_${cacheKey}`) || "null");
      if (stored && typeof stored === "object" && "t" in stored && fresh(stored)) {
        memoryCache.set(cacheKey, stored);
        return stored.d as T;
      }
    } catch {}
  }

  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  const data = await res.json();
  store(cacheKey, data);
  return data as T;
}

export function clearMemoryCache(key?: string) {
  if (key) {
    memoryCache.delete(key);
    if (typeof window !== "undefined") sessionStorage.removeItem(`cache_${key}`);
  } else {
    memoryCache.clear();
    if (typeof window !== "undefined") sessionStorage.clear();
  }
}
