import { getPosts } from "@/lib/posts";
import { PostCard } from "./post-card";

export function PostGrid() {
  const posts = getPosts();

  if (posts.length === 0) {
    return (
      <section id="posts" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center py-20">
          <p className="text-zinc-500">No posts yet. Check back soon!</p>
        </div>
      </section>
    );
  }

  return (
    <section id="posts" className="max-w-5xl mx-auto px-6 py-24">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
          Latest Posts
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Thoughts, tutorials, and explorations.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
      </div>
    </section>
  );
}
