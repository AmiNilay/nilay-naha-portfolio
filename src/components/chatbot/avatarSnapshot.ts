"use client";

import { useEffect, useState } from "react";

/**
 * Still image of the 3D avatar, captured once from its first rendered frame.
 * Message avatars show this instead of running extra WebGL contexts.
 * Lives outside Avatar3D so importing it never pulls three.js into the bundle.
 */
let snapshot = "";
const listeners = new Set<(s: string) => void>();

export function publishSnapshot(dataUrl: string) {
  snapshot = dataUrl;
  listeners.forEach((fn) => fn(dataUrl));
}

export function useAvatarSnapshot() {
  const [value, setValue] = useState(snapshot);
  useEffect(() => {
    listeners.add(setValue);
    if (snapshot) setValue(snapshot);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}
