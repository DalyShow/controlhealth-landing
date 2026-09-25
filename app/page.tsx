import { AiInputVisual } from "@/components/marketing/atoms/ai-input-visual";
import { BrandLockup } from "@/components/marketing/atoms/brand-lockup";
import { ConnectPlatformVisual } from "@/components/marketing/atoms/connect-platform-visual";
import { FootstepsIcon } from "@/components/marketing/atoms/footsteps-icon";
import { HeroMedia } from "@/components/marketing/atoms/hero-media";
import { LabPanelVisual } from "@/components/marketing/atoms/lab-panel-visual";
import { RollingFigure } from "@/components/marketing/atoms/rolling-figure";
import { TickingFigure } from "@/components/marketing/atoms/ticking-figure";
import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import { CalloutCard } from "@/components/marketing/molecules/callout-card";
import { MetricCard } from "@/components/marketing/molecules/metric-card";
import type { NavLink } from "@/components/marketing/molecules/nav-links";
import { StatBar } from "@/components/marketing/molecules/stat-bar";
import { StatSprite } from "@/components/marketing/molecules/stat-sprite";
import type { TrustItem } from "@/components/marketing/molecules/trust-row";
import { AiAssistantSection } from "@/components/marketing/organisms/ai-assistant-section";
import { BiomarkerPanelSection } from "@/components/marketing/organisms/biomarker-panel-section";
import { CalloutSection } from "@/components/marketing/organisms/callout-section";
import { CaseStudyWall } from "@/components/marketing/organisms/case-study-wall";
import {
  CaseStudySection,
  type CaseStudySlide,
} from "@/components/marketing/organisms/case-study-section";
import { HeartRateSprite } from "@/components/marketing/organisms/heart-rate-sprite";
import {
  LabChecklist,
  type LabGroup,
} from "@/components/marketing/organisms/lab-checklist";
import { LandingCta } from "@/components/marketing/organisms/landing-cta";
import {
  type FooterColumn,
  LandingFooter,
  type SocialLink,
} from "@/components/marketing/organisms/landing-footer";
import { LandingHero } from "@/components/marketing/organisms/landing-hero";
import { LandingNav } from "@/components/marketing/organisms/landing-nav";
import { RunningHeartRate } from "@/components/marketing/organisms/running-heart-rate";
import { ScanHero } from "@/components/marketing/organisms/scan-hero";
import {
  type Signal,
  SignalChips,
} from "@/components/marketing/organisms/signal-chips";
import { SleepReading } from "@/components/marketing/organisms/sleep-reading";
import { TrendReading } from "@/components/marketing/organisms/trend-reading";
import type { CaseStudyResults } from "@/lib/biomarkers";
import { assetPath } from "@/lib/asset-path";
import { CASE_STUDY_SCENARIOS } from "@/lib/case-study-scenarios";
import {
  Activity,
  BatteryFull,
  BatteryLow,
  FlaskConical,
  Gauge,
  LockKeyhole,
  Moon,
  Shield,
} from "lucide-react";
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
const HERO = {
  headline: "Measure what matters.",
  subheadline:
    "Build a more complete picture of your health with personalized testing.",
  ctaLabel: "Get the Personalized Panel",
} as const;

/**
 * Which hero the page leads with. Both stay built and wired: the media hero
 * with its footage, stat bar and biomarker strip is kept, not removed, so
 * switching back is this one line.
 */
const ACTIVE_HERO: HeroVariant = "scan";

/** Names the case study slider for assistive technology. */
const CASE_STUDY_LABEL = "Sarah’s story";

/** The AI section, after her panel: what she can ask of it. */
const AI_SECTION = {
  headline: "Her Health Keeps Changing. Her AI Keeps Up.",
  body: "Connected to Sarah’s biometric trends, clinical history, and biomarker results, AI helps her understand what’s changing, ask better questions, and stay in step with her health over time.",
  prompt: "How can we help",
  questionsLabel: "Questions Sarah might ask",
} as const;

/** Questions a person might ask it, walled up behind the input. */
const AI_QUESTIONS = [
  "What has changed most in my health data over the past month?",
  "How do my latest biomarker results help explain the changes in my heart rate and recovery?",
  "Which of my results deserve the most attention right now?",
  "Are my metrics moving back toward my personal baseline?",
  "Do my recent trends suggest that my current plan is working?",
  "How are my sleep, training, menstrual cycle, and symptoms affecting one another?",
  "Does my current training load look appropriate for how my body is recovering?",
  "Are there patterns I might be missing across my wearable and clinical data?",
  "Which symptoms should I continue tracking - and how often?",
  "What changes would be worth discussing with my healthcare professional?",
  "Which biomarkers should I consider retesting, and when?",
  "Are any of my results or trends potentially urgent?",
  "What questions should I bring to my next medical appointment?",
  "Can you summarize my progress since my last biomarker panel?",
  "What would meaningful improvement look like for me over the next four weeks?",
];

