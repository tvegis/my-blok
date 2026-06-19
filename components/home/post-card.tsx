"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { useRef, useState } from "react";

export function PostCard({ post, index }: { post: Post; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 30 });

  const rotateX = useTransform(springY, [0, 1], [8, -8]);
  const rotateY = useTransform(springX, [0, 1], [-8, 8]);
  const shineOpacity = useTransform(
    springX,
    [0, 0.5, 1],
    [0.1, 0.3, 0.1]
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.4, 0.25, 1] as const,
      }}
      data-motion
    >
      <Link href={`/posts/${post.slug}`}>
        <motion.div
          ref={cardRef}
          className="group relative rounded-2xl p-6 glass transition-all"
          style={{ perspective: 1000 }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            mouseX.set(0.5);
            mouseY.set(0.5);
          }}
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Shine */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                opacity: shineOpacity,
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
              }}
            />

            {/* Glow border on hover */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(236,72,153,0.4), rgba(139,92,246,0.4))",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            {/* Tags */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-pink-400 transition-all duration-300">
              {post.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-2">
              {post.description}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>{post.readingTime} min read</span>
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
