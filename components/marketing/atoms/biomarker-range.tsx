"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  BIOMARKER_COUNT,
  BIOMARKER_SYSTEMS,
  BIOMARKERS,
  COVERED_COUNT,
} from "@/lib/biomarkers";
import { createTickPlayer } from "@/lib/tick-sound";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Shape of the strip, sampled from the Figma graphic (Control Health
 * Marketing Site, node 1262:3132) as 82 control points. The rendered bars are
 * resampled from this curve, so their number is free to change without
 * redrawing the wave.
 */
const CURVE = [
  134, 140, 145, 150, 154, 157, 160, 161, 162, 162, 160, 158, 155, 151, 147,
  142, 137, 131, 126, 121, 116, 112, 108, 106, 104, 104, 104, 106, 109, 113,
  117, 121, 126, 130, 134, 137, 139, 139, 139, 137, 133, 129, 124, 119, 113,
  108, 103, 99, 96, 94, 94, 95, 97, 101, 105, 111, 118, 125, 132, 140, 147, 154,
  160, 166, 170, 173, 174, 174, 172, 169, 165, 159, 153, 145, 138, 129, 121,
  113, 106, 98, 92, 85,
] satisfies number[];

/** Height of the tallest bar, in pixels. */
const MAX_BAR_HEIGHT = 92;

/**
 * Bars per marker. Four gives a hover target of roughly fourteen pixels
 * instead of three. A phone cannot fit four at a legible width, so it takes
 * two and the strip reads as a coarser ruler.
 */
const BARS_PER_MARKER_WIDE = 4;
const BARS_PER_MARKER_NARROW = 2;

/**
 * Below this the strip thins out and a tap steps to the next marker instead
 * of scrubbing: forty stops across a phone is about eight pixels each, far
 * finer than a fingertip can express. Matches Tailwind's `md`.
 */
const NARROW_QUERY = "(max-width: 767px)";

/** How far the marker under the pointer rises, in pixels. */
const GROUP_LIFT = 9;

/** Falloff either side of the marker, indexed by distance from its edge. */
const LIFT = [6, 4, 3, 2, 1] satisfies number[];

/**
 * Milliseconds added per step away from the marker, so the lift travels
 * outward as a ripple rather than the whole neighbourhood moving at once.
 */
const RIPPLE_STEP_MS = 26;

/** Gap between the readout and the window edge it is kept clear of. */
const READOUT_MARGIN = 16;

/**
 * Resamples the curve to `count` evenly spaced bars with linear interpolation,
 * normalised so the tallest bar lands on `peak`.
 */
const resampleCurve = (curve: number[], count: number, peak: number) => {
  const sourcePeak = Math.max(...curve);
  const lastSourceIndex = curve.length - 1;

  return Array.from({ length: count }, (_, index) => {
    const position = (index / (count - 1)) * lastSourceIndex;
    const lower = Math.floor(position);
    const upper = Math.min(lower + 1, lastSourceIndex);
    const lowerHeight = curve[lower] ?? 0;
    const upperHeight = curve[upper] ?? lowerHeight;
    const blended =
      lowerHeight + (upperHeight - lowerHeight) * (position - lower);

    return Math.round((blended / sourcePeak) * peak);
  });
};

const clampToMarker = (index: number) =>
  Math.min(Math.max(index, 0), BIOMARKER_COUNT - 1);

/**
 * How far a bar rises, and how long it waits first, given which marker is
 * active. Bars inside the marker move together and immediately; everything
 * outside falls away and follows a beat later.
 */
const liftFor = (
  barIndex: number,
  activeIndex: number | null,
  barsPerMarker: number
) => {
  if (activeIndex === null) {
    return { lift: 0, delay: 0 };
  }

  const first = activeIndex * barsPerMarker;
  const last = first + barsPerMarker - 1;

  if (barIndex >= first && barIndex <= last) {
    return { lift: GROUP_LIFT, delay: 0 };
  }

  const distance =
    barIndex < first ? first - barIndex - 1 : barIndex - last - 1;
  const lift = LIFT[distance];

  if (lift === undefined) {
    return { lift: 0, delay: 0 };
  }

  return { lift, delay: (distance + 1) * RIPPLE_STEP_MS };
};

/**
 * The hero's bottom edge, read as a ruler of forty biomarkers grouped into six
 * body systems. At rest the markers a standard physical already covers sit
 * lit and the rest sit dim, so the gap is visible before anything is touched.
 * Rolling across one lifts it, names it, and says whether you would already
 * have it.
 *
 * It is a slider in the accessibility tree because that is what it is: one
 * value along an ordered range, moved with the arrow keys.
 */
