"use client";

import {
  MARK_CORE,
  MARK_POINTS,
  MARK_SILHOUETTE,
  MARK_SIZE,
} from "@/lib/brand-mark";
import { useEffect, useRef } from "react";

type ParticleMarkProperties = {
  /** Rendered width of the mark itself, in CSS pixels. */
  size: number;
  /** Read to anyone who cannot see it. */
  label: string;
};

type Mote = {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Eight independent draws, so no two of a mote's traits correlate. */
  s: number[];
  live: boolean;
};

/** Outward impulse each mote leaves with, in mark units per second. */
const IMPULSE = 90;

/** Upward kick on that impulse, so the cloud rises before it falls. */
const LIFT = 70;

/** Downward acceleration, in mark units per second squared. */
const GRAVITY = 320;

/** When the spring that gathers the motes home begins, in milliseconds. */
const GATHER_MS = 420;

/** How long that spring takes to reach full strength. */
const GATHER_RAMP_MS = 420;

const SPRING = 22;
const DAMPING = 3.4;

/**
 * How far each mote's own mass, spring, damping, launch moment and aim stray
 * from the mean. At zero the cloud moves as one body, which reads as a single
 * object breaking rather than as a cloud of separate specks.
 */
const VARIANCE = 0.7;

const MOTE_RADIUS = 1.3;
const SIZE_RANGE = 0.55;
const OPACITY_RANGE = 0.55;
const LAUNCH_SPREAD_MS = 170;

/** The canvas is wider than the mark, because the cloud travels past it. */
const BOX_RATIO = 2.1;

/** Cap the backing store: past 2x the extra pixels buy nothing. */
const MAX_DPR = 2;

const CENTRE = MARK_SIZE / 2;

/**
 * Deterministic hash in 0..1, seeded from the point itself rather than from a
 * random source, so a mote's character is a property of where it sits.
 */
const hash = (x: number, y: number, salt: number) => {
  const value = Math.sin(x * 12.9898 + y * 78.233 + salt * 37.719) * 43_758.545;

  return value - Math.floor(value);
};

const makeMotes = (): Mote[] =>
  MARK_POINTS.map(([x, y]) => ({
    hx: x,
    hy: y,
    x,
    y,
    vx: 0,
    vy: 0,
    s: Array.from({ length: 8 }, (_, index) => hash(x, y, index + 1)),
    live: false,
  }));

const traits = (mote: Mote) => ({
  mass: 1 + ((mote.s[3] ?? 0) - 0.5) * 1.7 * VARIANCE,
  spring: 1 + ((mote.s[4] ?? 0) - 0.5) * 1.1 * VARIANCE,
  damp: 1 + ((mote.s[5] ?? 0) - 0.5) * 1.1 * VARIANCE,
  launch: (mote.s[6] ?? 0) * LAUNCH_SPREAD_MS * VARIANCE,
  gather: ((mote.s[7] ?? 0) - 0.5) * 340 * VARIANCE,
  radius: MOTE_RADIUS * (1 + ((mote.s[0] ?? 0) - 0.5) * 2 * SIZE_RANGE),
  alpha: 1 - OPACITY_RANGE * (mote.s[2] ?? 0),
});

/**
 * The brand mark, which blows apart on hover and rebuilds itself.
 *
 * Gravity is acceleration rather than a curve between two states, so positions
 * are integrated every frame instead of tweened — which rules out CSS and
 * means a canvas. Each mote then carries its own mass, spring, damping, launch
 * moment, aim, size and opacity, so none of them travels the same arc or
 * arrives at the same time.
 */
const classes = {
  root: "block",
  canvas: "block cursor-pointer",
} as const;

