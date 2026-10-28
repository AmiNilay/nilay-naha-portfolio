"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import MascotFallback from "./MascotFallback";
import { useIdleReady } from "@/lib/useIdleReady";
import {
  isExpression,
  MASCOT_GLB_URL,
  MASCOT_LABEL,
  type MascotAnimation,
  type MascotExpression,
  type MascotTheme,
} from "./mascotConfig";

export type { AvatarEmotion, MascotExpression } from "./mascotConfig";

const MascotScene = dynamic(() => import("./MascotScene"), { ssr: false });

// One HEAD probe per page load: is the real 3D model deployed?
let glbProbe: Promise<boolean> | null = null;
function hasGlb() {
  if (!glbProbe) {
    glbProbe = fetch(MASCOT_GLB_URL, { method: "HEAD" })
      .then((r) => r.ok)
      .catch(() => false);
  }
  return glbProbe;
}

let webglOk: boolean | null = null;
function supportsWebGL() {
  if (webglOk === null) {
    try {
      const c = document.createElement("canvas");
      webglOk = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglOk = false;
    }
  }
  return webglOk;
}

/** Warm up: probe for the GLB and prefetch the 3D chunk if it exists. */
export function preloadMascot() {
  hasGlb().then((ok) => {
    if (ok && supportsWebGL()) import("./MascotScene");
  });
}

/**
 * The chatbot mascot. Renders the real GLB model (public/models/chatbot-mascot.glb)
 * when it is deployed and WebGL is available; otherwise — and while it loads —
 * shows the 2D renders from the reference sheet. See MASCOT_PIPELINE.md.
 */
export default function ChatbotMascot({
  theme = "auto",
  expression = "neutral",
  animation = "idle",
  size,
  icon = false,
  className = "",
}: {
  theme?: MascotTheme;
  expression?: MascotExpression;
  animation?: MascotAnimation;
  size: number;
  /** Use the theme-specific app-icon render when the expression is neutral (launcher). */
  icon?: boolean;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const [use3D, setUse3D] = useState(false);
  const [ready3D, setReady3D] = useState(false);

  const safeSize = Number.isFinite(size) && size > 0 ? Math.min(Math.round(size), 512) : 48;
  const safeExpr: MascotExpression = isExpression(expression) ? expression : "neutral";
  const mode: "light" | "dark" = theme === "auto" ? (resolvedTheme === "dark" ? "dark" : "light") : theme === "dark" ? "dark" : "light";
  const animate = animation === "idle" && !reduceMotion;
  // The 2D render shows first; the 3D model (three.js + GLB) loads only once the page is idle.
  const idle = useIdleReady();

  // Each 3D mascot owns a WebGL context and mobile browsers kill the oldest beyond a
  // small limit (showing a broken-image icon), so tiny static avatars stay 2D.
  const want3D = safeSize >= 40 && animation !== "none";

  useEffect(() => {
    if (!idle || !want3D) return;
    let alive = true;
    hasGlb().then((ok) => alive && ok && supportsWebGL() && setUse3D(true));
    return () => {
      alive = false;
    };
  }, [idle, want3D]);

  return (
    <div
      role="img"
      aria-label={MASCOT_LABEL}
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: safeSize, height: safeSize }}
    >
      {!ready3D && <MascotFallback expression={safeExpr} size={safeSize} theme={mode} icon={icon} animate={animate} />}
      {use3D && (
        <div className="absolute inset-0" style={{ opacity: ready3D ? 1 : 0, transition: "opacity 300ms" }}>
          <MascotScene
            expression={safeExpr}
            size={safeSize}
            theme={mode}
            animate={animate}
            onReady={() => setReady3D(true)}
            onError={() => {
              setUse3D(false);
              setReady3D(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
