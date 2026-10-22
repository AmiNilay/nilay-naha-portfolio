"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import HumanAvatar, { type AvatarEmotion } from "./HumanAvatar";
import { useAvatarSnapshot } from "./avatarSnapshot";

// three.js + the 3D character load in their own chunk, only once the page is idle.
const Avatar3D = dynamic(() => import("./Avatar3D"), { ssr: false });

let idleGate: Promise<void> | null = null;
function whenIdle() {
  if (!idleGate) {
    idleGate = new Promise((resolve) => {
      const ric = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined;
      if (ric) ric(() => resolve(), { timeout: 3000 });
      else setTimeout(resolve, 1500);
    });
  }
  return idleGate;
}

/** Skip the idle wait (e.g. the visitor opened the chat) and start loading the 3D chunk now. */
export function preload3DAvatar() {
  idleGate = Promise.resolve();
  import("./Avatar3D").catch(() => {});
}

let webglSupport: boolean | null = null;
function hasWebGL() {
  if (webglSupport === null) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

/**
 * Assistant avatar: a real-time 3D character (see Avatar3D) with the SVG
 * HumanAvatar as instant placeholder until the 3D chunk is ready, and as the
 * permanent fallback when WebGL is unavailable. Reduced motion keeps the 3D
 * model but damps its idle motion (many Windows setups report reduced motion
 * just because system animations are off).
 */
export default function Avatar({
  emotion = "neutral",
  size = 56,
  track = true,
  className = "",
}: {
  emotion?: AvatarEmotion;
  size?: number;
  track?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasWebGL()) return;
    let alive = true;
    whenIdle().then(() => alive && setLoad(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <span className={`relative inline-block align-middle ${className}`} style={{ width: size, height: size }}>
      {!ready && <HumanAvatar emotion={emotion} size={size} track={track} />}
      {load && (
        <Avatar3D
          emotion={emotion}
          size={size}
          track={track}
          reduceMotion={Boolean(reduceMotion)}
          onReady={() => setReady(true)}
          className={ready ? "block" : "absolute inset-0 opacity-0"}
        />
      )}
    </span>
  );
}

/** Small static avatar for message rows: a still of the 3D model, or the SVG until it exists. */
export function AvatarMark({ size = 24 }: { size?: number }) {
  const snapshot = useAvatarSnapshot();
  return snapshot ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={snapshot} width={size} height={size} alt="" aria-hidden className="block select-none" draggable={false} />
  ) : (
    <HumanAvatar emotion="neutral" size={size} track={false} />
  );
}
