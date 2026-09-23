import { BrandLockup } from "@/components/marketing/atoms/brand-lockup";
import { FootstepsIcon } from "@/components/marketing/atoms/footsteps-icon";
import { AiInputVisual } from "@/components/marketing/atoms/ai-input-visual";
import { ConnectPlatformVisual } from "@/components/marketing/atoms/connect-platform-visual";
import { HeroMedia } from "@/components/marketing/atoms/hero-media";
import { LabPanelVisual } from "@/components/marketing/atoms/lab-panel-visual";
import { RollingFigure } from "@/components/marketing/atoms/rolling-figure";
import { TickingFigure } from "@/components/marketing/atoms/ticking-figure";
import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import type { NavLink } from "@/components/marketing/molecules/nav-links";
import { StatBar } from "@/components/marketing/molecules/stat-bar";
import { StatSprite } from "@/components/marketing/molecules/stat-sprite";
import type { TrustItem } from "@/components/marketing/molecules/trust-row";
import { CalloutCard } from "@/components/marketing/molecules/callout-card";
import { CalloutSection } from "@/components/marketing/organisms/callout-section";
import {
  type CaseStudySlide,
  CaseStudySection,
} from "@/components/marketing/organisms/case-study-section";
import { HeartRateSprite } from "@/components/marketing/organisms/heart-rate-sprite";
import { LandingCta } from "@/components/marketing/organisms/landing-cta";
import {
  type FooterColumn,
  LandingFooter,
  type SocialLink,
} from "@/components/marketing/organisms/landing-footer";
import { LandingHero } from "@/components/marketing/organisms/landing-hero";
import { LandingNav } from "@/components/marketing/organisms/landing-nav";
import { ScanHero } from "@/components/marketing/organisms/scan-hero";
import { assetPath } from "@/lib/asset-path";
import type { CaseStudyResults } from "@/lib/biomarkers";
import { Activity, LockKeyhole, Moon, Shield } from "lucide-react";
import type { ReactNode } from "react";

type HeroVariant = "scan" | "media";

type Callout = {
  /** Plate number, which also selects the figure. */
  label: "01" | "02" | "03";
  title: string;
  body: string;
};

/**
 * Hero copy for the personalized-panel landing page.
 */
/**
 * Which hero the page leads with. Both stay built and wired: the media hero
 * with its footage, stat bar and biomarker strip is kept, not removed, so
 * switching back is this one line.
 */
const ACTIVE_HERO: HeroVariant = "scan";

/**
 * The sections below the case study are built but hidden while the top of the
 * page is worked out as full-screen panels. Set to true to bring them back.
 */
const SHOW_LOWER_SECTIONS = false;

/** Who the first case study follows. */
const CASE_STUDY_INTRO = "Sarah, 41, avid runner";

/**
 * Sarah's panel, from the case study. Only the results it states: serum iron,
 * vitamin D and the metabolic markers were tested, but no result is given, so
 * they are not pinned. "Thyroid markers" is read as TSH and Free T4. Health
 * copy on a marketing page — needs the same clinical review as the forty.
 */
const SARAH = {
  person: "Sarah",
  results: {
    // What explains her fatigue.
    Hemoglobin: {
      status: "finding",
      reading: "Mildly low",
      meaning: "Her blood is carrying slightly less oxygen.",
    },
    MCV: {
      status: "finding",
      reading: "Low",
      meaning:
        "Her red blood cells are smaller than normal, a pattern that points to iron.",
    },
    Ferritin: {
      status: "finding",
      reading: "Low",
      meaning: "Her iron stores are depleted.",
    },
    "Total iron-binding capacity": {
      status: "finding",
      reading: "High",
      meaning: "Raised, a common sign her body is short of iron.",
    },
    "Transferrin saturation": {
      status: "finding",
      reading: "Low",
      meaning: "Little of the iron in her blood is available to carry.",
    },
    // What it is not.
    TSH: {
      status: "clear",
      reading: "In range",
      meaning: "Points away from an underactive thyroid.",
    },
    "Free T4": {
      status: "clear",
      reading: "In range",
      meaning: "Her thyroid hormone is where it should be.",
    },
    "Vitamin B12": {
      status: "clear",
      reading: "In range",
      meaning: "Points away from B12 deficiency as a cause of her anemia.",
    },
    Folate: {
      status: "clear",
      reading: "In range",
      meaning: "Points away from folate deficiency as a cause of her anemia.",
    },
    "hs-CRP": {
      status: "clear",
      reading: "In range",
      meaning:
        "No sign of inflammation, so her low ferritin can be taken at face value.",
    },
  },
} satisfies CaseStudyResults;

