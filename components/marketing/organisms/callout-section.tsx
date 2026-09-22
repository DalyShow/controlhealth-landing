import type { ReactNode } from "react";

type CalloutSectionProperties = {
  headline: string;
  body: string;
  children: ReactNode;
};

/**
 * Three-up callout row on the deep surface below the hero, introduced by a
 * centred headline. Hairline rules separate the columns rather than boxing
 * each card, so the row reads as one plate of technical figures instead of
 * three cards.
 */
const classes = {
  section: "w-full bg-figure-ground py-32 max-md:py-20",
  inner:
    "mx-auto flex w-full max-w-[1280px] flex-col gap-24 px-11 max-md:gap-16 max-md:px-6",
  header: "mx-auto flex max-w-[54ch] flex-col items-center gap-5 text-center",
  headline:
    "font-display font-medium text-[clamp(1.875rem,1.35rem+1.6vw,2.75rem)] text-primary-foreground leading-[1.15]",
  lede: "text-pretty font-sans text-figure-body text-lg leading-[1.6] max-sm:text-base",
  grid: "grid w-full grid-cols-3 gap-0 max-md:grid-cols-1 max-md:gap-16 [&>*+*]:border-figure-rule [&>*+*]:border-l max-md:[&>*+*]:border-l-0 max-md:[&>*+*]:border-t max-md:[&>*+*]:pt-16",
} as const;

export const CalloutSection = ({
  headline,
  body,
  children,
}: CalloutSectionProperties) => (
  <section className={classes.section}>
    <div className={classes.inner}>
      <header className={classes.header}>
        <h2 className={classes.headline}>{headline}</h2>
        <p className={classes.lede}>{body}</p>
      </header>
      <div className={classes.grid}>{children}</div>
    </div>
  </section>
);
