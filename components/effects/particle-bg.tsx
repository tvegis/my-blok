"use client";

import dynamic from "next/dynamic";

export const ParticleBg = dynamic(
  () =>
    import("@/components/effects/particle-background").then(
      (mod) => mod.ParticleBackground
    ),
  { ssr: false }
);
