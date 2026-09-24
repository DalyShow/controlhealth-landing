"use client";

import { useReplayInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { roundedRectPath, sparklePath } from "@/lib/path";
import { type CSSProperties, useEffect, useRef, useState } from "react";

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

type AiPromptVisualProperties = {
  /** What is typed into the field, e.g. "How can we help". */
  prompt: string;
  /** False holds it undrawn; true draws the field in and types the prompt. */
  play: boolean;
};

/** How long the field takes to draw its outline before anything else. */
const PROMPT_DRAW_MS = 1200;

/** Milliseconds per character as the prompt types itself in. */
const PROMPT_TYPE_MS = 60;

/**
 * The field on its own: the width of the one above but slimmer, and
 * rounded fully at the ends, so it reads as a pill rather than a box.
 */
const PROMPT_FIELD = { x: -95, y: 16, width: 190, height: 34 } as const;
const PROMPT_RADIUS = PROMPT_FIELD.height / 2;
const PROMPT_MID = PROMPT_FIELD.y + PROMPT_RADIUS;

const PROMPT_FIELD_PATH = roundedRectPath(
  PROMPT_FIELD.x,
  PROMPT_FIELD.y,
  PROMPT_FIELD.width,
  PROMPT_FIELD.height,
  PROMPT_RADIUS
);

/** The send button, centred in the rounded end of the field. */
const PROMPT_SEND = {
  cx: PROMPT_FIELD.x + PROMPT_FIELD.width - PROMPT_RADIUS,
  cy: PROMPT_MID,
  r: 11,
} as const;

/** The prompt, set in from the rounded start of the field. */
const PROMPT_X = -76;

/** Space between the end of the prompt and the caret. */
const CARET_GAP = 2;

/** Width of the drawing box in its own units, for converting to pixels. */
const PROMPT_VIEW_WIDTH = 256;

/** The sparkles, gathered at the corner of the field now there is no reply. */
const PROMPT_SPARKLES = [
  { cx: -105, cy: 14, r: 4.5, delay: 0 },
  { cx: -112, cy: 6, r: 2.5, delay: -1.3 },
] as const;

/**
 * The AI input on its own, with no reply above it: its outline draws in,
 * the prompt types itself into the field, and once it is written the lit
 * segment starts running the border and the caret keeps blinking, waiting.
 * The same field, send button and sparkles as `AiInputVisual`.
 *
 * Drawn large, so its strokes are held at a true pixel rather than scaling
 * up with it: `--unit` is one screen pixel in the units of the drawing,
 * measured from the size it renders at, and the outline and the lit segment
 * are that wide.
 */
const promptClasses = {
  root: "block h-auto w-full overflow-visible",
  fieldDrawn:
    "stroke-figure-line-bright [fill:url(#prompt-glass)] [fill-opacity:1] [stroke-dasharray:100] [stroke-dashoffset:0] [stroke-width:var(--unit,0.4)] transition-[stroke-dashoffset,fill-opacity] duration-[1200ms] ease-out motion-reduce:transition-none",
  fieldHidden:
    "stroke-figure-line-bright [fill:url(#prompt-glass)] [fill-opacity:0] [stroke-dasharray:100] [stroke-dashoffset:100] [stroke-width:var(--unit,0.4)]",
  highlight:
    "fill-none stroke-figure-accent [filter:drop-shadow(0_0_calc(var(--unit,0.4)*2)_var(--color-figure-accent))] [stroke-dasharray:17_83] [stroke-width:var(--unit,0.4)]",
  sendShown:
    "opacity-100 transition-opacity delay-[900ms] duration-500 motion-reduce:transition-none",
  sendHidden: "opacity-0",
  sparkle:
    "fill-none stroke-figure-accent [stroke-width:var(--unit,0.4)] [transform-box:fill-box] [transform-origin:center]",
  send: "stroke-figure-line-bright [fill:url(#prompt-glass)] [stroke-width:var(--unit,0.4)]",
  prompt: "fill-primary-foreground font-sans [font-size:9px]",
} as const;

/** The prompt typed out a character at a time once the field has drawn. */
const useTyped = (prompt: string, play: boolean, still: boolean) => {
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (still) {
      setTyped(prompt.length);
      return;
    }

    if (!play) {
      setTyped(0);
      return;
    }

    if (typed >= prompt.length) {
      return;
    }

    const timer = window.setTimeout(
      () => setTyped((count) => count + 1),
      typed === 0 ? PROMPT_DRAW_MS : PROMPT_TYPE_MS
    );

    return () => window.clearTimeout(timer);
  }, [play, prompt.length, still, typed]);

  return typed;
};

