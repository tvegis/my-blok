"use client";

import { useState, useRef, type ComponentPropsWithoutRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CodeBlock({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // Extract code text
  const codeElement = children as React.ReactElement<{
    children?: React.ReactNode;
    className?: string;
  }>;
  const codeText =
    typeof codeElement?.props?.children === "string"
      ? codeElement.props.children
      : "";

  // Extract language from className
  const lang =
    codeElement?.props?.className?.replace("language-", "") || "plain";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="group relative my-8 rounded-xl overflow-hidden"
      translate="no"
      data-motion
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Gradient border */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2), rgba(139,92,246,0.2))",
          padding: "1px",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      />

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 dark:bg-black/50 border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* macOS dots */}
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-3 text-xs text-zinc-500 font-mono">{lang}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded hover:bg-white/5"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-emerald-400"
              >
                Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Code content */}
      <pre
        ref={preRef}
        className="!mt-0 !rounded-t-none !rounded-b-xl overflow-x-auto p-4 bg-[#0d0d12] dark:bg-[#08080c] text-sm leading-relaxed"
        {...props}
      >
        {children}
      </pre>
    </motion.div>
  );
}
