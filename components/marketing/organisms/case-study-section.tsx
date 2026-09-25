"use client";

import { Heading } from "@/components/marketing/atoms/heading";
import { HeroMediaPausedContext } from "@/components/marketing/atoms/hero-media";
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
  /** Something laid over the still, such as a `MetricCard` of readings. */
  overlay?: ReactNode;
};

type CaseStudySectionProperties = {
  /** The claim the study makes. The heading of the section. */
  headline: string;
  /** A sentence or two under the headline. */
  subheadline: string;
  /** Names the slider for assistive technology, e.g. "Sarah’s story". */
  label: string;
  /** Full-bleed footage or still, painted behind the headline. */
  media: ReactNode;
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
const SLIDE_IMAGE_SIZE = { width: 1000, height: 563 } as const;

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

/** Eases both ends, so the shrink starts and lands softly under the scroll. */
const smoothstep = (value: number) => value * value * (3 - 2 * value);

/**
 * A full-screen panel following one person, which shrinks into the first
 * slide of a horizontal slider as the page scrolls.
 *
 * The panel pins while the footage is masked down to a rounded card, and the
 * next slides slide in behind it until the first peeks in from the right.
 * The headline waits until the card has landed, then fades in. Her
 * biomarker panel follows in a section of its own.
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
  // The card geometry. The settled card is centred in the space beneath the
  // fixed nav bar, with the same gap above and below it, and capped at
  // 960px tall: on a tall window the spare height is shared out either side
  // rather than stretching the card. On a short window the card gives way
  // instead, keeping at least 32px (24px on a phone) clear of the bar and
  // of the bottom edge. 680px is the floor of the panel height, as in
  // `panel`. The next slide peeks in from the right. The content inset is
  // how far each slide keeps its words from the left and bottom edges of
  // the card.
  stage:
    "@container panel sticky top-0 isolate overflow-hidden bg-figure-ground [--card-w:calc(100cqw-var(--mask-l)-var(--mask-r))] [--gap:16px] [--card-max:960px] [--card-h:min(var(--card-max),calc(var(--stage-h)-var(--nav-bar-h)-2*var(--gap-min)))] [--gap-min:32px] [--mask-b:calc(var(--stage-h)-var(--mask-t)-var(--card-h))] [--mask-l:44px] [--mask-r:calc(var(--peek)+var(--gap))] [--mask-t:calc(var(--nav-bar-h)+(var(--stage-h)-var(--nav-bar-h)-var(--card-h))/2)] [--content-inset:80px] [--p:0] [--peek:120px] [--radius:28px] [--stage-h:max(100dvh,680px)] max-sm:[--content-inset:24px] max-sm:[--gap:10px] max-sm:[--mask-l:16px] max-sm:[--gap-min:24px] max-sm:[--peek:28px] max-sm:[--radius:20px]",
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
  // corner of the card, the content inset in from both edges.
  leadMessageHidden:
    "pointer-events-none absolute bottom-[calc(var(--mask-b)+var(--content-inset))] left-[calc(var(--mask-l)+var(--content-inset))] z-10 flex w-[calc(var(--card-w)-2*var(--content-inset))] flex-col items-start text-left opacity-0 transition-opacity duration-300 motion-reduce:transition-none",
  leadMessageShown:
    "absolute bottom-[calc(var(--mask-b)+var(--content-inset))] left-[calc(var(--mask-l)+var(--content-inset))] z-10 flex w-[calc(var(--card-w)-2*var(--content-inset))] flex-col items-start text-left opacity-100 transition-opacity delay-150 duration-700 ease-out motion-reduce:transition-none",
  // Laid out where the settled slider puts it, and pushed right by the peek
  // until the shrink lands, which puts the first one just off screen at the
  // start.
  slide:
    "absolute top-[var(--mask-t)] bottom-[var(--mask-b)] left-[calc(var(--mask-l)+var(--i)*(var(--card-w)+var(--gap)))] w-[var(--card-w)] overflow-hidden rounded-[var(--radius)] bg-primary-950 shadow-slide [translate:calc((1-var(--p))*var(--peek))_0]",
  // The shadow of the first card. The card is the footage masked down, and
  // a mask clips everything outside it, a shadow included, so the shadow is
  // this box behind it in the settled card position, fading in as the card
  // forms. Inside the track, so it moves with the card.
  leadShadow:
    "pointer-events-none absolute top-[var(--mask-t)] bottom-[var(--mask-b)] left-[var(--mask-l)] w-[var(--card-w)] rounded-[var(--radius)] opacity-[var(--p)] shadow-slide",
  slideImage: "pointer-events-none absolute inset-0 size-full object-cover",
  // Darkest under the words, at the bottom.
  slideScrim:
    "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/0",
  // Anchored to the bottom-left corner, the content inset in from both
  // edges.
  slideMessage:
    "absolute inset-x-[var(--content-inset)] bottom-[var(--content-inset)] flex flex-col items-start text-left",
  // The same, on a slide with a card in the bottom-right corner: from 1280px,
  // where the card sits beside the words, the right edge also clears the
  // card (280px) and a 40px gap, so a long headline wraps before reaching it.
  slideMessageBesideOverlay:
    "absolute inset-x-[var(--content-inset)] bottom-[var(--content-inset)] flex flex-col items-start text-left xl:right-[calc(var(--content-inset)+320px)]",
  // In the bottom-right corner, the content inset in from both edges,
  // opposite the words. Narrower than 1280px the card has no room for both
  // side by side, so it moves to the top-left, and on a phone drops below
  // the slider buttons in the top-right corner.
  slideOverlay:
    "absolute right-[var(--content-inset)] bottom-[var(--content-inset)] max-xl:top-[var(--content-inset)] max-xl:right-auto max-xl:bottom-auto max-xl:left-[var(--content-inset)] max-sm:top-[68px]",
  slideHeadline:
    "max-w-[min(17em,100%)] text-balance text-[clamp(1.75rem,1.2rem+1.6vw,2.75rem)] text-white tracking-[-0.01em] max-md:text-[22px] [@media(max-height:780px)]:text-[clamp(1.5rem,1.1rem+1.2vw,2.25rem)]",
  slideSubheadline:
    "mt-3 max-w-[480px] text-pretty font-sans text-[16px] text-white leading-6 max-md:mt-3 max-md:text-[14px] max-md:leading-5",
  navShown:
    "absolute top-[calc(var(--mask-t)+16px)] right-[calc(var(--mask-r)+16px)] z-20 flex gap-2 opacity-100 transition-opacity duration-500 motion-reduce:transition-none",
  navHidden:
    "pointer-events-none absolute top-[calc(var(--mask-t)+16px)] right-[calc(var(--mask-r)+16px)] z-20 flex gap-2 opacity-0 transition-opacity duration-300 motion-reduce:transition-none",
  // A light brand blue, so the arrows stand out on the dark footage as well
  // as on the photographs, deepening to a mid navy on hover.
  navButton:
    "flex size-10 items-center justify-center rounded-full border border-white/20 bg-primary-400 text-white transition-[background-color,opacity] hover:bg-primary-700 disabled:opacity-35 disabled:hover:bg-primary-400 max-sm:size-9",
  navIcon: "size-5",
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
    <div
      className={
        slide.overlay ? classes.slideMessageBesideOverlay : classes.slideMessage
      }
    >
      <Heading as={3} className={classes.slideHeadline} level={1}>
        {slide.headline}
      </Heading>
      <p className={classes.slideSubheadline}>{slide.subheadline}</p>
    </div>
    {slide.overlay ? (
      <div className={classes.slideOverlay}>{slide.overlay}</div>
    ) : null}
  </article>
);

export const CaseStudySection = ({
  headline,
  subheadline,
  label,
  media,
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
        aria-label={label}
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
          <div className={classes.leadShadow} />
          <article
            aria-label={`1 of ${count}`}
            aria-roledescription="slide"
            className={classes.lead}
          >
            {/* Only the card being shown plays: moved aside, it still
                overlaps the window, so being on screen is not enough. */}
            <HeroMediaPausedContext.Provider value={index !== 0}>
              <div className={classes.media}>{media}</div>
            </HeroMediaPausedContext.Provider>
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
      </section>
    </div>
  );
};
