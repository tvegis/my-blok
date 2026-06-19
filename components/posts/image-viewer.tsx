"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function ImageViewer({
  src,
  alt,
  ...props
}: ComponentPropsWithoutRef<"img">) {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <motion.button
        className="block my-8 cursor-none rounded-xl overflow-hidden"
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ""}
          className="w-full rounded-xl"
          {...props}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative z-10 max-w-5xl max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || ""}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
            <button
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-none"
              onClick={() => setIsOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
