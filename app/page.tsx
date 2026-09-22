import { BrandLockup } from "@/components/marketing/atoms/brand-lockup";
import { FootstepsIcon } from "@/components/marketing/atoms/footsteps-icon";
import { AiInputVisual } from "@/components/marketing/atoms/ai-input-visual";
import { ConnectPlatformVisual } from "@/components/marketing/atoms/connect-platform-visual";
import { HeroMedia } from "@/components/marketing/atoms/hero-media";
import { LabPanelVisual } from "@/components/marketing/atoms/lab-panel-visual";
import { ImageCard } from "@/components/marketing/molecules/image-card";
import { RollingFigure } from "@/components/marketing/atoms/rolling-figure";
import { TickingFigure } from "@/components/marketing/atoms/ticking-figure";
import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import type { NavLink } from "@/components/marketing/molecules/nav-links";
import { StatSprite } from "@/components/marketing/molecules/stat-sprite";
import { CalloutCard } from "@/components/marketing/molecules/callout-card";
import { CalloutSection } from "@/components/marketing/organisms/callout-section";
import { HeartRateSprite } from "@/components/marketing/organisms/heart-rate-sprite";
import { ImageCardSection } from "@/components/marketing/organisms/image-card-section";
import { LandingHero } from "@/components/marketing/organisms/landing-hero";
import { LandingNav } from "@/components/marketing/organisms/landing-nav";
import { assetPath } from "@/lib/asset-path";
import { Moon } from "lucide-react";

type ImagePanel = {
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
  body: string;
};

type Callout = {
  /** Plate number, which also selects the figure. */
  label: "01" | "02" | "03";
  title: string;
  body: string;
};

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

/** Introduces the three callouts as one product rather than three features. */
const SECTION = {
  headline: "How Control Health works",
  body: "Three pieces working together: your records and wearables in one place, an AI assistant that helps you better understand your data, and lab panels personalized to you.",
} as const;

/** The three callouts below the hero, in the order they are numbered. */
const CALLOUTS = [
  {
    label: "01",
    title: "Connect your health records and wearables",
    body: "Pull records, labs and every device you already wear into one place, so nothing about your health lives in a silo.",
  },
  {
    label: "02",
    title: "Understand what your data actually says",
    body: "Ask anything. The AI assistant draws on your full health history, so the answers are about you, not the population. Get summaries, visit prep, and translations of what your records and labs actually mean.",
  },
  {
    label: "03",
    title: "Take action with personalized lab panels",
    body: "Turn insight into action. Use AI-generated information based on your available records and health history to explore and customize lab tests available through an independent nationwide provider.",
  },
] satisfies Callout[];

/** Figures keyed by plate label, so the copy and the drawing stay separate. */
const CALLOUT_VISUALS = {
  "01": <ConnectPlatformVisual />,
  "02": <AiInputVisual />,
  "03": <LabPanelVisual />,
} as const;

/**
 * Image row under the callouts. Copy and photography are both placeholders,
 * awaiting the real art direction.
 */
const IMAGE_PANELS = [
  {
    src: "/media/card-placeholder-1.jpg",
    alt: "Placeholder",
    width: 900,
    height: 1125,
    title: "Placeholder headline one",
    body: "Placeholder supporting copy for the first image card, awaiting the real text.",
  },
  {
    src: "/media/card-placeholder-2.jpg",
    alt: "Placeholder",
    width: 900,
    height: 1125,
    title: "Placeholder headline two",
    body: "Placeholder supporting copy for the second image card, awaiting the real text.",
  },
  {
    src: "/media/card-placeholder-3.jpg",
    alt: "Placeholder",
    width: 900,
    height: 1125,
    title: "Placeholder headline three",
    body: "Placeholder supporting copy for the third image card, awaiting the real text.",
  },
] satisfies ImagePanel[];

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
    <CalloutSection body={SECTION.body} headline={SECTION.headline}>
      {CALLOUTS.map((callout) => (
        <CalloutCard
          body={callout.body}
          key={callout.label}
          label={callout.label}
          title={callout.title}
          visual={CALLOUT_VISUALS[callout.label]}
        />
      ))}
    </CalloutSection>
    <ImageCardSection>
      {IMAGE_PANELS.map((panel) => (
        <ImageCard
          alt={panel.alt}
          body={panel.body}
          height={panel.height}
          key={panel.src}
          // Served from a project subpath on Pages, so the src needs prefixing.
          src={assetPath(panel.src)}
          title={panel.title}
          width={panel.width}
        />
      ))}
    </ImageCardSection>
  </main>
);

export default LandingPage;
