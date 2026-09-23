import { BiomarkerRange } from "@/components/marketing/atoms/biomarker-range";
import { HeroCopy } from "@/components/marketing/molecules/hero-copy";
import type { ReactNode } from "react";

type LandingHeroProperties = {
  /**
   * Omit both to use the frame without its message: the media, the stat bar
   * and the biomarker strip, with the call to action still centred.
   */
  headline?: string;
  subheadline?: string;
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
    "panel relative isolate flex items-center justify-center overflow-hidden bg-hero-gradient px-6",
  anchor: "relative",
  // The band runs from the bottom of the message group down to the top of the
  // marker strip, which stands 24px off the section's bottom edge — see the
  // BiomarkerRange atom. `max(50dvh,340px)` is half the panel's height, the
  // distance from its middle to its bottom edge, and has to track the 680px
  // floor on the `panel` utility. The 50% is half the message group's own
  // height, since that group is centred in the section.
  //
  // The bar hangs off the bottom of the band, a fixed distance above the
  // strip, because the readout riding the strip rises into the same band and
  // has to clear it. Anchored to the bottom rather than the top, it keeps
  // that clearance at every window height.
  //
  // The band is the width of the viewport, centred on the message group,
  // rather than the width of the group itself. Without a headline the group
  // is only as wide as its button, and a bar squeezed into that overlaps its
  // own readings.
  spriteBand:
    "-translate-x-1/2 absolute top-full left-1/2 flex h-[calc(max(50dvh,340px)-24px-50%)] w-screen items-end justify-center pb-[188px] max-sm:pb-[158px] [@media(max-height:780px)]:pb-[152px]",
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
        {...(headline ? { headline } : {})}
        {...(subheadline ? { subheadline } : {})}
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
