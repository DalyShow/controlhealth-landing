import { Heading } from "@/components/marketing/atoms/heading";
import type { ReactNode } from "react";

type PageHeroProperties = {
  eyebrow: string;
  headline: string;
  lede: string;
  /** Full-bleed media layer painted behind everything else. */
  media?: ReactNode;
};

/**
 * Hero for an interior page: the landing hero's full-bleed treatment, with the
 * parts that only belong to the landing page taken out.
 *
 * No stat sprites, no waveform bleeding off the bottom edge and no call to
 * action — the page below is the call to action. What is left is the video,
 * the title ramp and a paragraph, which is why this is a sibling of
 * LandingHero rather than four more flags on it.
 */
const classes = {
  // On a phone the words sit 48px in, so they keep clear of the edges when
  // the hero is masked down to a card 24px in from the window.
  section:
    "relative isolate flex min-h-[max(100dvh,660px)] w-full items-center justify-center overflow-hidden bg-hero-gradient px-6 max-sm:px-12",
  copy: "relative flex max-w-[52rem] flex-col items-center gap-6 text-center",
  eyebrow:
    "font-medium font-mono text-[11px] text-spectrum-peach uppercase tracking-[0.18em]",
  headline: "text-balance text-white",
  lede: "max-w-[54ch] text-pretty font-sans text-lg text-white/75 leading-[1.65] max-sm:text-base",
} as const;

export const PageHero = ({
  eyebrow,
  headline,
  lede,
  media,
}: PageHeroProperties) => (
  <section className={classes.section}>
    {media}
    <div className={classes.copy}>
      <p className={classes.eyebrow}>{eyebrow}</p>
      <Heading className={classes.headline} level={1}>
        {headline}
      </Heading>
      <p className={classes.lede}>{lede}</p>
    </div>
  </section>
);
