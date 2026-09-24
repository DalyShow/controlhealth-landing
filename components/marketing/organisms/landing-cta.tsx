import { Heading } from "@/components/marketing/atoms/heading";
import { Button } from "@/components/ui/button";

type LandingCtaProperties = {
  /** Optional label above the headline, when the page wants one. */
  eyebrow?: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref?: string;
};

/**
 * Closing call to action, on a rounded card of deep brand navy, set on the
 * page grid, that closes the dark run of sections above it before the
 * footer.
 *
 * Takes the hero's title treatment to bookend the page, but renders as an h2:
 * the hero owns the document's only h1, and the ramp step is a matter of
 * weight on the page rather than of rank in the outline.
 */
const classes = {
  // On the ground, inset by the page gutters so the card lines up with the
  // grids above it, and clear of the footer below.
  section: "w-full bg-figure-ground px-11 pb-40 max-md:pb-24 max-sm:px-6",
  // A card of the deepest brand navy, a step up from the ground, rounded as
  // the case study slides are, with the same padding above and below so the
  // message sits centred in it.
  card: "mx-auto w-full max-w-[calc(var(--container-page)-88px)] rounded-[28px] bg-primary-950 py-40 max-md:py-24 max-sm:rounded-[20px]",
  shell: "mx-auto w-full max-w-page px-24 max-xl:px-10 max-sm:px-6",
  grid: "grid grid-cols-12 gap-x-6",
  inner:
    "col-span-8 col-start-3 flex flex-col items-center gap-8 text-center max-lg:col-span-10 max-lg:col-start-2 max-md:col-span-12 max-md:col-start-1",
  copy: "flex flex-col items-center gap-5",
  eyebrow:
    "font-medium font-mono text-[11px] text-spectrum-peach uppercase tracking-[0.18em]",
  headline: "text-balance text-spectrum-gradient",
  subheadline:
    "max-w-[46ch] text-balance font-sans text-lg text-primary-100/85 leading-[1.6] max-sm:text-base",
  cta: "w-full max-w-[17rem] bg-primary-50 text-primary-950 hover:bg-primary-100",
} as const;

export const LandingCta = ({
  eyebrow,
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
}: LandingCtaProperties) => (
  <section className={classes.section}>
    <div className={classes.card}>
      <div className={classes.shell}>
        <div className={classes.grid}>
          <div className={classes.inner}>
            <div className={classes.copy}>
              {eyebrow ? <p className={classes.eyebrow}>{eyebrow}</p> : null}
              <Heading as={2} className={classes.headline} level={1}>
                {headline}
              </Heading>
              <p className={classes.subheadline}>{subheadline}</p>
            </div>
            {ctaHref ? (
              <Button asChild className={classes.cta} size="xl">
                <a href={ctaHref}>{ctaLabel}</a>
              </Button>
            ) : (
              <Button className={classes.cta} size="xl" type="button">
                {ctaLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);
