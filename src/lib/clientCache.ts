/**
 * In-Memory & Session Client Cache Layer
 * Provides instant ms-speed access to data across page navigations in the same browser tab.
 * When the user closes the tab or opens in a new tab, fresh data is fetched automatically.
 */

const memoryCache = new Map<string, any>();
const inFlight = new Map<string, Promise<any>>();

/**
 * Seed the cache with data the server already rendered, so client components
 * reading the same key resolve without a network request. Browser-only: on the
 * server this module is a process-wide singleton shared across requests.
 */
export function primeCache(cacheKey: string, data: unknown) {
  if (typeof window === "undefined" || data == null) return;
  memoryCache.set(cacheKey, data);
  try {
    sessionStorage.setItem(`cache_${cacheKey}`, JSON.stringify(data));
  } catch {}
}

export async function fetchWithSessionCache<T>(
  cacheKey: string,
  url: string,
  options?: RequestInit
): Promise<T> {
  // 1. Fast in-memory check (0ms access)
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) as T;
  }

  // Share one request between components asking for the same key at once.
  if (inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey) as Promise<T>;
  }
  const request = loadIntoCache<T>(cacheKey, url, options).finally(() => inFlight.delete(cacheKey));
  inFlight.set(cacheKey, request);
  return request;
}

async function loadIntoCache<T>(cacheKey: string, url: string, options?: RequestInit): Promise<T> {
  // 2. Tab session storage check (survives client-side route transitions & back navigation)
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`cache_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryCache.set(cacheKey, parsed);
        return parsed as T;
      }
    } catch {}
  }

  // 3. Network fetch
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  const data = await res.json();

  // Save to memory cache and sessionStorage
  memoryCache.set(cacheKey, data);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`cache_${cacheKey}`, JSON.stringify(data));
    } catch {}
  }

  return data as T;
}

export function clearMemoryCache(key?: string) {
  if (key) {
    memoryCache.delete(key);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`cache_${key}`);
    }
  } else {
    memoryCache.clear();
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
  }
}