/** The first case study's headline and body. */
const CASE_STUDY_MESSAGE = {
  headline: "The Why Runs Deeper.",
  subheadline:
    "One comprehensive at-home biomarker panel connects your wearable data to the biology behind it",
} as const;

/**
 * The slides the case study shrinks into the first of. Placeholder copy and
 * stills while the slides are designed.
 */
const CASE_STUDY_SLIDES = [
  {
    headline: "Headline goes here",
    subheadline: "Subheadline goes here",
    image: assetPath("/media/video-4-poster.webp"),
  },
  {
    headline: "Headline goes here",
    subheadline: "Subheadline goes here",
    image: assetPath("/media/about-believe.webp"),
  },
  {
    headline: "Headline goes here",
    subheadline: "Subheadline goes here",
    image: assetPath("/media/about-data.webp"),
  },
] satisfies CaseStudySlide[];

/** Copy for the scan hero, from the Figma frame (1290:42929). */
const SCAN_HERO = {
  headline: "Measure what matters",
  body: "Control Health is a personalized health intelligence platform that brings together your health records and wearable data to help you customize lab tests that matter most to you.",
  ctaLabel: "Get the Personalized Panel",
} as const;

/** The reassurances along the bottom of the scan hero. */
const TRUST = [
  { icon: Shield, label: "HIPAA-Aligned" },
  { icon: LockKeyhole, label: "Private by design" },
  { icon: Activity, label: "60k+ providers" },
] satisfies TrustItem[];

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
  { label: "About us", href: assetPath("/about") },
  { label: "Pricing", href: assetPath("/pricing") },
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

/** Closing call to action, sharing the callouts' ground. */
const CTA = {
  headline: "Personalized lab panels",
  subheadline:
    "Free platform access. Pay only when you order labs. No subscription required.",
  ctaLabel: "Get Started",
} as const;

/**
 * Footer. Link targets are placeholders until the sitemap settles; the copy
 * and the groupings are from the supplied design.
 */
const FOOTER = {
  markLabel: "Control Health",
  blurb:
    "Control Health is the health intelligence platform that connects your health records, labs, and wearables. Ask AI with context and build personalized panels from your own history.",
  statement:
    "It's your health. You were always in control. Now it should finally feel like it.",
  legal: "© 2026 Control Health. All rights reserved.",
} as const;

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: assetPath("/pricing") },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    heading: "Company",
    links: [{ label: "About us", href: assetPath("/about") }],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQs", href: "#faqs" },
      {
        label: "support@controlhealth.ai",
        href: "mailto:support@controlhealth.ai",
      },
    ],
  },
] satisfies FooterColumn[];

const SOCIALS = [
  { network: "instagram", href: "https://instagram.com" },
  { network: "facebook", href: "https://facebook.com" },
  { network: "x", href: "https://x.com" },
  { network: "linkedin", href: "https://linkedin.com" },
  { network: "tiktok", href: "https://tiktok.com" },
] satisfies SocialLink[];

/**
 * Both heroes, built. Only the active one renders; the other is a description
 * of an element, not a mounted component, so keeping it costs nothing.
 */
