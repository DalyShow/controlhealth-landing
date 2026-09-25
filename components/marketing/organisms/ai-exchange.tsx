"use client";

import { BrandMarkIcon } from "@/components/marketing/atoms/brand-mark-icon";
import { MetricLabel } from "@/components/marketing/atoms/metric-label";
import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AiExchangeProperties = {
  /** Typed into the input. Short enough to sit on one line. */
  question: string;
  /** Streamed in beneath it, a word at a time. */
  answer: string;
  questionLabel?: string;
  answerLabel?: string;
};

/** How long after it arrives before the question starts to type. */
const START_MS = 500;
/** Milliseconds per character as the question types. */
const TYPE_MS = 55;
/** The pause between the question being sent and the answer starting. */
const THINK_MS = 650;
/** Milliseconds per word as the answer streams. */
const WORD_MS = 75;

/**
 * A question put to the AI and its answer, as the two halves of a
 * `MetricCard`: two elements, so the card draws its hairline between them.
 *
 * When it arrives the question types itself into the input, the send button
 * fills as it is sent, and the answer streams in beneath a word at a time,
 * its label reading "Generating" while it does. Every word of the answer is
 * laid out from the start and only fades in, so the card holds its size
 * throughout. The accents take the colour of the
 * slide around it (`--tone`), teal where there is none. It starts over each
 * time it arrives, and is already answered for anyone who has asked for
 * less motion.
 */
const classes = {
  half: "flex flex-col gap-2.5",
  field:
    "flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] py-1.5 pr-1.5 pl-3.5",
  typed:
    "min-w-0 flex-1 truncate font-sans text-[13px] text-primary-foreground leading-5",
  caret:
    "ml-px inline-block h-3.5 w-[1.5px] translate-y-[2px] animate-caret bg-[var(--tone,var(--color-teal-300))] motion-reduce:animate-none",
  sendWaiting:
    "flex size-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-primary-foreground/60 transition-colors duration-300",
  sendSent:
    "flex size-6 shrink-0 items-center justify-center rounded-full border border-transparent bg-[var(--tone,var(--color-teal-300))] text-primary-950 transition-colors duration-300",
  sendIcon: "size-3.5",
  mark: "block size-full text-[var(--tone,var(--color-teal-300))]",
  answer:
    "m-0 text-left font-sans text-[13px] text-primary-foreground/80 leading-[1.5]",
  wordShown: "opacity-100 transition-opacity duration-300",
  wordWaiting: "opacity-0",
} as const;

/** How long to wait before the next character or word. */
const nextDelay = (typed: number, shown: number, typing: boolean) => {
  if (typing) {
    return typed === 0 ? START_MS : TYPE_MS;
  }

  return shown === 0 ? THINK_MS : WORD_MS;
};

/** Where the exchange is: characters typed, and words of the answer shown. */
const useExchange = (
  question: string,
  words: number,
  playing: boolean,
  still: boolean
) => {
  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (still) {
      setTyped(question.length);
      setShown(words);
      return;
    }

    if (!playing) {
      setTyped(0);
      setShown(0);
      return;
    }

    if (shown >= words) {
      return;
    }

    const typing = typed < question.length;
    const delay = nextDelay(typed, shown, typing);

    const timer = window.setTimeout(() => {
      if (typing) {
        setTyped((count) => count + 1);
      } else {
        setShown((count) => count + 1);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [playing, question.length, shown, still, typed, words]);

  return { typed, shown };
};

export const AiExchange = ({
  question,
  answer,
  questionLabel = "Your question",
  answerLabel = "Control Health",
}: AiExchangeProperties) => {
  const halfRef = useRef<HTMLDivElement>(null);
  const inView = useInView(halfRef, "0px");
  const prefersReducedMotion = usePrefersReducedMotion();
  // Each word with its place in the answer, which is what tells repeated
  // words apart. The answer never reorders, so the place is a stable key.
  const words = answer
    .split(" ")
    .map((word, place) => ({ word, key: `${place}-${word}`, place }));
  const { typed, shown } = useExchange(
    question,
    words.length,
    inView,
    prefersReducedMotion
  );
  const sent = typed >= question.length && (shown > 0 || prefersReducedMotion);
  const answering = typed >= question.length && shown < words.length;
  const answerHeading = answering ? "Generating…" : answerLabel;

  return (
    <>
      <div className={classes.half} ref={halfRef}>
        <MetricLabel label={questionLabel} />
        <div className={classes.field}>
          <span className={classes.typed}>
            {question.slice(0, typed)}
            {sent ? null : <span className={classes.caret} />}
          </span>
          <span
            aria-hidden="true"
            className={sent ? classes.sendSent : classes.sendWaiting}
          >
            <ArrowUp
              className={classes.sendIcon}
              strokeWidth={SPRITE_ICON_STROKE_WIDTH}
            />
          </span>
        </div>
      </div>

      <div className={classes.half}>
        <MetricLabel
          icon={<BrandMarkIcon className={classes.mark} />}
          label={answerHeading}
        />
        <p className={classes.answer}>
          {words.map(({ word, key, place }) => (
            <span
              className={
                place < shown ? classes.wordShown : classes.wordWaiting
              }
              key={key}
            >
              {place === 0 ? word : ` ${word}`}
            </span>
          ))}
        </p>
      </div>
    </>
  );
};
