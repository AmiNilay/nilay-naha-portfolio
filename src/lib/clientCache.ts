/**
 * In-Memory & Session Client Cache Layer
 * Provides instant ms-speed access to data across page navigations in the same browser tab.
 * When the user closes the tab or opens in a new tab, fresh data is fetched automatically.
 */

const memoryCache = new Map<string, any>();

export async function fetchWithSessionCache<T>(
  cacheKey: string,
  url: string,
  options?: RequestInit
): Promise<T> {
  // 1. Fast in-memory check (0ms access)
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) as T;
  }

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

