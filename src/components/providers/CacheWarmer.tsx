"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { fetchWithSessionCache } from "@/lib/clientCache";

const PUBLIC_DATASETS: [key: string, url: string][] = [
  ["hero_data", "/api/hero"],
  ["about_data", "/api/about"],
  ["projects_catalog", "/api/projects"],
  ["blog_posts", "/api/blog"],
  ["testimonials", "/api/testimonials"],
];

/**
 * After the first page finishes loading, prefetches the data every other
 * public page needs into the session cache, so later clicks render instantly
 * instead of waiting on the API + database. Runs at idle priority so it never
 * competes with the page the visitor is actually looking at.
 */
export default function CacheWarmer() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (isAdmin) return;

    const warm = () => {
      PUBLIC_DATASETS.forEach(([key, url]) => {
        fetchWithSessionCache(key, url).catch(() => {});
      });
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 1500);
    return () => clearTimeout(id);
    // Only once per page load; the cache persists across client-side navigations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
