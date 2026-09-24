"use client";

import { useReplayInView } from "@/hooks/use-in-view";
import { roundedRectPath } from "@/lib/path";
import { type CSSProperties, useRef } from "react";

type Pick = {
  /** Position in the grid of everything measurable. */
  col: number;
  row: number;
  /** Where this marker sits along its reference range, 0 to 1. */
  value: number;
};

/** One keyframe stop: its percentage through the cycle, and its declarations. */
type Stop = [number, string];

const CYCLE_S = 8;

const GRID_COLS = 7;
const GRID_ROWS = 4;
const GRID_PITCH_X = 22;
const GRID_PITCH_Y = 18;
const GRID_LEFT = -66;
const GRID_TOP = -100;

/** The window the scan runs in, as percentages of the cycle. */
const SWEEP_FROM = 8;
const SWEEP_TO = 26;

/**
 * Listed in column order, which is the order the scan reaches them, so the
 * picks land in the panel top to bottom as they are chosen.
 */
const PICKS = [
  { col: 1, row: 2, value: 0.55 },
  { col: 2, row: 0, value: 0.18 },
  { col: 4, row: 3, value: 0.67 },
  { col: 5, row: 1, value: 0.47 },
] satisfies Pick[];

/** The optimal window on every reference range, as a fraction of the track. */
const BAND_FROM = 0.42;
const BAND_TO = 0.72;

const PANEL = { x: -100, y: -18, width: 192, height: 114, radius: 16 } as const;

/**
 * Compact, the grid is scanned inside the panel rather than above it: moved
 * down this far, it sits centred in the card, which fills in only once the
 * grid has faded, so the whole figure happens in one place.
 */
const COMPACT_SHIFT = 112;

/** The drawing box for each layout: compact is cropped to the card alone. */
const VIEW_BOX = {
  full: "-128 -124 256 228",
  compact: "-106 -26 204 130",
} as const;

const ROW_Y = [0, 26, 52, 78] as const;

/** Varied so the rows read as different markers rather than one repeated row. */
const LABEL_W = [40, 52, 34, 46] as const;

const MARKER_X = -88;
const TRACK_X = -26;
const TRACK_W = 104;

/** Where a value enters its track before sliding to its reading. */
const TRACK_ENTRY = TRACK_X + 4;

const gridX = (col: number) => GRID_LEFT + col * GRID_PITCH_X;
const gridY = (row: number) => GRID_TOP + row * GRID_PITCH_Y;
const trackAt = (fraction: number) => TRACK_X + fraction * TRACK_W;

/** The moment, as a percentage of the cycle, the scan reaches a column. */
const sweepAt = (col: number) =>
  SWEEP_FROM + (col / (GRID_COLS - 1)) * (SWEEP_TO - SWEEP_FROM);

const round = (value: number) => Math.round(value * 100) / 100;

const keyframes = (name: string, stops: Stop[]) =>
  `@keyframes ${name}{${stops
    .map(([at, declarations]) => `${round(at)}%{${declarations}}`)
    .join("")}}`;

/**
 * The picks, one set of keyframes per layout: each starts on its place in
 * the grid, `shift` down for the compact layout, and travels to its row.
 */
const pickFrames = (name: string, shift: number) => [
  // Each pick lives at its panel position and is offset back onto the grid
  // for the first half of the cycle. That way the resting state is the
  // finished panel, and reduced motion needs nothing but the scan hidden.
  ...PICKS.map((pick, index) => {
    const hit = sweepAt(pick.col);
    const at = `translate:${round(gridX(pick.col) - MARKER_X)}px ${round(
      gridY(pick.row) + shift - (ROW_Y[index] ?? 0)
    )}px`;
    const moveStart = 40 + index * 2;
    const moveEnd = 54 + index * 2;
    const loose = "fill:transparent;stroke:var(--color-figure-line-dim)";
    const lit =
      "fill:var(--color-figure-accent);stroke:var(--color-figure-accent)";
    const placed =
      "fill:var(--color-figure-line-bright);stroke:var(--color-figure-line-bright)";

    return keyframes(`${name}-${index}`, [
      [0, `opacity:0;scale:1;${at};${loose}`],
      [4, "opacity:0.5"],
      [hit, `opacity:0.5;scale:1;${loose}`],
      [hit + 3, `opacity:1;scale:1.8;${lit}`],
      [hit + 8, "scale:1.35"],
      [moveStart, `scale:1.35;${at}`],
      [moveEnd, "scale:1;translate:0 0"],
      // Cools once placed, leaving the accent to mean selection and the flag.
      [moveEnd + 6, placed],
      [92, "opacity:1;translate:0 0"],
      [96, "opacity:0"],
      [100, "opacity:0;translate:0 0"],
    ]);
  }),
];

/**
 * Every part of the figure is timed as a percentage of one shared cycle, so
 * the whole sequence stays in step without a timer and without any JavaScript
 * running per frame. The percentages depend on where each element sits, so
 * the keyframes are generated alongside the drawing rather than written out
 * by hand — deterministically, at module scope, so the markup is stable.
 */
