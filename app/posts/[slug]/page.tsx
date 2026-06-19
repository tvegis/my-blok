import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { MdxContent } from "@/components/mdx";
import { ArticleHeader } from "@/components/posts/article-layout";
import { Toc } from "@/components/posts/toc";
import { GiscusComments } from "@/components/comments/giscus";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="relative">
      <Toc />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <ArticleHeader post={post} />
        <MdxContent code={post.code} />
        <GiscusComments />
      </article>
    </div>
  );
}
