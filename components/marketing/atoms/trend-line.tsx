type TrendLineProperties = {
  /** The readings, oldest first. Only their shape matters: they are fitted to the box. */
  points: readonly number[];
  /** Whether the line has drawn itself in. It draws on the way to true. */
  drawn: boolean;
  /** How long the line takes to draw, to match whatever it accompanies. */
  durationMs: number;
  /**
   * The low and high ends of the scale. Leave it out to fit the line to its
   * own readings, which makes any change dramatic; give a wider scale to show
   * that little is changing.
   */
  domain?: readonly [number, number];
};

/** The drawing box. The line stretches to fill whatever box holds it. */
const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 32;

/** Room above and below the line so the stroke and end dot are not cut off. */
const INSET = 4;

/**
 * A sparkline that draws itself from left to right, ending on a dot at the
 * latest reading. The parent decides when, and how quickly, so it can be
 * timed against a figure counting alongside it.
 *
 * The path is measured as one unit long and dashed to match, so drawing it
 * is a single transition on the dash offset.
 */
const classes = {
  root: "block size-full overflow-visible",
  lineDrawn:
    "fill-none stroke-current [stroke-dasharray:1] [stroke-dashoffset:0] [vector-effect:non-scaling-stroke] transition-[stroke-dashoffset] ease-out motion-reduce:transition-none",
  lineHidden:
    "fill-none stroke-current [stroke-dasharray:1] [stroke-dashoffset:1] [vector-effect:non-scaling-stroke]",
  dotDrawn:
    "fill-current opacity-100 transition-opacity motion-reduce:transition-none",
  dotHidden: "fill-current opacity-0",
} as const;

const toCoordinates = (
  points: readonly number[],
  domain?: readonly [number, number]
) => {
  const [low, high] = domain ?? [Math.min(...points), Math.max(...points)];
  const span = high - low || 1;
  const step = VIEW_WIDTH / Math.max(points.length - 1, 1);

  return points.map((point, index) => ({
    x: index * step,
    y: INSET + ((high - point) / span) * (VIEW_HEIGHT - INSET * 2),
  }));
};

export const TrendLine = ({
  points,
  drawn,
  durationMs,
  domain,
}: TrendLineProperties) => {
  const coordinates = toCoordinates(points, domain);
  const last = coordinates.at(-1);

  return (
    <svg
      aria-hidden="true"
      className={classes.root}
      preserveAspectRatio="none"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline
        className={drawn ? classes.lineDrawn : classes.lineHidden}
        pathLength={1}
        points={coordinates.map(({ x, y }) => `${x},${y}`).join(" ")}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        style={{ transitionDuration: `${durationMs}ms` }}
      />
      {last ? (
        <circle
          className={drawn ? classes.dotDrawn : classes.dotHidden}
          cx={last.x}
          cy={last.y}
          r={2.25}
          style={{ transitionDelay: `${durationMs}ms` }}
        />
      ) : null}
    </svg>
  );
};
