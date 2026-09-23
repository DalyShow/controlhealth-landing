"use client";

import { useEffect, useRef } from "react";

type Rgb = readonly [number, number, number];

type Pick = {
  x: number;
  y: number;
  tone: Rgb;
};

/** Everything a frame needs, measured once per layout and once per tick. */
type Scene = {
  width: number;
  height: number;
  cols: number;
  rows: number;
  originX: number;
  dot: number;
  picks: Pick[];
  /** When the first round begins, on the document timeline, in ms. */
  firstSweepAt: number;
  /** Seconds into the current round, or null before the first sweep. */
  roundTime: number | null;
  /** 0 to 1 while the scan is crossing, outside that range otherwise. */
  sweep: number;
  scanX: number;
  /** 1 while the picks hold, falling to 0 as they clear for the next round. */
  clear: number;
  still: boolean;
};

/**
 * The primary ramp from the design system. A canvas cannot read Tailwind
 * classes, and theme variables are only emitted when something uses them, so
 * the steps this field draws with are restated here by token name.
 */
const RAMP = {
  900: [52, 66, 116],
  700: [68, 92, 177],
  600: [78, 110, 194],
  500: [98, 135, 207],
  400: [128, 165, 218],
  300: [169, 196, 231],
} as const satisfies Record<number, Rgb>;

/** `--color-spectrum-mint` and `--color-spectrum-blush`. */
const SPECTRUM_MINT = [129, 255, 214] as const satisfies Rgb;
const SPECTRUM_BLUSH = [252, 209, 222] as const satisfies Rgb;

const mix = (from: Rgb, to: Rgb, amount: number): Rgb => [
  Math.round(from[0] + (to[0] - from[0]) * amount),
  Math.round(from[1] + (to[1] - from[1]) * amount),
  Math.round(from[2] + (to[2] - from[2]) * amount),
];

const rgba = (tone: Rgb, alpha: number) =>
  `rgba(${tone[0]},${tone[1]},${tone[2]},${alpha})`;

/**
 * Colours for the picks, weighted rather than cycled so they do not fall into
 * a visible rhythm across the field. Blue from the ramp stays just over half.
 * Teal and pink are the brand spectrum's cool and soft ends, each at full
 * strength and as a step leaning toward the ramp, so the accents belong to
 * the field rather than sitting on top of it.
 */
const PICK_PALETTE = [
  [RAMP[500], 3],
  [RAMP[400], 3],
  [RAMP[300], 2],
  [SPECTRUM_MINT, 2],
  [mix(SPECTRUM_MINT, RAMP[500], 0.35), 2],
  [SPECTRUM_BLUSH, 2],
  [mix(SPECTRUM_BLUSH, RAMP[300], 0.3), 1],
] as const satisfies (readonly [Rgb, number])[];

const PALETTE_WEIGHT = PICK_PALETTE.reduce((total, [, w]) => total + w, 0);

/** Distance between markers, in CSS pixels. */
const PITCH = 26;

/** One marker lit for every biomarker on the strip. */
const PICK_COUNT = 40;

/**
 * Picks stay in the lower two thirds of the field. The mask has faded the top
 * third close to nothing, where a lit marker would only read as a smudge.
 */
const PICK_ROW_SHARE = 0.68;

/**
 * Used only if the field's entrance cannot be read, which should not happen:
 * the first scan is otherwise timed off the field's own fade (see
 * `firstSweepAt`), so the theme's `hero-field` token is the single source.
 */
const FALLBACK_FIRST_SWEEP_MS = 6800;

const SWEEP_FROM_S = 0.3;
const SWEEP_S = 5.5;
const HOLD_S = 2.4;
const CLEAR_S = 1.1;
const ROUND_S = SWEEP_FROM_S + SWEEP_S + HOLD_S + CLEAR_S + 1.2;

const LIGHT_UP_S = 0.35;
const HALO_S = 1.1;

