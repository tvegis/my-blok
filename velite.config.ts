import { defineConfig, s } from "velite";

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
  },
  collections: {
    posts: {
      name: "Post",
      pattern: "posts/**/*.mdx",
      schema: s
        .object({
          title: s.string(),
          date: s.isodate(),
          description: s.string(),
          tags: s.array(s.string()).default([]),
          cover: s.string().optional(),
          draft: s.boolean().default(false),
          code: s.mdx(),
          metadata: s.metadata(),
          slug: s.path(),
        })
        .transform((data) => ({
          ...data,
          slug: data.slug.replace(/^posts\//, ""),
          excerpt: data.description,
          readingTime: Math.ceil(data.metadata.readingTime),
          content: data.code,
        })),
    },
  },
});
