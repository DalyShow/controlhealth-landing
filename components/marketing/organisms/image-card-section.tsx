import type { ReactNode } from "react";

type ImageCardSectionProperties = {
  children: ReactNode;
};

/**
 * A row of three full-bleed image cards on the bright surface, sitting under
 * the line-art callouts.
 *
 * Same twelve-column grid as the section above, four columns to a card. The
 * cards fill their columns rather than insetting their contents the way the
 * callouts do: there are no rules to clear here, and a photograph that stops
 * short of its column reads as a mistake.
 */
const classes = {
  section: "w-full bg-surface-bright py-32 max-md:py-20",
  grid: "mx-auto grid w-full max-w-page grid-cols-12 gap-6 px-24 max-xl:px-10 max-md:gap-8 max-sm:px-6",
} as const;

export const ImageCardSection = ({ children }: ImageCardSectionProperties) => (
  <section className={classes.section}>
    <div className={classes.grid}>{children}</div>
  </section>
);
