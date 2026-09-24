"use client";

import { RollingFigure } from "@/components/marketing/atoms/rolling-figure";
import { TrendLine } from "@/components/marketing/atoms/trend-line";
import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import { MetricReading } from "@/components/marketing/molecules/metric-reading";
import { useInView } from "@/hooks/use-in-view";
import { Moon } from "lucide-react";
import { useRef } from "react";

type SleepReadingProperties = {
  /** Time asleep, as "7h 48m". */
  slept: string;
  delta: string;
  /** The shape of the nights behind it, oldest first. */
  points: readonly number[];
};

/**
 * The scale the nights are drawn against, in hours. Wide, so a normal spread
 * of nights reads as the steady line it is rather than as a zig-zag.
 */
const HOURS_DOMAIN = [4, 10] as const;

/** How long the line takes to draw, about as long as the reels take to settle. */
const DRAW_MS = 1600;

/**
 * Time asleep, told as the part that is holding up: the figure rolls up to
 * the night just gone, as the stat bar does, beside a line of recent nights
 * that barely moves, in the calm tone.
 */
const classes = {
  root: "block",
} as const;

export const SleepReading = ({
  slept,
  delta,
  points,
}: SleepReadingProperties) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, "0px");

  return (
    <div className={classes.root} ref={rootRef}>
      <MetricReading
        chart={
          <TrendLine
            domain={HOURS_DOMAIN}
            drawn={inView}
            durationMs={DRAW_MS}
            points={points}
          />
        }
        delta={delta}
        figure={<RollingFigure value={slept} />}
        icon={<Moon strokeWidth={SPRITE_ICON_STROKE_WIDTH} />}
        label="Sleep"
        tone="calm"
        trend="steady"
      />
    </div>
  );
};
