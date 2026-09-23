import { Heading } from "@/components/marketing/atoms/heading";
import { Button } from "@/components/ui/button";

type HeroCopyProperties = {
  /** Omit, with the subheadline, for a section that leads with its media. */
  headline?: string;
  subheadline?: string;
  ctaLabel: string;
  ctaHref?: string;
};

/**
 * Centred hero message: display headline, uppercase supporting line, and a
 * single call to action, stacked in one flex column.
 *
 * The headline and supporting line are optional, for a section that reuses
 * the hero's frame without its message. The headline is the page's H1 when it
 * is present, so leaving it out below the fold keeps the outline to one.
 */
const classes = {
  group: "flex flex-col items-center gap-10",
  copy: "flex flex-col items-center gap-4",
  headline: "text-balance text-center text-white",
  subheadline:
    "max-w-[29.8125rem] text-center font-sans text-base text-white uppercase leading-[1.5] tracking-[0.08em]",
  cta: "w-full max-w-[17rem] bg-primary-50 text-primary-950 hover:bg-primary-100 shadow-cta",
} as const;

export const HeroCopy = ({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
}: HeroCopyProperties) => (
  <div className={classes.group}>
    {headline || subheadline ? (
      <div className={classes.copy}>
        {headline ? (
          <Heading className={classes.headline} level={1}>
            {headline}
          </Heading>
        ) : null}
        {subheadline ? (
          <p className={classes.subheadline}>{subheadline}</p>
        ) : null}
      </div>
    ) : null}
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
);
