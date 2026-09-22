import {
  ISO_ELLIPSE_RX,
  ISO_ELLIPSE_RY,
  isoPoint,
  isoSquare,
  roundedPolygon,
} from "@/lib/isometric";
import {
  APPLE_WATCH_ART,
  MEDICAL_RECORD_ART,
  OURA_RING_ART,
  type ProductArt,
} from "@/lib/product-art";
import type { CSSProperties } from "react";

type SourceKey = "watch" | "record" | "ring";

type Source = {
  key: SourceKey;
  /** Hover position in world coordinates. */
  x: number;
  y: number;
  /**
   * Where this source's data lands, kept separate from the hover position.
   * Dropping straight down would put the watch and ring's impacts on the rim
   * of the plate, where the ripple spills over the edge and stops reading as
   * something landing on a surface. Each packet converges inward instead.
   */
  land: { x: number; y: number };
  /** Position in the round-robin, which sets this source's phase. */
  order: number;
};

type Plate = {
  z: number;
  /** Lower plates are drawn smaller, so the stack tapers into the ground. */
  scale: number;
  opacity: number;
};

/** Half-width of the top plate, in world units. */
const PLATE_HALF = 66;

/** Corner rounding on the top plate, scaled down with each plate below it. */
const CORNER = 15;

/**
 * A floor rather than a block: wide, with the layers close together. Each
 * plate below the surface is smaller and more transparent, so the edge reads
 * as depth without the stack gaining height.
 */
const PLATES = [
  { z: 0, scale: 0.9, opacity: 0.28 },
  { z: 8, scale: 0.95, opacity: 0.55 },
  { z: 16, scale: 1, opacity: 1 },
] satisfies Plate[];

const SURFACE_Z = 16;

/** Height the sources hover at. */
const SOURCE_Z = 145;

/**
 * The record sits centred and high; the watch and ring flank it, lower.
 * Horizontal spread comes from (x - y), screen height from (x + y).
 */
const SOURCES = [
  { key: "watch", x: -25, y: 65, land: { x: -42, y: 12 }, order: 0 },
  { key: "record", x: 0, y: 0, land: { x: 12, y: 20 }, order: 1 },
  { key: "ring", x: 65, y: -25, land: { x: 26, y: -32 }, order: 2 },
] satisfies Source[];

/** One full round of the three sources taking their turn. */
const CYCLE_S = 3.6;

const STAGGER_S = CYCLE_S / SOURCES.length;

/** Fraction of the cycle at which a packet reaches the platform. */
const ARRIVAL_FRACTION = 0.4;

/** World radius of the ripple a landing packet leaves on the surface. */
const RIPPLE_RADIUS = 11;

/** Each drawing was made in its own box, so it is scaled to fit on its own. */
const ART_SCALE = {
  record: 0.32,
  watch: 0.36,
  ring: 0.3,
} as const;

const ART = {
  record: MEDICAL_RECORD_ART,
  watch: APPLE_WATCH_ART,
  ring: OURA_RING_ART,
} as const;

/**
 * "Connect your health records and wearables" — an isometric floor fed by
 * three sources. The floor stays isometric because it is the ground plane;
 * the sources face the viewer, since a watch drawn in the isometric plane
 * reads as a skewed rounded rectangle rather than as a watch.
 */
const classes = {
  root: "block h-auto w-full",
  stack: "[transform-box:fill-box] [transform-origin:center]",
  plate: "stroke-figure-line [fill:url(#platform-glass)] [stroke-width:0.65]",
  plateTop:
    "stroke-figure-line-bright [fill:url(#platform-glass)] [stroke-width:0.65]",
  packet:
    "fill-figure-accent [filter:drop-shadow(0_0_2.5px_var(--color-figure-accent))]",
  ripple:
    "fill-none stroke-figure-accent [transform-box:fill-box] [transform-origin:center]",
  art: "fill-figure-line-bright stroke-none",
} as const;

const plate = ({ z, scale }: Plate) =>
  roundedPolygon(isoSquare(PLATE_HALF * scale, z), CORNER * scale);

/**
 * The stack's own keyframes run once per source rather than once per cycle,
 * so it acknowledges every arrival and not just the first.
 */
const stackStyle: CSSProperties = {
  animation: `figure-receive ${STAGGER_S}s ease-out ${
    CYCLE_S * ARRIVAL_FRACTION
  }s infinite`,
};

const travelStyle = (delay: number, dx: number, dy: number): CSSProperties =>
  ({
    animation: `figure-travel ${CYCLE_S}s linear ${delay}s infinite`,
    "--dx": `${dx}px`,
    "--dy": `${dy}px`,
  }) as CSSProperties;

const rippleStyle = (delay: number): CSSProperties => ({
  animation: `figure-ripple ${CYCLE_S}s ease-out ${
    delay + CYCLE_S * ARRIVAL_FRACTION
  }s infinite`,
});

const floatStyle = (delay: number): CSSProperties => ({
  animation: `figure-float 5s ease-in-out ${delay}s infinite`,
});

/** One hand-drawn product, centred on its own origin and scaled to fit. */
const Artwork = ({ art, scale }: { art: ProductArt; scale: number }) => (
  <g
    className={classes.art}
    transform={`scale(${scale}) translate(${-art.width / 2} ${
      -art.height / 2
    })`}
  >
    {art.paths.map((d) => (
      <path d={d} key={d.slice(0, 32)} />
    ))}
  </g>
);

export const ConnectPlatformVisual = () => (
  <svg
    aria-hidden="true"
    className={classes.root}
    data-figure=""
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.3}
    viewBox="-128 -180 256 250"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="platform-glass" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="var(--color-figure-glass-far)" />
        <stop offset="1" stopColor="var(--color-figure-glass-near)" />
      </linearGradient>
    </defs>

    {/* The stack breathes as a unit when data lands. */}
    <g className={classes.stack} style={stackStyle}>
      {PLATES.map((layer) => (
        <path
          className={layer.z === SURFACE_Z ? classes.plateTop : classes.plate}
          d={plate(layer)}
          key={layer.z}
          opacity={layer.opacity}
        />
      ))}
    </g>

    {SOURCES.map((source) => {
      const hover = isoPoint(source.x, source.y, SOURCE_Z);
      const landing = isoPoint(source.land.x, source.land.y, SURFACE_Z);
      const delay = source.order * STAGGER_S;

      return (
        <g key={source.key}>
          <circle
            className={classes.packet}
            cx={hover.x}
            cy={hover.y}
            data-figure-transient=""
            r={1.8}
            style={travelStyle(delay, landing.x - hover.x, landing.y - hover.y)}
          />

          <ellipse
            className={classes.ripple}
            cx={landing.x}
            cy={landing.y}
            data-figure-transient=""
            rx={RIPPLE_RADIUS * ISO_ELLIPSE_RX}
            ry={RIPPLE_RADIUS * ISO_ELLIPSE_RY}
            style={rippleStyle(delay)}
          />

          {/* The float keyframes animate `transform`, which would clobber a
              positional transform on the same element. Position the outer
              group and animate an inner one. */}
          <g transform={`translate(${hover.x} ${hover.y})`}>
            <g style={floatStyle(delay)}>
              <Artwork art={ART[source.key]} scale={ART_SCALE[source.key]} />
            </g>
          </g>
        </g>
      );
    })}
  </svg>
);
