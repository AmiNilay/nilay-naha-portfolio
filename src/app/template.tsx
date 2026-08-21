"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  consumePendingNavigationDirection,
  peekPendingNavigationDirection,
  type NavigationDirection,
} from "@/lib/navigationDirection";

const transitionVariants = {
  enter: (direction: NavigationDirection) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: NavigationDirection) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [direction] = useState<NavigationDirection>(() =>
    peekPendingNavigationDirection()
  );

  useEffect(() => {
    consumePendingNavigationDirection();
  }, []);

  return (
    <motion.div
      key={pathname}
      custom={direction}
      variants={transitionVariants}
      initial="enter"
      animate="center"
      transition={{
        x: { type: "spring", stiffness: 260, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="w-full min-h-full overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
}
