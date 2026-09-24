type RecordScanProperties = {
  /** Whether the beam is crossing. Held still off screen. */
  scanning: boolean;
};

/** The drawing box. It stretches to fill whatever box holds it. */
const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 32;

/** Three records side by side, each a page with lines of text on it. */
const PAGES = [4, 38, 72] as const;
const PAGE = { width: 24, height: 30, radius: 3 } as const;

/** The text lines on each page: how far down each sits, and how wide. */
const LINES = [
  { y: 7, width: 16 },
  { y: 12.5, width: 12 },
  { y: 18, width: 14 },
  { y: 23.5, width: 9 },
] as const;

/**
 * A row of medical records being read in: three small pages with a beam
 * crossing them on a loop, for a `MetricReading` chart. It takes the colour
 * of whatever holds it. The beam moves by transform alone, and holds still
 * for anyone who has asked for less motion.
 */
const classes = {
  root: "block size-full overflow-visible",
  page: "fill-current/10 stroke-current/60",
  line: "fill-current/45",
  beamScanning:
    "animate-record-scan fill-current [filter:drop-shadow(0_0_3px_currentColor)] motion-reduce:animate-none motion-reduce:opacity-0",
  beamIdle: "fill-current opacity-0",
} as const;

export const RecordScan = ({ scanning }: RecordScanProperties) => (
  <svg
    aria-hidden="true"
    className={classes.root}
    preserveAspectRatio="none"
    viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {PAGES.map((x) => (
      <g key={x}>
        <rect
          className={classes.page}
          height={PAGE.height}
          rx={PAGE.radius}
          strokeWidth={0.8}
          vectorEffect="non-scaling-stroke"
          width={PAGE.width}
          x={x}
          y={1}
        />
        {LINES.map((line) => (
          <rect
            className={classes.line}
            height={2}
            key={`${x}-${line.y}`}
            rx={1}
            width={line.width}
            x={x + 4}
            y={line.y}
          />
        ))}
      </g>
    ))}
    <rect
      className={scanning ? classes.beamScanning : classes.beamIdle}
      height={VIEW_HEIGHT}
      rx={0.8}
      width={1.6}
      x={0}
      y={0}
    />
  </svg>
);
