"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear and re-create
    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", "tvegis/my-blog");
    script.setAttribute("data-repo-id", "YOUR_REPO_ID");
    script.setAttribute("data-category", "Comments");
    script.setAttribute("data-category-id", "YOUR_CATEGORY_ID");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute(
      "data-theme",
      resolvedTheme === "dark" ? "dark_dimmed" : "light"
    );
    script.setAttribute("data-lang", "zh-CN");
    container.appendChild(script);
  }, [resolvedTheme]);

  return (
    <motion.div
      ref={containerRef}
      className="mt-16 pt-8 border-t border-zinc-200/60 dark:border-zinc-800/60"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    />
  );
}
