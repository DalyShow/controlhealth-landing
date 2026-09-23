import { BiomarkerRange } from "@/components/marketing/atoms/biomarker-range";
import { StatBar } from "@/components/marketing/molecules/stat-bar";
import type { ReactNode } from "react";

type CaseStudySectionProperties = {
  /** Who the study follows, e.g. "Sarah, 41, avid runner". */
  intro: string;
  /** The live readings, as `StatSprite`s; the section puts them in the bar. */
  stats: ReactNode;
  /** Full-bleed footage or still, painted behind everything else. */
  media: ReactNode;
};

/**
 * A full-screen panel following one person: a single bar centred at the top
 * that says who they are and then what their body is doing, their footage
 * behind, and the biomarker strip along the bottom edge.
 *
 * The intro leads the bar, set exactly as the readings are — same face,
 * weight and size — so it reads as the first entry in one line of data
 * rather than a title beside a widget. It stays an H2 in the outline: it
 * introduces the section, and the page's H1 belongs to the hero.
 */
const classes = {
  section: "panel relative isolate overflow-hidden bg-hero-gradient",
  top: "absolute inset-x-0 top-0 z-10 flex justify-center px-11 pt-[34px] max-sm:px-6",
  // Matches `StatSprite`'s value: if the readings change size, change this.
  intro:
    "m-0 whitespace-nowrap font-sans font-semibold text-[13.5px] text-primary-foreground leading-none max-sm:text-[12px]",
} as const;

export const CaseStudySection = ({
  intro,
  stats,
  media,
}: CaseStudySectionProperties) => (
  <section className={classes.section}>
    {media}

    <div className={classes.top}>
      <StatBar lead={<h2 className={classes.intro}>{intro}</h2>}>
        {stats}
      </StatBar>
    </div>

    <BiomarkerRange />
  </section>
);
