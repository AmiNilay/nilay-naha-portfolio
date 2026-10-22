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
      className="relative overflow-hidden rounded-full"
      style={{ width: size, height: size }}
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
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
      </AnimatePresence>
    </motion.div>
  );
}
