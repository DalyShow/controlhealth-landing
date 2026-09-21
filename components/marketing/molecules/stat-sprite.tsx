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
 * Floating stat readout that overlays the hero — an icon, a label, a live
 * figure and a trend delta. The shell is shared by every sprite; the icon
 * supplies the per-metric animation and reads the same beat as the figure, so
 * the two never drift apart.
 */
const classes = {
  root: "inline-flex flex-col justify-center gap-[3px] rounded-xl px-[15px] py-3",
  row: "flex items-center gap-1.5",
  icon: "size-[18px] shrink-0 text-primary-foreground [&_svg]:size-full",
  label: "font-medium font-sans text-[15px] text-primary-foreground leading-6",
  value:
    "font-sans font-semibold text-2xl text-primary-foreground leading-none tabular-nums",
  deltaRow: "flex items-center gap-1.5",
  deltaIcon: "size-[18px] shrink-0 text-teal-300",
  deltaChange: "font-medium font-sans text-[15px] text-verdant-100 leading-6",
  deltaSteady:
    "font-medium font-sans text-[15px] text-primary-foreground leading-6",
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
        <div className={classes.row}>
          <span className={classes.icon}>{icon}</span>
          <span className={classes.label}>{label}</span>
        </div>

        <p className={classes.value}>{figure}</p>

        <div className={classes.deltaRow}>
          <TrendIcon
            aria-hidden="true"
            className={classes.deltaIcon}
            strokeWidth={SPRITE_ICON_STROKE_WIDTH}
          />
          <span className={deltaClass(trend)}>{delta}</span>
        </div>
      </div>
    </StepBeatContext.Provider>
  );
};
