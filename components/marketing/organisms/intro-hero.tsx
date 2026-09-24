import { Heading } from "@/components/marketing/atoms/heading";
import { Button } from "@/components/ui/button";

type IntroHeroProperties = {
  /** A pill above the headline. Left out, the headline leads. */
  badge?: string;
  headline: string;
  body: string;
  /** A button under the words. Left out, the hero ends on the body. */
  cta?: { label: string; href: string };
};

/**
 * A short hero for an interior page: a headline and body, with an optional
 * badge above and button below, centred on the ground, only as tall as its
 * words. The top padding
 * clears the header, which sits over the page.
 *
 * On a short window it gives up height so what follows always peeks 96px up
 * from the bottom: 440px tall where there is room, the window less 96px
 * where there is not, but never below 340px, and never shorter than its
 * content, so longer copy, or a badge and a button, are not cut off.
 */
const classes = {
  section:
    "flex h-[max(340px,min(440px,calc(100dvh-96px)))] min-h-fit w-full flex-col items-center justify-center bg-figure-ground px-6 pt-24 pb-6 text-center max-md:h-auto max-md:pt-36 max-md:pb-16",
  // The teal pill of the panel label on the homepage.
  badge:
    "m-0 inline-flex rounded-full border border-teal-300/60 bg-teal-300/10 px-3.5 py-[7px] font-sans font-semibold text-[13px] text-teal-300 leading-none",
  headline:
    "mt-6 max-w-[16em] text-balance text-white leading-[1.08] tracking-[-0.01em]",
  headlineFirst:
    "max-w-[16em] text-balance text-white leading-[1.08] tracking-[-0.01em]",
  body: "mt-5 max-w-[632px] text-pretty font-sans text-[18px] text-white/80 leading-[28px] max-md:text-[16px] max-md:leading-[24px]",
  cta: "mt-9 w-full max-w-[17rem] border border-hero-glass-rule shadow-cta hover:border-hero-glass-edge",
} as const;

export const IntroHero = ({
  badge,
  headline,
  body,
  cta,
}: IntroHeroProperties) => (
  <section className={classes.section}>
    {badge ? <p className={classes.badge}>{badge}</p> : null}
    <Heading
      className={badge ? classes.headline : classes.headlineFirst}
      level={1}
    >
      {headline}
    </Heading>
    <p className={classes.body}>{body}</p>
    {cta ? (
      <Button asChild className={classes.cta} size="xl">
        <a href={cta.href}>{cta.label}</a>
      </Button>
    ) : null}
  </section>
);