const classes = {
  root: "-bottom-[33px] absolute inset-x-0 h-[96px] touch-none drop-shadow-waveform focus-visible:outline-none",
  track:
    "-translate-x-1/2 absolute bottom-0 left-1/2 flex h-full w-full max-w-page items-end justify-between px-7",
  bar: "w-[3px] shrink-0 rounded-full opacity-[0.22] transition-[opacity,transform] duration-[260ms,340ms] ease-arrive max-md:w-[2px] motion-reduce:transition-none",
  barCovered:
    "w-[3px] shrink-0 rounded-full opacity-[0.82] transition-[opacity,transform] duration-[260ms,340ms] ease-arrive max-md:w-[2px] motion-reduce:transition-none",
  barActive:
    "w-[3px] shrink-0 rounded-full opacity-100 drop-shadow-[0_0_6px_var(--tone)] transition-[opacity,transform] duration-[260ms,340ms] ease-arrive max-md:w-[2px] motion-reduce:transition-none",

  // Sits over the strip and slides along it to whichever marker is active.
  readout:
    "pointer-events-none absolute bottom-[124px] left-0 w-[328px] text-center opacity-0 transition-[opacity,transform] duration-[220ms,460ms] ease-arrive max-md:bottom-[112px] max-md:w-[300px] motion-reduce:transition-none",
  readoutOn: "opacity-100",
  system:
    "font-medium font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--tone)]",
  name: "mt-2 font-display text-[23px] text-primary-foreground leading-[1.2] max-md:text-[20px]",
  note: "mt-2 text-pretty font-sans text-[13.5px] text-figure-body leading-[1.55] max-md:text-[13px]",
  tagRow: "mt-3",
  tag: "inline-block rounded-full border px-[9px] py-1 font-mono text-[10px] uppercase tracking-[0.1em]",
  tagCovered: "border-primary-100/45 text-primary-100",
  tagMissing: "border-[var(--tone)] bg-[var(--tone)]/12 text-[var(--tone)]",
  // Hairline dropping from the readout toward the marker it describes.
  leader:
    "mx-auto mt-3.5 h-11 w-px bg-gradient-to-b from-[var(--tone)]/60 to-transparent",

  caption:
    "pointer-events-none absolute inset-x-0 bottom-[148px] text-center font-sans text-[13px] text-figure-body opacity-90 transition-opacity duration-[260ms] ease-arrive max-md:bottom-[136px] motion-reduce:transition-none",
  captionOff: "opacity-0 duration-0",
  captionLead: "font-medium text-primary-foreground",
  captionHint:
    "mt-[5px] block font-mono text-[10px] uppercase tracking-[0.12em] opacity-50",
} as const;

const barClass = (covered: boolean, isActive: boolean) => {
  if (isActive) {
    return classes.barActive;
  }

  return covered ? classes.barCovered : classes.bar;
};

