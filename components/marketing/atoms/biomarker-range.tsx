"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  BIOMARKER_COUNT,
  BIOMARKER_SYSTEMS,
  BIOMARKERS,
  type BiomarkerResult,
  type CaseStudyResults,
} from "@/lib/biomarkers";
import { createTickPlayer } from "@/lib/tick-sound";
import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from "react";
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
const BAR_HEIGHT = 52;

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
const GROUP_LIFT = 16;

/** How far above the ink a case study's pin sits. */
const PIN_GAP = 10;

/** Falloff either side of the marker, indexed by distance from its edge. */
const LIFT = [11, 8, 5, 3, 2] satisfies number[];

/**
 * Milliseconds added per step away from the marker, so the lift travels
 * outward as a ripple rather than the whole neighbourhood moving at once.
 */
const RIPPLE_STEP_MS = 26;

/** Gap between the readout and the window edge it is kept clear of. */
const READOUT_MARGIN = 16;

/** Matches `classes.readout`, for the clamp that keeps it inside the window. */
const READOUT_WIDTH = 560;

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
  // A strip pinned to the bottom edge of the window is a hard thing to land
  // on and an easy thing to fall off, so the region that answers the pointer
  // reaches well above the ink. The bars stay bottom aligned inside it and
  // nothing above them is drawn.
  root: "absolute inset-x-0 bottom-0 h-[140px] touch-none drop-shadow-waveform focus-visible:outline-none",
  track:
    "-translate-x-1/2 absolute bottom-0 left-1/2 flex h-full w-full max-w-page items-end justify-between px-7",
  // Hidden until the wave plays, when each bar rises in on its own delay.
  trackWaiting:
    "-translate-x-1/2 absolute bottom-0 left-1/2 flex h-full w-full max-w-page items-end justify-between px-7 opacity-0",
  // Rises from below its own baseline into place. The keyframes set only the
  // start, so each bar finishes on whatever its own opacity and lift are.
  barWave: "animate-bar-rise motion-reduce:animate-none",
  // Sinks back below its baseline as a parent raises `--exit` from 0 to 1:
  // the wave run backwards, the rightmost bar first (its `--k` is 1) and the
  // leftmost last. On `translate`, so it stacks with the lift on `transform`
  // and with the entrance, and does nothing where no parent sets `--exit`.
  barExit:
    "[translate:0_calc(clamp(0,var(--exit,0)*1.6-(1-var(--k))*0.6,1)*110%)]",
  bar: "w-[4px] shrink-0 rounded-full opacity-[0.22] transition-[opacity,transform] duration-[260ms,340ms] ease-arrive max-md:w-[3px] motion-reduce:transition-none",
  barCovered:
    "w-[4px] shrink-0 rounded-full opacity-[0.82] transition-[opacity,transform] duration-[260ms,340ms] ease-arrive max-md:w-[3px] motion-reduce:transition-none",
  barActive:
    "w-[4px] shrink-0 rounded-full opacity-100 drop-shadow-[0_0_8px_var(--tone)] transition-[opacity,transform] duration-[260ms,340ms] ease-arrive max-md:w-[3px] motion-reduce:transition-none",

  // Sits over the strip and slides along it to whichever marker is active.
  // Its bottom edge, the tip of the hairline, stops well clear of the bars
  // at full lift (52 + 16 = 68px), so nothing in it ever touches them.
  readout:
    "pointer-events-none absolute bottom-[120px] left-0 w-[560px] text-center [@media(max-height:780px)]:bottom-[104px] max-md:bottom-[104px] max-md:w-[330px]",
  // One of these, never both: gliding between markers, or fading in place
  // on arrival.
  readoutGlide:
    "transition-[opacity,transform] duration-[220ms,460ms] ease-arrive motion-reduce:transition-none",
  readoutJump:
    "transition-opacity duration-[220ms] ease-arrive motion-reduce:transition-none",
  // Exactly one of these is ever applied. Stacking two opacity utilities on
  // one element leaves the winner to Tailwind's emit order, not to intent.
  readoutRest: "opacity-0",
  readoutOn: "opacity-100",
  // A dark pane behind the words so they hold up over any photograph, for
  // when the strip sits over one (`readoutGlass`). Off by default. The
  // tint does most of the work: the readout fades in and out, and a browser
  // only blurs what is behind a fading element once the fade has finished,
  // so a pane that relied on the blur would visibly snap into focus. Fixed
  // width, so it does not resize as it glides from marker to marker.
  readoutPanel:
    "mx-auto w-[440px] rounded-2xl border border-hero-glass-edge bg-figure-ground/80 px-7 pt-5 pb-6 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.6)] backdrop-blur-md max-md:w-full max-md:px-5 max-md:pt-4 max-md:pb-5",
  // The same measure with no pane, over a plain ground.
  readoutPanelPlain: "mx-auto w-[440px] max-md:w-full",
  system:
    "font-medium font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--tone)] max-md:text-[11px]",
  name: "mt-2 font-display text-[30px] text-primary-foreground leading-[1.15] max-md:text-[24px] [@media(max-height:780px)]:text-[26px]",
  // A narrower measure than the readout, so the note breaks into short lines
  // and the readout stays compact.
  note: "mx-auto mt-2 max-w-[380px] text-pretty font-sans text-[16px] text-figure-body leading-[1.5] max-md:text-[14px] [@media(max-height:780px)]:text-[15px]",
  tagRow:
    "mt-3.5 flex flex-wrap items-center justify-center gap-2 [@media(max-height:780px)]:mt-3",
  // A person's reading, on the markers the case study covers. A finding is
  // filled with its system's tone; a clear result is only outlined.
  resultFinding:
    "inline-block rounded-full bg-[var(--tone)] px-3 py-1.5 font-mono text-[12px] text-primary-950 uppercase tracking-[0.1em] max-md:text-[11px]",
  resultClear:
    "inline-block rounded-full border border-white/40 px-3 py-1.5 font-mono text-[12px] text-white/85 uppercase tracking-[0.1em] max-md:text-[11px]",
  // The pins share the track's box, so a bar's offset within the track is its
  // position here too. They cannot live inside the track: its children are
  // the bars, and bars are found by their index among them.
  pins: "-translate-x-1/2 pointer-events-none absolute bottom-0 left-1/2 h-full w-full max-w-page opacity-100 transition-opacity duration-500 motion-reduce:transition-none",
  // Until the wave has passed, so the pins land on bars that are there.
  pinsWaiting:
    "-translate-x-1/2 pointer-events-none absolute bottom-0 left-1/2 h-full w-full max-w-page opacity-0",
  pinFinding:
    "absolute size-[9px] rounded-full bg-[var(--tone)] shadow-[0_0_10px_var(--tone)] transition-transform duration-[340ms] max-md:size-[7px] motion-reduce:transition-none",
  pinClear:
    "absolute size-[9px] rounded-full border-[1.5px] border-white/70 transition-transform duration-[340ms] max-md:size-[7px] motion-reduce:transition-none",
  // Hairline dropping from the readout toward the marker it describes. It is
  // long on purpose: it lifts the text well clear of the bars while still
  // reaching down to the one being read. `block` matters: it is a span, and
  // an inline box ignores both its width and its height, so without it the
  // line never draws at all.
  leader:
    "mx-auto mt-4 block h-[72px] w-px max-md:h-12 [@media(max-height:780px)]:h-12 bg-gradient-to-b from-[var(--tone)]/60 to-transparent",
} as const;

