"use client";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(): TocItem[] {
  if (typeof document === "undefined") return [];
  const headings = document.querySelectorAll(".prose h2, .prose h3");
  return Array.from(headings).map((h) => ({
    id: h.id,
    text: h.textContent || "",
    level: h.tagName === "H2" ? 2 : 3,
  }));
}

export function Toc() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const activeId = useScrollSpy(headings);

  useEffect(() => {
    // Wait for MDX content to render
    const timer = setTimeout(() => {
      setHeadings(extractHeadings());
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (headings.length === 0) return null;

  return (
    <motion.nav
      className="hidden xl:block fixed top-24 right-[max(1rem,calc((100vw-64rem)/2-16rem))] w-56"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
        On this page
      </h3>
      <ul className="space-y-1 border-l border-zinc-200/60 dark:border-zinc-800/60">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block text-sm py-1.5 transition-all duration-200 ${
                heading.level === 3 ? "pl-4" : "pl-3"
              } ${
                activeId === heading.id
                  ? "text-violet-400 border-l-2 border-violet-400 -ml-px font-medium"
                  : "text-zinc-400 hover:text-zinc-200 border-l-2 border-transparent -ml-px"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
