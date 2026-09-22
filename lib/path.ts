/**
 * Small SVG path builders shared by the section figures.
 */

/**
 * A rounded rectangle as an explicit path rather than a `<rect rx>`, so it can
 * carry `pathLength` and have a dash pattern travel its perimeter.
 */
export const roundedRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): string => {
  const right = x + width;
  const bottom = y + height;
  const arc = `A${radius} ${radius} 0 0 1`;

  return [
    `M${x + radius} ${y}`,
    `H${right - radius}`,
    `${arc} ${right} ${y + radius}`,
    `V${bottom - radius}`,
    `${arc} ${right - radius} ${bottom}`,
    `H${x + radius}`,
    `${arc} ${x} ${bottom - radius}`,
    `V${y + radius}`,
    `${arc} ${x + radius} ${y}`,
    "Z",
  ].join("");
};

/**
 * A four-point star with concave sides, sized about its own centre. Used for
 * the AI sparkles.
 */
export const sparklePath = (cx: number, cy: number, r: number): string => {
  const waist = r * 0.26;

  return [
    `M${cx} ${cy - r}`,
    `C${cx} ${cy - waist} ${cx + waist} ${cy} ${cx + r} ${cy}`,
    `C${cx + waist} ${cy} ${cx} ${cy + waist} ${cx} ${cy + r}`,
    `C${cx} ${cy + waist} ${cx - waist} ${cy} ${cx - r} ${cy}`,
    `C${cx - waist} ${cy} ${cx} ${cy - waist} ${cx} ${cy - r}`,
    "Z",
  ].join("");
};
