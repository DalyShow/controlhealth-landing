"use client";

import { useStepBeat } from "@/hooks/use-step-beat";

type TickingFigureProperties = {
  base: number;
  /**
   * How far the figure may climb above `base` before it holds. Without a
   * ceiling a tab left open all day drifts to an implausible reading.
   */
  maxIncrease?: number;
  locale?: string;
};

const DEFAULT_MAX_INCREASE = 400;

/**
 * A figure that climbs by one on every beat of its sprite. The live number is
 * hidden from assistive technology — it would be narrated endlessly — which
 * gets the settled base value instead.
 */
const classes = {
  settled: "sr-only",
} as const;

export const TickingFigure = ({
  base,
  maxIncrease = DEFAULT_MAX_INCREASE,
  locale = "en-US",
}: TickingFigureProperties) => {
  const beat = useStepBeat();
  const displayed = base + Math.min(beat, maxIncrease);

  return (
    <span>
      <span aria-hidden="true">{displayed.toLocaleString(locale)}</span>
      <span className={classes.settled}>{base.toLocaleString(locale)}</span>
    </span>
  );
};
