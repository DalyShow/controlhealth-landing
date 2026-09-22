import type { CSSProperties } from "react";

type ProgressiveBlurProperties = {
  /** How far up the parent the ramp reaches, as a CSS length. */
  height: string;
};

/**
 * Number of stacked layers. Each one doubles the blur of the one before it, so
 * six layers span a 32x range without any single step being visible.
 */
const LAYERS = 6;

/** Blur of the topmost, weakest layer, in pixels. */
const BASE_BLUR = 0.6;

/**
 * A blur that deepens toward the bottom edge.
 *
 * CSS has no progressive blur, and a single `backdrop-filter` leaves a hard
 * line where it starts. Stacking layers does: each one blurs a little more
 * than the last and is masked to begin a little lower, so near the top only
 * the weakest layer applies and near the bottom they all compose. The result
 * is a ramp rather than a step.
 *
 * Each layer's mask runs from fully transparent at the point it starts to
 * fully opaque one band lower, which overlaps its neighbours and keeps the
 * seams out of sight.
 */
const classes = {
  root: "pointer-events-none absolute inset-x-0 bottom-0",
  layer: "absolute inset-0",
} as const;

const layerStyle = (index: number): CSSProperties => {
  const from = (index / LAYERS) * 100;
  const to = ((index + 1) / LAYERS) * 100;
  const mask = `linear-gradient(to bottom, transparent ${from}%, black ${to}%)`;

  return {
    backdropFilter: `blur(${BASE_BLUR * 2 ** index}px)`,
    WebkitBackdropFilter: `blur(${BASE_BLUR * 2 ** index}px)`,
    maskImage: mask,
    WebkitMaskImage: mask,
  } as CSSProperties;
};

const LAYER_INDICES = Array.from({ length: LAYERS }, (_, index) => index);

export const ProgressiveBlur = ({ height }: ProgressiveBlurProperties) => (
  <div aria-hidden="true" className={classes.root} style={{ height }}>
    {LAYER_INDICES.map((index) => (
      <div className={classes.layer} key={index} style={layerStyle(index)} />
    ))}
  </div>
);
