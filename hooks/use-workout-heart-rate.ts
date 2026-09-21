"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useEffect, useState } from "react";

export type HeartRateTrend = "up" | "down" | "steady";

type Phase = {
  target: number;
  msPerStep: number;
};

/**
 * A light interval session: warm up, ease off, push harder, then recover.
 * Each phase walks the reading one beat at a time toward its target, so the
 * arc plays out over roughly forty seconds before looping.
 */
const WORKOUT = [
  { target: 146, msPerStep: 120 },
  { target: 104, msPerStep: 170 },
  { target: 158, msPerStep: 110 },
  { target: 58, msPerStep: 150 },
] satisfies Phase[];

const trendFor = (bpm: number, target: number): HeartRateTrend => {
  if (target === bpm) {
    return "steady";
  }

  return target > bpm ? "up" : "down";
};

/**
 * Drives a heart rate reading through a looping workout. Viewers who prefer
 * reduced motion get the resting figure, held still.
 */
export const useWorkoutHeartRate = (restingBpm: number) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [bpm, setBpm] = useState(restingBpm);
  const [phaseIndex, setPhaseIndex] = useState(0);

  const phase = WORKOUT[phaseIndex] ?? WORKOUT[0];

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    if (bpm === phase.target) {
      setPhaseIndex((index) => (index + 1) % WORKOUT.length);
      return;
    }

    const timer = window.setTimeout(() => {
      setBpm((value) => value + Math.sign(phase.target - value));
    }, phase.msPerStep);

    return () => window.clearTimeout(timer);
  }, [bpm, phase, prefersReducedMotion]);

  return {
    bpm,
    trend: prefersReducedMotion ? "steady" : trendFor(bpm, phase.target),
  } as const;
};
