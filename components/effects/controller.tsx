"use client";

import { usePathname } from "next/navigation";
import { ParticleBg } from "@/components/effects/particle-bg";
import { CustomCursor } from "@/components/effects/custom-cursor";

export function EffectsController() {
  const pathname = usePathname();

  // Hide effects on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <ParticleBg />
      <CustomCursor />
    </>
  );
}
