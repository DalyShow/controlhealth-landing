"use client";

import { BiomarkerRange } from "@/components/marketing/atoms/biomarker-range";
import { Heading } from "@/components/marketing/atoms/heading";
import { useArrived } from "@/hooks/use-arrived";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { CaseStudyResults } from "@/lib/biomarkers";
import { type RefObject, useEffect, useRef, useState } from "react";

type BiomarkerPanelSectionProperties = {
  headline: string;
  body: string;
  /** A label over the headline, naming whose panel it is. */
  label?: string;
  /** Their results, pinned over the strip and read out on it. */
  caseStudy?: CaseStudyResults;
};

/**
 * How far into view each part must come before it plays: the words once the
 * section is well on screen, the strip once it is clear of the bottom edge,
 * so neither plays while the reader cannot see it.
 */
const WORDS_MARGIN = "0px 0px -25% 0px";
const STRIP_MARGIN = "0px 0px -8% 0px";

/** The least time between the words starting and the strip starting. */
const WAVE_AFTER_MS = 1000;

/**
 * A section for the biomarker panel of one person, after the story that led
 * to it: the words, and her strip beneath them, close enough together to be
 * seen in one view.
 *
 * It plays once. When the reader arrives the headline fades up with the body
 * a beat behind, and once the strip itself is on screen, and at least a
 * second after the words, it rises into place as a wave from the left, with
 * the pins arriving once it has passed. As the reader scrolls on past, it
 * leaves the opposite way, sinking back down from the right, scrubbed by
 * the scroll. The words step back
 * while a marker is read, since the readout rises over them. Anyone who has
 * asked for less motion gets it all in place from the start.
 */
const classes = {
  section:
    "group/panel relative isolate overflow-hidden bg-figure-ground pt-40 max-md:pt-24",
  message:
    "relative z-10 flex flex-col items-center px-6 text-center transition-opacity duration-300 group-has-[[role=slider][aria-valuetext]]/panel:opacity-15",
  headlineShown:
    "max-w-[15em] translate-y-0 text-balance text-[clamp(2rem,1.2rem+2.4vw,3.5rem)] text-white leading-[1.08] tracking-[-0.01em] opacity-100 transition-[opacity,translate] duration-1000 ease-out motion-reduce:transition-none max-md:text-[28px]",
  headlineHidden:
    "max-w-[15em] translate-y-3 text-balance text-[clamp(2rem,1.2rem+2.4vw,3.5rem)] text-white leading-[1.08] tracking-[-0.01em] opacity-0 max-md:text-[28px]",
  bodyShown:
    "mt-5 max-w-[632px] translate-y-0 text-pretty font-sans text-[18px] text-white/80 leading-[28px] opacity-100 transition-[opacity,translate] delay-300 duration-1000 ease-out motion-reduce:transition-none max-md:mt-3 max-md:text-[15px] max-md:leading-[22px]",
  bodyHidden:
    "mt-5 max-w-[632px] translate-y-3 text-pretty font-sans text-[18px] text-white/80 leading-[28px] opacity-0 max-md:mt-3 max-md:text-[15px] max-md:leading-[22px]",
  // The box the strip, its readout and its label position against. The gap
  // above it leaves room for the readout to rise into as a marker is read.
  // It sits on the bottom edge of the section, which clips the bars as they
  // rise, so they come up out of it.
  // Fades as it leaves, slowly at first while the bars do the work.
  strip:
    "relative mt-[220px] h-[140px] opacity-[calc(1-var(--exit,0)*var(--exit,0))] max-md:mt-[180px]",
  // The label, as an eyebrow centred over the headline: a teal pill, its
  // stroke and words in the calm tone of the metric cards on a dimmed fill
  // of it. It fades up with the headline.
  labelShown:
    "mb-6 inline-flex translate-y-0 items-center rounded-full border border-teal-300/60 bg-teal-300/10 px-3.5 py-[7px] opacity-100 transition-[opacity,translate] duration-1000 ease-out motion-reduce:transition-none max-md:mb-4 max-sm:py-1.5",
  labelHidden:
    "mb-6 inline-flex translate-y-3 items-center rounded-full border border-teal-300/60 bg-teal-300/10 px-3.5 py-[7px] opacity-0 max-md:mb-4 max-sm:py-1.5",
  labelText:
    "m-0 whitespace-nowrap font-sans font-semibold text-[13.5px] text-teal-300 leading-none max-sm:text-[12px]",
} as const;

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

/**
 * The strip leaves as the reader scrolls on past it, tied to the scroll so
 * it can be scrubbed both ways: from when its top reaches this far down the
 * screen, over this share of the screen height.
 */
const EXIT_FROM = 0.45;
const EXIT_SPAN = 0.35;

/**
 * Writes how far the strip has left, 0 to 1, onto it as `--exit` on every
 * scroll event. The bars read it to sink back down, the last in first, and
 * the strip fades with it.
 */
const useExitProgress = (
  stripRef: RefObject<HTMLDivElement | null>,
  enabled: boolean
) => {
  useEffect(() => {
    const strip = stripRef.current;

    if (!(strip && enabled)) {
      return;
    }

    const update = () => {
      const { top } = strip.getBoundingClientRect();
      const height = window.innerHeight;
      const exit = clampUnit((height * EXIT_FROM - top) / (height * EXIT_SPAN));

      strip.style.setProperty("--exit", exit.toFixed(3));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled, stripRef]);
};

export const BiomarkerPanelSection = ({
  headline,
  body,
  label,
  caseStudy,
}: BiomarkerPanelSectionProperties) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const wordsStartedRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const wordsArrived = useArrived(sectionRef, WORDS_MARGIN);
  const stripArrived = useArrived(stripRef, STRIP_MARGIN);
  const [waving, setWaving] = useState(false);

  // The strip can come on screen first on a short window, so the words start
  // with it if they have not already.
  const wordsShown = wordsArrived || stripArrived || prefersReducedMotion;

  useEffect(() => {
    if (wordsShown && !wordsStartedRef.current) {
      wordsStartedRef.current = performance.now();
    }
  }, [wordsShown]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setWaving(true);
      return;
    }

    if (!stripArrived) {
      return;
    }

    const sinceWords = performance.now() - wordsStartedRef.current;
    const timer = window.setTimeout(
      () => setWaving(true),
      Math.max(0, WAVE_AFTER_MS - sinceWords)
    );

    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, stripArrived]);

  useExitProgress(stripRef, waving && !prefersReducedMotion);

  // With less motion the strip is simply there; otherwise it waits, then waves.
  const wave = prefersReducedMotion ? {} : { waveIn: waving };

  return (
    <section className={classes.section} ref={sectionRef}>
      <div className={classes.message}>
        {label ? (
          <p className={wordsShown ? classes.labelShown : classes.labelHidden}>
            <span className={classes.labelText}>{label}</span>
          </p>
        ) : null}
        <Heading
          as={2}
          className={
            wordsShown ? classes.headlineShown : classes.headlineHidden
          }
          level={1}
        >
          {headline}
        </Heading>
        <p className={wordsShown ? classes.bodyShown : classes.bodyHidden}>
          {body}
        </p>
      </div>

      <div className={classes.strip} inert={!waving} ref={stripRef}>
        <BiomarkerRange {...(caseStudy ? { caseStudy } : {})} {...wave} />
      </div>
    </section>
  );
};
