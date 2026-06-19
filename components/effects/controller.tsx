"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ParticleBg } from "@/components/effects/particle-bg";
import { CustomCursor } from "@/components/effects/custom-cursor";

export function EffectsController() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // Signal admin route to the rest of the page
  useEffect(() => {
    if (isAdmin) {
      document.documentElement.setAttribute("data-route", "admin");
    } else {
      document.documentElement.removeAttribute("data-route");
    }
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      <ParticleBg />
      <CustomCursor />
    </>
  );
}
