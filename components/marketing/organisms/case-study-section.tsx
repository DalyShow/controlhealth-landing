"use client";

import { BiomarkerRange } from "@/components/marketing/atoms/biomarker-range";
import { Heading } from "@/components/marketing/atoms/heading";
import { StatBar } from "@/components/marketing/molecules/stat-bar";
import type { CaseStudyResults } from "@/lib/biomarkers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react";

/** One of the slides that follow the case study once it has shrunk. */
export type CaseStudySlide = {
  headline: string;
  subheadline: string;
  /** A still, painted edge to edge behind the words. */
  image: string;
};

type CaseStudySectionProperties = {
  /** The claim the study makes. The heading of the section. */
  headline: string;
  /** A sentence or two under the headline. */
  subheadline: string;
  /** Who the study follows, e.g. "Sarah, 41, avid runner". */
  intro: string;
  /** The live readings, as `StatSprite`s; the section puts them in the bar. */
  stats: ReactNode;
  /** Full-bleed footage or still, painted behind the headline. */
  media: ReactNode;
  /** Their lab results, pinned over the biomarker strip. */
  caseStudy?: CaseStudyResults;
  /** The slides the study becomes the first of. */
  slides?: CaseStudySlide[];
};

type SlideCardProperties = {
  slide: CaseStudySlide;
  /** Where it sits in the slider, counting the study itself as 0. */
  position: number;
  count: number;
};

/**
 * Share of the pinned scroll spent shrinking. The rest holds the settled
 * slider on screen before the panel moves on, so it can be used.
 */
const SHRINK_SHARE = 0.75;

/** A drag or swipe further than this across the slides turns one. */
const SWIPE_THRESHOLD = 48;

/** Horizontal wheel travel, from a trackpad swipe, that turns one slide. */
const WHEEL_THRESHOLD = 40;

/**
 * How long after a wheel turn before another can happen. Long enough to
 * outlast the momentum of a trackpad, which otherwise runs through every slide.
 */
const WHEEL_COOLDOWN_MS = 900;

/**
 * Nominal size for the slide stills. They are cropped to the card whatever
 * their real size, so this only gives the browser a shape to reserve.
 */
const SLIDE_IMAGE_SIZE = { width: 1600, height: 1200 } as const;

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

/** Eases both ends, so the shrink starts and lands softly under the scroll. */
const smoothstep = (value: number) => value * value * (3 - 2 * value);

/**
 * A full-screen panel following one person, which shrinks into the first
 * slide of a horizontal slider as the page scrolls.
 *
 * The panel pins while the footage is masked down to a rounded card, and the
 * next slides slide in behind it until the first peeks in from the right.
 * The biomarker strip rises from the bottom edge on the same progress, so
 * the card and the strip arrive together, and the headline waits until the
 * card has landed, then fades in. The bar at the top and the strip sit
 * outside the mask: they belong to the panel, not to any one slide, and the
 * card settles in the space between them.
 *
 * Scroll writes one number, `--p`, from 0 to 1, onto the stage. Every moving
 * part is CSS derived from it and from the card geometry set on the stage, so
 * a scroll frame costs one property write and no render. The slider only
 * takes input once the shrink has landed; scrolling back up returns it to
 * the first slide as the card opens out again.
 *
 * Anyone who has asked for less motion gets the settled slider as a single
 * panel with nothing to scroll through.
 */
