"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const TEXTS = [
  "Building things for the web.",
  "Writing clean, elegant code.",
  "Exploring design systems.",
  "Sharing what I learn.",
];

export function Hero() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = TEXTS[textIndex];
    const speed = isDeleting ? 30 : 60;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < current.length) {
          setDisplayText(current.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % TEXTS.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex]);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
            top: "10%",
            left: "-10%",
          }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
            bottom: "10%",
            right: "-5%",
          }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center" translate="no">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const }}
          data-motion
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-zinc-400 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Available for new projects
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="gradient-text">Hello, I&apos;m</span>
            <br />
            <span className="text-zinc-900 dark:text-white">a Developer</span>
          </h1>

          <div className="h-8 sm:h-10 mb-8">
            <span className="text-xl sm:text-2xl text-zinc-400 font-light">
              {displayText}
              <motion.span
                className="inline-block w-[2px] h-6 bg-violet-400 ml-1 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              />
            </span>
          </div>

          <motion.p
            className="max-w-xl mx-auto text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            A personal space where I share thoughts about web development, design
            system, and performance optimization.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <a
              href="#posts"
              className="px-6 py-3 rounded-xl bg-white dark:bg-white/10 text-zinc-900 dark:text-white font-medium border border-black/5 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/20 transition-all hover:scale-105"
            >
              Read Blog
            </a>
            <a
              href="/about"
              className="px-6 py-3 rounded-xl glass text-zinc-500 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white transition-all hover:scale-105"
            >
              About Me
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
