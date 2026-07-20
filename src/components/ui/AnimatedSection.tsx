"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  duration?: number;
  once?: boolean;
  amount?: number;
}

const getVariants = (direction: string, duration: number): Variants => {
  const distance = 40;
  const initial: Record<string, number> = { opacity: 0 };

  if (direction === "up") initial.y = distance;
  if (direction === "down") initial.y = -distance;
  if (direction === "left") initial.x = distance;
  if (direction === "right") initial.x = -distance;

  return {
    hidden: initial,
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };
};

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.7,
  once = true,
  amount = 0.2,
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={getVariants(direction, duration)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}