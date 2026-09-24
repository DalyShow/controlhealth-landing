import { BrandLockup } from "@/components/marketing/atoms/brand-lockup";
import { LabPanelVisual } from "@/components/marketing/atoms/lab-panel-visual";
import { MetricCard } from "@/components/marketing/molecules/metric-card";
import { MetricFigure } from "@/components/marketing/molecules/metric-figure";
import type { NavLink } from "@/components/marketing/molecules/nav-links";
import { AiExchange } from "@/components/marketing/organisms/ai-exchange";
import { IntroHero } from "@/components/marketing/organisms/intro-hero";
import { LandingCta } from "@/components/marketing/organisms/landing-cta";
import {
  type FooterColumn,
  LandingFooter,
  type SocialLink,
} from "@/components/marketing/organisms/landing-footer";
import { LandingNav } from "@/components/marketing/organisms/landing-nav";
import { RecordsScanReading } from "@/components/marketing/organisms/records-scan-reading";
import {
  type StackedSlide,
  StackedSlides,
} from "@/components/marketing/organisms/stacked-slides";
import { StepsReading } from "@/components/marketing/organisms/steps-reading";
import { assetPath } from "@/lib/asset-path";
import type { Metadata } from "next";

/** Primary navigation. */
const NAV_LINKS = [
  { label: "About us", href: assetPath("/about") },
  { label: "Pricing", href: assetPath("/pricing") },
  { label: "How it works", href: assetPath("/how-it-works") },
] satisfies NavLink[];

const NAV_CTA_LABEL = "Join the waitlist";
const LOCKUP_SRC = "/assets/lockup-light.svg";
const WORDMARK_SRC = "/assets/wordmark-light.svg";

/** The hero. */
const HERO = {
  headline: "How it Works",
  body: "Three pieces working together: your records and wearables in one place, an AI assistant that translates what your data actually says, and lab panels that are personalized to you can be ordered when they’re useful to you.",
} as const;

/**
 * The exchange in the second slide. Placeholder copy, in the voice of the
 * story, until the real wording is written; it is health copy and needs the
 * same review as the rest.
 */
const AI_EXAMPLE = {
  question: "Why am I so tired lately?",
  answer:
    "Your sleep has held steady, but your ferritin came back low. Low iron is a common cause of fatigue, so it is worth raising at your next visit.",
} as const;

/** Milliseconds between steps in the step counter. */
const STEP_BEAT_MS = 900;

/**
 * The steps, as slides that stack as the page scrolls, each with its own
 * colour. The first image is
 * final, and the second; the third, of the nurse from the homepage slides,
 * stands in for now.
 */
const SLIDES = [
  {
    title: "Bring it all together",
    tone: "var(--color-teal-300)",
    widget: (
      <MetricCard surface="dark">
        <StepsReading
          base={14_804}
          beatMs={STEP_BEAT_MS}
          delta="12% above average"
        />
        <RecordsScanReading delta="Scanning 3 providers" records={312} />
      </MetricCard>
    ),
    headline: "Your Health, Connected.",
    body: "Pull your health records from the providers you’ve already seen. Sync your wearables. Add anything else you’ve uploaded yourself. Everything lives in one dashboard you can actually search",
    image: {
      src: assetPath("/media/hiw-01-wearables.webp"),
      alt: "",
      width: 2000,
      height: 1335,
    },
  },
  {
    title: "Ask anything",
    tone: "var(--color-marker-hormone)",
    widget: (
      <MetricCard surface="dark">
        <AiExchange answer={AI_EXAMPLE.answer} question={AI_EXAMPLE.question} />
      </MetricCard>
    ),
    headline: "Questions Meet Context.",
    body: "Ask anything. The AI assistant draws on your full health history, so the answers are about you, not the population. Get summaries, visit prep, and translations of what your records and labs actually mean.",
    image: {
      src: assetPath("/media/hiw-02-ask.webp"),
      alt: "",
      width: 2000,
      height: 1125,
    },
  },
  {
    title: "A Panel With Purpose.",
    tone: "var(--color-spectrum-peach)",
    widget: (
      <MetricCard surface="dark">
        <MetricFigure
          figure={<LabPanelVisual compact />}
          label="Your personalized panel"
        />
      </MetricCard>
    ),
    headline: "Order Personalized lab panels",
    body: "Turn insight into action. Order a personalized lab panel that AI shapes around your records and history, customize what’s tested, and get results you can use.",
    image: {
      src: assetPath("/media/slide-03-nurse.webp"),
      alt: "",
      width: 1672,
      height: 941,
    },
  },
] satisfies StackedSlide[];

const CLOSE = {
  eyebrow: "Get started",
  headline: "Personalized lab panels, built around your data.",
  subheadline:
    "A curated baseline measuring 100+ biomarkers. $259, one-time. Results uploaded to your Control Health dashboard. No subscription, no commitment.",
  ctaLabel: "See Pricing",
  ctaHref: assetPath("/pricing"),
} as const;

const FOOTER = {
  markLabel: "Control Health",
  blurb:
    "Control Health is the health intelligence platform that connects your health records, labs, and wearables. Ask AI with context and build personalized panels from your own history.",
  statement:
    "It’s your health. You were always in control. Now it should finally feel like it.",
  legal: "© 2026 Control Health. All rights reserved.",
} as const;

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: assetPath("/pricing") },
      { label: "How it works", href: assetPath("/how-it-works") },
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

const classes = {
  page: "relative w-full bg-figure-ground",
  // Room between the stack and the closing call to action.
  close: "pt-40 max-md:pt-24",
} as const;

export const metadata: Metadata = {
  title: "How it works | Control Health",
  description: HERO.body,
};

const HowItWorksPage = () => (
  <main className={classes.page}>
    <LandingNav
      ctaLabel={NAV_CTA_LABEL}
      links={NAV_LINKS}
      logo={<BrandLockup src={assetPath(LOCKUP_SRC)} />}
      logoHref={assetPath("/")}
      logoLabel="Control Health, back to home"
    />
    <IntroHero body={HERO.body} headline={HERO.headline} />
    <StackedSlides slides={SLIDES} />
    <div className={classes.close}>
      <LandingCta
        ctaHref={CLOSE.ctaHref}
        ctaLabel={CLOSE.ctaLabel}
        eyebrow={CLOSE.eyebrow}
        headline={CLOSE.headline}
        subheadline={CLOSE.subheadline}
      />
    </div>
    <LandingFooter
      blurb={FOOTER.blurb}
      columns={FOOTER_COLUMNS}
      legal={FOOTER.legal}
      markLabel={FOOTER.markLabel}
      socials={SOCIALS}
      statement={FOOTER.statement}
      wordmarkSrc={assetPath(WORDMARK_SRC)}
    />
  </main>
);

export default HowItWorksPage;
