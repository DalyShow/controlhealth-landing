import type { ReactNode } from "react";

type StatBarProperties = {
  /**
   * An optional first segment ahead of the readings — who they belong to, say.
   * Set off by a hairline on a wide screen; stacked above them on a phone.
   */
  lead?: ReactNode;
  /** One `StatSprite` per reading. Hairlines are drawn between them. */
  children: ReactNode;
};

/**
 * The frosted shell holding a row of live readings on a single line.
 *
 * These used to be three stacked blocks over a hundred pixels tall, which put
 * them in the same band the biomarker strip's readout travels through, so one
 * had to give way to the other. On one line the bar is short enough that both
 * can be on screen at once, which is the point: the readings are the evidence
 * for the claim the strip is making.
 *
 * Hairlines come from the shell rather than the items so each reading stays
 * unaware of where it sits in the row.
 *
 * A lead segment makes the row too long for a phone, where four segments in
 * one pill would squeeze the readings into each other. There the shell turns
 * into a rounded card with the lead on its own line above the readings.
 */
const classes = {
  root: "inline-flex max-w-full items-center rounded-full border border-hero-glass-edge bg-hero-glass py-[7px] backdrop-blur-md max-sm:py-1.5",
  rootWithLead:
    "inline-flex max-w-full items-center rounded-full border border-hero-glass-edge bg-hero-glass py-[7px] backdrop-blur-md max-sm:flex-col max-sm:rounded-2xl max-sm:py-2",
  lead: "flex items-center self-stretch border-hero-glass-rule border-r px-3.5 max-sm:mb-2 max-sm:w-full max-sm:justify-center max-sm:border-r-0 max-sm:border-b max-sm:px-3 max-sm:pb-2",
  readings: "flex items-center [&>*+*]:border-hero-glass-rule [&>*+*]:border-l",
} as const;

export const StatBar = ({ lead, children }: StatBarProperties) => (
  <div className={lead ? classes.rootWithLead : classes.root}>
    {lead ? <div className={classes.lead}>{lead}</div> : null}
    <div className={classes.readings}>{children}</div>
  </div>
);
