"use client";

import {
  BiomarkerRange,
  type ReadoutAction,
} from "@/components/marketing/atoms/biomarker-range";
import { Heading } from "@/components/marketing/atoms/heading";
import { ScenarioCard } from "@/components/marketing/molecules/scenario-card";
import { Button } from "@/components/ui/button";
import { useArrived } from "@/hooks/use-arrived";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { BiomarkerName } from "@/lib/biomarkers";
import {
  type CaseStudyScenario,
  scenarioResults,
} from "@/lib/case-study-scenarios";
import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CaseStudyWallProperties = {
  headline: string;
  subheadline: string;
  scenarios: readonly CaseStudyScenario[];
};

/** Room left at either end before an arrow counts it as reached, in px. */
const END_SLACK = 4;

/** How long the arrows take to carry the row one tile, in ms. */
const GLIDE_MS = 1200;

/**
 * A long ease out (quint): most of the way early, then a slow drift onto
 * the tile, the same settle the tiles have as they rise.
 */
const easeOut = (progress: number) => 1 - (1 - progress) ** 5;

/**
 * How far into view the row of tiles must come before they wave in: until
 * its top edge is a quarter of the way up the window, so the tiles are seen
 * rising rather than coming in below the fold.
 */
const ARRIVAL_MARGIN = "0px 0px -25% 0px";

/** Milliseconds between one tile starting to rise and the next. */
const TILE_STAGGER_MS = 40;

/**
 * Milliseconds between one tile starting to fade in and the next. Wider
 * than the rise, so the far end of the row stays faint for longer and the
 * wave reads as coming up out of the dark.
 */
const FADE_STAGGER_MS = 90;

/**
 * When the strip starts its own wave, after the first tiles have risen:
 * tiles past the edge of the window are still rising, but out of sight.
 */
const STRIP_AFTER_MS = 600;

/**
 * A row of case studies, one tall tile per situation, over the biomarker
 * strip.
 *
 * The row slides sideways: a swipe or a trackpad scrolls it natively, each
 * tile snapping to the gutter, and the arrows over its right end step it
 * along a tile at a time for a mouse. It starts on the gutter and runs off
 * the right edge of the window so the next tiles peek in.
 *
 * Picking a tile pins its markers on the strip beneath the row, so the row
 * reads as many stories and the strip as the one panel they are all drawn
 * from. The first tile is picked to begin with, so the strip is never empty.
 *
 * It plays in once, when it arrives: the tiles rise into place one after
 * another from the left, the wave the strip makes, and the strip waves in
 * beneath them a beat later. Anyone who has asked for less motion gets it
 * all in place.
 *
 * Reading a marker on the strip offers to add it to your panel, from its
 * readout, and a second press takes it off again. The panel is only held
 * here for now, and nothing is sent anywhere.
 */
