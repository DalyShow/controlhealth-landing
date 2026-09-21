"use client";

import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useStepBeat } from "@/hooks/use-step-beat";

/**
 * Walking footprints — the lucide `Footprints` glyph, split into a leading and
 * a trailing foot. On each footfall the planted foot swings forward along its
 * line of travel while the other sits back, so the pair walks rather than
 * merely blinking. Opacity only shades the lifted foot slightly, to give the
 * movement depth.
 */
const classes = {
  root: "block size-full overflow-visible",
  leadPlanted:
    "-translate-y-[3.5px] opacity-100 transition-[opacity,translate] duration-[420ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]",
  leadLifted:
    "translate-y-[3.5px] opacity-60 transition-[opacity,translate] duration-[420ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]",
  trailPlanted:
    "-translate-y-[3.5px] opacity-100 transition-[opacity,translate] duration-[420ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]",
  trailLifted:
    "translate-y-[3.5px] opacity-60 transition-[opacity,translate] duration-[420ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]",
  still: "translate-y-0 opacity-100",
} as const;

const leadClass = (isStill: boolean, isLeadActive: boolean) => {
  if (isStill) {
    return classes.still;
  }

  return isLeadActive ? classes.leadPlanted : classes.leadLifted;
};

const trailClass = (isStill: boolean, isLeadActive: boolean) => {
  if (isStill) {
    return classes.still;
  }

  return isLeadActive ? classes.trailLifted : classes.trailPlanted;
};

export const FootstepsIcon = () => {
  const beat = useStepBeat();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isLeadActive = beat % 2 === 0;

  return (
    <svg
      aria-hidden="true"
      className={classes.root}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={SPRITE_ICON_STROKE_WIDTH}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className={leadClass(prefersReducedMotion, isLeadActive)}>
        <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" />
        <path d="M4 13h4" />
      </g>
      <g className={trailClass(prefersReducedMotion, isLeadActive)}>
        <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" />
        <path d="M16 17h4" />
      </g>
    </svg>
  );
};
