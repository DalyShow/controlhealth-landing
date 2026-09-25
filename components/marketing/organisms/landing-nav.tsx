"use client";

import {
  type NavLink,
  NavLinks,
} from "@/components/marketing/molecules/nav-links";
import { Button } from "@/components/ui/button";
import { useScrolled } from "@/hooks/use-scrolled";
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
 * is fixed to the top of the window and overlays the hero rather than
 * sitting above it, so the hero copy stays centred in the viewport.
 *
 * At the top of the page it is clear, with room above it. Once the page has
 * scrolled it condenses into a bar of dark glass, blurring whatever passes
 * beneath, with a 0.5px hairline along its bottom edge, drawn as an inset
 * shadow so it adds nothing to the height of the bar. The bar is
 * `--nav-bar-h` tall, which anything pinned to the top of the window sits
 * beneath.
 *
 * The header owns the logo's link rather than taking a pre-wrapped one, so
 * every page gets the same target and the same accessible name without having
 * to remember to supply them.
 */
const classes = {
  headerAtTop:
    "fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-transparent shadow-[inset_0_-0.5px_0_transparent] px-11 pt-[34px] pb-4 backdrop-blur-[0px] transition-[padding,background-color,box-shadow,backdrop-filter] duration-300 ease-out max-sm:px-6",
  headerScrolled:
    "fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-figure-ground/70 shadow-[inset_0_-0.5px_0_var(--color-hero-glass-rule)] px-11 py-4 backdrop-blur-xl transition-[padding,background-color,box-shadow,backdrop-filter] duration-300 ease-out max-sm:px-6",
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
}: LandingNavProperties) => {
  const scrolled = useScrolled();

  return (
  <header className={scrolled ? classes.headerScrolled : classes.headerAtTop}>
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
};