const classes = {
  // The gutter every part lines up on: the first bar of the strip below,
  // which sits 28px in from the edge of the page, or of the window when it
  // is narrower than the page. The headline and the first tile start on it.
  section:
    "relative w-full bg-figure-ground py-[120px] [--gutter:max(28px,calc((100%-var(--container-page))/2+28px))] max-md:py-16",
  // Centred over the row, as every section heading on the page is, at the
  // same size and measure as the AI section below.
  header: "flex flex-col items-center px-6 text-center",
  headline:
    "max-w-[15em] text-balance text-[clamp(2rem,1.2rem+2.4vw,3.5rem)] text-white leading-[1.08] tracking-[-0.01em] max-md:text-[28px]",
  subheadline:
    "mt-5 max-w-[632px] text-pretty font-sans text-[18px] text-white/80 leading-[28px] max-md:mt-3 max-md:text-[15px] max-md:leading-[22px]",
  // The arrows, over the right end of the row, on the gutter. They fade in
  // last, once the tiles have all but settled, and take no clicks until.
  arrowsWaiting:
    "pointer-events-none mt-12 flex justify-end gap-2 px-[var(--gutter)] opacity-0 max-md:mt-10",
  arrowsShown:
    "mt-12 flex justify-end gap-2 px-[var(--gutter)] opacity-100 transition-opacity delay-[1100ms] duration-700 ease-out motion-reduce:transition-none max-md:mt-10",
  // Each tile starts a whole tile height below its place, out of sight
  // under the edge of the row, as each bar of the strip starts a whole bar
  // height below its baseline. Further along the row it starts further
  // down still (`--i` is its place), so before they move the row is a
  // slope, low on the right. They all rise over the same time, the far ones faster to
  // cover more ground, so the slope levels out as it lifts: a wave, rather
  // than one drop played on a delay. The row clips them as they rise, so
  // they come up out of it, as the bars come up out of the strip. The fade
  // runs on its own, on a gentle ease out, rather than on the quick start
  // the rise has, so it is seen rather than over at once. The rise itself
  // decelerates hard and long, so each tile covers most of its ground early
  // and then glides the last few pixels, settling rather than landing.
  tileWaiting:
    "shrink-0 translate-y-[calc(100%+var(--i)*56px)] opacity-0",
  tileShown:
    "shrink-0 translate-y-0 opacity-100 transition-[translate,opacity] duration-[1600ms,1400ms] [transition-timing-function:cubic-bezier(0.05,0.7,0.1,1),cubic-bezier(0.33,0,0.2,1)] motion-reduce:transition-none",
  // The carousel arrows of the homepage case study.
  arrow:
    "flex size-10 items-center justify-center rounded-full border border-white/20 bg-primary-400 text-white transition-[background-color,opacity] hover:bg-primary-700 disabled:opacity-35 disabled:hover:bg-primary-400",
  arrowIcon: "size-5",
  // Scrolls sideways with its scrollbar hidden. Padded to the gutter at both
  // ends, and snapping to it, so the first tile starts in line with the
  // header and the last can be brought fully in. The vertical padding keeps
  // the selected outline, which sits outside the tile, from being clipped.
  // Hidden rather than scrolling up and down, so the tiles waiting below
  // it to rise never give the row a height of its own to scroll.
  track:
    "mt-4 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain px-[var(--gutter)] py-2 [scrollbar-width:none] max-sm:gap-4 [&::-webkit-scrollbar]:hidden",
  // The strip, close beneath the row. Above the row, so the readout of a
  // marker, which rises up over the tiles, always sits on top of them. The
  // height is the room the pins need over the bars.
  strip: "relative z-20 mt-10 h-[140px] max-md:mt-8",
  // In the readout: light, as the site’s other calls to action are, until
  // the marker is in the panel, then outlined in teal with a tick.
  add: "rounded-full bg-primary-50 text-primary-950 hover:bg-primary-100",
  added:
    "rounded-full border border-teal-300 bg-teal-300/15 text-teal-300 hover:bg-teal-300/25",
  announcer: "sr-only",
} as const;

/** Whether the row can scroll further back and further on. */
const useTrackEnds = (track: HTMLDivElement | null) => {
  const [ends, setEnds] = useState({ atStart: true, atEnd: false });

  useEffect(() => {
    if (!track) {
      return;
    }

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      setEnds({
        atStart: scrollLeft <= END_SLACK,
        atEnd: scrollLeft + clientWidth >= scrollWidth - END_SLACK,
      });
    };

    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [track]);

  return ends;
};

