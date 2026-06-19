import { getAllTags } from "@/lib/posts";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all blog tags",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-3">Tags</h1>
      <p className="text-zinc-500 mb-12">Browse posts by topic.</p>

      {tags.length === 0 ? (
        <p className="text-zinc-500">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl glass hover:border-violet-500/30 transition-all hover:scale-105"
            >
              <span className="text-sm font-medium">{tag}</span>
              <span className="text-xs text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5">
                {count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
