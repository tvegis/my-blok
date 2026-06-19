"use client";

import { motion } from "framer-motion";

const TIMELINE = [
  {
    year: "2026",
    title: "Started this blog",
    description: "Decided to share knowledge and document my learning journey.",
  },
  {
    year: "2025",
    title: "Senior Frontend Developer",
    description:
      "Focused on design systems, performance optimization, and developer tooling.",
  },
  {
    year: "2023",
    title: "Frontend Developer",
    description:
      "Building web applications with React, TypeScript, and modern tooling.",
  },
  {
    year: "2021",
    title: "Started coding",
    description:
      "Fell in love with building things for the web. The journey begins.",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-5xl font-bold tracking-tight mb-4">About Me</h1>
        <p className="text-xl text-zinc-500 mb-16 leading-relaxed max-w-xl">
          I&apos;m a developer passionate about building beautiful, performant
          web experiences.
        </p>

        {/* Skills */}
        <div className="mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "TypeScript",
              "React",
              "Next.js",
              "Tailwind CSS",
              "Node.js",
              "Framer Motion",
              "Three.js",
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-8">
            Timeline
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />

            <div className="space-y-12">
              {TIMELINE.map((item) => (
                <motion.div
                  key={item.year}
                  variants={itemVariants}
                  className="relative pl-8"
                >
                  {/* Dot */}
                  <div className="absolute left-[-4px] top-1 w-[9px] h-[9px] rounded-full bg-violet-500 ring-4 ring-white dark:ring-[#05050a]" />

                  <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                    {item.year}
                  </span>
                  <h3 className="text-lg font-semibold mt-1 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
