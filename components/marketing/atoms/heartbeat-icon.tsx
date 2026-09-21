import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";

type HeartbeatIconProperties = {
  beatsPerMinute: number;
};

const SECONDS_PER_MINUTE = 60;

/**
 * The lucide `Heart` glyph beating lub-dub at the rate it is reporting — one
 * full cycle per beat, so a 58 bpm reading pulses 58 times a minute. Pure CSS
 * apart from the duration, so this stays a server component.
 */
const classes = {
  root: "block size-full origin-center animate-heartbeat overflow-visible text-heartbeat motion-reduce:animate-none",
} as const;

export const HeartbeatIcon = ({ beatsPerMinute }: HeartbeatIconProperties) => (
  <svg
    aria-hidden="true"
    className={classes.root}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={SPRITE_ICON_STROKE_WIDTH}
    style={{ animationDuration: `${SECONDS_PER_MINUTE / beatsPerMinute}s` }}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
  </svg>
);
