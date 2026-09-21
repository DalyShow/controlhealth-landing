"use client";

import { HeartbeatIcon } from "@/components/marketing/atoms/heartbeat-icon";
import { StatSprite } from "@/components/marketing/molecules/stat-sprite";
import {
  type HeartRateTrend,
  useWorkoutHeartRate,
} from "@/hooks/use-workout-heart-rate";

type HeartRateSpriteProperties = {
  restingBpm?: number;
};

const DEFAULT_RESTING_BPM = 58;

/** What the delta line reads in each direction of travel. */
const TREND_LABELS = {
  up: "Climbing",
  down: "Recovering",
  steady: "Steady",
} satisfies Record<HeartRateTrend, string>;

/**
 * Heart rate sprite running a looping workout: the figure walks up and down
 * one beat at a time and the icon pulses at whatever rate it currently reads,
 * so the glyph speeds up as the number climbs.
 */
export const HeartRateSprite = ({
  restingBpm = DEFAULT_RESTING_BPM,
}: HeartRateSpriteProperties) => {
  const { bpm, trend } = useWorkoutHeartRate(restingBpm);

  return (
    <StatSprite
      delta={TREND_LABELS[trend]}
      figure={`${bpm} bpm`}
      icon={<HeartbeatIcon beatsPerMinute={bpm} />}
      label="HR"
      trend={trend}
    />
  );
};