export const ParticleMark = ({ size, label }: ParticleMarkProperties) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!(canvas && context)) {
      return;
    }

    // Colour comes from the tokens rather than being restated here, since a
    // canvas cannot inherit it.
    const styles = getComputedStyle(canvas);
    const ink = styles.getPropertyValue("--color-primary-foreground");
    const accent = styles.getPropertyValue("--color-figure-accent");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const boxPx = Math.round(size * BOX_RATIO);
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    canvas.width = boxPx * dpr;
    canvas.height = boxPx * dpr;
    canvas.style.width = `${boxPx}px`;
    canvas.style.height = `${boxPx}px`;

    const scale = (size / MARK_SIZE) * dpr;
    const offset = ((boxPx - size) / 2) * dpr;
    const silhouette = new Path2D(MARK_SILHOUETTE);
    const core = new Path2D(MARK_CORE);
    const motes = makeMotes();

    let running = false;
    let hovered = false;
    let startedAt = 0;
    let lastAt = 0;
    let solidAlpha = 1;
    let cloudAlpha = 0;
    let handle = 0;

    const kick = (mote: Mote) => {
      const fromX = mote.hx - CENTRE;
      const fromY = mote.hy - CENTRE;
      // Aim wanders off pure radial, or every mote leaves on the same spoke.
      const angle =
        Math.atan2(fromY, fromX) + ((mote.s[1] ?? 0) - 0.5) * 1.1 * VARIANCE;
      const power = IMPULSE * (0.5 + (mote.s[0] ?? 0) * (0.6 + VARIANCE));

      mote.vx = Math.cos(angle) * power;
      mote.vy = Math.sin(angle) * power - LIFT * (0.4 + (mote.s[2] ?? 0) * 1.2);
      mote.live = true;
    };

    /** Integrates one mote for one frame, and says whether it has come to rest. */
    const advance = (mote: Mote, dt: number, elapsed: number) => {
      const t = traits(mote);

      if (!mote.live) {
        if (elapsed < t.launch) {
          return false;
        }
        kick(mote);
      }

      // The spring ramps in rather than switching on, so the motes are still
      // falling as they start being reeled back.
      const pull = Math.max(
        0,
        Math.min(1, (elapsed - GATHER_MS - t.gather) / GATHER_RAMP_MS)
      );
      const damp = Math.exp(-DAMPING * t.damp * pull * dt);
      const k = SPRING * t.spring;

      mote.vx = (mote.vx + (mote.hx - mote.x) * k * pull * dt) * damp;
      mote.vy =
        (mote.vy +
          ((mote.hy - mote.y) * k * pull + GRAVITY * t.mass * (1 - pull)) *
            dt) *
        damp;
      mote.x += mote.vx * dt;
      mote.y += mote.vy * dt;

      return (
        pull >= 1 &&
        Math.hypot(mote.hx - mote.x, mote.hy - mote.y) <= 0.35 &&
        Math.hypot(mote.vx, mote.vy) <= 1.2
      );
    };

    const step = (dt: number, elapsed: number) => {
      let settled = true;

      for (const mote of motes) {
        if (!advance(mote, dt, elapsed)) {
          settled = false;
        }
      }

      return settled;
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(offset, offset);
      context.scale(scale, scale);

      if (solidAlpha > 0.004) {
        context.globalAlpha = solidAlpha;
        context.fillStyle = ink;
        context.fill(silhouette, "evenodd");
        context.fill(core);
      }

      if (cloudAlpha > 0.004) {
        context.fillStyle = accent;

        for (const mote of motes) {
          const t = traits(mote);

          context.globalAlpha = cloudAlpha * t.alpha;
          context.beginPath();
          context.arc(mote.x, mote.y, Math.max(0.15, t.radius), 0, Math.PI * 2);
          context.fill();
        }
      }

      context.restore();
    };

    const frame = () => {
      const now = performance.now();
      const dt = Math.min((now - lastAt) / 1000, 1 / 30);

      lastAt = now;
      solidAlpha += ((hovered ? 0 : 1) - solidAlpha) * Math.min(1, dt * 9);
      cloudAlpha += ((hovered ? 1 : 0) - cloudAlpha) * Math.min(1, dt * 9);

      if (running && step(dt, now - startedAt)) {
        running = false;
      }

      draw();

      if (running || hovered || solidAlpha < 0.996 || cloudAlpha > 0.004) {
        handle = requestAnimationFrame(frame);
      }
    };

    const enter = () => {
      if (still) {
        return;
      }

      hovered = true;
      startedAt = performance.now();
      lastAt = startedAt;
      running = true;

      for (const mote of motes) {
        mote.x = mote.hx;
        mote.y = mote.hy;
        mote.vx = 0;
        mote.vy = 0;
        mote.live = false;
      }

      cancelAnimationFrame(handle);
      frame();
    };

    const leave = () => {
      hovered = false;
      lastAt = performance.now();
      cancelAnimationFrame(handle);
      frame();
    };

    draw();
    canvas.addEventListener("pointerenter", enter);
    canvas.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(handle);
      canvas.removeEventListener("pointerenter", enter);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, [size]);

  // The canvas is wider than the mark so the cloud has room to travel, but
  // that overhang should not push anything around: negative margins take it
  // back out of the flow, leaving a layout box exactly the size of the mark.
  const overhang = -((size * (BOX_RATIO - 1)) / 2);

  return (
    <span className={classes.root} style={{ margin: `${overhang}px` }}>
      <canvas
        aria-label={label}
        className={classes.canvas}
        ref={canvasRef}
        role="img"
      />
    </span>
  );
};
