"use client";

import { MetricLabel } from "@/components/marketing/atoms/metric-label";
import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";

export type Signal = {
  label: string;
  trend: "up" | "down";
};

type SignalChipsProperties = {
  icon: ReactNode;
  label: string;
  /** The readings being flagged, in the order they are told. */
  signals: readonly Signal[];
};

const TREND_ICONS = {
  up: ArrowUp,
  down: ArrowDown,
} satisfies Record<Signal["trend"], LucideIcon>;

/** How far apart the chips arrive, so they read as a list being gathered. */
const STAGGER_MS = 140;

/**
 * A row of warning chips recapping readings told earlier, each with the
 * direction it moved. They rise into place one after another when the
 * section comes on screen, and start over each time it arrives.
 */
const classes = {
  root: "flex flex-col gap-2.5",
  row: "m-0 flex list-none flex-wrap gap-1.5 p-0",
  chipShown:
    "inline-flex translate-y-0 items-center gap-1 rounded-full border border-spectrum-peach/35 bg-spectrum-peach/10 px-2 py-1 opacity-100 transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none",
  chipHidden:
    "inline-flex translate-y-1 items-center gap-1 rounded-full border border-spectrum-peach/35 bg-spectrum-peach/10 px-2 py-1 opacity-0",
  chipIcon: "size-3 shrink-0 text-spectrum-peach",
  chipText:
    "whitespace-nowrap font-sans text-[12px] text-primary-foreground leading-none",
  hidden: "sr-only",
} as const;

export const SignalChips = ({
  icon,
  label,
  signals,
}: SignalChipsProperties) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, "0px");
  const prefersReducedMotion = usePrefersReducedMotion();
  const chipClass =
    inView || prefersReducedMotion ? classes.chipShown : classes.chipHidden;

  return (
    <div className={classes.root} ref={rootRef}>
      <MetricLabel icon={icon} label={label} />
      <ul className={classes.row}>
        {signals.map((signal, index) => {
          const TrendIcon = TREND_ICONS[signal.trend];

          return (
            <li
              className={chipClass}
              key={signal.label}
              style={{ transitionDelay: `${index * STAGGER_MS}ms` }}
            >
              <TrendIcon
                aria-hidden="true"
                className={classes.chipIcon}
                strokeWidth={SPRITE_ICON_STROKE_WIDTH}
              />
              <span className={classes.chipText}>{signal.label}</span>
              <span className={classes.hidden}>{signal.trend}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
