import {
  type NavLink,
  NavLinks,
} from "@/components/marketing/molecules/nav-links";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type LandingNavProperties = {
  logo: ReactNode;
  /** Where the logo goes. Home, on every page including home itself. */
  logoHref: string;
  /** Read in place of the logo, which is an image with no text of its own. */
  logoLabel: string;
  links: NavLink[];
  ctaLabel: string;
  ctaHref?: string;
};

/**
 * Landing page header: logo left, links centred, call to action right. It
 * overlays the hero rather than sitting above it, so the hero copy stays
 * centred in the viewport.
 *
 * The header owns the logo's link rather than taking a pre-wrapped one, so
 * every page gets the same target and the same accessible name without having
 * to remember to supply them.
 */
const classes = {
  header:
    "absolute inset-x-0 top-0 z-10 flex items-center justify-between px-11 pt-[34px] max-sm:px-6",
  // The lockup is only 23px tall, which is a mean target. Padding enlarges
  // the hit area and an equal negative margin keeps the layout where it was.
  home: "-my-2 inline-flex items-center rounded-sm py-2 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-figure-accent focus-visible:outline-offset-4",
  links: "-translate-x-1/2 absolute left-1/2 max-md:hidden",
  cta: "gap-2 border-glint",
} as const;

export const LandingNav = ({
  logo,
  logoHref,
  logoLabel,
  links,
  ctaLabel,
  ctaHref,
}: LandingNavProperties) => (
  <header className={classes.header}>
    <a aria-label={logoLabel} className={classes.home} href={logoHref}>
      {logo}
    </a>

    <div className={classes.links}>
      <NavLinks links={links} />
    </div>

    {ctaHref ? (
      <Button asChild className={classes.cta} size="lg">
        <a href={ctaHref}>
          {ctaLabel}
          <ChevronRight />
        </a>
      </Button>
    ) : (
      <Button className={classes.cta} size="lg" type="button">
        {ctaLabel}
        <ChevronRight />
      </Button>
    )}
  </header>
);
