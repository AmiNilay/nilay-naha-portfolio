"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useIdleReady } from "@/lib/useIdleReady";

const GhostCursor = dynamic(() => import("./GhostCursor").then((m) => m.GhostCursor), {
  ssr: false,
});

/**
 * Theme-aware wrapper around GhostCursor.
 *
 * Bloom (UnrealBloomPass) is never enabled here, in either theme. It has
 * caused two separate full-screen breakages already: forcing the canvas's
 * alpha to 1 across the whole viewport (see GhostCursor.tsx), and on at
 * least one real GPU it washed/brightened the entire page badly enough to
 * make text unreadable in dark mode (not reproducible in a software-rendered
 * headless browser, which is how the first version of this fix slipped
 * through). Rather than keep re-tuning an unreliable pass, it's removed
 * outright: the shader's own color + alpha, with no post-processing, is
 * what's proven stable across environments.
 *
 * "screen" blend mode is a mathematical no-op against a pure white
 * background (screen(x, 1) = 1 for any x), so it can never be made visible
 * in light mode. Light mode uses "multiply" instead.
 *
 * Rendered at z-index -1: body is not a stacking context, so the canvas
 * paints above the page background but beneath all text, images and cards.
 *
 * Deliberately does NOT gate on `prefers-reduced-motion`: this is an
 * explicitly requested background effect, and many Windows setups report
 * reduced-motion simply because "Show animations" is off system-wide, which
 * would silently hide the whole effect with no way to tell why.
 *
 * Performance: three.js is only loaded once the page is idle, and never on
 * touch-only devices (there is no cursor to trail).
 */
export default function CursorTrail() {
  const { resolvedTheme } = useTheme();
  const [hasCursor, setHasCursor] = useState(false);
  const idle = useIdleReady();

  useEffect(() => {
    setHasCursor(window.matchMedia("(pointer: fine)").matches);
  }, []);

  if (!hasCursor || !idle) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <GhostCursor
      color={isDark ? "#B19EEF" : "#4C1D95"}
      brightness={isDark ? 1.4 : 1.2}
      mixBlendMode={isDark ? "screen" : "multiply"}
      trailLength={24}
      inertia={0.45}
      bloomStrength={0}
      glowSize={0.35}
      grainIntensity={0.04}
      edgeIntensity={0}
      fadeDelayMs={250}
      fadeDurationMs={1200}
      zIndex={-1}
    />
  );
}
