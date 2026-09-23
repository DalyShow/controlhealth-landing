import { Heading } from "@/components/marketing/atoms/heading";
import { ScanField } from "@/components/marketing/atoms/scan-field";
import {
  type TrustItem,
  TrustRow,
} from "@/components/marketing/molecules/trust-row";
import { Button } from "@/components/ui/button";
import type { CSSProperties } from "react";

type ScanHeroProperties = {
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref?: string;
  /**
   * A cut-out figure standing in front of the field. It needs a clean alpha
   * channel: its own shape is also used to mask the field behind it.
   */
  figureSrc: string;
  trust?: TrustItem[];
};

/**
 * Full-viewport hero on the deep ground: a gradient headline over a figure,
 * with the scan field rising behind her across the bottom 70% of the frame.
 *
 * Everything enters on one timeline, set in the theme as the `hero-*`
 * animations: headline, figure and field together, the body a second later,
 * the button a second after that, and the trust row just behind it. The
 * field's first sweep waits for the button, so it plays as the payoff rather
 * than competing with the words arriving.
 *
 * The figure is drawn twice. Underneath, her shape in the ground colour at
 * full strength, cut from the image's own alpha; on top, the image itself at
 * 42%. Without the solid layer she is translucent, the field shows straight
 * through her, and it reads as in front of her rather than behind.
 *
 * The ground matches the section below, so the hero runs straight into it
 * with no seam.
 */
const classes = {
  section:
    "relative isolate min-h-[max(100dvh,680px)] w-full overflow-hidden bg-figure-ground",
  figure:
    "-translate-x-1/2 pointer-events-none absolute top-[20.56%] bottom-[1%] left-1/2 z-[1] aspect-[418/898] animate-hero-figure motion-reduce:animate-none",
  occluder:
    "absolute inset-0 bg-figure-ground [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
  image: "relative block size-full object-contain opacity-[0.42]",
  copy: "-translate-x-1/2 -translate-y-1/2 absolute top-[59%] left-1/2 z-[4] flex w-[min(1100px,calc(100%-48px))] flex-col items-center text-center",
  headline:
    "animate-hero-headline whitespace-nowrap font-semibold text-[clamp(2.75rem,1rem+5vw,5.1rem)] text-spectrum-gradient capitalize leading-[1.371] tracking-[-0.02em] max-md:whitespace-normal motion-reduce:animate-none",
  body: "mt-5 max-w-[632px] animate-hero-body text-pretty font-sans text-[18px] text-primary-foreground leading-[26px] max-md:px-2 max-md:text-base max-md:leading-6 motion-reduce:animate-none",
  cta: "mt-8 w-full max-w-[17rem] animate-hero-button border border-hero-glass-rule shadow-cta hover:border-hero-glass-edge motion-reduce:animate-none",
  trust:
    "-translate-x-1/2 absolute bottom-[42px] left-1/2 z-[4] animate-hero-trust max-md:bottom-[26px] max-md:w-[calc(100%-32px)] motion-reduce:animate-none",
} as const;

export const ScanHero = ({
  headline,
  body,
  ctaLabel,
  ctaHref,
  figureSrc,
  trust,
}: ScanHeroProperties) => {
  const occluderMask: CSSProperties = {
    maskImage: `url(${figureSrc})`,
    WebkitMaskImage: `url(${figureSrc})`,
  };

  return (
    <section className={classes.section}>
      <ScanField />

      <div aria-hidden="true" className={classes.figure}>
        <div className={classes.occluder} style={occluderMask} />
        {/** biome-ignore lint/performance/noImgElement: static export, unoptimized */}
        <img
          alt=""
          className={classes.image}
          decoding="async"
          height={898}
          src={figureSrc}
          width={418}
        />
      </div>

      <div className={classes.copy}>
        <Heading className={classes.headline} level={1}>
          {headline}
        </Heading>
        <p className={classes.body}>{body}</p>
        {ctaHref ? (
          <Button asChild className={classes.cta} size="xl">
            <a href={ctaHref}>{ctaLabel}</a>
          </Button>
        ) : (
          <Button className={classes.cta} size="xl">
            {ctaLabel}
          </Button>
        )}
      </div>

      {trust ? (
        <div className={classes.trust}>
          <TrustRow items={trust} />
        </div>
      ) : null}
    </section>
  );
};
