"use client";

import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the viewer's reduced-motion preference so components can drop
 * decorative movement without dropping the interaction itself.
 */
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);

    setPrefersReducedMotion(media.matches);

    const handleChange = (event: MediaQueryListEvent) =>
      setPrefersReducedMotion(event.matches);

    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
};
