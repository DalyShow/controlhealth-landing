import { BrandLockup } from "@/components/marketing/atoms/brand-lockup";
import { FootstepsIcon } from "@/components/marketing/atoms/footsteps-icon";
import { HeroMedia } from "@/components/marketing/atoms/hero-media";
import { RollingFigure } from "@/components/marketing/atoms/rolling-figure";
import { TickingFigure } from "@/components/marketing/atoms/ticking-figure";
import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import type { NavLink } from "@/components/marketing/molecules/nav-links";
import { StatSprite } from "@/components/marketing/molecules/stat-sprite";
import { HeartRateSprite } from "@/components/marketing/organisms/heart-rate-sprite";
import { LandingHero } from "@/components/marketing/organisms/landing-hero";
import { LandingNav } from "@/components/marketing/organisms/landing-nav";
import { assetPath } from "@/lib/asset-path";
import { Moon } from "lucide-react";

/**
 * Hero copy for the personalized-panel landing page.
 */
const HERO = {
  headline: "Measure what matters.",
  subheadline:
    "Build a more complete picture of your health with personalized testing.",
  ctaLabel: "Get the Personalized Panel",
} as const;

/**
 * Primary navigation. Targets are placeholders until the sections exist.
 */
const NAV_LINKS = [
  { label: "About us", href: "#about" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it works", href: "#how-it-works" },
] satisfies NavLink[];

const NAV_CTA_LABEL = "Join the waitlist";

/** Milliseconds per footfall — a slow, readable walking pace. */
const STEP_BEAT_MS = 900;

/** Where the heart rate workout starts and returns to. */
const RESTING_BPM = 58;

const classes = {
  page: "relative w-full",
} as const;

const LandingPage = () => (
  <main className={classes.page}>
    <LandingNav
      ctaLabel={NAV_CTA_LABEL}
      links={NAV_LINKS}
      logo={<BrandLockup src={assetPath("/assets/lockup-light.svg")} />}
    />
    <LandingHero
      ctaLabel={HERO.ctaLabel}
      headline={HERO.headline}
      media={<HeroMedia src={assetPath("/media/video-3.mp4")} />}
      sprites={
        <>
          <StatSprite
            beatMs={STEP_BEAT_MS}
            delta="12%"
            figure={<TickingFigure base={14_804} />}
            icon={<FootstepsIcon />}
            label="Steps"
          />
          <HeartRateSprite restingBpm={RESTING_BPM} />
          <StatSprite
            delta="+ 5 mins"
            figure={<RollingFigure from="5h 00m" value="6h 52m" />}
            icon={<Moon strokeWidth={SPRITE_ICON_STROKE_WIDTH} />}
            label="Sleep"
          />
        </>
      }
      subheadline={HERO.subheadline}
    />
  </main>
);

export default LandingPage;