const classes = {
  // The runway: 80vh of scroll past the panel, 60vh of it shrinking, so one
  // scroll gesture carries the footage into the card.
  section: "relative h-[calc(max(100dvh,680px)+80vh)] motion-reduce:h-auto",
  // The card geometry. The mask insets are the settled card: under the bar
  // at the top, above the tallest bar and its pins at the bottom, with the
  // next slide peeking in from the right. The content inset is how far each
  // slide keeps its words from the left and bottom edges of the card.
  stage:
    "group/stage @container panel sticky top-0 isolate overflow-hidden bg-figure-ground [--card-w:calc(100cqw-var(--mask-l)-var(--mask-r))] [--gap:16px] [--mask-b:112px] [--mask-l:44px] [--mask-r:calc(var(--peek)+var(--gap))] [--mask-t:96px] [--content-inset:80px] [--p:0] [--peek:120px] [--radius:28px] max-sm:[--content-inset:24px] max-sm:[--gap:10px] max-sm:[--mask-l:16px] max-sm:[--mask-t:112px] max-sm:[--peek:28px] max-sm:[--radius:20px]",
  track:
    "absolute inset-0 touch-pan-y select-none transition-[translate] duration-700 ease-arrive [translate:calc(var(--slide)*-1*(var(--card-w)+var(--gap)))_0] motion-reduce:transition-none",
  lead: "absolute inset-0 isolate bg-hero-gradient [clip-path:inset(calc(var(--p)*var(--mask-t))_calc(var(--p)*var(--mask-r))_calc(var(--p)*var(--mask-b))_calc(var(--p)*var(--mask-l))_round_calc(var(--p)*var(--radius)))]",
  // Its own box, rather than a sibling of the headline: an element handed in
  // from the server and rendered beside another trips the list key check.
  // No stacking context of its own, so the footage still blends with the
  // gradient behind it.
  media: "absolute inset-0",
  // The lead headline is held back while the footage is full-bleed and
  // shrinking, and fades in once the card has landed, in the same place and
  // at the same size as every other slide: anchored to the bottom-left
  // corner of the card, the content inset in from both edges. It fades back
  // while a marker is read, like theirs.
  leadMessageHidden:
    "pointer-events-none absolute bottom-[calc(var(--mask-b)+var(--content-inset))] left-[calc(var(--mask-l)+var(--content-inset))] z-10 flex w-[calc(var(--card-w)-2*var(--content-inset))] flex-col items-start text-left opacity-0 transition-opacity duration-300 motion-reduce:transition-none",
  leadMessageShown:
    "absolute bottom-[calc(var(--mask-b)+var(--content-inset))] left-[calc(var(--mask-l)+var(--content-inset))] z-10 flex w-[calc(var(--card-w)-2*var(--content-inset))] flex-col items-start text-left opacity-100 transition-opacity delay-150 duration-700 ease-out group-has-[[role=slider][aria-valuetext]]/stage:opacity-15 group-has-[[role=slider][aria-valuetext]]/stage:delay-0 group-has-[[role=slider][aria-valuetext]]/stage:duration-300 motion-reduce:transition-none",
  // Laid out where the settled slider puts it, and pushed right by the peek
  // until the shrink lands, which puts the first one just off screen at the
  // start.
  slide:
    "absolute top-[var(--mask-t)] bottom-[var(--mask-b)] left-[calc(var(--mask-l)+var(--i)*(var(--card-w)+var(--gap)))] w-[var(--card-w)] overflow-hidden rounded-[var(--radius)] bg-primary-950 [translate:calc((1-var(--p))*var(--peek))_0]",
  slideImage: "pointer-events-none absolute inset-0 size-full object-cover",
  // Darkest under the words, at the bottom.
  slideScrim:
    "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/0",
  // Anchored to the bottom-left corner, the content inset in from both
  // edges. It fades back while a marker is read, because the readout rises
  // into the card.
  slideMessage:
    "absolute inset-x-[var(--content-inset)] bottom-[var(--content-inset)] flex flex-col items-start text-left transition-opacity duration-300 group-has-[[role=slider][aria-valuetext]]/stage:opacity-15",
  slideHeadline:
    "max-w-[min(17em,100%)] text-balance text-[clamp(1.75rem,1.2rem+1.6vw,2.75rem)] text-white tracking-[-0.01em] max-md:text-[22px] [@media(max-height:780px)]:text-[clamp(1.5rem,1.1rem+1.2vw,2.25rem)]",
  slideSubheadline:
    "mt-3 max-w-[480px] text-pretty font-sans text-[16px] text-white leading-6 max-md:mt-3 max-md:text-[14px] max-md:leading-5",
  top: "absolute inset-x-0 top-0 z-10 flex justify-center px-11 pt-[34px] max-sm:px-6",
  // Matches the value in `StatSprite`: if the readings change size, change this.
  intro:
    "m-0 whitespace-nowrap font-sans font-semibold text-[13.5px] text-primary-foreground leading-none max-sm:text-[12px]",
  navShown:
    "absolute top-[calc(var(--mask-t)+16px)] right-[calc(var(--mask-r)+16px)] z-20 flex gap-2 opacity-100 transition-opacity duration-500 motion-reduce:transition-none",
  navHidden:
    "pointer-events-none absolute top-[calc(var(--mask-t)+16px)] right-[calc(var(--mask-r)+16px)] z-20 flex gap-2 opacity-0 transition-opacity duration-300 motion-reduce:transition-none",
  navButton:
    "flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-[background-color,opacity] hover:bg-black/45 disabled:opacity-35 disabled:hover:bg-black/30 max-sm:size-9",
  navIcon: "size-5",
  // The strip rises from below the frame as the footage shrinks, on the same
  // progress, so the two arrive together. It answers the pointer only once
  // it has landed.
  stripArriving:
    "pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[140px] opacity-[var(--p)] [translate:0_calc((1-var(--p))*100%)]",
  stripLanded:
    "absolute inset-x-0 bottom-0 z-20 h-[140px] opacity-[var(--p)] [translate:0_calc((1-var(--p))*100%)]",
} as const;

/**
 * Writes the progress of the shrink onto the stage on every scroll frame, and
 * reports whether it has landed. Nothing re-renders until it does.
 */
const useShrinkProgress = (
  sectionRef: RefObject<HTMLDivElement | null>,
  stageRef: RefObject<HTMLElement | null>
) => {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;

    if (!(section && stage)) {
      return;
    }

    // Straight from the scroll event, with no frame request in between:
    // browsers already fire scroll at most once a frame, in step with
    // rendering, so gating it again would only add a frame of lag.
    const update = () => {
      // Nothing to scroll through, as for a reader who asked for less
      // motion, means the slider is simply there.
      const distance = section.offsetHeight - stage.offsetHeight;
      const travelled = -section.getBoundingClientRect().top;
      const raw = distance > 0 ? travelled / (distance * SHRINK_SHARE) : 1;
      const progress = smoothstep(clampUnit(raw));

      stage.style.setProperty("--p", progress.toFixed(4));
      setSettled(progress >= 1);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionRef, stageRef]);

  return settled;
};

