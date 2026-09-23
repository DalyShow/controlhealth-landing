import { Heading } from "@/components/marketing/atoms/heading";
import type { ReactNode } from "react";

type CalloutCardProperties = {
  /** Plate number, e.g. "01" — renders as a technical figure label. */
  label: string;
  title: string;
  body: string;
  visual: ReactNode;
  /** Puts the figure on the left and the copy on the right. */
  flipped?: boolean;
};

/**
 * One callout, as a full-width row: the claim and its sentence on one side,
 * the line-art figure on the other, alternating down the run.
 *
 * Three of these side by side gave each figure a third of the page and left
 * the titles at the smallest step on the ramp. A row apiece buys the figure
 * half the grid and the title room to be read as a claim rather than a
 * caption.
 *
 * Copy and figure take five columns each with two of air between, so the
 * drawing is framed by exactly the box the words are, rather than floating
 * small inside a wider well. Both are placed explicitly on the same grid row,
 * because the flipped variant asks for column eight before column one and
 * auto-placement would otherwise wrap the second of them onto a new row.
 * Below `lg` there is no room to sit side by side, so it unwinds to one
 * column with the copy always first, whichever side it takes on a wide
 * screen.
 */
const classes = {
  root: "grid grid-cols-12 items-center gap-x-6",
  copyLeft:
    "col-span-5 col-start-1 row-start-1 flex flex-col gap-5 max-lg:col-span-12 max-lg:row-start-1",
  copyRight:
    "col-span-5 col-start-8 row-start-1 flex flex-col gap-5 max-lg:col-span-12 max-lg:col-start-1 max-lg:row-start-1",
  figureRight:
    "col-span-5 col-start-8 row-start-1 flex items-center justify-center max-lg:col-span-12 max-lg:col-start-1 max-lg:row-start-2 max-lg:mt-12",
  figureLeft:
    "col-span-5 col-start-1 row-start-1 flex items-center justify-center max-lg:col-span-12 max-lg:row-start-2 max-lg:mt-12",
  label:
    "font-medium font-mono text-figure-label text-xs uppercase tracking-[0.18em]",
  // A step between the ramp's second and third, which are 44px and 24px at the
  // 1440 frame with nothing in between. If this size turns up again it wants
  // to become a ramp step rather than an override.
  title:
    "text-balance text-primary-foreground text-[clamp(1.75rem,1.45rem+0.94vw,2.25rem)]",
  body: "max-w-[46ch] text-pretty font-sans text-figure-body text-base leading-[1.65]",
} as const;

export const CalloutCard = ({
  label,
  title,
  body,
  visual,
  flipped = false,
}: CalloutCardProperties) => (
  <article className={classes.root}>
    <div className={flipped ? classes.copyRight : classes.copyLeft}>
      <p className={classes.label}>{label}</p>
      <Heading as={3} className={classes.title} level={2}>
        {title}
      </Heading>
      <p className={classes.body}>{body}</p>
    </div>

    <div className={flipped ? classes.figureLeft : classes.figureRight}>
      {visual}
    </div>
  </article>
);
