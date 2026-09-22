import { Heading } from "@/components/marketing/atoms/heading";
import { Button } from "@/components/ui/button";

type HeroCopyProperties = {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref?: string;
};

/**
 * Centred hero message: display headline, uppercase supporting line, and a
 * single call to action, stacked in one flex column.
 */
const classes = {
  group: "flex flex-col items-center gap-10",
  copy: "flex flex-col items-center gap-4",
  headline: "text-balance text-center text-white",
  subheadline:
    "max-w-[29.8125rem] text-center font-sans text-base text-white uppercase leading-[1.5] tracking-[0.08em]",
  cta: "w-full max-w-[17rem] shadow-cta",
} as const;

export const HeroCopy = ({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
}: HeroCopyProperties) => (
  <div className={classes.group}>
    <div className={classes.copy}>
      <Heading className={classes.headline} level={1}>
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
);
