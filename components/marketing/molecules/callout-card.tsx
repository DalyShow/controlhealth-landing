import type { ReactNode } from "react";

type CalloutCardProperties = {
  /** Plate number, e.g. "01" — renders as a technical figure label. */
  label: string;
  title: string;
  body: string;
  visual: ReactNode;
};

/**
 * One callout: a plate label, a line-art illustration, then the claim and a
 * sentence of support.
 *
 * Four columns wide on the page grid. The card box spans the columns, but its
 * contents are inset so neither the drawing nor the copy runs into the rules
 * on either side — the inset matches the drawing's own width, so the figure
 * and the sentence beneath it share an edge. The illustration sits in a
 * fixed-height well so the three cards keep their titles on a shared baseline
 * whatever their figures measure.
 */
const classes = {
  // The inset is a fixed measure, so it eats proportionally more of a
  // narrow column. It tapers as the columns close up, and goes entirely
  // once the cards stack and there are no rules left to clear.
  root: "col-span-4 flex flex-col gap-10 px-7 max-xl:px-4 max-md:col-span-12 max-md:px-0",
  label:
    "font-medium font-mono text-figure-label text-xs uppercase tracking-[0.18em]",
  // Stacked in one column there is no shared baseline to hold, so the well
  // stops reserving height the figure does not use.
  well: "flex h-[340px] items-center justify-center max-md:h-auto",
  // Padded off the drawing above it, so the claim reads as a separate zone
  // rather than as a caption hanging off the figure.
  copy: "flex flex-col gap-4 pt-8",
  title: "font-medium font-sans text-base text-primary-foreground",
  body: "text-pretty font-sans text-[15px] text-figure-body leading-[1.6]",
} as const;

export const CalloutCard = ({
  label,
  title,
  body,
  visual,
}: CalloutCardProperties) => (
  <article className={classes.root}>
    <p className={classes.label}>{label}</p>
    <div className={classes.well}>{visual}</div>
    <div className={classes.copy}>
      <h3 className={classes.title}>{title}</h3>
      <p className={classes.body}>{body}</p>
    </div>
  </article>
);
