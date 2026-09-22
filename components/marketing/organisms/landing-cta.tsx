import { Heading } from "@/components/marketing/atoms/heading";
import { Button } from "@/components/ui/button";

type LandingCtaProperties = {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref?: string;
};

/**
 * Closing call to action, on the same ground as the callouts above it so the
 * two read as one dark run rather than as separate bands.
 *
 * Takes the hero's title treatment to bookend the page, but renders as an h2:
 * the hero owns the document's only h1, and the ramp step is a matter of
 * weight on the page rather than of rank in the outline.
 */
const classes = {
  section: "w-full bg-figure-ground pt-32 pb-64 max-md:pt-16 max-md:pb-40",
  shell: "mx-auto w-full max-w-page px-24 max-xl:px-10 max-sm:px-6",
  grid: "grid grid-cols-12 gap-x-6",
  inner:
    "col-span-8 col-start-3 flex flex-col items-center gap-8 text-center max-lg:col-span-10 max-lg:col-start-2 max-md:col-span-12 max-md:col-start-1",
  copy: "flex flex-col items-center gap-5",
  headline: "text-balance text-spectrum-gradient",
  subheadline:
    "max-w-[46ch] text-balance font-sans text-figure-body text-lg leading-[1.6] max-sm:text-base",
  cta: "w-full max-w-[17rem] bg-primary-50 text-primary-950 hover:bg-primary-100",
} as const;

export const LandingCta = ({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
}: LandingCtaProperties) => (
  <section className={classes.section}>
    <div className={classes.shell}>
      <div className={classes.grid}>
        <div className={classes.inner}>
          <div className={classes.copy}>
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
  </section>
);
