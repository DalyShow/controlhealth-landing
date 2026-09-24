import type { ReactNode } from "react";

/**
 * The glass the card is made of: `light` is the frosted shell of the stat
 * bar, for footage; `dark` is a deep, near-opaque pane, for bright
 * photographs, where light glass washes out.
 */
type MetricSurface = "light" | "dark";

type MetricCardProperties = {
  surface?: MetricSurface;
  /** One `MetricReading` per metric. Hairlines are drawn between them. */
  children: ReactNode;
};

/**
 * The frosted shell the stat bar uses, as a card: a short stack of readings
 * laid over a photograph to carry a beat of the story.
 *
 * Hairlines come from the shell rather than the readings so each reading
 * stays unaware of where it sits in the stack.
 */
const classes = {
  light:
    "flex w-[280px] flex-col rounded-2xl border border-hero-glass-edge bg-hero-glass p-4 backdrop-blur-md max-sm:w-[248px] max-sm:p-3.5 [&>*+*]:mt-4 [&>*+*]:border-hero-glass-rule [&>*+*]:border-t [&>*+*]:pt-4 max-xl:[&>*+*]:mt-3 max-xl:[&>*+*]:pt-3",
  dark: "flex w-[280px] flex-col rounded-2xl border border-white/12 bg-figure-ground/70 p-4 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.6)] backdrop-blur-md max-sm:w-[248px] max-sm:p-3.5 [&>*+*]:mt-4 [&>*+*]:border-white/10 [&>*+*]:border-t [&>*+*]:pt-4 max-xl:[&>*+*]:mt-3 max-xl:[&>*+*]:pt-3",
} as const;

export const MetricCard = ({
  surface = "light",
  children,
}: MetricCardProperties) => <div className={classes[surface]}>{children}</div>;
