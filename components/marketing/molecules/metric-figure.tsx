import { MetricLabel } from "@/components/marketing/atoms/metric-label";
import type { ReactNode } from "react";

type MetricFigureProperties = {
  label: string;
  /** A glyph beside the name. Left out, the name stands alone. */
  icon?: ReactNode;
  /** A figure drawing that fills the width of the card, such as `LabPanelVisual`. */
  figure: ReactNode;
};

/**
 * A section of a `MetricCard` that is a drawing rather than a figure: the
 * name of what it shows, and the drawing across the full width beneath.
 */
const classes = {
  root: "flex flex-col gap-3",
  figure: "block w-full",
} as const;

export const MetricFigure = ({
  label,
  icon,
  figure,
}: MetricFigureProperties) => (
  <div className={classes.root}>
    <MetricLabel label={label} {...(icon ? { icon } : {})} />
    <div className={classes.figure}>{figure}</div>
  </div>
);