export const AiPromptVisual = ({ prompt, play }: AiPromptVisualProperties) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const shown = play || prefersReducedMotion;
  const typed = useTyped(prompt, play, prefersReducedMotion);
  const [caretX, setCaretX] = useState(PROMPT_X);
  const written = typed >= prompt.length;

  // One screen pixel, in the units of the drawing, kept current as it resizes.
  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) {
      return;
    }

    const measure = () => {
      const width = svg.getBoundingClientRect().width;

      if (width > 0) {
        svg.style.setProperty("--unit", `${PROMPT_VIEW_WIDTH / width}`);
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(svg);

    return () => observer.disconnect();
  }, []);

  // The caret follows the end of what has been typed so far.
  useEffect(() => {
    const width =
      typed > 0 ? (textRef.current?.getComputedTextLength() ?? 0) : 0;
    setCaretX(PROMPT_X + width + (typed > 0 ? CARET_GAP : 0));
  }, [typed]);

  return (
    <svg
      aria-hidden="true"
      className={promptClasses.root}
      data-figure=""
      fill="none"
      ref={svgRef}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox={`-128 -8 ${PROMPT_VIEW_WIDTH} 66`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="prompt-glass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-figure-glass-far)" />
          <stop offset="1" stopColor="var(--color-figure-glass-near)" />
        </linearGradient>
      </defs>

      {shown
        ? PROMPT_SPARKLES.map((sparkle) => (
            <path
              className={promptClasses.sparkle}
              d={sparklePath(sparkle.cx, sparkle.cy, sparkle.r)}
              key={sparkle.r}
              style={{
                animation: `figure-twinkle ${TWINKLE_S}s ease-in-out ${sparkle.delay}s infinite`,
              }}
            />
          ))
        : null}

      <path
        className={shown ? promptClasses.fieldDrawn : promptClasses.fieldHidden}
        d={PROMPT_FIELD_PATH}
        pathLength={100}
      />

      <text
        className={promptClasses.prompt}
        dominantBaseline="central"
        ref={textRef}
        x={PROMPT_X}
        y={PROMPT_MID}
      >
        {prompt.slice(0, typed)}
      </text>
      {shown ? (
        <rect
          className={classes.caret}
          height={12}
          rx={0.8}
          style={{
            animation: written
              ? "figure-caret 1.1s steps(1, end) infinite"
              : "none",
          }}
          width={1.6}
          x={caretX}
          y={PROMPT_MID - 6}
        />
      ) : null}

      <g className={shown ? promptClasses.sendShown : promptClasses.sendHidden}>
        <circle
          className={promptClasses.send}
          cx={PROMPT_SEND.cx}
          cy={PROMPT_SEND.cy}
          r={PROMPT_SEND.r}
        />
        <path
          className={classes.mark}
          d={`M${PROMPT_SEND.cx} ${PROMPT_SEND.cy + 5.5}v-10M${
            PROMPT_SEND.cx - 4.2
          } ${PROMPT_SEND.cy - 0.8}l4.2-4.2 4.2 4.2`}
        />
      </g>

      {written ? (
        <path
          className={promptClasses.highlight}
          d={PROMPT_FIELD_PATH}
          pathLength={100}
          style={{ animation: "figure-trace 3.4s linear infinite" }}
        />
      ) : null}
    </svg>
  );
};
