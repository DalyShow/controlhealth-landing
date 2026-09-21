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
  headline:
    "text-balance text-center font-display font-normal text-[clamp(2.75rem,2.31rem+1.878vw,4rem)] text-white leading-[1.15] tracking-[-0.03em]",
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
      <h1 className={classes.headline}>{headline}</h1>
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
