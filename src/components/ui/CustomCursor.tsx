"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const dotSpring = useSpring(cursorX, { damping: 30, stiffness: 700 });
  const dotSpringY = useSpring(cursorY, { damping: 30, stiffness: 700 });
  const ringSpring = useSpring(cursorX, { damping: 25, stiffness: 150 });
  const ringSpringY = useSpring(cursorY, { damping: 25, stiffness: 150 });

  useEffect(() => {
    setIsMounted(true);
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'a, button, [data-cursor-hover], input, textarea, select, [role="button"]'
        )
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'a, button, [data-cursor-hover], input, textarea, select, [role="button"]'
        )
      ) {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [cursorX, cursorY]);

  if (!isMounted || isTouchDevice) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border-2 border-primary mix-blend-difference"
        style={{
          x: ringSpring,
          y: ringSpringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovering ? 60 : 36,
          height: isHovering ? 60 : 36,
          opacity: isClicking ? 0.4 : 1,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      />

      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-primary mix-blend-difference"
        style={{
          x: dotSpring,
          y: dotSpringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovering ? 8 : 6,
          height: isHovering ? 8 : 6,
          scale: isClicking ? 0.5 : 1,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
      />
    </>
  );
}