"use client";

import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import {
  StepBeatContext,
  useStepCadence,
} from "@/hooks/use-step-beat";
import { ArrowDown, ArrowUp, Ellipsis, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Trend = "up" | "down" | "steady";

type StatSpriteProperties = {
  icon: ReactNode;
  /**
   * Names the metric for assistive technology. The glyph carries it visually,
   * so it is not drawn: at this size a label costs more room than it earns.
   */
  label: string;
  /** The headline reading — each sprite supplies its own animated figure. */
  figure: ReactNode;
  delta: string;
  trend?: Trend;
  /**
   * Milliseconds between beats. Each beat adds one to the figure and advances
   * the icon's animation. Omit it for a static sprite.
   */
  beatMs?: number;
};

/** Glyph for each trend state. "Steady" reports no change, so it gets dots. */
const TREND_ICONS = {
  up: ArrowUp,
  down: ArrowDown,
  steady: Ellipsis,
} satisfies Record<Trend, LucideIcon>;

/**
 * One live reading inside the hero's stat bar: a glyph, the figure and the
 * direction it is travelling, all on a single line.
 *
 * The icon supplies the per-metric animation and reads the same beat as the
 * figure, so the two never drift apart.
 */
const classes = {
  root: "inline-flex items-center gap-1.5 px-3.5 max-sm:gap-1 max-sm:px-2.5",
  icon: "size-[15px] shrink-0 text-primary-foreground [&_svg]:size-full",
  // "98 bpm" will break across two lines given the chance, which makes the
  // whole bar taller than the row it is meant to be.
  value:
    "whitespace-nowrap font-sans font-semibold text-[13.5px] text-primary-foreground leading-none tabular-nums max-sm:text-[12px]",
  // A phone has room for the readings but not for what they are doing. The
  // figures are the point; the trend is colour commentary.
  deltaRow: "flex items-center gap-0.5 max-sm:hidden",
  deltaIcon: "size-[11px] shrink-0 text-teal-300",
  deltaChange:
    "whitespace-nowrap font-sans text-[11.5px] text-verdant-100 leading-none max-sm:text-[10.5px]",
  deltaSteady:
    "whitespace-nowrap font-sans text-[11.5px] text-primary-foreground/65 leading-none max-sm:text-[10.5px]",
  hidden: "sr-only",
} as const;

const deltaClass = (trend: Trend) =>
  trend === "steady" ? classes.deltaSteady : classes.deltaChange;

export const StatSprite = ({
  icon,
  label,
  figure,
  delta,
  trend = "up",
  beatMs = 0,
}: StatSpriteProperties) => {
  const beat = useStepCadence(beatMs);
  const TrendIcon = TREND_ICONS[trend];

  return (
    <StepBeatContext.Provider value={beat}>
      <div className={classes.root}>
        <span aria-hidden="true" className={classes.icon}>
          {icon}
        </span>
        <span className={classes.hidden}>{label}</span>

        <p className={classes.value}>{figure}</p>

        <span className={classes.deltaRow}>
          <TrendIcon
            aria-hidden="true"
            className={classes.deltaIcon}
            strokeWidth={SPRITE_ICON_STROKE_WIDTH}
          />
          <span className={deltaClass(trend)}>{delta}</span>
        </span>
      </div>
    </StepBeatContext.Provider>
  );
};
