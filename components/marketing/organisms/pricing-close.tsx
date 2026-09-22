import { Heading } from "@/components/marketing/atoms/heading";
import { Button } from "@/components/ui/button";

type PricingCloseProperties = {
  headline: string;
  body: string;
  /** The at-home draw note, set apart from the paragraph above it. */
  aside: string;
  ctaLabel: string;
  ctaHref?: string;
};

/**
 * Closing panel of the pricing page, on the same ground as everything above so
 * the page reads as one dark run. Takes the same title treatment and spectrum
 * as the landing page's closing call to action, for the sake of the rhyme.
 */
const classes = {
  section: "w-full bg-figure-ground pt-16 pb-40 max-md:pt-8 max-md:pb-24",
  shell: "mx-auto w-full max-w-page px-24 max-xl:px-10 max-sm:px-6",
  grid: "grid grid-cols-12 gap-x-6",
  inner:
    "col-span-8 col-start-3 flex flex-col items-center gap-8 text-center max-lg:col-span-10 max-lg:col-start-2 max-md:col-span-12 max-md:col-start-1",
  copy: "flex flex-col items-center gap-5",
  headline: "text-balance text-spectrum-gradient",
  body: "max-w-[58ch] text-pretty font-sans text-figure-body text-lg leading-[1.65] max-sm:text-base",
  aside: "font-sans text-[15px] text-figure-body/80",
  cta: "w-full max-w-[17rem]",
} as const;

export const PricingClose = ({
  headline,
  body,
  aside,
  ctaLabel,
  ctaHref,
}: PricingCloseProperties) => (
  <section className={classes.section}>
    <div className={classes.shell}>
      <div className={classes.grid}>
        <div className={classes.inner}>
          <div className={classes.copy}>
            <Heading as={2} className={classes.headline} level={1}>
              {headline}
            </Heading>
            <p className={classes.body}>{body}</p>
            <p className={classes.aside}>{aside}</p>
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
