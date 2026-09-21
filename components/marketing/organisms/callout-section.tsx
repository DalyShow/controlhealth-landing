import type { ReactNode } from "react";

type CalloutSectionProperties = {
  children: ReactNode;
};

/**
 * Three-up callout row on the deep surface below the hero. Hairline rules
 * separate the columns rather than boxing each card, so the row reads as one
 * plate of technical figures instead of three cards.
 */
const classes = {
  section: "w-full bg-figure-ground py-32 max-md:py-20",
  grid: "mx-auto grid w-full max-w-[1280px] grid-cols-3 gap-0 px-11 max-md:grid-cols-1 max-md:gap-16 max-md:px-6 [&>*+*]:border-figure-rule [&>*+*]:border-l max-md:[&>*+*]:border-l-0 max-md:[&>*+*]:border-t max-md:[&>*+*]:pt-16",
} as const;

export const CalloutSection = ({ children }: CalloutSectionProperties) => (
  <section className={classes.section}>
    <div className={classes.grid}>{children}</div>
  </section>
);