/** How far past each edge the scan starts and ends, so it enters and leaves. */
const SCAN_OVERSHOOT = 40;

/** Glow falloff around the scan: a long tail behind it, a sharp edge ahead. */
const TRAIL_PX = 170;
const LEAD_PX = 26;

const GRID_ALPHA = 0.5;
const GRID_GLOW_ALPHA = 0.35;
const PICK_ALPHA = 0.82;
const BLOOM_ALPHA = 0.26;
const HALO_ALPHA = 0.55;
const SCAN_WASH_ALPHA = 0.22;
const SCAN_LINE_ALPHA = 0.9;

const DOT_RATIO = 0.088;
const DOT_MIN = 1.6;
const PICK_SCALE = 1.45;
const BLOOM_SCALE = 6;
const HALO_REACH = 8;
const SCAN_WASH_PX = 90;
const SCAN_LINE_PX = 1.5;

/** Share of the sweep at each end over which the scan fades in and out. */
const SCAN_FADE = 0.06;

const DPR_CAP = 2;

const PLACEMENT_SEED = 1290;
const TONE_SEED = 4374;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const easeOut = (value: number) => 1 - (1 - clamp01(value)) ** 3;

/**
 * The scan eases off as it reaches the far edge. Each pick fires when the line
 * actually reaches it, so the pick's moment is found by inverting that curve
 * rather than by assuming a linear crossing.
 */
const sweepPositionAt = (progress: number) => easeOut(progress * 0.98 + 0.01);
const progressAtPosition = (position: number) =>
  clamp01((1 - Math.cbrt(1 - clamp01(position)) - 0.01) / 0.98);

/** Deterministic, so the picks land in the same places on every visit. */
const seeded = (seed: number) => {
  let state = seed;

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
};

const toneFor = (roll: number): Rgb => {
  let remaining = roll * PALETTE_WEIGHT;

  for (const [tone, weight] of PICK_PALETTE) {
    remaining -= weight;

    if (remaining < 0) {
      return tone;
    }
  }

  return PICK_PALETTE[0][0];
};

const placePicks = (
  height: number,
  cols: number,
  rows: number,
  originX: number
) => {
  const place = seeded(PLACEMENT_SEED);
  const tone = seeded(TONE_SEED);
  const pickRows = Math.max(1, Math.floor(rows * PICK_ROW_SHARE));
  const wanted = Math.min(PICK_COUNT, cols * pickRows);
  const taken = new Set<number>();
  const picks: Pick[] = [];

  while (picks.length < wanted) {
    const col = Math.floor(place() * cols);
    const row = Math.floor(place() * pickRows);
    const key = row * cols + col;

    if (taken.has(key)) {
      continue;
    }

    taken.add(key);
    picks.push({
      x: originX + col * PITCH,
      y: height - (row + 0.5) * PITCH,
      tone: toneFor(tone()),
    });
  }

  return picks;
};

/** How strongly the scan lights a column at `x`. */
const glowAt = (scene: Scene, x: number) => {
  if (scene.sweep < 0 || scene.sweep > 1) {
    return 0;
  }

  const distance = x - scene.scanX;

  return distance <= 0
    ? Math.exp(distance / TRAIL_PX)
    : Math.exp(-distance / LEAD_PX);
};

const drawGrid = (ctx: CanvasRenderingContext2D, scene: Scene) => {
  ctx.lineWidth = 1.15;

  for (let col = 0; col < scene.cols; col += 1) {
    const x = scene.originX + col * PITCH;
    const glow = glowAt(scene, x);

    ctx.strokeStyle = rgba(
      mix(RAMP[900], RAMP[600], glow),
      GRID_ALPHA + GRID_GLOW_ALPHA * glow
    );
    ctx.beginPath();

    for (let row = 0; row < scene.rows; row += 1) {
      const y = scene.height - (row + 0.5) * PITCH;

      ctx.moveTo(x + scene.dot, y);
      ctx.arc(x, y, scene.dot, 0, Math.PI * 2);
    }

    ctx.stroke();
  }
};

