import { BrandLockup } from "@/components/marketing/atoms/brand-lockup";
import type { NavLink } from "@/components/marketing/molecules/nav-links";
import { CaseStudyWall } from "@/components/marketing/organisms/case-study-wall";
import { LandingNav } from "@/components/marketing/organisms/landing-nav";
import { assetPath } from "@/lib/asset-path";
import { CASE_STUDY_SCENARIOS } from "@/lib/case-study-scenarios";
import type { Metadata } from "next";

/**
 * A standalone page for the case study wall, while it is built, with the nav
 * over it and no footer so it can be tried in context. It is not in the
 * navigation yet; once it is settled it can move onto a page of its own
 * or take the place of the single case study on the homepage.
 */

/** Beside the call to action in the nav, as plain text. */
const NAV_TEXT_LINK = {
  label: "View Pricing",
  href: assetPath("/pricing"),
} satisfies NavLink;

const NAV_CTA_LABEL = "Build your Panel";
const LOCKUP_SRC = "/assets/lockup-light.svg";

const WALL = {
  headline: "Your Health Isn’t Standard. Neither Is Your Panel.",
  subheadline:
    "Your symptoms, health history, wearable trends, and goals shape a biomarker panel built around the questions your body is raising.",
  description:
    "Eighteen situations people bring to testing, and the markers each one points to.",
} as const;



const classes = {
  // The wall runs straight on from under the fixed nav, with room for it.
  page: "relative w-full bg-figure-ground pt-[72px]",
} as const;

export const metadata: Metadata = {
  title: "Case studies | Control Health",
  description: WALL.description,
};

const CaseStudiesPage = () => (
  <main className={classes.page}>
    <LandingNav
      ctaLabel={NAV_CTA_LABEL}
      logo={<BrandLockup src={assetPath(LOCKUP_SRC)} />}
      logoHref={assetPath("/")}
      logoLabel="Control Health, back to home"
      textLink={NAV_TEXT_LINK}
    />
    <CaseStudyWall
      headline={WALL.headline}
      scenarios={CASE_STUDY_SCENARIOS}
      subheadline={WALL.subheadline}
    />
  </main>
);

export default CaseStudiesPage;
