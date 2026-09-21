import {
  type NavLink,
  NavLinks,
} from "@/components/marketing/molecules/nav-links";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type LandingNavProperties = {
  logo: ReactNode;
  links: NavLink[];
  ctaLabel: string;
  ctaHref?: string;
};

/**
 * Landing page header: logo left, links centred, call to action right. It
 * overlays the hero rather than sitting above it, so the hero copy stays
 * centred in the viewport.
 */
const classes = {
  header:
    "absolute inset-x-0 top-0 z-10 flex items-center justify-between px-11 pt-[34px] max-sm:px-6",
  links: "-translate-x-1/2 absolute left-1/2 max-md:hidden",
  cta: "gap-2",
} as const;

export const LandingNav = ({
  logo,
  links,
  ctaLabel,
  ctaHref,
}: LandingNavProperties) => (
  <header className={classes.header}>
    {logo}

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
