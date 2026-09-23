"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  BIOMARKER_COUNT,
  BIOMARKER_SYSTEMS,
  BIOMARKERS,
} from "@/lib/biomarkers";
import { createTickPlayer } from "@/lib/tick-sound";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Every bar is the same height. The strip used to carry the waveform from the
 * Figma graphic, which was decorative and fought what it now says: forty
 * evenly weighted markers, none of them more important than another. Flat, it
 * reads as the ruler it is.
 *
 * Ninety-two pixels was amplitude the wave needed and a ruler does not, so the
 * ticks are short. What it gives back is headroom: the readout sits lower and
 * the hero's stat bar keeps the band above it.
 */
const BAR_HEIGHT = 24;

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

/** Matches `classes.readout`, for the clamp that keeps it inside the window. */
const READOUT_WIDTH = 440;

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
  // Twenty-four pixels of tick pinned to the bottom edge of the window is a
  // hard thing to land on and an easy thing to fall off, so the region that
  // answers the pointer reaches well above the ink. The bars stay bottom
  // aligned inside it and nothing above them is drawn.
  root: "absolute inset-x-0 bottom-0 h-[96px] touch-none drop-shadow-waveform focus-visible:outline-none",
  track:
    "-translate-x-1/2 absolute bottom-0 left-1/2 flex h-full w-full max-w-page items-end justify-between px-7",
  bar: "w-[3px] shrink-0 rounded-full opacity-[0.22] transition-[opacity,transform] duration-[260ms,340ms] ease-arrive max-md:w-[2px] motion-reduce:transition-none",
  barCovered:
    "w-[3px] shrink-0 rounded-full opacity-[0.82] transition-[opacity,transform] duration-[260ms,340ms] ease-arrive max-md:w-[2px] motion-reduce:transition-none",
  barActive:
    "w-[3px] shrink-0 rounded-full opacity-100 drop-shadow-[0_0_6px_var(--tone)] transition-[opacity,transform] duration-[260ms,340ms] ease-arrive max-md:w-[2px] motion-reduce:transition-none",

  // Sits over the strip and slides along it to whichever marker is active.
  readout:
    "pointer-events-none absolute bottom-[52px] left-0 w-[440px] text-center [@media(max-height:780px)]:bottom-[34px] transition-[opacity,transform] duration-[220ms,460ms] ease-arrive max-md:bottom-[52px] max-md:w-[300px] motion-reduce:transition-none",
  // Exactly one of these is ever applied. Stacking two opacity utilities on
  // one element leaves the winner to Tailwind's emit order, not to intent.
  readoutRest: "opacity-0",
  readoutOn: "opacity-100",
  system:
    "font-medium font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--tone)]",
  name: "mt-1.5 font-display text-[21px] text-primary-foreground leading-[1.2] max-md:text-[19px] [@media(max-height:780px)]:text-[19px]",
  note: "mt-1.5 text-pretty font-sans text-[13px] text-figure-body leading-[1.5] max-md:text-[12.5px] [@media(max-height:780px)]:text-[12px]",
  tagRow: "mt-2.5 [@media(max-height:780px)]:mt-2",
  tag: "inline-block rounded-full border px-[9px] py-1 font-mono text-[10px] uppercase tracking-[0.1em]",
  tagCovered: "border-primary-100/45 text-primary-100",
  tagMissing: "border-[var(--tone)] bg-[var(--tone)]/12 text-[var(--tone)]",
  // Hairline dropping from the readout toward the marker it describes.
  leader:
    "mx-auto mt-2.5 h-4 w-px bg-gradient-to-b from-[var(--tone)]/60 to-transparent",
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
  const bars = useMemo(
    () => Array.from({ length: barCount }, (_, index) => index),
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
      const half =
        Math.min(READOUT_WIDTH, window.innerWidth - READOUT_MARGIN * 2) / 2;

      setReadoutX(
        Math.min(
          Math.max(box.left + box.width / 2, half + READOUT_MARGIN),
          edge * 2 - half - READOUT_MARGIN
        )
      );

      // Last, and never able to take the visible work down with it: scrubbing
      // the strip asks the audio graph for forty oscillators in a second and
      // it is entitled to refuse.
      tickPlayer.play();
    },
    [barsPerMarker, tickPlayer]
  );

  const clear = useCallback(() => {
    activeIndexRef.current = null;
    setActiveIndex(null);
  }, []);

  const scrubTo = useCallback(
    (clientX: number) => {
      // Measure now if the cached box is missing or stale. `pointerenter` is
      // the usual moment, but it is not guaranteed to have happened.
      if (!trackBoxRef.current || trackBoxRef.current.width === 0) {
        measureTrack();
      }

      const box = trackBoxRef.current;

      if (!box || box.width === 0) {
        return;
      }

      const ratio = (clientX - box.left) / box.width;

      goToMarker(clampToMarker(Math.floor(ratio * BIOMARKER_COUNT)));
    },
    [goToMarker, measureTrack]
  );

  const handlePointerEnter = () => measureTrack();

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    // Deliberately not conditioned on `pointerType`. A touch device does not
    // send hover moves in the first place, so gating on the pointer calling
    // itself a mouse bought nothing and silently killed hover whenever it
    // reported anything else — while dragging, which took a different branch,
    // carried on working. Narrow screens step on tap instead of tracking.
    if (isNarrow) {
      return;
    }

    scrubTo(event.clientX);
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

    // Only a finger needs capture. Taking it for a mouse changes how the
    // boundary events fire and can strand the strip mid-interaction.
    if (event.pointerType !== "mouse") {
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    scrubTo(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerLeave = () => {
    if (!draggingRef.current) {
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
      <div
        aria-hidden="true"
        className={`${classes.readout} ${active ? classes.readoutOn : classes.readoutRest}`}
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
          {bars.map((index) => {
            const marker = BIOMARKERS[Math.floor(index / barsPerMarker)];

            if (!marker) {
              return null;
            }

            const { lift, delay } = prefersReducedMotion
              ? { lift: 0, delay: 0 }
              : liftFor(index, activeIndex, barsPerMarker);

            const style: CSSProperties = {
              height: `${BAR_HEIGHT}px`,
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
