"use client";

import { useEffect } from "react";

const GUARD_KEY = "chunk_reload_at";
const GUARD_MS = 30_000;

const isChunkError = (value: unknown) => {
  const e = value as { name?: string; message?: string } | null;
  return e?.name === "ChunkLoadError" || /Loading (CSS )?chunk [\w-]+ failed/i.test(e?.message || "");
};

/**
 * After a new deploy, a tab (or the PWA cache) can still hold HTML from the
 * previous build whose JS chunks no longer exist, which throws ChunkLoadError.
 * Reload once to pick up the current build; the timestamp guard prevents loops
 * if the chunk is genuinely missing.
 */
export default function ChunkErrorReload() {
  useEffect(() => {
    const reload = (err: unknown) => {
      if (!isChunkError(err)) return;
      try {
        const last = Number(sessionStorage.getItem(GUARD_KEY) || 0);
        if (Date.now() - last < GUARD_MS) return;
        sessionStorage.setItem(GUARD_KEY, String(Date.now()));
      } catch {
        return; // Storage blocked: no loop guard, so don't risk a reload loop.
      }
      window.location.reload();
    };
    const onError = (e: ErrorEvent) => reload(e.error ?? { message: e.message });
    const onRejection = (e: PromiseRejectionEvent) => reload(e.reason);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
