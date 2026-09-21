/**
 * Isometric projection helpers for the line-art section illustrations.
 *
 * A true isometric view drops a 3D point onto the plane with
 *   sx = (x - y) · cos30°
 *   sy = (x + y) · sin30° - z
 * so x runs down-right, y runs down-left and z runs straight up the screen.
 * Everything is computed rather than traced, which keeps the drawings
 * tunable — change a plate's size or a device's height and the whole
 * composition follows.
 */

export type Point = {
  x: number;
  y: number;
};

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);

/**
 * A circle of radius r lying flat in the x/y plane projects to an axis-aligned
 * ellipse. These are the multipliers for its radii.
 */
export const ISO_ELLIPSE_RX = Math.SQRT2 * COS_30;
export const ISO_ELLIPSE_RY = Math.SQRT2 * SIN_30;

export const isoPoint = (x: number, y: number, z: number): Point => ({
  x: (x - y) * COS_30,
  y: (x + y) * SIN_30 - z,
});

/** The four corners of a flat square of half-width `half`, at height `z`. */
export const isoSquare = (half: number, z: number): Point[] => [
  isoPoint(half, -half, z),
  isoPoint(half, half, z),
  isoPoint(-half, half, z),
  isoPoint(-half, -half, z),
];

/** The four corners of a flat rectangle, at height `z`. */
export const isoRect = (
  halfX: number,
  halfY: number,
  z: number
): Point[] => [
  isoPoint(halfX, -halfY, z),
  isoPoint(halfX, halfY, z),
  isoPoint(-halfX, halfY, z),
  isoPoint(-halfX, -halfY, z),
];

const distance = (from: Point, to: Point) =>
  Math.hypot(to.x - from.x, to.y - from.y);

/** Unit vector pointing from `from` toward `to`. */
const towards = (from: Point, to: Point): Point => {
  const length = distance(from, to) || 1;

  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
};

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Closed path through `points` with each corner rounded off. The radius is
 * clamped to half the shortest edge so tight corners degrade rather than
 * fold back on themselves.
 */
export const roundedPolygon = (points: Point[], radius: number): string => {
  const count = points.length;

  if (count < 3) {
    return "";
  }

  const shortestEdge = points.reduce((shortest, point, index) => {
    const next = points[(index + 1) % count] ?? point;

    return Math.min(shortest, distance(point, next));
  }, Number.POSITIVE_INFINITY);

  const corner = Math.min(radius, shortestEdge / 2);
  const commands: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const previous = points[(index - 1 + count) % count];
    const current = points[index];
    const next = points[(index + 1) % count];

    if (!(previous && current && next)) {
      continue;
    }

    const entry = towards(current, previous);
    const exit = towards(current, next);

    const start = {
      x: round(current.x + entry.x * corner),
      y: round(current.y + entry.y * corner),
    };
    const end = {
      x: round(current.x + exit.x * corner),
      y: round(current.y + exit.y * corner),
    };

    commands.push(
      index === 0 ? `M${start.x} ${start.y}` : `L${start.x} ${start.y}`
    );
    commands.push(`Q${round(current.x)} ${round(current.y)} ${end.x} ${end.y}`);
  }

  commands.push("Z");

  return commands.join(" ");
};
