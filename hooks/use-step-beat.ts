"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { createContext, useContext, useEffect, useState } from "react";

/**
 * Footfalls since mount. A sprite publishes its cadence here so the figure it
 * displays and the icon that animates stay on the same beat — a CSS loop and
 * a JS timer would drift apart.
 */
export const StepBeatContext = createContext(0);

export const useStepBeat = () => useContext(StepBeatContext);

/**
 * Ticks once every `periodMs`. A period of zero or less leaves the sprite
 * static, as does a reduced-motion preference.
 */
export const useStepCadence = (periodMs: number) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion || periodMs <= 0) {
      return;
    }

    const timer = window.setInterval(
      () => setBeat((current) => current + 1),
      periodMs
    );

    return () => window.clearInterval(timer);
  }, [periodMs, prefersReducedMotion]);

  return beat;
};