const LAB_KEYFRAMES = [
  // Columns brighten as the scan passes, then fall away unselected. Timing
  // depends only on the column, so the 24 loose markers share seven sets.
  ...Array.from({ length: GRID_COLS }, (_, col) =>
    keyframes(`lab-scan-${col}`, [
      [0, "opacity:0"],
      [4, "opacity:0.5"],
      [sweepAt(col), "opacity:0.5"],
      [sweepAt(col) + 2, "opacity:0.85"],
      [34, "opacity:0.5"],
      [44, "opacity:0"],
      [100, "opacity:0"],
    ])
  ),

  // A halo left behind at the grid position each pick is lifted out of.
  ...PICKS.map((pick, index) => {
    const hit = sweepAt(pick.col);

    return keyframes(`lab-halo-${index}`, [
      [0, "opacity:0;scale:0.5"],
      [hit, "opacity:0;scale:0.5"],
      [hit + 1, "opacity:0.6;scale:0.7"],
      [hit + 10, "opacity:0;scale:3"],
      [100, "opacity:0;scale:3"],
    ]);
  }),

  keyframes("lab-sweep", [
    [0, "opacity:0;translate:-84px 0"],
    [SWEEP_FROM - 2, "opacity:0;translate:-84px 0"],
    [SWEEP_FROM, "opacity:0.9"],
    [SWEEP_TO, "opacity:0.9"],
    [SWEEP_TO + 3, "opacity:0;translate:84px 0"],
    [100, "opacity:0;translate:84px 0"],
  ]),

  // The card stays put as the destination rather than popping in, but sits
  // back until there is something in it.
  keyframes("lab-card", [
    [0, "opacity:0.35"],
    [48, "opacity:0.35"],
    [62, "opacity:1"],
    [92, "opacity:1"],
    [100, "opacity:0.35"],
  ]),

  ...ROW_Y.map((_, index) => {
    const from = 52 + index * 3;

    return keyframes(`lab-row-${index}`, [
      [0, "opacity:0"],
      [from, "opacity:0"],
      [from + 8, "opacity:1"],
      [92, "opacity:1"],
      [96, "opacity:0"],
      [100, "opacity:0"],
    ]);
  }),

  // Values ride in from the low end of their track and settle, so the row
  // reads as being measured rather than simply drawn.
  ...PICKS.map((pick, index) => {
    const slide = trackAt(pick.value) - TRACK_ENTRY;
    const from = 62 + index * 3;
    const start = `translate:${round(-slide)}px 0`;

    return keyframes(`lab-value-${index}`, [
      [0, `opacity:0;${start}`],
      [from, `opacity:0;${start}`],
      [from + 2, "opacity:1"],
      [from + 11, "opacity:1;translate:0 0"],
      [92, "opacity:1;translate:0 0"],
      [96, "opacity:0"],
      [100, "opacity:0;translate:0 0"],
    ]);
  }),

  ...pickFrames("lab-pick", 0),
  ...pickFrames("lab-pick-compact", COMPACT_SHIFT),
].join("");

/**
 * "Take action with personalized lab panels" — a grid of everything
 * measurable, scanned, narrowed to four markers, and assembled into a panel
 * with one reading outside its reference range.
 */
/**
 * Cycles a figure plays when it comes into view before resting. Running
 * every timeline on the page forever costs frames for motion nobody is
 * looking at.
 */
const FIGURE_CYCLES = 2;

const classes = {
  root: "block h-auto w-full max-w-figure",
  dot: "fill-transparent stroke-figure-line-dim [stroke-width:1.01]",
  halo: "fill-none stroke-figure-accent [stroke-width:1.01] [transform-box:fill-box] [transform-origin:center]",
  sweep:
    "stroke-figure-accent [stroke-width:1.26] [filter:drop-shadow(0_0_4px_var(--color-figure-accent))]",
  card: "stroke-figure-line-bright [fill:url(#panel-glass)] [stroke-width:0.63]",
  label: "fill-figure-line-dim",
  track: "fill-figure-line-dim",
  band: "fill-figure-line opacity-55",
  value:
    "fill-figure-line-bright [transform-box:fill-box] [transform-origin:center]",
  flag: "fill-figure-accent [filter:drop-shadow(0_0_4px_var(--color-figure-accent))]",
  pick: "fill-figure-line-bright stroke-figure-line-bright [stroke-width:1.01] [transform-box:fill-box] [transform-origin:center]",
} as const;

/**
 * Plays a keyframe set for the figure's cycles. The parts that make up the
 * finished panel rest on their own styles once the cycles end, which are the
 * finished panel. The scan's parts (`hold`) instead keep the last frame, in
 * which they have faded out: left to fall back to their own styles, the grid,
 * its halos and the sweep would reappear over the resting panel.
 */
const runs = (
  name: string,
  easing = "linear",
  hold = false
): CSSProperties => ({
  animation: `${name} ${CYCLE_S}s ${easing} ${FIGURE_CYCLES}${hold ? " forwards" : ""}`,
});

