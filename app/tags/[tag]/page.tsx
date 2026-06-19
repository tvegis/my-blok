import { notFound } from "next/navigation";
import { getPostsByTag, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/home/post-card";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag}`,
    description: `Posts tagged with "${tag}"`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  if (posts.length === 0) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <Link
        href="/tags"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        All Tags
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          <span className="text-violet-400">#</span> {tag}
        </h1>
        <p className="text-zinc-500">
          {posts.length} post{posts.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
      </div>
    </div>
  );
}
