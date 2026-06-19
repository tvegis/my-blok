"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.p
          className="text-[10rem] sm:text-[14rem] font-bold leading-none gradient-text select-none"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          404
        </motion.p>
        <h1 className="text-2xl font-semibold mb-3 text-zinc-900 dark:text-white">
          Page not found
        </h1>
        <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-xl bg-white dark:bg-white/10 text-zinc-900 dark:text-white font-medium border border-black/5 dark:border-white/10 hover:scale-105 transition-transform"
        >
          Go Home
        </Link>
      </motion.div>
    </div>
  );
}