export const BiomarkerRange = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackBoxRef = useRef<{ left: number; width: number } | null>(null);
  const activeIndexRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const [barsPerMarker, setBarsPerMarker] = useState(BARS_PER_MARKER_WIDE);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [readoutX, setReadoutX] = useState(0);

  const prefersReducedMotion = usePrefersReducedMotion();
  const tickPlayer = useMemo(createTickPlayer, []);

  const isNarrow = barsPerMarker === BARS_PER_MARKER_NARROW;
  const barCount = BIOMARKER_COUNT * barsPerMarker;
  const barHeights = useMemo(
    () => resampleCurve(CURVE, barCount, MAX_BAR_HEIGHT),
    [barCount]
  );

  // Starts wide so the prerendered markup is stable, then corrects on mount.
  useEffect(() => {
    const query = window.matchMedia(NARROW_QUERY);

    const apply = (matches: boolean) =>
      setBarsPerMarker(matches ? BARS_PER_MARKER_NARROW : BARS_PER_MARKER_WIDE);

    apply(query.matches);

    const handleChange = (event: MediaQueryListEvent) => apply(event.matches);

    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  // Browsers keep an AudioContext suspended until the page has been
  // interacted with, so arm it on the viewer's first gesture anywhere.
  useEffect(() => {
    const unlock = () => tickPlayer.unlock();

    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });

    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      tickPlayer.dispose();
    };
  }, [tickPlayer]);

  // Measuring on every move forces a synchronous layout read. The strip only
  // moves on resize, so cache the box and refresh it there.
  const measureTrack = useCallback(() => {
    const track = trackRef.current;

    trackBoxRef.current = track
      ? { left: track.getBoundingClientRect().left, width: track.offsetWidth }
      : null;
  }, []);

  useEffect(() => {
    measureTrack();
    window.addEventListener("resize", measureTrack);

    return () => window.removeEventListener("resize", measureTrack);
  }, [measureTrack]);

  const goToMarker = useCallback(
    (index: number) => {
      if (activeIndexRef.current === index) {
        return;
      }

      activeIndexRef.current = index;
      setActiveIndex(index);
      tickPlayer.play();

      // Park the readout over the marker's middle bar. Measured rather than
      // derived, because the track carries padding the bar index knows
      // nothing about. Only runs on a change of marker.
      const centre = trackRef.current?.children[
        index * barsPerMarker + Math.floor(barsPerMarker / 2)
      ] as HTMLElement | undefined;

      if (!centre) {
        return;
      }

      const box = centre.getBoundingClientRect();
      const edge = window.innerWidth / 2;
      const half = Math.min(328, window.innerWidth - READOUT_MARGIN * 2) / 2;

      setReadoutX(
        Math.min(
          Math.max(box.left + box.width / 2, half + READOUT_MARGIN),
          edge * 2 - half - READOUT_MARGIN
        )
      );
    },
    [barsPerMarker, tickPlayer]
  );

  const clear = useCallback(() => {
    activeIndexRef.current = null;
    setActiveIndex(null);
  }, []);

  const scrubTo = useCallback(
    (clientX: number) => {
      const box = trackBoxRef.current;

      if (!box || box.width === 0) {
        return;
      }

      const ratio = (clientX - box.left) / box.width;

      goToMarker(clampToMarker(Math.floor(ratio * BIOMARKER_COUNT)));
    },
    [goToMarker]
  );

  const handlePointerEnter = () => measureTrack();

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    // A mouse scrubs on hover. A finger only reports moves once it is down,
    // which the capture below arranges, so one handler serves both.
    if (event.pointerType === "mouse" || draggingRef.current) {
      scrubTo(event.clientX);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    measureTrack();

    if (isNarrow) {
      goToMarker(
        activeIndexRef.current === null
          ? 0
          : (activeIndexRef.current + 1) % BIOMARKER_COUNT
      );
      return;
    }

    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrubTo(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && !draggingRef.current) {
      clear();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = activeIndexRef.current ?? -1;
    const moves: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowUp: current + 1,
      ArrowLeft: current - 1,
      ArrowDown: current - 1,
      Home: 0,
      End: BIOMARKER_COUNT - 1,
    };

    const next = moves[event.key];

    if (next === undefined) {
      if (event.key === "Escape") {
        clear();
      }
      return;
    }

    event.preventDefault();
    goToMarker(clampToMarker(next));
  };

  const active = activeIndex === null ? null : BIOMARKERS[activeIndex];
  const activeSystem = active ? BIOMARKER_SYSTEMS[active.system] : null;

  // What a screen reader hears when the value moves. Built here rather than
  // inline so the whole announcement reads as one sentence.
  const valueText = active
    ? `${active.name}. ${activeSystem?.label}. ${active.note} ${
        active.covered ? "In a standard panel." : "Not in a standard panel."
      }`
    : undefined;

  // Present only while a marker is up, so the hero can dim what sits behind
  // the readout without this component knowing anything about it.
  const activeFlag = active ? "" : undefined;

  const readoutStyle: CSSProperties = {
    transform: `translate3d(calc(${readoutX}px - 50%), ${active ? 0 : 8}px, 0)`,
    ...(activeSystem ? { "--tone": activeSystem.tone } : {}),
  } as CSSProperties;

  return (
    <>
      <p
        aria-hidden="true"
        className={`${classes.caption} ${active ? classes.captionOff : ""}`}
      >
        <span className={classes.captionLead}>
          {COVERED_COUNT} of these {BIOMARKER_COUNT} markers
        </span>{" "}
        come with a standard physical.
        <span className={classes.captionHint}>
          {isNarrow ? "Tap to step through" : "Roll across to see the rest"}
        </span>
      </p>

      <div
        aria-hidden="true"
        className={`${classes.readout} ${active ? classes.readoutOn : ""}`}
        style={readoutStyle}
      >
        <p className={classes.system}>{activeSystem?.label}</p>
        <p className={classes.name}>{active?.name}</p>
        <p className={classes.note}>{active?.note}</p>
        <p className={classes.tagRow}>
          <span
            className={`${classes.tag} ${active?.covered ? classes.tagCovered : classes.tagMissing}`}
          >
            {active?.covered
              ? "in a standard panel"
              : "not in a standard panel"}
          </span>
        </p>
        <span className={classes.leader} />
      </div>

      <div
        aria-label="Biomarkers a comprehensive panel can measure, and which of them a standard physical already covers"
        aria-valuemax={BIOMARKER_COUNT}
        aria-valuemin={1}
        aria-valuenow={(activeIndex ?? 0) + 1}
        aria-valuetext={valueText}
        className={classes.root}
        data-marker-active={activeFlag}
        onKeyDown={handleKeyDown}
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="slider"
        tabIndex={0}
      >
        <div className={classes.track} ref={trackRef}>
          {barHeights.map((height, index) => {
            const marker = BIOMARKERS[Math.floor(index / barsPerMarker)];

            if (!marker) {
              return null;
            }

            const { lift, delay } = prefersReducedMotion
              ? { lift: 0, delay: 0 }
              : liftFor(index, activeIndex, barsPerMarker);

            const style: CSSProperties = {
              height: `${height}px`,
              transform: `translateY(-${lift}px)`,
              transitionDelay: `${delay}ms`,
              transitionTimingFunction: "var(--ease-pin)",
              background: BIOMARKER_SYSTEMS[marker.system].tone,
              "--tone": BIOMARKER_SYSTEMS[marker.system].tone,
            } as CSSProperties;

            return (
              <div
                className={barClass(
                  marker.covered,
                  Math.floor(index / barsPerMarker) === activeIndex
                )}
                // biome-ignore lint/suspicious/noArrayIndexKey: bars are a fixed, ordered dataset
                key={index}
                style={style}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};
