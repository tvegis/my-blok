"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch posts on first open
  useEffect(() => {
    if (open && posts.length === 0) {
      setLoading(true);
      fetch("/api/search")
        .then((res) => res.json())
        .then((data) => {
          setPosts(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open, posts.length]);

  // Search logic (client-side)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
    setResults(filtered);
  }, [query, posts]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navigate = useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/posts/${slug}`);
    },
    [router]
  );

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span>Search</span>
        <kbd className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5">⌘K</kbd>
      </button>

      {/* Dialog */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-none"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="relative z-10 w-full max-w-lg mx-4 rounded-2xl glass shadow-2xl overflow-hidden"
              translate="no"
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500"
                />
                <kbd className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-zinc-500">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="px-4 py-8 text-center text-sm text-zinc-500">
                    Loading...
                  </div>
                ) : results.length > 0 ? (
                  results.map((post, i) => (
                    <motion.button
                      key={post.slug}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => navigate(post.slug)}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {post.description}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-600 ml-2 shrink-0">
                        {formatDate(post.date)}
                      </span>
                    </motion.button>
                  ))
                ) : query ? (
                  <div className="px-4 py-8 text-center text-sm text-zinc-500">
                    No results for &quot;{query}&quot;
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-zinc-500">
                    Type to search posts...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