/** The section after the case study: her panel, and what it showed. */
const PANEL_SECTION = {
  headline: "The Data Showed What. The Panel Showed Why.",
  body: "Sarah’s wearable captured the change. Her personalized biomarker panel connected those signals to what was happening beneath the surface - turning scattered metrics into a clearer, more complete picture.",
  label: "Sarah’s Personalized Panel",
} as const;

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
  headline: "She Knows What Strong Feels Like.",
  subheadline:
    "At 36, Sarah is an experienced runner training for her third half marathon. She knows the difference between a tough run - and something feeling off.",
} as const;

/**
 * The shape of her week behind each reading on the slides, oldest first.
 * Recovery slides, sleep holds, and fatigue climbs regardless.
 */
const RECOVERY_WEEK = [72, 70, 71, 66, 63, 64, 58, 54, 49, 45, 41];
const SLEEP_WEEK = [7.6, 7.9, 7.7, 7.8, 8.0, 7.7, 7.8];
const FATIGUE_WEEK = [34, 36, 35, 41, 44, 43, 50, 55, 58, 63, 68];
/** Her recovery climbing back once she is treated, for the last slide. */
const RECOVERY_RETURN = [41, 44, 43, 49, 53, 52, 58, 63, 67, 72, 78];

/** The readings from the first two slides, recapped as the nurse reviews them. */
const REVIEWED_SIGNALS = [
  { label: "Heart rate", trend: "up" },
  { label: "Recovery", trend: "down" },
  { label: "Fatigue", trend: "up" },
] satisfies Signal[];

/** The labs the nurse orders: the groups behind her ten pinned results. */
const ORDERED_LABS = [
  { name: "Iron panel", markers: 3 },
  { name: "Blood count", markers: 2 },
  { name: "Thyroid", markers: 2 },
  { name: "B12 & folate", markers: 2 },
  { name: "Inflammation", markers: 1 },
] satisfies LabGroup[];

/**
 * Her usual heart rate at her running pace. The first slide tells her
 * reading against it.
 */
const USUAL_RUNNING_BPM = 152;

/**
 * The four slides that follow the case study once it has shrunk into the
 * first card, telling her story through to the other side.
 */
const CASE_STUDY_SLIDES = [
  {
    headline: "Same Run. Different Story.",
    subheadline:
      "Her regular training suddenly felt harder. Her heart rate was climbing while her recovery kept falling - even though nothing in her routine had changed.",
    image: assetPath("/media/slide-01-hilltop.webp"),
    overlay: (
      <MetricCard>
        <RunningHeartRate state="strained" usualBpm={USUAL_RUNNING_BPM} />
        <TrendReading
          delta="Down 31 this week"
          from={72}
          icon={<BatteryLow strokeWidth={SPRITE_ICON_STROKE_WIDTH} />}
          label="Recovery"
          points={RECOVERY_WEEK}
          suffix="%"
          to={41}
          trend="down"
        />
      </MetricCard>
    ),
  },
  {
    headline: "Rested on Paper. Running on Empty.",
    subheadline:
      "She was still getting nearly eight hours of sleep. But each day demanded more coffee, more snacks, and more effort just to keep up.",
    image: assetPath("/media/slide-02-work.webp"),
    overlay: (
      <MetricCard>
        <SleepReading
          delta="In her usual range"
          points={SLEEP_WEEK}
          slept="7h 48m"
        />
        <TrendReading
          delta="Up 34 this week"
          from={34}
          icon={<Gauge strokeWidth={SPRITE_ICON_STROKE_WIDTH} />}
          label="Fatigue"
          points={FATIGUE_WEEK}
          to={68}
          trend="up"
          unit="/ 100"
        />
      </MetricCard>
    ),
  },
  {
    headline: "The Pattern Called for a Closer Look.",
    subheadline:
      "Rather than dismissing it as a tough training cycle, Sarah chose to look deeper - ordering a comprehensive biomarker panel to investigate what might be driving the change.",
    image: assetPath("/media/slide-03-nurse.webp"),
    overlay: (
      <MetricCard>
        <SignalChips
          icon={<Activity strokeWidth={SPRITE_ICON_STROKE_WIDTH} />}
          label="Signals reviewed"
          signals={REVIEWED_SIGNALS}
        />
        <LabChecklist
          groups={ORDERED_LABS}
          icon={<FlaskConical strokeWidth={SPRITE_ICON_STROKE_WIDTH} />}
          label="Labs ordered"
        />
      </MetricCard>
    ),
  },
  {
    headline: "Better Than Back.",
    subheadline:
      "With clearer answers and an informed plan, Sarah returned to the trail. Her heart rate settled, her recovery climbed, and she wasn’t just back to baseline - she was moving beyond it.",
    image: assetPath("/media/slide-04-final.webp"),
    overlay: (
      <MetricCard>
        <RunningHeartRate state="settled" usualBpm={USUAL_RUNNING_BPM} />
        <TrendReading
          delta="Up 37 in six weeks"
          from={41}
          icon={<BatteryFull strokeWidth={SPRITE_ICON_STROKE_WIDTH} />}
          label="Recovery"
          points={RECOVERY_RETURN}
          suffix="%"
          to={78}
          tone="calm"
          trend="up"
        />
      </MetricCard>
    ),
  },
] satisfies CaseStudySlide[];

