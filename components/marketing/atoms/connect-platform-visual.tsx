import {
  ISO_ELLIPSE_RX,
  ISO_ELLIPSE_RY,
  isoPoint,
  isoSquare,
  roundedPolygon,
} from "@/lib/isometric";
import type { CSSProperties } from "react";

type SourceKey = "record" | "watch" | "ring" | "band";

type Source = {
  key: SourceKey;
  /** Point on the platform this source feeds, in world coordinates. */
  x: number;
  y: number;
  /** Seconds of offset so the four flows stay out of phase. */
  delay: number;
};

/** Half-width of the platform plates, in world units. */
const PLATE_HALF = 74;

/** Corner rounding on the plates. */
const CORNER = 16;

/** Heights of the stacked plates, bottom to top. */
const PLATE_HEIGHTS = [0, 18, 36, 54] satisfies number[];

const SURFACE_Z = 54;

/** Height the sources hover at. */
const SOURCE_Z = 200;

/**
 * Screen position in an isometric view follows (x - y) horizontally and
 * (x + y) vertically. These are picked to spread the four sources evenly
 * sideways while keeping them on a shallow stagger, so none of them drops far
 * enough to collide with the platform's far corner.
 */
const SOURCES = [
  { key: "record", x: -51, y: 39, delay: 0 },
  { key: "watch", x: -13, y: 17, delay: 0.7 },
  { key: "ring", x: 13, y: -17, delay: 1.4 },
  { key: "band", x: 51, y: -39, delay: 2.1 },
] satisfies Source[];

/** One full cycle of the marching dashes that carry the data down. */
const FLOW_DURATION_S = 1.6;

/** How often the platform acknowledges an arrival. */
const ARRIVAL_DURATION_S = 3.2;

/**
 * "Connect your health records and wearables" — an isometric platform stack
 * fed by four sources. The platform stays isometric because it is the ground
 * plane; the sources face the viewer, since a watch drawn in the isometric
 * plane reads as a skewed rounded rectangle rather than as a watch.
 */
const classes = {
  root: "block h-full w-auto max-h-[320px]",
  plate: "stroke-figure-line [fill:url(#figure-glass)]",
  plateTop: "stroke-figure-line-bright [fill:url(#figure-glass)]",
  guide: "fill-none stroke-figure-line-dim [stroke-dasharray:2_5]",
  flow: "fill-none stroke-figure-accent/70 [stroke-dasharray:2_6] motion-reduce:stroke-figure-line-dim",
  arrival:
    "[transform-box:fill-box] [transform-origin:center] fill-none stroke-figure-accent motion-reduce:hidden",
  body: "fill-figure-ground stroke-figure-line-bright",
  detail: "fill-none stroke-figure-line",
  float: "motion-reduce:animate-none",
} as const;

const plate = (z: number) => roundedPolygon(isoSquare(PLATE_HALF, z), CORNER);

const floatStyle = (delay: number): CSSProperties => ({
  animation: `figure-float 5s ease-in-out ${delay}s infinite`,
});

const flowStyle = (delay: number): CSSProperties => ({
  animation: `figure-flow ${FLOW_DURATION_S}s linear ${delay}s infinite`,
});

const arrivalStyle = (delay: number): CSSProperties => ({
  animation: `figure-arrival ${ARRIVAL_DURATION_S}s ease-out ${delay}s infinite`,
});

/** A medical record: a page of ruled lines headed by a medical cross. */
const RecordGlyph = () => (
  <>
    <rect
      className={classes.body}
      height={52}
      rx={4}
      width={40}
      x={-20}
      y={-26}
    />
    <path className={classes.detail} d="M-9 -14h14M-2 -21v14" />
    <path className={classes.detail} d="M-12 -2h24M-12 5h24M-12 12h16" />
  </>
);

/** The Apple Watch: squircle case between two strap stubs, crown on the right. */
const WatchGlyph = () => (
  <>
    <rect
      className={classes.detail}
      height={14}
      rx={4}
      width={18}
      x={-9}
      y={-30}
    />
    <rect
      className={classes.detail}
      height={14}
      rx={4}
      width={18}
      x={-9}
      y={16}
    />
    <rect
      className={classes.body}
      height={36}
      rx={11}
      width={32}
      x={-16}
      y={-18}
    />
    <rect
      className={classes.detail}
      height={26}
      rx={7}
      width={22}
      x={-11}
      y={-13}
    />
    <rect
      className={classes.body}
      height={10}
      rx={1.5}
      width={4}
      x={15}
      y={-5}
    />
  </>
);

/** The Oura ring, face on: a plain band with its sensor bosses inside. */
const RingGlyph = () => (
  <>
    <circle className={classes.body} r={19} />
    <circle className={classes.detail} r={12} />
    <path className={classes.detail} d="M-5 11a13 13 0 0 0 10 0" />
  </>
);

/** The Whoop band: a continuous strap loop with the sensor pod set into it. */
const BandGlyph = () => (
  <>
    <rect
      className={classes.body}
      height={54}
      rx={13}
      width={28}
      x={-14}
      y={-27}
    />
    <rect
      className={classes.detail}
      height={40}
      rx={7}
      width={14}
      x={-7}
      y={-20}
    />
    <rect
      className={classes.body}
      height={15}
      rx={4}
      width={18}
      x={-9}
      y={-7.5}
    />
  </>
);

const GLYPHS = {
  record: RecordGlyph,
  watch: WatchGlyph,
  ring: RingGlyph,
  band: BandGlyph,
} as const;

export const ConnectPlatformVisual = () => (
  <svg
    aria-hidden="true"
    className={classes.root}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1}
    viewBox="-146 -248 292 332"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="figure-glass" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="var(--color-figure-glass-far)" />
        <stop offset="1" stopColor="var(--color-figure-glass-near)" />
      </linearGradient>
    </defs>

    {/* Guides first: the frosted plates draw over them, leaving them visible
        only in the gaps between each plate's outer corners. */}
    {isoSquare(PLATE_HALF, 0).map((corner, index) => {
      const top = isoSquare(PLATE_HALF, SURFACE_Z)[index];

      return top ? (
        <line
          className={classes.guide}
          key={`${corner.x}-${corner.y}`}
          x1={corner.x}
          x2={top.x}
          y1={corner.y}
          y2={top.y}
        />
      ) : null;
    })}

    {/* Bottom plate first, so the upper plates occlude it. */}
    {PLATE_HEIGHTS.map((z) => (
      <path
        className={z === SURFACE_Z ? classes.plateTop : classes.plate}
        d={plate(z)}
        key={z}
      />
    ))}

    {SOURCES.map((source) => {
      const landing = isoPoint(source.x, source.y, SURFACE_Z);
      const hover = isoPoint(source.x, source.y, SOURCE_Z);
      const Glyph = GLYPHS[source.key];

      return (
        <g key={source.key}>
          {/* Marching dashes run the length of the link, so the data reads as
              flowing continuously rather than arriving as single packets. */}
          <line
            className={classes.flow}
            style={flowStyle(source.delay)}
            x1={hover.x}
            x2={landing.x}
            y1={hover.y}
            y2={landing.y}
          />

          <ellipse
            className={classes.arrival}
            cx={landing.x}
            cy={landing.y}
            rx={15 * ISO_ELLIPSE_RX}
            ry={15 * ISO_ELLIPSE_RY}
            style={arrivalStyle(source.delay)}
          />

          <g
            className={classes.float}
            style={floatStyle(source.delay)}
            transform={`translate(${hover.x} ${hover.y})`}
          >
            <Glyph />
          </g>
        </g>
      );
    })}
  </svg>
);
