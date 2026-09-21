"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useEffect, useRef, useState } from "react";

type RollingFigureProperties = {
  value: string;
  /**
   * Reading the reels rest on before rolling, in the same shape as `value`
   * (e.g. "5h 00m" settling to "6h 52m"). Digits travel upward from here to
   * their final value, wrapping through nine, so keeping it close to `value`
   * keeps the roll short. Defaults to all zeroes.
   */
  from?: string;
};

type Cell =
  | { kind: "static"; key: string; char: string }
  | { kind: "digit"; key: string; from: number; to: number; ordinal: number };

/** Settling time for the leftmost reel; each reel to its right takes longer. */
const BASE_ROLL_MS = 1100;
const ROLL_STAGGER_MS = 350;

/** Fraction of the figure that must be on screen before the reels spin. */
const VISIBILITY_THRESHOLD = 0.4;

const DIGITS_PER_ROTATION = 10;

const isDigit = (char: string) => char >= "0" && char <= "9";

const digitsOf = (value: string) => [...value].filter(isDigit).map(Number);

/** Upward distance from one digit to another, wrapping through nine. */
const stepsBetween = (from: number, to: number) =>
  (to - from + DIGITS_PER_ROTATION) % DIGITS_PER_ROTATION;

/** The digits a reel passes through on its way from `from` up to `to`. */
const reelFor = (from: number, to: number) =>
  Array.from(
    { length: stepsBetween(from, to) + 1 },
    (_, index) => (from + index) % DIGITS_PER_ROTATION
  );

/** Splits a display string into static characters and numbered digit reels. */
const toCells = (value: string, from: string): Cell[] => {
  const startDigits = digitsOf(from);
  let ordinal = 0;

  return [...value].map((char, index) => {
    if (!isDigit(char)) {
      return { kind: "static", key: `${index}-${char}`, char };
    }

    const cell: Cell = {
      kind: "digit",
      key: `${index}-${char}`,
      from: startDigits[ordinal] ?? 0,
      to: Number(char),
      ordinal,
    };

    ordinal += 1;

    return cell;
  });
};

/**
 * Speedometer-style figure: each digit sits on a reel that rolls up from its
 * starting value and settles on its final one, reels to the right landing
 * later so the number sweeps into place left to right. A digit that does not
 * change stays put.
 */
const classes = {
  root: "inline-flex h-[1em] items-start leading-none",
  column: "inline-block h-[1em] overflow-hidden",
  reel: "flex flex-col ease-[cubic-bezier(0.33,1,0.68,1)] transition-transform will-change-transform",
  digit: "h-[1em] leading-none",
  static: "inline-block h-[1em] whitespace-pre leading-none",
  settled: "sr-only",
} as const;

export const RollingFigure = ({
  value,
  from = "",
}: RollingFigureProperties) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Tracks which reading has been rolled to, rather than a plain flag, so a
  // new `value` re-arms the roll instead of jump-cutting to it.
  const [rolledTo, setRolledTo] = useState<string | null>(null);
  const hasRolled = rolledTo === value;

  useEffect(() => {
    if (prefersReducedMotion) {
      setRolledTo(value);
      return;
    }

    const anchor = anchorRef.current;

    if (!anchor) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          setRolledTo(value);
        }
      },
      { threshold: VISIBILITY_THRESHOLD }
    );

    observer.observe(anchor);

    return () => observer.disconnect();
  }, [prefersReducedMotion, value]);

  return (
    <span ref={anchorRef}>
      <span aria-hidden="true" className={classes.root}>
        {toCells(value, from).map((cell) => {
          if (cell.kind === "static") {
            return (
              <span className={classes.static} key={cell.key}>
                {cell.char}
              </span>
            );
          }

          const landing = stepsBetween(cell.from, cell.to);

          return (
            <span className={classes.column} key={cell.key}>
              <span
                className={classes.reel}
                style={{
                  transform: `translateY(-${hasRolled ? landing : 0}em)`,
                  transitionDuration: prefersReducedMotion
                    ? "0ms"
                    : `${BASE_ROLL_MS + cell.ordinal * ROLL_STAGGER_MS}ms`,
                }}
              >
                {reelFor(cell.from, cell.to).map((digit, index) => (
                  <span
                    className={classes.digit}
                    // biome-ignore lint/suspicious/noArrayIndexKey: a fixed, ordered reel of digits
                    key={index}
                  >
                    {digit}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
      <span className={classes.settled}>{value}</span>
    </span>
  );
};