/** Copy for the scan hero, from the Figma frame (1290:42929). */
const SCAN_HERO = {
  headline: "Measure what matters",
  body: "Control Health is a personalized health intelligence platform that brings together your health records and wearable data to help you customize lab tests that matter most to you.",
  ctaLabel: "Get the Personalized Panel",
} as const;

/**
 * The cut-out figure standing in front of the scan field. Versioned in the
 * name: GitHub Pages caches assets for ten minutes, so a replacement image
 * under the old name reaches returning visitors in the new layout late.
 */
const SCAN_HERO_FIGURE_SRC = assetPath("/media/hero-figure-5.webp");

/** The reassurances along the bottom of the scan hero. */
const TRUST = [
  { icon: Shield, label: "HIPAA-Aligned" },
  { icon: LockKeyhole, label: "Private by design" },
  { icon: Activity, label: "60k+ providers" },
] satisfies TrustItem[];

/** Beside the call to action in the nav, as plain text. */
const NAV_TEXT_LINK = {
  label: "View Pricing",
  href: assetPath("/pricing"),
} satisfies NavLink;

const NAV_CTA_LABEL = "Build your Panel";

/** Milliseconds per footfall — a slow, readable walking pace. */
const STEP_BEAT_MS = 900;

/** Where the heart rate workout starts and returns to. */
const RESTING_BPM = 58;

const LOCKUP_SRC = assetPath("/assets/lockup-light.svg");

/** Placeholder footage for the hero's media layer. */
const HERO_MEDIA_SRC = assetPath("/media/video-3.mp4");
const HERO_MEDIA_POSTER = assetPath("/media/video-3-poster.webp");

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

/**
 * Both heroes, built. Only the active one renders; the other is a description
 * of an element, not a mounted component, so keeping it costs nothing.
 */
const HEROES = {
  scan: (
    <ScanHero
      body={SCAN_HERO.body}
      ctaLabel={SCAN_HERO.ctaLabel}
      figureSrc={SCAN_HERO_FIGURE_SRC}
      headline={SCAN_HERO.headline}
      trust={TRUST}
    />
  ),
  media: (
    <LandingHero
      ctaLabel={HERO.ctaLabel}
      headline={HERO.headline}
      media={<HeroMedia poster={HERO_MEDIA_POSTER} src={HERO_MEDIA_SRC} />}
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
 * The "How Control Health works" callouts are built but hidden while the top
 * of the page is worked out as full-screen panels. Set to true to bring them
 * back, between the case study and the closing call to action.
 */
const SHOW_HOW_IT_WORKS = false;

/**
 * The first case study: one person, their live readings, their footage, and
 * the biomarker strip. It reuses the media hero's pieces in its own section.
 */
const CASE_STUDY = (
  <CaseStudySection
    headline={CASE_STUDY_MESSAGE.headline}
    label={CASE_STUDY_LABEL}
    media={<HeroMedia poster={HERO_MEDIA_POSTER} src={HERO_MEDIA_SRC} />}
    slides={CASE_STUDY_SLIDES}
    subheadline={CASE_STUDY_MESSAGE.subheadline}
  />
);

/**
 * What follows the hero: Sarah, the single case study that scales down into
 * its slider, with her biomarker panel after it, or the wall of eighteen
 * scenarios over the strip in their place. Both stay built; this line picks
 * which one the page shows, while the wall is tried in context.
 */
type StoryVariant = "sarah" | "wall";

const WALL = {
  headline: "Your Health Isn’t Standard. Neither Is Your Panel.",
  subheadline:
    "Your symptoms, health history, wearable trends, and goals shape a biomarker panel built around the questions your body is raising.",
} as const;

const ACTIVE_STORY: StoryVariant = "wall";

const STORIES = {
  sarah: (
    <>
      {CASE_STUDY}
      <BiomarkerPanelSection
        body={PANEL_SECTION.body}
        caseStudy={SARAH}
        headline={PANEL_SECTION.headline}
        label={PANEL_SECTION.label}
      />
    </>
  ),
  wall: (
    <CaseStudyWall
      headline={WALL.headline}
      scenarios={CASE_STUDY_SCENARIOS}
      subheadline={WALL.subheadline}
    />
  ),
} satisfies Record<StoryVariant, ReactNode>;

const classes = {
  page: "relative w-full",
} as const;

const LandingPage = () => (
  <main className={classes.page}>
    <LandingNav
      ctaLabel={NAV_CTA_LABEL}
      logo={<BrandLockup src={LOCKUP_SRC} />}
      logoHref={assetPath("/")}
      logoLabel="Control Health, back to home"
      textLink={NAV_TEXT_LINK}
    />
    {HEROES[ACTIVE_HERO]}
    {STORIES[ACTIVE_STORY]}
    <AiAssistantSection
      body={AI_SECTION.body}
      headline={AI_SECTION.headline}
      prompt={AI_SECTION.prompt}
      questions={AI_QUESTIONS}
      questionsLabel={AI_SECTION.questionsLabel}
    />
    {SHOW_HOW_IT_WORKS ? (
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
    ) : null}
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
  </main>
);

export default LandingPage;
