import { BrandLockup } from "@/components/marketing/atoms/brand-lockup";
import type { NavLink } from "@/components/marketing/molecules/nav-links";
import type { PricingPlan } from "@/components/marketing/molecules/pricing-card";
import {
  type FooterColumn,
  LandingFooter,
  type SocialLink,
} from "@/components/marketing/organisms/landing-footer";
import { LandingNav } from "@/components/marketing/organisms/landing-nav";
import { PricingClose } from "@/components/marketing/organisms/pricing-close";
import {
  type ComparisonColumn,
  type ComparisonGroup,
  PricingComparison,
} from "@/components/marketing/organisms/pricing-comparison";
import { PricingHero } from "@/components/marketing/organisms/pricing-hero";
import { assetPath } from "@/lib/asset-path";
import type { Metadata } from "next";

/**
 * Primary navigation. Targets are placeholders until the sections exist.
 */
const NAV_LINKS = [
  { label: "About us", href: "#about" },
  { label: "Pricing", href: assetPath("/pricing") },
  { label: "How it works", href: "#how-it-works" },
] satisfies NavLink[];

const NAV_CTA_LABEL = "Join the waitlist";
const LOCKUP_SRC = "/assets/lockup-light.svg";
const WORDMARK_SRC = "/assets/wordmark-light.svg";
const WAITLIST_CTA = "Join the waitlist";

const HERO = {
  eyebrow: "No subscription, no commitment",
  headline: "Pay for what's useful, when it's useful.",
  blurb:
    "The platform is free to use anytime. Connect your records, ask questions, and explore your data. You only pay when a lab panel is useful to you — at cost plus a transparent markup.",
} as const;

const PLANS = [
  {
    badge: "Basic",
    name: "The Platform",
    price: "Free",
    summary: "Connect, translate, ask anything",
    features: [
      "All your records in one place",
      "AI Chat with your full health history",
      "Engineered for privacy",
    ],
    ctaLabel: WAITLIST_CTA,
  },
  {
    badge: "Standard",
    name: "Foundation Panel",
    price: "One time $259",
    summary: "A baseline",
    features: [
      "Everything in the Platform",
      "Baseline of 110+ biomarkers",
      "No subscription needed",
      "Customize before you order",
    ],
    ctaLabel: WAITLIST_CTA,
  },
  {
    badge: "Advanced · ~15-minute setup",
    name: "Personalized Panel",
    price: "Priced by what you choose",
    summary: "A panel designed for you",
    features: [
      "Everything in the Platform",
      "Curated from your full history",
      "No subscription needed",
      "Pay only for what needs tested",
    ],
    ctaLabel: WAITLIST_CTA,
  },
] satisfies PricingPlan[];

const COMPARISON_COLUMNS = [
  { name: "Platform", price: "Free", tagline: "Your health, in one place." },
  {
    name: "Foundation Panel",
    price: "$259, one-time",
    tagline: "Establish a baseline.",
  },
  {
    name: "Personalized Panel",
    price: "Priced by what you choose",
    tagline: "Test only what you need.",
  },
] satisfies ComparisonColumn[];

/** Values run in column order: Platform, Foundation, Personalized. */
const COMPARISON_GROUPS = [
  {
    heading: "The Platform",
    rows: [
      { label: "All your records in one place", values: [true, true, true] },
      {
        label: "AI Chat with your full health history",
        values: [true, true, true],
      },
      { label: "Wearable data, connected", values: [true, true, true] },
      { label: "Doesn't train AI models", values: [true, true, true] },
      { label: "Privacy and HIPAA-aligned", values: [true, true, true] },
    ],
  },
  {
    heading: "Your panel",
    rows: [
      { label: "100+ Biomarkers", values: [false, "Yes", "Targeted"] },
      {
        label: "Personalized Suggestions",
        values: [false, "Next order", "Yes"],
      },
      { label: "Customizable", values: [false, "Yes", "Yes"] },
      { label: "Results flow into platform", values: [false, "Yes", "Yes"] },
      { label: "At Home Blood Draw", values: [false, "+$75", "+$75"] },
      { label: "Track trends over time", values: [false, "Yes", "Yes"] },
    ],
  },
  {
    heading: "Pricing",
    rows: [
      { label: "HSA/FSA eligible", values: [false, "Yes", "Yes"] },
      { label: "What you pay", values: ["$0", "$259", "Custom"] },
      {
        label: "Setup",
        values: ["~2 minutes", "~5 minutes", "~15 minutes"],
      },
    ],
  },
] satisfies ComparisonGroup[];

const CLOSE = {
  headline: "No subscription. On anything.",
  body: "The platform is free. Panels are one-time purchases. Pay when a panel is useful to you, not every month it isn't. Not sure where to start? Most people begin with the Foundation Panel. Once those results are in your record, your next panel can be built from there.",
  aside: "Prefer an at-home draw? Add it at checkout for $75.",
  ctaLabel: "Join the Waitlist",
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
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    heading: "Company",
    links: [{ label: "About us", href: "#about" }],
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
  title: "Pricing | Control Health",
  description: HERO.blurb,
};

const PricingPage = () => (
  <main className={classes.page}>
    <LandingNav
      ctaLabel={NAV_CTA_LABEL}
      links={NAV_LINKS}
      logo={<BrandLockup src={assetPath(LOCKUP_SRC)} />}
      logoHref={assetPath("/")}
      logoLabel="Control Health, back to home"
    />
    <PricingHero
      blurb={HERO.blurb}
      eyebrow={HERO.eyebrow}
      headline={HERO.headline}
      plans={PLANS}
    />
    <PricingComparison
      columns={COMPARISON_COLUMNS}
      groups={COMPARISON_GROUPS}
    />
    <PricingClose
      aside={CLOSE.aside}
      body={CLOSE.body}
      ctaLabel={CLOSE.ctaLabel}
      headline={CLOSE.headline}
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

export default PricingPage;