/** Seconds since the scan reached this pick, or null if it has not yet. */
const hitAgeOf = (scene: Scene, pick: Pick) => {
  if (scene.roundTime === null) {
    return null;
  }

  const position =
    (pick.x + SCAN_OVERSHOOT) / (scene.width + SCAN_OVERSHOOT * 2);
  const age =
    scene.roundTime - (SWEEP_FROM_S + SWEEP_S * progressAtPosition(position));

  return age < 0 ? null : age;
};

const drawPick = (
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  pick: Pick,
  age: number | null
) => {
  // A still frame shows the finished picture; otherwise a pick brightens as
  // the scan reaches it and dims as the round clears.
  const lit = scene.still ? 1 : clamp01((age ?? 0) / LIGHT_UP_S) * scene.clear;
  // The halo it is lifted out of the grid with, as in the lab-panel figure.
  if (age !== null && age < HALO_S) {
    const progress = age / HALO_S;

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = rgba(pick.tone, HALO_ALPHA * (1 - progress));
    ctx.beginPath();
    ctx.arc(
      pick.x,
      pick.y,
      scene.dot + progress * scene.dot * HALO_REACH,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  const bloomRadius = scene.dot * BLOOM_SCALE;
  const bloom = ctx.createRadialGradient(
    pick.x,
    pick.y,
    0,
    pick.x,
    pick.y,
    bloomRadius
  );

  bloom.addColorStop(0, rgba(pick.tone, BLOOM_ALPHA * lit));
  bloom.addColorStop(1, rgba(pick.tone, 0));
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(pick.x, pick.y, bloomRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = rgba(pick.tone, PICK_ALPHA * lit);
  ctx.beginPath();
  ctx.arc(pick.x, pick.y, scene.dot * PICK_SCALE, 0, Math.PI * 2);
  ctx.fill();
};

const drawPicks = (ctx: CanvasRenderingContext2D, scene: Scene) => {
  for (const pick of scene.picks) {
    const age = scene.still ? null : hitAgeOf(scene, pick);

    // Not yet reached by the scan this round.
    if (!scene.still && age === null) {
      continue;
    }

    drawPick(ctx, scene, pick, age);
  }
};

const drawScan = (ctx: CanvasRenderingContext2D, scene: Scene) => {
  if (scene.sweep < 0 || scene.sweep > 1) {
    return;
  }

  const fade = Math.min(
    1,
    scene.sweep / SCAN_FADE,
    (1 - scene.sweep) / SCAN_FADE
  );
  const wash = ctx.createLinearGradient(
    scene.scanX - SCAN_WASH_PX,
    0,
    scene.scanX + 6,
    0
  );

  wash.addColorStop(0, rgba(RAMP[700], 0));
  wash.addColorStop(1, rgba(RAMP[700], SCAN_WASH_ALPHA * fade));
  ctx.fillStyle = wash;
  ctx.fillRect(scene.scanX - SCAN_WASH_PX, 0, SCAN_WASH_PX + 6, scene.height);

  ctx.fillStyle = rgba(RAMP[400], SCAN_LINE_ALPHA * fade);
  ctx.fillRect(scene.scanX - SCAN_LINE_PX / 2, 0, SCAN_LINE_PX, scene.height);
};

/**
 * The moment the field's fade-in finishes, on the document timeline — the
 * same clock CSS animations and requestAnimationFrame both run on. The scan
 * starts there, so however the theme re-times the entrance, the first sweep
 * follows the fade rather than a number that has to be kept in step with it.
 * Read from the running animation rather than from mount, because the page
 * may hydrate after the CSS has already started it.
 */
const firstSweepAt = (canvas: HTMLCanvasElement) => {
  const fade = canvas.getAnimations()[0];
  const timing = fade?.effect?.getTiming();
  const start = fade?.startTime;

  if (!(fade && timing && typeof start === "number")) {
    return performance.now() + FALLBACK_FIRST_SWEEP_MS;
  }

  const duration = typeof timing.duration === "number" ? timing.duration : 0;

  return start + (timing.delay ?? 0) + duration;
};

/** Where the round is at `now`, a document-timeline timestamp in ms. */
const advance = (scene: Scene, now: number) => {
  if (scene.still || now < scene.firstSweepAt) {
    scene.roundTime = null;
    scene.sweep = -1;
    scene.clear = 1;
    return;
  }

  const roundTime = ((now - scene.firstSweepAt) / 1000) % ROUND_S;
  const sweep = (roundTime - SWEEP_FROM_S) / SWEEP_S;
  const clearFrom = SWEEP_FROM_S + SWEEP_S + HOLD_S;

  scene.roundTime = roundTime;
  scene.sweep = sweep;
  scene.scanX =
    -SCAN_OVERSHOOT +
    (scene.width + SCAN_OVERSHOOT * 2) * sweepPositionAt(sweep);
  scene.clear =
    roundTime < clearFrom ? 1 : clamp01(1 - (roundTime - clearFrom) / CLEAR_S);
};

/**
 * A full-width take on the lab-panel figure from How it works: an outlined
 * grid of everything measurable, a scan that crosses it, and the markers that
 * matter lifting out of it with a halo as it passes. The finished picture
 * holds, clears, and the round begins again.
 *
 * Drawn on one canvas rather than as a thousand elements, and it only draws
 * while it is on screen and the tab is visible. It answers nothing: it is a
 * background, and the pointer belongs to the copy in front of it.
 */
const classes = {
  root: "absolute inset-x-0 bottom-0 z-0 block h-[70%] w-full animate-hero-field mask-field-rise motion-reduce:animate-none",
} as const;

export const ScanField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!(canvas && ctx)) {
      return;
    }

    const scene: Scene = {
      width: 0,
      height: 0,
      cols: 0,
      rows: 0,
      originX: 0,
      dot: DOT_MIN,
      picks: [],
      firstSweepAt: Number.POSITIVE_INFINITY,
      roundTime: null,
      sweep: -1,
      scanX: 0,
      clear: 1,
      still: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };

    let frame = 0;
    let live = false;

    const draw = () => {
      ctx.clearRect(0, 0, scene.width, scene.height);
      drawGrid(ctx, scene);
      drawPicks(ctx, scene);
      drawScan(ctx, scene);
    };

    const layout = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

      scene.width = box.width;
      scene.height = box.height;

      if (!(box.width && box.height)) {
        return;
      }

      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      scene.cols = Math.floor(box.width / PITCH);
      scene.rows = Math.floor(box.height / PITCH);
      scene.originX = (box.width - (scene.cols - 1) * PITCH) / 2;
      scene.dot = Math.max(DOT_MIN, PITCH * DOT_RATIO);
      scene.picks = placePicks(
        box.height,
        scene.cols,
        scene.rows,
        scene.originX
      );

      // A still frame has nothing to redraw it, so paint it now.
      if (scene.still) {
        draw();
      }
    };

    const tick = (now: number) => {
      advance(scene, now);
      draw();

      if (live) {
        frame = requestAnimationFrame(tick);
      }
    };

    const setLive = (on: boolean) => {
      if (on === live || scene.still) {
        return;
      }

      live = on;

      if (on) {
        frame = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(frame);
      }
    };

    let onScreen = false;

    const sync = () => setLive(onScreen && !document.hidden);

    const resizeObserver = new ResizeObserver(layout);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      sync();
    });

    scene.firstSweepAt = firstSweepAt(canvas);

    resizeObserver.observe(canvas);
    visibilityObserver.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    layout();

    return () => {
      live = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: a canvas is not focusable without a tabindex, and this one is decoration, so it stays out of the accessibility tree
    <canvas aria-hidden="true" className={classes.root} ref={canvasRef} />
  );
};
