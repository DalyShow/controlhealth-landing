import { Heading } from "@/components/marketing/atoms/heading";
import type { ReactNode } from "react";

type CalloutSectionProperties = {
  headline: string;
  body: string;
  children: ReactNode;
};

/**
 * Three-up callout row on the deep surface below the hero, introduced by a
 * centred headline.
 *
 * Both rows sit on the page's twelve-column grid: the header takes the middle
 * eight columns, each callout takes four. Hairline rules separate the columns
 * rather than boxing each card, so the row reads as one plate of technical
 * figures instead of three cards.
 */
const classes = {
  section: "w-full bg-figure-ground py-32 max-md:py-20",
  shell:
    "mx-auto flex w-full max-w-page flex-col gap-24 px-24 max-xl:px-10 max-md:gap-16 max-sm:px-6",
  grid: "grid grid-cols-12 gap-x-6",
  header:
    "col-span-8 col-start-3 flex flex-col items-center gap-5 text-center max-lg:col-span-10 max-lg:col-start-2 max-md:col-span-12 max-md:col-start-1",
  headline: "text-primary-foreground",
  lede: "text-pretty font-sans text-figure-body text-lg leading-[1.6] max-sm:text-base",
  /**
   * The rule belongs to the gutter rather than to either card, so it is drawn
   * half a gutter to the left of the card box instead of being that box's
   * border. That keeps it off the card's own padding, which is free to inset
   * the contents as far as it likes without dragging the rule along with it.
   */
  cards:
    "grid grid-cols-12 gap-x-6 [&>*+*]:relative [&>*+*]:before:absolute [&>*+*]:before:inset-y-0 [&>*+*]:before:-left-3 [&>*+*]:before:w-px [&>*+*]:before:bg-figure-rule [&>*+*]:before:content-[''] max-md:gap-y-16 max-md:[&>*+*]:border-figure-rule max-md:[&>*+*]:border-t max-md:[&>*+*]:pt-16 max-md:[&>*+*]:before:hidden",
} as const;

export const CalloutSection = ({
  headline,
  body,
  children,
}: CalloutSectionProperties) => (
  <section className={classes.section}>
    <div className={classes.shell}>
      <div className={classes.grid}>
        <header className={classes.header}>
          <Heading className={classes.headline} level={2}>
            {headline}
          </Heading>
          <p className={classes.lede}>{body}</p>
        </header>
      </div>
      <div className={classes.cards}>{children}</div>
    </div>
  </section>
);
