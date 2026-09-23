import type { ReactNode } from "react";

type StatBarProperties = {
  /** One `StatSprite` per reading. Hairlines are drawn between them. */
  children: ReactNode;
};

/**
 * The frosted shell holding the hero's live readings on a single line.
 *
 * These used to be three stacked blocks over a hundred pixels tall, which put
 * them in the same band the biomarker strip's readout travels through, so one
 * had to give way to the other. On one line the bar is short enough that both
 * can be on screen at once, which is the point: the readings are the evidence
 * for the claim the strip is making.
 *
 * Hairlines come from the shell rather than the items so each reading stays
 * unaware of where it sits in the row.
 */
const classes = {
  root: "inline-flex max-w-full items-center rounded-full border border-hero-glass-edge bg-hero-glass py-[7px] backdrop-blur-md max-sm:py-1.5 [&>*+*]:border-hero-glass-rule [&>*+*]:border-l",
} as const;

export const StatBar = ({ children }: StatBarProperties) => (
  <div className={classes.root}>{children}</div>
);
