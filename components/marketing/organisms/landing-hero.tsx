import { BiomarkerRange } from "@/components/marketing/atoms/biomarker-range";
import { HeroCopy } from "@/components/marketing/molecules/hero-copy";
import type { ReactNode } from "react";

type LandingHeroProperties = {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref?: string;
  /** Full-bleed media layer painted behind everything else. */
  media?: ReactNode;
  /** Stat sprites, laid out in a centred row beneath the message group. */
  sprites?: ReactNode;
};

/**
 * Full-viewport marketing hero: dark gradient surface with the message group
 * centred on both axes and the biomarker strip along the bottom edge.
 *
 * The sprites hang off the bottom of the message group rather than sitting in
 * the flex flow, so adding them does not push the copy off the centre of the
 * viewport. They sit centred in the band between the message group and the
 * waveform.
 */
const classes = {
  section:
    "relative isolate flex min-h-[max(100dvh,660px)] w-full items-center justify-center overflow-hidden bg-hero-gradient px-6",
  anchor: "relative",
  // The band runs from the bottom of the message group down to the top of the
  // marker strip, which stands 24px off the section's bottom edge — see the
  // BiomarkerRange atom. The 50% is half the message group's own height, since
  // that group is centred in the section.
  //
  // The bar sits at the top of that band rather than centred in it, because
  // the readout riding the marker strip rises into the bottom of the same
  // band. Kept to one line the two clear each other, so neither has to give
  // way while the strip is being read.
  spriteBand:
    "absolute inset-x-0 top-full flex h-[calc(max(50dvh,330px)-24px-50%)] items-end justify-center pb-[188px] max-sm:pb-[158px] [@media(max-height:780px)]:pb-[152px]",
  // `w-max` keeps the bar on its natural width so the centring does not
  // squeeze it into a wrap.
  sprites: "w-max max-w-full",
} as const;

export const LandingHero = ({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  media,
  sprites,
}: LandingHeroProperties) => (
  <section className={classes.section}>
    {media}
    <div className={classes.anchor}>
      <HeroCopy
        ctaLabel={ctaLabel}
        headline={headline}
        subheadline={subheadline}
        {...(ctaHref ? { ctaHref } : {})}
      />
      {sprites ? (
        <div className={classes.spriteBand}>
          <div className={classes.sprites}>{sprites}</div>
        </div>
      ) : null}
    </div>
    <BiomarkerRange />
  </section>
);
