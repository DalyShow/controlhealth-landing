import {
  MARK_CORE,
  MARK_SILHOUETTE,
  MARK_SIZE,
} from "@/lib/brand-mark";

type BrandMarkIconProperties = {
  className?: string;
};

/**
 * The Control Health mark as a glyph, filled with `currentColor` so it takes
 * the colour of the text around it, such as the slide colour in a card.
 * Drawn from the same geometry as the particle mark, so the two never drift.
 */
const classes = {
  root: "block size-full",
} as const;

export const BrandMarkIcon = ({ className }: BrandMarkIconProperties) => (
  <svg
    aria-hidden="true"
    className={className ?? classes.root}
    fill="currentColor"
    viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path clipRule="evenodd" d={MARK_SILHOUETTE} fillRule="evenodd" />
    <path d={MARK_CORE} />
  </svg>
);