const SlideCard = ({ slide, position, count }: SlideCardProperties) => (
  <article
    aria-label={`${position + 1} of ${count}`}
    aria-roledescription="slide"
    className={classes.slide}
    style={{ "--i": position } as CSSProperties}
  >
    {/** biome-ignore lint/performance/noImgElement: static export, unoptimized */}
    <img
      alt=""
      className={classes.slideImage}
      decoding="async"
      draggable={false}
      height={SLIDE_IMAGE_SIZE.height}
      loading="lazy"
      src={slide.image}
      width={SLIDE_IMAGE_SIZE.width}
    />
    <div className={classes.slideScrim} />
    <div className={classes.slideMessage}>
      <Heading as={3} className={classes.slideHeadline} level={1}>
        {slide.headline}
      </Heading>
      <p className={classes.slideSubheadline}>{slide.subheadline}</p>
    </div>
  </article>
);

export const CaseStudySection = ({
  headline,
  subheadline,
  intro,
  stats,
  media,
  caseStudy,
  slides = [],
}: CaseStudySectionProperties) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const dragStartRef = useRef<number | null>(null);
  const wheelRef = useRef({ travel: 0, lockedUntil: 0 });
  const [index, setIndex] = useState(0);
  const settled = useShrinkProgress(sectionRef, stageRef);
  const count = slides.length + 1;

  // Opening the card back out always lands on the study itself.
  useEffect(() => {
    if (!settled) {
      setIndex(0);
    }
  }, [settled]);

  const step = useCallback(
    (direction: number) => {
      if (!settled) {
        return;
      }

      setIndex((current) =>
        Math.min(count - 1, Math.max(0, current + direction))
      );
    },
    [count, settled]
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;

    if (start === null) {
      return;
    }

    const distance = event.clientX - start;

    if (Math.abs(distance) > SWIPE_THRESHOLD) {
      step(distance < 0 ? 1 : -1);
    }
  };

  const handlePointerCancel = () => {
    dragStartRef.current = null;
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const wheel = wheelRef.current;

    // Vertical scrolling belongs to the page.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
      wheel.travel = 0;
      return;
    }

    if (event.timeStamp < wheel.lockedUntil) {
      return;
    }

    wheel.travel += event.deltaX;

    if (Math.abs(wheel.travel) >= WHEEL_THRESHOLD) {
      step(wheel.travel > 0 ? 1 : -1);
      wheel.travel = 0;
      wheel.lockedUntil = event.timeStamp + WHEEL_COOLDOWN_MS;
    }
  };

  // Arrow keys turn the slides from either button, as well as clicks.
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };
    const direction = moves[event.key];

    if (direction !== undefined) {
      event.preventDefault();
      step(direction);
    }
  };

  return (
    <div className={classes.section} ref={sectionRef}>
      <section
        aria-label={`${intro}, and more stories`}
        aria-roledescription="carousel"
        className={classes.stage}
        ref={stageRef}
        style={{ "--slide": index } as CSSProperties}
      >
        <div
          className={classes.track}
          onPointerCancel={handlePointerCancel}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
        >
          <article
            aria-label={`1 of ${count}`}
            aria-roledescription="slide"
            className={classes.lead}
          >
            <div className={classes.media}>{media}</div>
            <div
              className={
                settled ? classes.leadMessageShown : classes.leadMessageHidden
              }
            >
              <Heading as={2} className={classes.slideHeadline} level={1}>
                {headline}
              </Heading>
              <p className={classes.slideSubheadline}>{subheadline}</p>
            </div>
          </article>

          {slides.map((slide, position) => (
            <SlideCard
              count={count}
              key={slide.headline + slide.image}
              position={position + 1}
              slide={slide}
            />
          ))}
        </div>

        <div className={classes.top}>
          <StatBar lead={<p className={classes.intro}>{intro}</p>}>
            {stats}
          </StatBar>
        </div>

        {slides.length > 0 ? (
          <div
            className={settled ? classes.navShown : classes.navHidden}
            inert={!settled}
          >
            <button
              aria-label="Previous slide"
              className={classes.navButton}
              disabled={index === 0}
              onClick={() => step(-1)}
              onKeyDown={handleKeyDown}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className={classes.navIcon} />
            </button>
            <button
              aria-label="Next slide"
              className={classes.navButton}
              disabled={index === count - 1}
              onClick={() => step(1)}
              onKeyDown={handleKeyDown}
              type="button"
            >
              <ChevronRight aria-hidden="true" className={classes.navIcon} />
            </button>
          </div>
        ) : null}

        <div
          className={settled ? classes.stripLanded : classes.stripArriving}
          inert={!settled}
        >
          <BiomarkerRange {...(caseStudy ? { caseStudy } : {})} />
        </div>
      </section>
    </div>
  );
};
