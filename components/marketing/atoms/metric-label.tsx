import type { ReactNode } from "react";

type MetricLabelProperties = {
  /** A glyph beside the name. Left out, the name stands alone. */
  icon?: ReactNode;
  label: string;
};

/**
 * The heading of each section of a `MetricCard`: a glyph and the name of the
 * metric, small and quiet, so the figure or list beneath does the talking.
 */
const classes = {
  root: "flex items-center gap-2",
  icon: "size-4 shrink-0 text-primary-foreground [&_svg]:size-full",
  label:
    "font-sans text-[12px] text-primary-foreground/70 leading-none tracking-[0.01em]",
} as const;

export const MetricLabel = ({ icon, label }: MetricLabelProperties) => (
  <div className={classes.root}>
    {icon ? (
      <span aria-hidden="true" className={classes.icon}>
        {icon}
      </span>
    ) : null}
    <span className={classes.label}>{label}</span>
  </div>
);
