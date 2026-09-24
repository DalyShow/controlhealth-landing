import { BrandLockup } from "@/components/marketing/atoms/brand-lockup";
import { HeroMedia } from "@/components/marketing/atoms/hero-media";
import type { NavLink } from "@/components/marketing/molecules/nav-links";
import { LandingCta } from "@/components/marketing/organisms/landing-cta";
import {
  type FooterColumn,
  LandingFooter,
  type SocialLink,
} from "@/components/marketing/organisms/landing-footer";
import { LandingNav } from "@/components/marketing/organisms/landing-nav";
import { PageHero } from "@/components/marketing/organisms/page-hero";
import type { ProseBlock } from "@/components/marketing/organisms/prose-section";
import { ShowcaseSection } from "@/components/marketing/organisms/showcase-section";
import { StickyScrollSection } from "@/components/marketing/organisms/sticky-scroll-section";
import { assetPath } from "@/lib/asset-path";
import type { Metadata } from "next";

/** Primary navigation. Targets are placeholders until the sections exist. */
const NAV_LINKS = [
  { label: "About us", href: assetPath("/about") },
  { label: "Pricing", href: assetPath("/pricing") },
  { label: "How it works", href: assetPath("/how-it-works") },
] satisfies NavLink[];

const NAV_CTA_LABEL = "Join the waitlist";
const LOCKUP_SRC = "/assets/lockup-light.svg";
const HERO_MEDIA_SRC = "/media/video-4.mp4";
const HERO_MEDIA_POSTER = "/media/video-4-poster.webp";
const WORDMARK_SRC = "/assets/wordmark-light.svg";

/** Quieter than the landing hero: this footage is a face filling the frame. */
const HERO_MEDIA_OPACITY = 0.6;

const HERO = {
  eyebrow: "Our story",
  headline: "A health platform built for you, not the system.",
  lede: "Most health platforms are built for doctors, insurers, or shareholders. Control Health is built for you. Whether you're navigating a chronic condition, optimizing your health, or just trying to stay on top of your wellness goals, Control Health brings your full picture together and helps you act on it.",
} as const;

/** Opens the run with a wide shot of the product itself. */
const PLATFORM = {
  eyebrow: "Why we built this",
  headline: "Concierge-level access to your health information",
  body: "For most people, navigating their own health means navigating alone. Records scattered across systems that don't talk to each other. Test results that never translate to anything actionable.",
  image: {
    src: assetPath("/media/about-platform.webp"),
    alt: "The Control Health dashboard, with a chat thread beside a connected health record",
    width: 1800,
    height: 1276,
  },
} as const;

/**
 * The panels the page pins and steps through. Copy is from the live page,
 * with two missing spaces in the middle paragraph repaired.
 */
const PANELS = [
  {
    heading: "What we believe",
    paragraphs: [
      "What's normal for the population isn't always what's normal for you. Nothing about you is one-size-fits-all, so your labs shouldn't be either.",
      "We're here to help you better understand your data, not to diagnose, prescribe, or replace your doctor. We treat your most personal data like it's your most personal data: we don't sell it, monetize it, or use it for anything other than making your own experience better and more personalized.",
      "And we believe that concierge-level access to health information shouldn't be a luxury. Everyone deserves a trusted, knowledgeable presence in their health journey.",
    ],
    image: {
      src: assetPath("/media/about-believe.webp"),
      alt: "Four friends walking together along a country road",
      width: 1100,
      height: 1355,
    },
  },
  {
    heading: "Your data is always yours",
    paragraphs: [
      "Your health data is your most personal information, and Control Health is engineered to treat it that way: HIPAA-aligned infrastructure, strong encryption everywhere your data moves and rests, and granular controls over what's shared and with whom. Your data is never sold, never monetized, and never used to train commercial AI models.",
    ],
    image: {
      src: assetPath("/media/about-data.webp"),
      alt: "A woman outdoors with her eyes closed, face turned to the sun",
      width: 1100,
      height: 1355,
    },
  },
  {
    heading: "Our Story",
    image: {
      src: assetPath("/media/about-story.webp"),
      alt: "Open landscape at golden hour",
      width: 1100,
      height: 733,
    },
    paragraphs: [
      'Control Health was launched with seed funding from Post Ventures, named after a close friend who suddenly passed away. "Give more than you take" was how he treated everyone around him, and is a core value at Post Ventures. He\'s a constant reminder that this is for the friends and family we all care about.',
      "The team at Control Health each hit the same healthcare wall from a different direction. Brad spent years on a chronic Lyme journey through a system with no answers. Bryan came through a health scare that made understanding his own health urgent. James, after scaling and selling a company, landed in the cash-pay world and found he could actually get better care.",
      "Different roads, same realization: the moment we all stopped waiting on an insurance company and took control of our own care, we got better. That's the whole idea behind Control Health.",
    ],
  },
] satisfies ProseBlock[];

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
    "It's your health. You were always in control. Now it should finally feel like it.",
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
} as const;

export const metadata: Metadata = {
  title: "About us | Control Health",
  description: HERO.lede,
};

const AboutPage = () => (
  <main className={classes.page}>
    <LandingNav
      ctaLabel={NAV_CTA_LABEL}
      links={NAV_LINKS}
      logo={<BrandLockup src={assetPath(LOCKUP_SRC)} />}
      logoHref={assetPath("/")}
      logoLabel="Control Health, back to home"
    />
    <PageHero
      eyebrow={HERO.eyebrow}
      headline={HERO.headline}
      lede={HERO.lede}
      media={
        <HeroMedia
          opacity={HERO_MEDIA_OPACITY}
          poster={assetPath(HERO_MEDIA_POSTER)}
          src={assetPath(HERO_MEDIA_SRC)}
        />
      }
    />
    <ShowcaseSection
      body={PLATFORM.body}
      eyebrow={PLATFORM.eyebrow}
      headline={PLATFORM.headline}
      image={PLATFORM.image}
    />
    <StickyScrollSection panels={PANELS} />
    <LandingCta
      ctaHref={CLOSE.ctaHref}
      ctaLabel={CLOSE.ctaLabel}
      eyebrow={CLOSE.eyebrow}
      headline={CLOSE.headline}
      subheadline={CLOSE.subheadline}
    />
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

export default AboutPage;
