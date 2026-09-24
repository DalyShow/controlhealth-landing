"use client";

import { TrendLine } from "@/components/marketing/atoms/trend-line";
import {
  MetricReading,
  type MetricTone,
  type MetricTrend,
} from "@/components/marketing/molecules/metric-reading";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";

type TrendReadingProperties = {
  icon: ReactNode;
  label: string;
  /** The figure it counts from, in whole units. */
  from: number;
  /** The figure it settles on. */
  to: number;
  /** Set straight after the figure, at its size, such as "%". */
  suffix?: string;
  /** Set small after the figure, such as "/ 100". */
  unit?: string;
  delta: string;
  trend: MetricTrend;
  tone?: MetricTone;
  /**
   * The shape of the readings behind the figure, oldest first. Only the shape
   * is drawn, fitted to the box, so it need not match the figures.
   */
  points: readonly number[];
};

/** Milliseconds per unit as the figure counts. */
const STEP_MS = 55;

/**
 * A reading that counts from one figure to another as it comes on screen,
 * while its line draws itself in beside it, the two finishing together.
 * It starts over each time it arrives, and holds the final figure for
 * anyone who has asked for less motion.
 */
const classes = {
  root: "block",
} as const;

export const TrendReading = ({
  icon,
  label,
  from,
  to,
  suffix = "",
  unit,
  delta,
  trend,
  tone,
  points,
}: TrendReadingProperties) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, "0px");
  const prefersReducedMotion = usePrefersReducedMotion();
  const [figure, setFigure] = useState(from);

  useEffect(() => {
    if (prefersReducedMotion) {
      setFigure(to);
      return;
    }

    if (!inView) {
      setFigure(from);
      return;
    }

    if (figure === to) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFigure((value) => value + Math.sign(to - value));
    }, STEP_MS);

    return () => window.clearTimeout(timer);
  }, [figure, from, inView, prefersReducedMotion, to]);

  return (
    <div className={classes.root} ref={rootRef}>
      <MetricReading
        chart={
          <TrendLine
            drawn={inView || prefersReducedMotion}
            durationMs={Math.abs(from - to) * STEP_MS}
            points={points}
          />
        }
        delta={delta}
        figure={`${figure}${suffix}`}
        icon={icon}
        label={label}
        trend={trend}
        {...(tone ? { tone } : {})}
        {...(unit ? { unit } : {})}
      />
    </div>
  );
};
