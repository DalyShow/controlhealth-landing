"use client";

import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { type ReactNode, useRef } from "react";

type ScrollMaskProperties = {
  /** A full-window panel, such as a `PageHero`. */
  children: ReactNode;
};

/** Share of the runway spent masking down; the rest holds the card. */
const MASK_SHARE = 0.8;

/**
 * Pins a full-window panel and, as the page scrolls, masks it down from full
 * bleed to a card with rounded corners on the page grid, the same move as
 * the case study on the homepage. The panel itself never moves or resizes;
 * only the mask closes in around it.
 *
 * The settled card sits on the gutters of the page shell, so its edges line
 * up with the sections below it: 96px in, or the edge of the page on a
 * window wider than it, narrowing with the shell on smaller screens. It is
 * as tall as a 16:9 frame of that width, the shape of the footage, centred
 * down the window, and never shorter than 480px, so the words in it always
 * fit, nor taller than the window leaves room for. Below 768px the words are
 * too tall for any frame of that shape, so the card takes all the height
 * there is.
 *
 * Anyone who has asked for less motion gets the panel full bleed, with
 * nothing to scroll through.
 */
const classes = {
  // Measures the width the card is set against.
  root: "@container",
  // The runway: 60vh of scroll past the panel, most of it masking. It holds
  // the card geometry, and pulls whatever follows up by the band under the
  // settled card, so the next section is spaced from the card itself rather
  // than from the bottom of the window, however tall the window is.
  runway:
    "relative mb-[calc(-1*var(--mask-b))] h-[calc(var(--stage-h)+60vh)] [--card-floor:480px] [--card-h:min(calc(var(--stage-h)-var(--mask-min-t)-48px),max(var(--card-floor),calc((100cqw-2*var(--mask-x))*9/16)))] [--mask-b:calc(var(--stage-h)-var(--mask-t)-var(--card-h))] [--mask-min-t:96px] [--mask-t:max(var(--mask-min-t),calc((var(--stage-h)-var(--card-h))/2))] [--mask-x:max(96px,calc((100cqw-var(--container-page))/2+96px))] [--radius:28px] [--stage-h:max(100dvh,660px)] max-xl:[--mask-x:40px] max-md:[--card-floor:100dvh] max-sm:[--mask-min-t:88px] max-sm:[--mask-x:24px] max-sm:[--radius:20px] motion-reduce:mb-0 motion-reduce:h-auto",
  // Clear outside the card, and passes the pointer through, so the section
  // pulled up under its bottom band shows and can be used.
  stage:
    "pointer-events-none sticky top-0 h-[var(--stage-h)] overflow-hidden [--p:0] motion-reduce:static",
  frame:
    "pointer-events-auto size-full bg-figure-ground [clip-path:inset(calc(var(--p)*var(--mask-t))_calc(var(--p)*var(--mask-x))_calc(var(--p)*var(--mask-b))_calc(var(--p)*var(--mask-x))_round_calc(var(--p)*var(--radius)))]",
} as const;

export const ScrollMask = ({ children }: ScrollMaskProperties) => {
  const runwayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useScrollProgress(runwayRef, stageRef, MASK_SHARE);

  return (
    <div className={classes.root}>
      <div className={classes.runway} ref={runwayRef}>
        <div className={classes.stage} ref={stageRef}>
          <div className={classes.frame}>{children}</div>
        </div>
      </div>
    </div>
  );
};