const HEROES = {
  scan: (
    <ScanHero
      body={SCAN_HERO.body}
      ctaLabel={SCAN_HERO.ctaLabel}
      figureSrc={assetPath("/media/hero-figure-3.webp")}
      headline={SCAN_HERO.headline}
      trust={TRUST}
    />
  ),
  media: (
    <LandingHero
      ctaLabel={HERO.ctaLabel}
      headline={HERO.headline}
      media={
        <HeroMedia
          poster={assetPath("/media/video-3-poster.webp")}
          src={assetPath("/media/video-3.mp4")}
        />
      }
      sprites={
        <StatBar>
          <StatSprite
            beatMs={STEP_BEAT_MS}
            delta="12%"
            figure={<TickingFigure base={14_804} />}
            icon={<FootstepsIcon />}
            label="Steps today"
          />
          <HeartRateSprite restingBpm={RESTING_BPM} />
          <StatSprite
            delta="+5m"
            figure={<RollingFigure from="5h 00m" value="6h 52m" />}
            icon={<Moon strokeWidth={SPRITE_ICON_STROKE_WIDTH} />}
            label="Sleep last night"
          />
        </StatBar>
      }
      subheadline={HERO.subheadline}
    />
  ),
} satisfies Record<HeroVariant, ReactNode>;

/**
 * The first case study: one person, their live readings, their footage, and
 * the biomarker strip. It reuses the media hero's pieces in its own section.
 */
const CASE_STUDY = (
  <CaseStudySection
    caseStudy={SARAH}
    headline={CASE_STUDY_MESSAGE.headline}
    intro={CASE_STUDY_INTRO}
    media={
      <HeroMedia
        poster={assetPath("/media/video-3-poster.webp")}
        src={assetPath("/media/video-3.mp4")}
      />
    }
    slides={CASE_STUDY_SLIDES}
    stats={
      // Keyed: the section is a client component, and a fragment handed to
      // one from the server arrives as a list.
      <>
        <StatSprite
          beatMs={STEP_BEAT_MS}
          delta="12%"
          figure={<TickingFigure base={14_804} />}
          icon={<FootstepsIcon />}
          key="steps"
          label="Steps today"
        />
        <HeartRateSprite key="heart-rate" restingBpm={RESTING_BPM} />
        <StatSprite
          delta="+5m"
          figure={<RollingFigure from="5h 00m" value="6h 52m" />}
          icon={<Moon strokeWidth={SPRITE_ICON_STROKE_WIDTH} />}
          key="sleep"
          label="Sleep last night"
        />
      </>
    }
    subheadline={CASE_STUDY_MESSAGE.subheadline}
  />
);

const classes = {
  page: "relative w-full",
} as const;

const LandingPage = () => (
  <main className={classes.page}>
    <LandingNav
      ctaLabel={NAV_CTA_LABEL}
      links={NAV_LINKS}
      logo={<BrandLockup src={assetPath("/assets/lockup-light.svg")} />}
      logoHref={assetPath("/")}
      logoLabel="Control Health, back to home"
    />
    {HEROES[ACTIVE_HERO]}
    {CASE_STUDY}
    {SHOW_LOWER_SECTIONS ? (
      <>
        <CalloutSection body={SECTION.body} headline={SECTION.headline}>
          {CALLOUTS.map((callout, index) => (
            <CalloutCard
              body={callout.body}
              flipped={index % 2 === 1}
              key={callout.label}
              label={callout.label}
              title={callout.title}
              visual={CALLOUT_VISUALS[callout.label]}
            />
          ))}
        </CalloutSection>
        <LandingCta
          ctaLabel={CTA.ctaLabel}
          headline={CTA.headline}
          subheadline={CTA.subheadline}
        />
        <LandingFooter
          blurb={FOOTER.blurb}
          columns={FOOTER_COLUMNS}
          legal={FOOTER.legal}
          markLabel={FOOTER.markLabel}
          socials={SOCIALS}
          statement={FOOTER.statement}
          wordmarkSrc={assetPath("/assets/wordmark-light.svg")}
        />
      </>
    ) : null}
  </main>
);

export default LandingPage;
