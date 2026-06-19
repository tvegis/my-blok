"use client";

import * as runtime from "react/jsx-runtime";
import { useMemo, type ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/posts/code-block";
import { ImageViewer } from "@/components/posts/image-viewer";

type HeadingProps = ComponentPropsWithoutRef<"h1">;
type AnchorProps = ComponentPropsWithoutRef<"a">;
type ImgProps = ComponentPropsWithoutRef<"img">;

const components = {
  h2: ({ id, children, ...props }: HeadingProps) => (
    <h2 id={id} {...props}>
      {children}
    </h2>
  ),
  h3: ({ id, children, ...props }: HeadingProps) => (
    <h3 id={id} {...props}>
      {children}
    </h3>
  ),
  a: ({ href, children, ...props }: AnchorProps) => {
    if (href?.startsWith("/")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    if (href?.startsWith("#")) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  img: ({ src, alt, ...props }: ImgProps) => {
    if (!src) return null;
    return <ImageViewer src={src} alt={alt || ""} {...props} />;
  },
  pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => {
    return <CodeBlock {...props}>{children}</CodeBlock>;
  },
  code: ({ children, className, ...props }: ComponentPropsWithoutRef<"code">) => {
    if (!className) {
      return (
        <code
          className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-white/10 text-pink-500 dark:text-pink-400 text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export function MdxContent({ code }: { code: string }) {
  const Content = useMemo(() => {
    try {
      const fn = new Function(code);
      const result = fn(runtime);
      return result.default;
    } catch (e) {
      console.error("Failed to evaluate MDX:", e);
      return null;
    }
  }, [code]);

  if (!Content) {
    return <p className="text-red-400">Failed to render content.</p>;
  }

  return (
    <div className="prose" translate="no">
      <Content components={components} />
    </div>
  );
}
