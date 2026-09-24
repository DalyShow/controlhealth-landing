import { MetricLabel } from "@/components/marketing/atoms/metric-label";
import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import { ArrowDown, ArrowUp, Ellipsis, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type MetricTrend = "up" | "down" | "steady";

/**
 * How the reading is told: `warning` for the part of the story that is going
 * wrong, `calm` for what is holding up.
 */
export type MetricTone = "warning" | "calm";

type MetricReadingProperties = {
  /** A glyph beside the name. Left out, the name stands alone. */
  icon?: ReactNode;
  label: string;
  /** The reading itself, which may be animated. */
  figure: ReactNode;
  unit?: string;
  /** What the reading is doing, in a few words. */
  delta: string;
  trend: MetricTrend;
  tone?: MetricTone;
  /** A small chart set beside the figure, such as a `TrendLine`. */
  chart?: ReactNode;
};

/** Glyph for each trend. "Steady" reports no change, so it gets dots. */
const TREND_ICONS = {
  up: ArrowUp,
  down: ArrowDown,
  steady: Ellipsis,
} satisfies Record<MetricTrend, LucideIcon>;

/**
 * One reading in a `MetricCard`: the metric named beside its glyph, the
 * figure large beneath, and what it is doing under that.
 *
 * The tone colours the chart and the delta. A warning is warm, set against
 * the green of the stat bar, which a calm reading keeps, so a card can put
 * what is holding up beside what is not. The arrow is left to say which way
 * things are going.
 */
const classes = {
  root: "flex flex-col gap-2",
  body: "flex items-end justify-between gap-4",
  figure:
    "m-0 whitespace-nowrap font-sans font-semibold text-[30px] text-primary-foreground leading-none tabular-nums max-sm:text-[24px]",
  unit: "ml-1 font-normal text-[13px] text-primary-foreground/70 max-sm:text-[12px]",
  chartWarning:
    "h-[30px] w-[96px] shrink-0 text-spectrum-peach max-sm:h-6 max-sm:w-20",
  chartCalm: "h-[30px] w-[96px] shrink-0 text-teal-300 max-sm:h-6 max-sm:w-20",
  delta: "flex items-center gap-1",
  deltaIconWarning: "size-3 shrink-0 text-spectrum-peach",
  deltaIconCalm: "size-3 shrink-0 text-teal-300",
  deltaTextWarning:
    "whitespace-nowrap font-sans text-[12px] text-spectrum-peach leading-none",
  deltaTextCalm:
    "whitespace-nowrap font-sans text-[12px] text-verdant-100 leading-none",
} as const;

/** The three tone-dependent class keys for a tone. */
const TONE_CLASSES = {
  warning: {
    chart: classes.chartWarning,
    deltaIcon: classes.deltaIconWarning,
    deltaText: classes.deltaTextWarning,
  },
  calm: {
    chart: classes.chartCalm,
    deltaIcon: classes.deltaIconCalm,
    deltaText: classes.deltaTextCalm,
  },
} satisfies Record<
  MetricTone,
  { chart: string; deltaIcon: string; deltaText: string }
>;

export const MetricReading = ({
  icon,
  label,
  figure,
  unit,
  delta,
  trend,
  tone = "warning",
  chart,
}: MetricReadingProperties) => {
  const TrendIcon = TREND_ICONS[trend];
  const toned = TONE_CLASSES[tone];

  return (
    <div className={classes.root}>
      <MetricLabel label={label} {...(icon ? { icon } : {})} />

      <div className={classes.body}>
        <p className={classes.figure}>
          {figure}
          {unit ? <span className={classes.unit}>{unit}</span> : null}
        </p>
        {chart ? <span className={toned.chart}>{chart}</span> : null}
      </div>

      <div className={classes.delta}>
        <TrendIcon
          aria-hidden="true"
          className={toned.deltaIcon}
          strokeWidth={SPRITE_ICON_STROKE_WIDTH}
        />
        <span className={toned.deltaText}>{delta}</span>
      </div>
    </div>
  );
};
