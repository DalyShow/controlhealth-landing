import { Waveform } from "@/components/marketing/atoms/waveform";
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
 * centred on both axes and the waveform bleeding off the bottom edge.
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
  // waveform, which sits 63px above the section's bottom edge (a 96px strip
  // offset 33px below it — see the Waveform atom). The 50% is half the message
  // group's own height, since that group is centred in the section.
  //
  // The half-height term mirrors the section's own `max(100dvh,660px)` floor.
  // Without that floor a short viewport shrinks the band below the height of
  // the sprite row, and the centred row spills over the copy and the waveform.
  spriteBand:
    "absolute inset-x-0 top-full flex h-[calc(max(50dvh,330px)-63px-50%)] items-center justify-center max-sm:hidden",
  // One row, never stacking. `w-max` keeps it on its natural width so the
  // centring does not squeeze it into a wrap.
  sprites: "flex w-max flex-nowrap items-start gap-14",
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
    <Waveform />
  </section>
);
