import {
  ISO_ELLIPSE_RX,
  ISO_ELLIPSE_RY,
  isoPoint,
  isoRect,
  isoSquare,
  roundedPolygon,
} from "@/lib/isometric";
import type { CSSProperties } from "react";

type Device = {
  key: string;
  label: string;
  /** Position on the platform the device hovers over. */
  x: number;
  y: number;
  /** Seconds of delay before this device's pulse starts. */
  delay: number;
};

/** Half-width of the platform plates, in world units. */
const PLATE_HALF = 74;

/** Corner rounding applied to every plate and device outline. */
const CORNER = 16;

/** Heights of the stacked plates, bottom to top. */
const PLATE_HEIGHTS = [0, 18, 36, 54] satisfies number[];

const SURFACE_Z = 54;

/** Height the devices hover at. */
const DEVICE_Z = 200;

/**
 * Where each device sits above the platform. Screen height follows (x + y)
 * and horizontal position follows (x - y), so these are chosen to spread the
 * devices sideways while keeping them on a shallow stagger — otherwise the
 * front-most device drops far enough to collide with the platform's far
 * corner. The links read as vertical drops because only z changes between a
 * device and its landing point.
 */
const DEVICES = [
  { key: "watch", label: "Apple Watch", x: -40, y: 30, delay: 0 },
  { key: "ring", label: "Oura ring", x: -12, y: 12, delay: 0.9 },
  { key: "band", label: "Whoop band", x: 40, y: -30, delay: 1.8 },
] satisfies Device[];

const PULSE_DURATION_S = 2.7;

/**
 * "Connect your records and wearables" — a stacked isometric platform with
 * three wearables hovering above it, each dropping a dotted link that pulses
 * down into the surface.
 */
const classes = {
  root: "block h-full w-auto max-h-[320px]",
  plate: "fill-none stroke-figure-line",
  plateTop: "fill-none stroke-figure-line-bright",
  guide: "fill-none stroke-figure-line-dim [stroke-dasharray:2_5]",
  link: "fill-none stroke-figure-line [stroke-dasharray:2_6]",
  pulse: "fill-figure-accent motion-reduce:hidden",
  landing:
    "[transform-box:fill-box] [transform-origin:center] fill-none stroke-figure-accent motion-reduce:hidden",
  device: "fill-figure-ground stroke-figure-line-bright",
  deviceDetail: "fill-none stroke-figure-line",
  float: "motion-reduce:animate-none",
} as const;

const plate = (z: number) => roundedPolygon(isoSquare(PLATE_HALF, z), CORNER);

/** Vertical screen distance a pulse travels from a device down to the plate. */
const dropLength = (x: number, y: number) =>
  isoPoint(x, y, SURFACE_Z).y - isoPoint(x, y, DEVICE_Z).y;

const floatStyle = (delay: number): CSSProperties => ({
  animation: `figure-float 5s ease-in-out ${delay}s infinite`,
});

const pulseStyle = (device: Device): CSSProperties =>
  ({
    "--pulse-drop": `${dropLength(device.x, device.y)}px`,
    animation: `figure-pulse ${PULSE_DURATION_S}s linear ${device.delay}s infinite`,
  }) as CSSProperties;

const landingStyle = (device: Device): CSSProperties => ({
  animation: `figure-landing ${PULSE_DURATION_S}s ease-out ${device.delay + PULSE_DURATION_S * 0.72}s infinite`,
});

/**
 * The Apple Watch: a narrow strap running under a squircle case, with the
 * digital crown on its right edge. The strap has to be clearly thinner than
 * the case or the whole thing reads as an anonymous rounded rectangle.
 */
const WatchGlyph = () => (
  <>
    <path
      className={classes.deviceDetail}
      d={roundedPolygon(isoRect(8, 34, 0), 4)}
    />
    <path
      className={classes.device}
      d={roundedPolygon(isoRect(19, 17, 0), 8)}
    />
    <path
      className={classes.deviceDetail}
      d={roundedPolygon(isoRect(12, 10, 0), 5)}
    />
    <path
      className={classes.device}
      d={roundedPolygon(isoRect(4, 3, 0), 1.5)}
      transform={`translate(${isoPoint(23, 0, 0).x} ${isoPoint(23, 0, 0).y})`}
    />
  </>
);

/** The Oura ring: two concentric iso circles with a little wall thickness. */
const RingGlyph = () => (
  <>
    <ellipse
      className={classes.device}
      rx={17 * ISO_ELLIPSE_RX}
      ry={17 * ISO_ELLIPSE_RY}
    />
    <ellipse
      className={classes.deviceDetail}
      rx={11 * ISO_ELLIPSE_RX}
      ry={11 * ISO_ELLIPSE_RY}
    />
    <ellipse
      className={classes.deviceDetail}
      cy={6}
      rx={17 * ISO_ELLIPSE_RX}
      ry={17 * ISO_ELLIPSE_RY}
    />
    <ellipse
      className={classes.deviceDetail}
      cy={6}
      rx={11 * ISO_ELLIPSE_RX}
      ry={11 * ISO_ELLIPSE_RY}
    />
  </>
);

/** The Whoop band: a continuous strap loop with the sensor pod set into it. */
const BandGlyph = () => (
  <>
    <path className={classes.device} d={roundedPolygon(isoRect(9, 34, 0), 8)} />
    <path
      className={classes.deviceDetail}
      d={roundedPolygon(isoRect(4, 28, 0), 4)}
    />
    <path className={classes.device} d={roundedPolygon(isoRect(11, 9, 0), 4)} />
  </>
);

const GLYPHS = {
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
    viewBox="-142 -252 284 338"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* The stack, drawn bottom plate first so upper plates overlap it. */}
    {PLATE_HEIGHTS.map((z) => (
      <path
        className={z === SURFACE_Z ? classes.plateTop : classes.plate}
        d={plate(z)}
        key={z}
      />
    ))}

    {/* Corner guides tying the stack together. */}
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

    {DEVICES.map((device) => {
      const landing = isoPoint(device.x, device.y, SURFACE_Z);
      const hover = isoPoint(device.x, device.y, DEVICE_Z);
      const Glyph = GLYPHS[device.key as keyof typeof GLYPHS];

      return (
        <g key={device.key}>
          <line
            className={classes.link}
            x1={hover.x}
            x2={landing.x}
            y1={hover.y}
            y2={landing.y}
          />

          <circle
            className={classes.pulse}
            cx={hover.x}
            cy={hover.y}
            r={2.5}
            style={pulseStyle(device)}
          />

          <ellipse
            className={classes.landing}
            cx={landing.x}
            cy={landing.y}
            rx={14 * ISO_ELLIPSE_RX}
            ry={14 * ISO_ELLIPSE_RY}
            style={landingStyle(device)}
          />

          <g
            className={classes.float}
            style={floatStyle(device.delay)}
            transform={`translate(${hover.x} ${hover.y})`}
          >
            <Glyph />
          </g>
        </g>
      );
    })}
  </svg>
);
