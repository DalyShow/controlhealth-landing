import { Heading } from "@/components/marketing/atoms/heading";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export type PricingPlan = {
  /** Tier label, e.g. "Basic" or "Advanced | ~15-minute setup". */
  badge: string;
  name: string;
  /** What it costs, in words: "Free", "One time $259". */
  price: string;
  /** One line on what the plan is for. */
  summary: string;
  features: string[];
  ctaLabel: string;
  ctaHref?: string;
};

type PricingCardProperties = {
  plan: PricingPlan;
};

/**
 * One plan. A raised frosted panel rather than the white card the light site
 * uses: on this ground a filled card would punch a hole, where a pane of glass
 * with a hairline edge sits on the surface.
 */
const classes = {
  root: "col-span-4 flex flex-col gap-8 rounded-2xl border border-figure-rule bg-figure-glass-near p-8 max-lg:col-span-12 max-sm:p-6",
  badge:
    "w-fit rounded-full border border-figure-rule px-3 py-1 font-medium font-mono text-[11px] text-figure-body uppercase tracking-[0.12em]",
  head: "flex flex-col gap-2",
  name: "text-primary-foreground",
  price: "font-sans text-[15px] text-figure-body",
  summary:
    "border-figure-rule border-t pt-6 font-medium font-sans text-[15px] text-primary-foreground",
  features: "flex flex-1 flex-col gap-4",
  feature: "flex items-start gap-3 font-sans text-[15px] text-figure-body",
  tick: "mt-[3px] size-4 shrink-0 text-figure-accent",
  cta: "w-full",
} as const;

export const PricingCard = ({ plan }: PricingCardProperties) => (
  <article className={classes.root}>
    <p className={classes.badge}>{plan.badge}</p>

    <div className={classes.head}>
      <Heading className={classes.name} level={3}>
        {plan.name}
      </Heading>
      <p className={classes.price}>{plan.price}</p>
    </div>

    <p className={classes.summary}>{plan.summary}</p>

    <ul className={classes.features}>
      {plan.features.map((feature) => (
        <li className={classes.feature} key={feature}>
          <Check
            aria-hidden="true"
            className={classes.tick}
            strokeWidth={2.5}
          />
          {feature}
        </li>
      ))}
    </ul>

    {plan.ctaHref ? (
      <Button asChild className={classes.cta} size="lg">
        <a href={plan.ctaHref}>{plan.ctaLabel}</a>
      </Button>
    ) : (
      <Button className={classes.cta} size="lg" type="button">
        {plan.ctaLabel}
      </Button>
    )}
  </article>
);
