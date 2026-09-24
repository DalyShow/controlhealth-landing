"use client";

import { FootstepsIcon } from "@/components/marketing/atoms/footsteps-icon";
import { TickingFigure } from "@/components/marketing/atoms/ticking-figure";
import { MetricReading } from "@/components/marketing/molecules/metric-reading";
import {
  StepBeatContext,
  useStepCadence,
} from "@/hooks/use-step-beat";

type StepsReadingProperties = {
  /** The count it starts from, before the steps start adding to it. */
  base: number;
  delta: string;
  /** Milliseconds between steps, for the count and the feet alike. */
  beatMs: number;
};

/**
 * Steps today, as a reading on a `MetricCard`: the count ticks up a step at a
 * time as the stat bar did on the homepage, with the feet walking in time
 * with it, drawn large where a chart would sit so the reading fills its row
 * and balances any beneath it, centred in that space, over the middle of a
 * chart below it.
 */
/**
 * The feet are drawn at 40px from a 24-unit glyph, so a line weight of 0.6
 * units is about a pixel on screen, the weight of the pages in the records
 * reading. Change the two together.
 */
const FEET_STROKE = 0.6;

const classes = {
  feet: "flex size-full justify-center",
  // A little taller than the chart space, overhanging it evenly above and
  // below rather than making the row taller.
  glyph: "-my-[5px] size-10 shrink-0",
} as const;

export const StepsReading = ({
  base,
  delta,
  beatMs,
}: StepsReadingProperties) => {
  const beat = useStepCadence(beatMs);

  return (
    <StepBeatContext.Provider value={beat}>
      <MetricReading
        chart={
          <span className={classes.feet}>
            <span className={classes.glyph}>
              <FootstepsIcon strokeWidth={FEET_STROKE} />
            </span>
          </span>
        }
        delta={delta}
        figure={<TickingFigure base={base} />}
        label="Steps today"
        tone="calm"
        trend="up"
      />
    </StepBeatContext.Provider>
  );
};
