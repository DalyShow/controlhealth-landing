"use client";

import { useReplayInView } from "@/hooks/use-in-view";
import { roundedRectPath, sparklePath } from "@/lib/path";
import { type CSSProperties, useRef } from "react";

type Bar = {
  x: number;
  y: number;
  width: number;
};

/** The answer sitting above the input, the way it would in a thread. */
const REPLY_BARS = [
  { x: -66, y: -76, width: 142 },
  { x: -66, y: -60, width: 158 },
  { x: -66, y: -44, width: 88 },
] satisfies Bar[];

const BAR_HEIGHT = 6;

/** The input field: short, softly cornered, frosted like the platform. */
const FIELD = { x: -95, y: 10, width: 190, height: 48, radius: 20 } as const;

/** Vertical centre of the field, which the text, caret and send share. */
const FIELD_MID = FIELD.y + FIELD.height / 2;

const SEND = { cx: 68, cy: FIELD_MID, r: 13 } as const;

/** The two sparkles, twinkling half a cycle apart. */
const SPARKLES = [
  { cx: -86, cy: -70, r: 9, delay: 0 },
  { cx: -72, cy: -86, r: 5, delay: -1.3 },
] as const;

const TWINKLE_S = 2.6;

/**
 * "Understand what your data actually says" — an AI input with a lit segment
 * running its border. Flat and frontal, against the platform's isometric
 * floor, so the two figures read as different kinds of object.
 */
/**
 * Cycles a figure plays when it comes into view before resting. Running
 * every timeline on the page forever costs frames for motion nobody is
 * looking at.
 */
const FIGURE_CYCLES = 2;

const classes = {
  root: "block h-auto w-full max-w-figure",
  field:
    "stroke-figure-line-bright [fill:url(#input-glass)] [stroke-width:0.63]",
  fill: "fill-figure-line-dim stroke-none",
  mark: "fill-none stroke-figure-line [stroke-width:1.01]",
  caret: "fill-figure-accent",
  sparkle:
    "fill-none stroke-figure-accent [stroke-width:1.26] [transform-box:fill-box] [transform-origin:center]",
  highlight:
    "fill-none stroke-figure-accent [stroke-dasharray:17_83] [stroke-width:1.77] [filter:drop-shadow(0_0_3px_var(--color-figure-accent))]",
} as const;

const FIELD_PATH = roundedRectPath(
  FIELD.x,
  FIELD.y,
  FIELD.width,
  FIELD.height,
  FIELD.radius
);

const twinkleStyle = (delay: number): CSSProperties => ({
  animation: `figure-twinkle ${TWINKLE_S}s ease-in-out ${delay}s ${FIGURE_CYCLES}`,
});

const caretStyle: CSSProperties = {
  animation: `figure-caret 1.1s steps(1, end) ${FIGURE_CYCLES}`,
};

const highlightStyle: CSSProperties = {
  animation: `figure-trace 3.4s linear ${FIGURE_CYCLES}`,
};

export const AiInputVisual = () => {
  const figureRef = useRef<SVGSVGElement>(null);

  // Plays its couple of cycles when it arrives and rests after, rather
  // than animating forever behind whatever you are actually reading.
  useReplayInView(figureRef);

  return (
    <svg
      aria-hidden="true"
      className={classes.root}
      data-figure=""
      fill="none"
      ref={figureRef}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="-128 -112 256 184"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Its own gradient rather than the platform's, so neither figure
            depends on the other being on the page. */}
        <linearGradient id="input-glass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-figure-glass-far)" />
          <stop offset="1" stopColor="var(--color-figure-glass-near)" />
        </linearGradient>
      </defs>

      {SPARKLES.map((sparkle) => (
        <path
          className={classes.sparkle}
          d={sparklePath(sparkle.cx, sparkle.cy, sparkle.r)}
          key={sparkle.r}
          style={twinkleStyle(sparkle.delay)}
        />
      ))}

      {REPLY_BARS.map((reply) => (
        <rect
          className={classes.fill}
          height={BAR_HEIGHT}
          key={reply.y}
          rx={BAR_HEIGHT / 2}
          width={reply.width}
          x={reply.x}
          y={reply.y}
        />
      ))}

      <path className={classes.field} d={FIELD_PATH} />

      {/* The typed question, with a caret sitting at the end of it. */}
      <rect
        className={classes.fill}
        height={BAR_HEIGHT}
        rx={BAR_HEIGHT / 2}
        width={84}
        x={-74}
        y={FIELD_MID - BAR_HEIGHT / 2}
      />
      <rect
        className={classes.caret}
        height={14}
        rx={0.8}
        style={caretStyle}
        width={1.6}
        x={13}
        y={FIELD_MID - 7}
      />

      <circle className={classes.field} cx={SEND.cx} cy={SEND.cy} r={SEND.r} />
      <path
        className={classes.mark}
        d={`M${SEND.cx} ${SEND.cy + 6.5}v-12M${SEND.cx - 5} ${
          SEND.cy - 1
        }l5-5 5 5`}
      />

      {/* pathLength normalises the border to 100 units, so the dash pattern is
          a percentage of the perimeter and the loop closes seamlessly. */}
      <path
        className={classes.highlight}
        d={FIELD_PATH}
        pathLength={100}
        style={highlightStyle}
      />
    </svg>
  );
};
