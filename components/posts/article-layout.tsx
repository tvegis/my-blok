"use client";

import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

export function ArticleHeader({ post }: { post: Post }) {
  return (
    <motion.header
      className="mb-12"
      translate="no"
      data-motion
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const }}
    >
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Tags */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Title */}
      <motion.h1
        className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-zinc-900 dark:text-white mb-4"
        initial={{ filter: "blur(8px)", opacity: 0 }}
        animate={{ filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {post.title}
      </motion.h1>

      {/* Description */}
      <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
        {post.description}
      </p>

      {/* Meta bar */}
      <div className="flex items-center gap-4 text-sm text-zinc-400 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className="w-1 h-1 rounded-full bg-zinc-400" />
        <span>{post.readingTime} min read</span>
      </div>
    </motion.header>
  );
}
