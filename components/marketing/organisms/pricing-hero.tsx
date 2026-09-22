import { Heading } from "@/components/marketing/atoms/heading";
import {
  PricingCard,
  type PricingPlan,
} from "@/components/marketing/molecules/pricing-card";

type PricingHeroProperties = {
  eyebrow: string;
  headline: string;
  blurb: string;
  plans: PricingPlan[];
};

/**
 * The opening of the pricing page: the claim, then the three plans.
 *
 * The light site sets the eyebrow in a warm red that has nothing to sit
 * against here, so it takes the first stop of the brand spectrum instead —
 * the same coral, but one that belongs to a ramp the page already uses.
 */
const classes = {
  section: "w-full bg-figure-ground pt-40 pb-24 max-md:pt-28 max-md:pb-16",
  shell:
    "mx-auto flex w-full max-w-page flex-col gap-20 px-24 max-xl:px-10 max-md:gap-14 max-sm:px-6",
  grid: "grid grid-cols-12 gap-x-6",
  header:
    "col-span-8 col-start-3 flex flex-col items-center gap-6 text-center max-lg:col-span-10 max-lg:col-start-2 max-md:col-span-12 max-md:col-start-1",
  eyebrow:
    "font-medium font-mono text-[11px] text-spectrum-peach uppercase tracking-[0.18em]",
  headline: "text-balance text-primary-foreground",
  blurb:
    "max-w-[52ch] text-pretty font-sans text-figure-body text-lg leading-[1.65] max-sm:text-base",
  plans: "grid grid-cols-12 items-stretch gap-6",
} as const;

export const PricingHero = ({
  eyebrow,
  headline,
  blurb,
  plans,
}: PricingHeroProperties) => (
  <section className={classes.section}>
    <div className={classes.shell}>
      <div className={classes.grid}>
        <header className={classes.header}>
          <p className={classes.eyebrow}>{eyebrow}</p>
          <Heading className={classes.headline} level={1}>
            {headline}
          </Heading>
          <p className={classes.blurb}>{blurb}</p>
        </header>
      </div>

      <div className={classes.plans}>
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  </section>
);
