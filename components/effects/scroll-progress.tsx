"use client";

import { motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
      style={{
        scaleX: scrollYProgress,
        background:
          "linear-gradient(90deg, #6366f1, #8b5cf6, #d946ef, #ec4899)",
      }}
    />
  );
}
