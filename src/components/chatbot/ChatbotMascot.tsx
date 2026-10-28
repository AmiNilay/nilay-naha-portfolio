import { MASCOT_IMAGE, MASCOT_LABEL } from "./mascotConfig";

export type { AvatarEmotion } from "./mascotConfig";

/**
 * The chatbot mascot: one static image (see MASCOT_IMAGE in mascotConfig.ts).
 * Kept deliberately light — no three.js, WebGL or animation — so it loads
 * instantly in every browser.
 */
export default function ChatbotMascot({ size, className = "" }: { size: number; className?: string }) {
  const safeSize = Number.isFinite(size) && size > 0 ? Math.min(Math.round(size), 512) : 48;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MASCOT_IMAGE}
      alt={MASCOT_LABEL}
      width={safeSize}
      height={safeSize}
      draggable={false}
      decoding="async"
      className={`inline-block shrink-0 object-contain select-none ${className}`}
      style={{ width: safeSize, height: safeSize }}
    />
  );
}
