"use client";

import { HeartbeatIcon } from "@/components/marketing/atoms/heartbeat-icon";
import { MetricReading } from "@/components/marketing/molecules/metric-reading";
import {
  useWorkoutHeartRate,
  type WorkoutPhase,
} from "@/hooks/use-workout-heart-rate";

type RunningState = "strained" | "settled";

type RunningHeartRateProperties = {
  /** Her usual heart rate at this pace. The reading is told against it. */
  usualBpm: number;
  /** Straining above her usual, or settled back under it. */
  state: RunningState;
};

type StateSettings = {
  /** Where the reading starts, inside the band it wanders in. */
  startingBpm: number;
  /** The band it wanders in, never settling. */
  workout: WorkoutPhase[];
};

/**
 * The two runs in the story. Strained holds between 171 and 181, well above
 * her usual, on slow steps so it reads as strain rather than a sprint.
 * Settled wanders gently between 144 and 150, just under it.
 */
const STATES = {
  strained: {
    startingBpm: 174,
    workout: [
      { target: 178, msPerStep: 280 },
      { target: 171, msPerStep: 340 },
      { target: 181, msPerStep: 300 },
      { target: 173, msPerStep: 360 },
    ],
  },
  settled: {
    startingBpm: 147,
    workout: [
      { target: 150, msPerStep: 420 },
      { target: 145, msPerStep: 480 },
      { target: 149, msPerStep: 440 },
      { target: 144, msPerStep: 500 },
    ],
  },
} satisfies Record<RunningState, StateSettings>;

/**
 * Heart rate on a run, told against her usual. The heart beats at whatever
 * the figure reads, so strained it visibly races and settled it slows. The
 * delta counts how far above her usual it is as a warning, or how far below
 * it as a calm reading.
 */
export const RunningHeartRate = ({
  usualBpm,
  state,
}: RunningHeartRateProperties) => {
  const { startingBpm, workout } = STATES[state];
  const { bpm } = useWorkoutHeartRate(startingBpm, workout);
  const strained = state === "strained";

  return (
    <MetricReading
      delta={
        strained
          ? `${bpm - usualBpm} above usual`
          : `${usualBpm - bpm} below usual`
      }
      figure={bpm}
      icon={<HeartbeatIcon beatsPerMinute={bpm} />}
      label="Heart rate"
      tone={strained ? "warning" : "calm"}
      trend={strained ? "up" : "down"}
      unit="bpm"
    />
  );
};
