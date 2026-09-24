"use client";

import { RecordScan } from "@/components/marketing/atoms/record-scan";
import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import { MetricReading } from "@/components/marketing/molecules/metric-reading";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type RecordsScanReadingProperties = {
  /** How many records it counts up to. */
  records: number;
  /** What the scan is doing, in a few words, e.g. "Scanning 3 providers". */
  delta: string;
};

/** How long the count takes to climb to the total. */
const COUNT_MS = 1600;

const easeOut = (value: number) => 1 - (1 - value) ** 3;

/**
 * Medical records being read in, as a reading on a `MetricCard`: the count
 * climbs to the total when it arrives, easing as it nears it, beside a row
 * of pages with a beam crossing them. The trend is steady, drawn as dots,
 * since the scan is still going. Anyone who has asked for less motion gets
 * the total and a still row of pages.
 */
const classes = {
  root: "block",
} as const;

export const RecordsScanReading = ({
  records,
  delta,
}: RecordsScanReadingProperties) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, "0px");
  const prefersReducedMotion = usePrefersReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(records);
      return;
    }

    if (!inView) {
      setCount(0);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_MS);
      setCount(Math.round(records * easeOut(progress)));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [inView, prefersReducedMotion, records]);

  return (
    <div className={classes.root} ref={rootRef}>
      <MetricReading
        chart={<RecordScan scanning={inView} />}
        delta={delta}
        figure={count.toLocaleString("en-US")}
        icon={<FileText strokeWidth={SPRITE_ICON_STROKE_WIDTH} />}
        label="Medical records"
        tone="calm"
        trend="steady"
        unit="records"
      />
    </div>
  );
};
