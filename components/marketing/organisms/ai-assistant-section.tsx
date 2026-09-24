"use client";

import { AiPromptVisual } from "@/components/marketing/atoms/ai-input-visual";
import { Heading } from "@/components/marketing/atoms/heading";
import { useArrived } from "@/hooks/use-arrived";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useEffect, useRef, useState } from "react";

type AiAssistantSectionProperties = {
  headline: string;
  body: string;
  /** Typed into the AI input, e.g. "How can we help". */
  prompt: string;
  /** Things a person might ask it, walled up behind the input. */
  questions: readonly string[];
  /** Names the questions for assistive technology. */
  questionsLabel: string;
};

/** How far into view the section must come before it plays. */
const ARRIVAL_MARGIN = "0px 0px -25% 0px";

/** When the first question fades in, and the spread they arrive over. */
const WALL_FROM_MS = 400;
const WALL_SPREAD_MS = 1400;

/** How long after the words start before the input begins to draw. */
const PROMPT_AFTER_MS = 600;

/**
 * A step through the questions that visits every one before repeating (it
 * shares no factor with the 15 of them), so they rise in scattered across
 * the grid rather than in reading order.
 */
const SCATTER_STEP = 7;

/**
 * The AI section: a headline and body, and beneath them an AI input with a
 * wall of the questions a person might ask it standing behind.
 *
 * It plays once, when the reader arrives: the words fade up, the questions
 * fade in scattered across the wall, and the input draws its outline and
 * types its prompt. The questions stand in a grid of boxes, each wrapping
 * to a few lines, dimmed but legible, so they read as a wall behind the
 * input rather than a list beside it. They rise into place scattered, as
 * the words settle. The wall is decoration to sighted readers; the
 * questions are also listed, unseen, for assistive technology.
 */
const classes = {
  section:
    "relative isolate overflow-hidden bg-figure-ground pt-40 pb-40 max-md:pt-24 max-md:pb-24",
  message: "relative z-10 flex flex-col items-center px-6 text-center",
  headlineShown:
    "max-w-[15em] translate-y-0 text-balance text-[clamp(2rem,1.2rem+2.4vw,3.5rem)] text-white leading-[1.08] tracking-[-0.01em] opacity-100 transition-[opacity,translate] duration-1000 ease-out motion-reduce:transition-none max-md:text-[28px]",
  headlineHidden:
    "max-w-[15em] translate-y-3 text-balance text-[clamp(2rem,1.2rem+2.4vw,3.5rem)] text-white leading-[1.08] tracking-[-0.01em] opacity-0 max-md:text-[28px]",
  bodyShown:
    "mt-5 max-w-[632px] translate-y-0 text-pretty font-sans text-[18px] text-white/80 leading-[28px] opacity-100 transition-[opacity,translate] delay-300 duration-1000 ease-out motion-reduce:transition-none max-md:mt-3 max-md:text-[15px] max-md:leading-[22px]",
  bodyHidden:
    "mt-5 max-w-[632px] translate-y-3 text-pretty font-sans text-[18px] text-white/80 leading-[28px] opacity-0 max-md:mt-3 max-md:text-[15px] max-md:leading-[22px]",
  stage: "relative mt-16 max-md:mt-10",
  // Five across at full width, fewer as the window narrows.
  wall: "mx-auto grid max-w-page grid-cols-5 gap-6 px-11 max-lg:grid-cols-3 max-md:grid-cols-2 max-md:gap-4 max-sm:px-6",
  questionShown:
    "translate-y-0 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-left font-sans text-[15px] text-white/45 leading-[1.45] opacity-100 transition-[opacity,translate] duration-700 ease-out motion-reduce:transition-none max-md:text-[13px]",
  questionHidden:
    "translate-y-5 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-left font-sans text-[15px] text-white/45 leading-[1.45] opacity-0 max-md:text-[13px]",
  // A soft pool of the ground under the input, so the questions nearest it
  // sink back and the input stands clear of the wall.
  halo: "-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 z-[5] h-[260px] w-[min(1000px,100%)] bg-[radial-gradient(closest-side,var(--color-figure-ground)_45%,transparent)]",
  prompt:
    "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-10 w-[min(640px,calc(100%-48px))] drop-shadow-[0_24px_48px_rgb(0_0_0/0.55)]",
  list: "sr-only",
} as const;

/** When the box at `order` rises in, of `count`, scattered across the grid. */
const arrivalDelay = (order: number, count: number) =>
  WALL_FROM_MS + (((order * SCATTER_STEP) % count) / count) * WALL_SPREAD_MS;

export const AiAssistantSection = ({
  headline,
  body,
  prompt,
  questions,
  questionsLabel,
}: AiAssistantSectionProperties) => {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const arrived =
    useArrived(sectionRef, ARRIVAL_MARGIN) || prefersReducedMotion;
  const [prompting, setPrompting] = useState(false);

  useEffect(() => {
    if (!arrived) {
      return;
    }

    const timer = window.setTimeout(
      () => setPrompting(true),
      prefersReducedMotion ? 0 : PROMPT_AFTER_MS
    );

    return () => window.clearTimeout(timer);
  }, [arrived, prefersReducedMotion]);

  return (
    <section className={classes.section} ref={sectionRef}>
      <div className={classes.message}>
        <Heading
          as={2}
          className={arrived ? classes.headlineShown : classes.headlineHidden}
          level={1}
        >
          {headline}
        </Heading>
        <p className={arrived ? classes.bodyShown : classes.bodyHidden}>
          {body}
        </p>
      </div>

      <div className={classes.stage}>
        <div aria-hidden="true" className={classes.wall}>
          {questions.map((question, order) => (
            <p
              className={
                arrived ? classes.questionShown : classes.questionHidden
              }
              key={question}
              style={{
                transitionDelay: `${arrivalDelay(order, questions.length)}ms`,
              }}
            >
              {question}
            </p>
          ))}
        </div>

        <div className={classes.halo} />

        <div className={classes.prompt}>
          <AiPromptVisual play={prompting} prompt={prompt} />
        </div>

        <ul aria-label={questionsLabel} className={classes.list}>
          {questions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};