export const CaseStudyWall = ({
  headline,
  subheadline,
  scenarios,
}: CaseStudyWallProperties) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const arrived =
    useArrived(trackRef, ARRIVAL_MARGIN) || prefersReducedMotion;
  const [stripWaving, setStripWaving] = useState(false);
  const [track, setTrack] = useState<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState(0);
  const { atStart, atEnd } = useTrackEnds(track);
  const [panel, setPanel] = useState<ReadonlySet<BiomarkerName>>(new Set());
  const [announcement, setAnnouncement] = useState("");
  const scenario = scenarios[selected] ?? scenarios[0];
  const caseStudy = useMemo(
    () => (scenario ? scenarioResults(scenario) : undefined),
    [scenario]
  );

  useEffect(() => {
    setTrack(trackRef.current);
  }, []);

  useEffect(() => {
    if (!arrived || prefersReducedMotion) {
      return;
    }

    const timer = window.setTimeout(() => setStripWaving(true), STRIP_AFTER_MS);

    return () => window.clearTimeout(timer);
  }, [arrived, prefersReducedMotion]);

  // With less motion the strip is simply there; otherwise it waits, then
  // waves in.
  const stripWave = prefersReducedMotion ? {} : { waveIn: stripWaving };

  // Adds the marker, or takes it off if it is already in, and says which.
  const togglePanel = useCallback(
    (name: BiomarkerName) => {
      const had = panel.has(name);
      const next = new Set(panel);

      if (had) {
        next.delete(name);
      } else {
        next.add(name);
      }

      setPanel(next);
      setAnnouncement(
        had ? `${name} removed from your panel.` : `${name} added to your panel.`
      );
    },
    [panel]
  );

  // Out of the tab order: the readout is hidden from assistive technology,
  // and the strip itself adds the marker on Enter.
  const readoutAction = useMemo<ReadoutAction>(
    () => ({
      render: (name) => {
        const isIn = panel.has(name);

        return (
          <Button
            className={isIn ? classes.added : classes.add}
            onClick={() => togglePanel(name)}
            size="sm"
            tabIndex={-1}
            type="button"
          >
            {isIn ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isIn ? "Added to panel" : "Add to panel"}
          </Button>
        );
      },
      onActivate: togglePanel,
    }),
    [panel, togglePanel]
  );

  // The glide the arrows start: where it set out from, where it is going,
  // and the frame that is carrying it. Null when the row is at rest.
  const glideRef = useRef<{
    from: number;
    to: number;
    start: number;
    frame: number;
  } | null>(null);

  // Ends a glide where it is, and gives the row its snap back.
  const stopGlide = useCallback(() => {
    const glide = glideRef.current;
    const row = trackRef.current;

    if (glide) {
      cancelAnimationFrame(glide.frame);
    }

    glideRef.current = null;

    if (row) {
      row.style.scrollSnapType = "";
    }
  }, []);

  // A swipe, a wheel or a press on the row takes it back from a glide at
  // once, so the reader is never fighting the arrows.
  useEffect(() => {
    if (!track) {
      return;
    }

    const events = ["wheel", "pointerdown", "touchstart"] as const;

    for (const name of events) {
      track.addEventListener(name, stopGlide, { passive: true });
    }

    return () => {
      for (const name of events) {
        track.removeEventListener(name, stopGlide);
      }
      stopGlide();
    };
  }, [stopGlide, track]);

  // Carries the row to `left` on a long ease out, frame by frame, since a
  // browser’s own smooth scroll can neither be timed nor eased. The snap is
  // off while it moves, or the browser would pull it to a tile at every
  // frame, and back on once it lands, on a tile, so the snap has nothing to
  // correct.
  const glideTo = useCallback(
    (left: number) => {
      const row = trackRef.current;

      if (!row) {
        return;
      }

      if (glideRef.current) {
        cancelAnimationFrame(glideRef.current.frame);
      }

      if (prefersReducedMotion) {
        stopGlide();
        row.scrollLeft = left;
        return;
      }

      row.style.scrollSnapType = "none";

      const glide = {
        from: row.scrollLeft,
        to: left,
        start: performance.now(),
        frame: 0,
      };

      const tick = (now: number) => {
        const progress = Math.min((now - glide.start) / GLIDE_MS, 1);

        row.scrollLeft = glide.from + (glide.to - glide.from) * easeOut(progress);

        if (progress < 1) {
          glide.frame = requestAnimationFrame(tick);
          return;
        }

        stopGlide();
      };

      glide.frame = requestAnimationFrame(tick);
      glideRef.current = glide;
    },
    [prefersReducedMotion, stopGlide]
  );

  // One tile and the gap after it, read from the row itself so it follows
  // the tile width at every size. Each press goes to the next tile's snap
  // position, a whole number of strides from the start, counted from where
  // a glide under way is heading rather than from part way through it, so
  // a quick run of presses moves exactly one tile each.
  const step = useCallback(
    (direction: number) => {
      const row = trackRef.current;
      const [first, second] = row?.children ?? [];

      if (!(row && first)) {
        return;
      }

      const stride = second
        ? second.getBoundingClientRect().left -
          first.getBoundingClientRect().left
        : first.getBoundingClientRect().width;
      const furthest = row.scrollWidth - row.clientWidth;
      const from = glideRef.current?.to ?? row.scrollLeft;
      const tile = Math.round(from / stride) + direction;

      glideTo(Math.min(Math.max(tile * stride, 0), furthest));
    },
    [glideTo]
  );

  return (
    <section className={classes.section}>
      <header className={classes.header}>
        <Heading as={2} className={classes.headline} level={1}>
          {headline}
        </Heading>
        <p className={classes.subheadline}>{subheadline}</p>
      </header>

      <div className={arrived ? classes.arrowsShown : classes.arrowsWaiting}>
        <button
          aria-label="Previous case studies"
          className={classes.arrow}
          disabled={atStart}
          onClick={() => step(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className={classes.arrowIcon} />
        </button>
        <button
          aria-label="Next case studies"
          className={classes.arrow}
          disabled={atEnd}
          onClick={() => step(1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" className={classes.arrowIcon} />
        </button>
      </div>

      <div className={classes.track} ref={trackRef}>
        {scenarios.map((item, index) => (
          <div
            className={arrived ? classes.tileShown : classes.tileWaiting}
            key={item.title}
            style={
              {
                "--i": index,
                transitionDelay: `${index * TILE_STAGGER_MS}ms, ${index * FADE_STAGGER_MS}ms`,
              } as CSSProperties
            }
          >
            <ScenarioCard
              onSelect={() => setSelected(index)}
              scenario={item}
              selected={index === selected}
            />
          </div>
        ))}
      </div>

      <div className={classes.strip}>
        <BiomarkerRange
          readoutAction={readoutAction}
          readoutGlass
          {...(caseStudy ? { caseStudy } : {})}
          {...stripWave}
        />
        <p aria-live="polite" className={classes.announcer}>
          {announcement}
        </p>
      </div>
    </section>
  );
};