const barClass = (covered: boolean, isActive: boolean) => {
  if (isActive) {
    return classes.barActive;
  }

  return covered ? classes.barCovered : classes.bar;
};

/**
 * Where each tested marker's pin goes: midway between the marker's two middle
 * bars, read off the laid-out bars rather than derived, because the strip
 * spaces its bars to fill whatever width it is given.
 */
const measurePinPositions = (
  track: HTMLElement | null,
  caseStudy: CaseStudyResults | undefined,
  barsPerMarker: number
) => {
  const positions: Record<number, number> = {};

  if (!(track && caseStudy)) {
    return positions;
  }

  const half = barsPerMarker / 2;

  for (const [index, marker] of BIOMARKERS.entries()) {
    const left = track.children[index * barsPerMarker + half - 1];
    const right = track.children[index * barsPerMarker + half];
    const tested = Boolean(caseStudy.results[marker.name]);

    if (tested && left instanceof HTMLElement && right instanceof HTMLElement) {
      positions[index] =
        (left.offsetLeft + left.offsetWidth + right.offsetLeft) / 2;
    }
  }

  return positions;
};

type CaseStudyPinsProperties = {
  caseStudy: CaseStudyResults | undefined;
  pinX: Record<number, number>;
  /** The marker being read, whose pin rides up with it. */
  activeIndex: number | null;
  /** Reduced motion: pins hold their place rather than riding up. */
  still: boolean;
  /** False while the strip waits to wave in; the pins arrive after it. */
  shown: boolean;
  /** How long after being shown the pins fade in, in ms. */
  showDelayMs: number;
};

