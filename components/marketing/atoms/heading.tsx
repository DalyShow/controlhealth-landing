import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Level = 1 | 2 | 3;

type HeadingProperties = {
  /** Step on the title ramp, which picks the tag unless `as` overrides it. */
  level: Level;
  /**
   * Tag to render, when the ramp step and the document outline disagree — a
   * closing panel wanting the H1 treatment on a page whose H1 is the hero,
   * say. Keep the two together unless there is a reason not to.
   */
  as?: Level;
  children: ReactNode;
  /**
   * Surface concerns the ramp has no opinion on — colour, alignment, measure.
   * Pass a key from the consumer's own class registry, never a literal.
   */
  className?: string;
};

/**
 * The marketing title ramp. Playfair at every step, since the display face is
 * what carries the brand; the steps differ only by size, weight, leading and
 * tracking. Sizes are fluid between the phone and the 1440 frame so the ramp
 * keeps its proportions rather than stepping at breakpoints.
 */
const RAMP = {
  1: "font-display font-normal text-[clamp(2.75rem,2.31rem+1.878vw,4rem)] leading-[1.15] tracking-[-0.03em]",
  2: "font-display font-medium text-[clamp(1.875rem,1.35rem+1.6vw,2.75rem)] leading-[1.15]",
  3: "font-display font-medium text-[clamp(1.25rem,1.1rem+0.47vw,1.5rem)] leading-[1.3]",
} as const satisfies Record<Level, string>;

const TAGS = {
  1: "h1",
  2: "h2",
  3: "h3",
} as const satisfies Record<Level, string>;

export const Heading = ({
  level,
  as,
  children,
  className,
}: HeadingProperties) => {
  const Tag = TAGS[as ?? level];

  return <Tag className={cn(RAMP[level], className)}>{children}</Tag>;
};
