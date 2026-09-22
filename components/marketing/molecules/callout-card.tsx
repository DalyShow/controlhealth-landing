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
 * Four columns wide on the page grid, with no padding of its own — the
 * gutters do that work, so the copy and the drawing both start on a column.
 * The illustration sits in a fixed-height well so the three cards keep their
 * titles on a shared baseline whatever their figures measure.
 */
const classes = {
  root: "col-span-4 flex flex-col gap-10 max-md:col-span-12",
  label:
    "font-medium font-mono text-figure-label text-xs uppercase tracking-[0.18em]",
  // Stacked in one column there is no shared baseline to hold, so the well
  // stops reserving height the figure does not use.
  well: "flex h-[400px] items-center justify-center max-md:h-auto",
  copy: "flex flex-col gap-3",
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
