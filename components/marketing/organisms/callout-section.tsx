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
  headline:
    "font-display font-medium text-[clamp(1.875rem,1.35rem+1.6vw,2.75rem)] text-primary-foreground leading-[1.15]",
  lede: "text-pretty font-sans text-figure-body text-lg leading-[1.6] max-sm:text-base",
  /**
   * The rule belongs in the middle of the gutter, not hard against the next
   * card. Pulling each card half a gutter left puts its border there, and an
   * equal padding puts the content back on its column.
   */
  cards:
    "grid grid-cols-12 gap-x-6 [&>*+*]:-ml-3 [&>*+*]:border-figure-rule [&>*+*]:border-l [&>*+*]:pl-3 max-md:gap-y-16 max-md:[&>*+*]:ml-0 max-md:[&>*+*]:border-l-0 max-md:[&>*+*]:border-t max-md:[&>*+*]:pt-16 max-md:[&>*+*]:pl-0",
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
          <h2 className={classes.headline}>{headline}</h2>
          <p className={classes.lede}>{body}</p>
        </header>
      </div>
      <div className={classes.cards}>{children}</div>
    </div>
  </section>
);
