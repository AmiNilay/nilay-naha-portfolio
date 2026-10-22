"use client";

import { AnimatePresence, motion } from "framer-motion";
import { mascotImage, MASCOT_LABEL, type MascotExpression } from "./mascotConfig";

/**
 * 2D mascot: renders cropped from the reference sheet, crossfading between
 * expressions, with a gentle breathing float when `animate` is on.
 */
export default function MascotFallback({
  expression,
  size,
  theme,
  icon,
  animate,
}: {
  expression: MascotExpression;
  size: number;
  theme: "light" | "dark";
  icon: boolean;
  animate: boolean;
}) {
  const src = mascotImage(expression, size, theme, icon);
  return (
    <motion.div
      // Transparent cut-out figure: no disc, no backdrop. A soft contact shadow
      // grounds it; in dark mode a faint cool rim keeps black hair/hoodie readable.
      className="relative"
      style={{
        width: size,
        height: size,
        filter:
          theme === "dark"
            ? "drop-shadow(0 0 1px rgba(125,211,252,0.55)) drop-shadow(0 6px 10px rgba(0,0,0,0.55))"
            : "drop-shadow(0 6px 10px rgba(15,23,42,0.22))",
      }}
      animate={animate ? { y: [0, -size * 0.025, 0], scale: [1, 1.012, 1] } : undefined}
      transition={animate ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={src}
          src={src}
          alt={MASCOT_LABEL}
          width={size}
          height={size}
          draggable={false}
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 w-full h-full object-contain select-none"
        />
      </AnimatePresence>
    </motion.div>
  );
}