/** A pin above each marker the case study covers: filled for a finding. */
const CaseStudyPins = ({
  caseStudy,
  pinX,
  activeIndex,
  still,
  shown,
  showDelayMs,
}: CaseStudyPinsProperties) => {
  if (!caseStudy) {
    return null;
  }

  const lifted = still ? null : activeIndex;
  const pins: ReactNode[] = [];

  for (const [key, x] of Object.entries(pinX)) {
    const index = Number(key);
    const marker = BIOMARKERS[index];
    const pinned = marker && caseStudy.results[marker.name];

    if (!(marker && pinned)) {
      continue;
    }

    const style: CSSProperties = {
      left: `${x}px`,
      bottom: `${BAR_HEIGHT + PIN_GAP}px`,
      transform: `translate(-50%, ${index === lifted ? -GROUP_LIFT : 0}px)`,
      transitionTimingFunction: "var(--ease-pin)",
      "--tone": BIOMARKER_SYSTEMS[marker.system].tone,
    } as CSSProperties;

    pins.push(
      <span
        className={
          pinned.status === "finding" ? classes.pinFinding : classes.pinClear
        }
        key={marker.name}
        style={style}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={shown ? classes.pins : classes.pinsWaiting}
      style={{ transitionDelay: shown ? `${showDelayMs}ms` : "0ms" }}
    >
      {pins}
    </div>
  );
};

type ResultTagProperties = {
  person: string | undefined;
  result: BiomarkerResult | undefined;
};

/** The person's reading, shown under the note on the markers they have. */
const ResultTag = ({ person, result }: ResultTagProperties) => {
  if (!(person && result)) {
    return null;
  }

  return (
    <span
      className={
        result.status === "finding"
          ? classes.resultFinding
          : classes.resultClear
      }
    >
      {person} · {result.reading}
    </span>
  );
};

type Marker = (typeof BIOMARKERS)[number];

/** What a screen reader hears for a marker, as one sentence. */
const describeMarker = (
  marker: Marker,
  caseStudy: CaseStudyResults | undefined
) => {
  const result = caseStudy?.results[marker.name];
  const detail =
    result && caseStudy
      ? `${caseStudy.person}: ${result.reading}. ${result.meaning}`
      : marker.note;
  return `${marker.name}. ${BIOMARKER_SYSTEMS[marker.system].label}. ${detail}`;
};

type ReadoutContentProperties = {
  marker: Marker | null;
  caseStudy: CaseStudyResults | undefined;
};

/**
 * The readout's text. For a marker the case study covers, what it meant for
 * this person takes the generic note's place, with their reading beneath.
 * Every other marker has only its note, and no row where the reading would
 * go.
 */
const ReadoutContent = ({ marker, caseStudy }: ReadoutContentProperties) => {
  const system = marker ? BIOMARKER_SYSTEMS[marker.system] : null;
  const result = marker ? caseStudy?.results[marker.name] : undefined;

  return (
    <>
      <p className={classes.system}>{system?.label}</p>
      <p className={classes.name}>{marker?.name}</p>
      <p className={classes.note}>{result?.meaning ?? marker?.note}</p>
      {result ? (
        <p className={classes.tagRow}>
          <ResultTag person={caseStudy?.person} result={result} />
        </p>
      ) : null}
    </>
  );
};

type BiomarkerRangeProperties = {
  /**
   * One person's results, laid over the generic strip: a pin above each
   * marker they were tested on, and their reading in its readout.
   */
  caseStudy?: CaseStudyResults;
  /** Set the readout on a dark glass pane, for a strip laid over a photograph. */
  readoutGlass?: boolean;
  /**
   * Leave out to show the strip at once. Pass false to hold it hidden, and
   * true to play it in: the bars rise into place as a wave from the left,
   * and the pins follow once it has passed.
   */
  waveIn?: boolean;
};

/**
 * The wave: how long it takes to travel from the first bar to the last, and
 * how long each bar takes to rise, which the `bar-rise` animation token sets.
 */
const WAVE_SPAN_MS = 1100;
const BAR_RISE_MS = 700;

export const BiomarkerRange = ({
  caseStudy,
  readoutGlass = false,
  waveIn,
}: BiomarkerRangeProperties) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackBoxRef = useRef<{ left: number; width: number } | null>(null);
  const activeIndexRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const [barsPerMarker, setBarsPerMarker] = useState(BARS_PER_MARKER_WIDE);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [readoutX, setReadoutX] = useState(0);
  const [isGliding, setIsGliding] = useState(false);

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

  // Where each tested marker's pin goes: midway between the marker's two
  // middle bars, read off the laid-out bars rather than derived, because the
  // strip spaces its bars to fill whatever width it is given.
  const [pinX, setPinX] = useState<Record<number, number>>({});

  const measurePins = useCallback(() => {
    setPinX(measurePinPositions(trackRef.current, caseStudy, barsPerMarker));
  }, [barsPerMarker, caseStudy]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    measurePins();

    const observer = new ResizeObserver(measurePins);

    observer.observe(track);

    return () => observer.disconnect();
  }, [measurePins]);

  const goToMarker = useCallback(
    (index: number) => {
      if (activeIndexRef.current === index) {
        return;
      }

      // Appearing, it jumps straight to its marker; only once it is showing
      // does it glide from one marker to the next. Otherwise the first hover
      // slides it in from wherever it last sat — off the left edge on a
      // fresh page, since its position starts at zero.
      const isEntering = activeIndexRef.current === null;

      activeIndexRef.current = index;
      setActiveIndex(index);
      setIsGliding(!isEntering);

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
  // What a screen reader hears when the value moves, as one sentence.
  const valueText = active ? describeMarker(active, caseStudy) : undefined;

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
        className={`${classes.readout} ${isGliding ? classes.readoutGlide : classes.readoutJump} ${active ? classes.readoutOn : classes.readoutRest}`}
        style={readoutStyle}
      >
        <div
          className={
            readoutGlass ? classes.readoutPanel : classes.readoutPanelPlain
          }
        >
          <ReadoutContent caseStudy={caseStudy} marker={active ?? null} />
        </div>
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
        <div
          className={waveIn === false ? classes.trackWaiting : classes.track}
          ref={trackRef}
        >
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
              "--k": index / Math.max(barCount - 1, 1),
              ...(waveIn
                ? { animationDelay: `${(index * WAVE_SPAN_MS) / barCount}ms` }
                : {}),
            } as CSSProperties;

            return (
              <div
                className={`${barClass(
                  marker.covered,
                  Math.floor(index / barsPerMarker) === activeIndex
                )} ${classes.barExit} ${waveIn ? classes.barWave : ""}`}
                key={index}
                style={style}
              />
            );
          })}
        </div>

        <CaseStudyPins
          activeIndex={activeIndex}
          caseStudy={caseStudy}
          pinX={pinX}
          showDelayMs={waveIn ? WAVE_SPAN_MS + BAR_RISE_MS - 200 : 0}
          shown={waveIn !== false}
          still={prefersReducedMotion}
        />
      </div>
    </>
  );
};
