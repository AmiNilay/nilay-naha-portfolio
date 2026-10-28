"use client";

import { useEffect, useState } from "react";

let idle = false;
let idlePromise: Promise<void> | null = null;

/** Resolves once the page has loaded and the browser is idle (shared across callers). */
function whenIdle() {
  if (!idlePromise) {
    idlePromise = new Promise<void>((resolve) => {
      const schedule = () => {
        if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 3000 });
        else setTimeout(resolve, 1500);
      };
      if (document.readyState === "complete") schedule();
      else window.addEventListener("load", schedule, { once: true });
    }).then(() => {
      idle = true;
    });
  }
  return idlePromise;
}

/**
 * false until the page has finished loading and the main thread is idle.
 * Gate heavy, non-essential work (three.js / WebGL effects) behind it so it
 * never competes with the content the visitor came for.
 */
export function useIdleReady() {
  const [ready, setReady] = useState(idle);
  useEffect(() => {
    if (ready) return;
    let alive = true;
    whenIdle().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [ready]);
  return ready;
}