const EASE_SETTLE = "cubic-bezier(.22,.9,.3,1)";
const EASE_CARRY = "cubic-bezier(.4,0,.2,1)";

const PICKED = new Set(PICKS.map((pick) => `${pick.col}:${pick.row}`));

/** The 24 markers the scan reads but does not choose. */
const LOOSE = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => ({
  col: index % GRID_COLS,
  row: Math.floor(index / GRID_COLS),
})).filter(({ col, row }) => !PICKED.has(`${col}:${row}`));

const CARD_PATH = roundedRectPath(
  PANEL.x,
  PANEL.y,
  PANEL.width,
  PANEL.height,
  PANEL.radius
);

const isFlagged = (value: number) => value < BAND_FROM || value > BAND_TO;

type LabPanelVisualProperties = {
  /**
   * Scan the grid inside the panel instead of above it, so the figure plays
   * out in one place, cropped to the card, for a widget or a tight space.
   * The card then has no fill or outline of its own, and sits on the glass
   * of whatever holds it.
   */
  compact?: boolean;
};

export const LabPanelVisual = ({
  compact = false,
}: LabPanelVisualProperties) => {
  const figureRef = useRef<SVGSVGElement>(null);

  // Plays its couple of cycles when it arrives and rests after, rather
  // than animating forever behind whatever you are actually reading.
  useReplayInView(figureRef);

  // Compact, the figure sits on the glass of whatever holds it, so the card
  // has no pane of its own: only its rows are drawn.
  const cardPane = compact ? null : (
    <path className={classes.card} d={CARD_PATH} />
  );

  // The panel the picks assemble into.
  const cardLayer = (
    <g style={runs("lab-card")}>
      {cardPane}

      {ROW_Y.map((y, index) => (
        <g key={y} style={runs(`lab-row-${index}`)}>
          <rect
            className={classes.label}
            height={5}
            rx={2.5}
            width={LABEL_W[index]}
            x={-76}
            y={y - 2.5}
          />
          {/* A thin rule for the full range, a thicker segment for the
              window, so the row reads as a reference range and not a bar. */}
          <rect
            className={classes.track}
            height={1.5}
            rx={0.75}
            width={TRACK_W}
            x={TRACK_X}
            y={y - 0.75}
          />
          <rect
            className={classes.band}
            height={5}
            rx={2.5}
            width={(BAND_TO - BAND_FROM) * TRACK_W}
            x={trackAt(BAND_FROM)}
            y={y - 2.5}
          />
        </g>
      ))}
    </g>
  );

  // The card goes under the grid when the two share a place, and after it,
  // below, when they do not.
  const cardUnder = compact ? cardLayer : null;
  const cardOver = compact ? null : cardLayer;
  const gridShift = `translate(0 ${compact ? COMPACT_SHIFT : 0})`;

  return (
    <svg
      aria-hidden="true"
      className={classes.root}
      data-figure=""
      fill="none"
      ref={figureRef}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox={compact ? VIEW_BOX.compact : VIEW_BOX.full}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="panel-glass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-figure-glass-far)" />
          <stop offset="1" stopColor="var(--color-figure-glass-near)" />
        </linearGradient>
      </defs>

      <style>{LAB_KEYFRAMES}</style>

      {/* Compact, the card is laid first and the grid is scanned over its dim
          glass, moved down into it; otherwise the grid is above the card. */}
      {cardUnder}

      {/* Everything that could be measured, and the scan reading across it. */}
      <g transform={gridShift}>
        <g data-figure-transient="">
          {LOOSE.map(({ col, row }) => (
            <circle
              className={classes.dot}
              cx={gridX(col)}
              cy={gridY(row)}
              key={`${col}-${row}`}
              r={3}
              style={runs(`lab-scan-${col}`, "linear", true)}
            />
          ))}

          {PICKS.map((pick, index) => (
            <circle
              className={classes.halo}
              cx={gridX(pick.col)}
              cy={gridY(pick.row)}
              key={`${pick.col}-${pick.row}`}
              r={3}
              style={runs(`lab-halo-${index}`, "ease-out", true)}
            />
          ))}

          <line
            className={classes.sweep}
            style={runs("lab-sweep", "linear", true)}
            x1={0}
            x2={0}
            y1={-112}
            y2={-34}
          />
        </g>
      </g>

      {cardOver}

      {PICKS.map((pick, index) => (
        <circle
          className={
            isFlagged(pick.value)
              ? `${classes.value} ${classes.flag}`
              : classes.value
          }
          cx={trackAt(pick.value)}
          cy={ROW_Y[index]}
          key={`value-${pick.col}`}
          r={3.4}
          style={runs(`lab-value-${index}`, EASE_SETTLE)}
        />
      ))}

      {PICKS.map((pick, index) => (
        <circle
          className={classes.pick}
          cx={MARKER_X}
          cy={ROW_Y[index]}
          key={`pick-${pick.col}`}
          r={3.4}
          style={runs(
            `${compact ? "lab-pick-compact" : "lab-pick"}-${index}`,
            EASE_CARRY
          )}
        />
      ))}
    </svg>
  );
};
