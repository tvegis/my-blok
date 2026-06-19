import { posts as allPosts } from "#site/content";

export type Post = (typeof allPosts)[number];

export function getPosts(): Post[] {
  return allPosts
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | undefined {
  return allPosts.find((post) => post.slug === slug && !post.draft);
}

export function getPostsByTag(tag: string): Post[] {
  return getPosts().filter((post) => post.tags.includes(tag));
}

export function getAllTags(): { tag: string; count: number }[] {
  const tagMap = new Map<string, number>();
  for (const post of getPosts()) {
    for (const tag of post.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getRelatedPosts(currentSlug: string, limit = 3): Post[] {
  const current = getPostBySlug(currentSlug);
  if (!current) return [];
  return getPosts()
    .filter((post) => post.slug !== currentSlug)
    .filter((post) => post.tags.some((t) => current.tags.includes(t)))
    .slice(0, limit);
}
