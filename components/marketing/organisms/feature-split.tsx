"use client";

import { Heading } from "@/components/marketing/atoms/heading";
import { useArrived } from "@/hooks/use-arrived";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { type ReactNode, useRef } from "react";

export type FeatureSplitImage = {
  src: string;
  /** Empty when the picture is decoration beside the words. */
  alt: string;
  width: number;
  height: number;
  /**
   * Which part of the picture to keep in frame as it is cropped to the
   * panel, as a CSS `object-position`, such as "50% 15%" to hold a face near
   * the top of a portrait shot. Centred when left out.
   */
  focus?: string;
};

type FeatureSplitProperties = {
  /** A pill over the headline. Left out, the headline leads. */
  badge?: string;
  headline: string;
  /** One paragraph or several, set one after another. */
  paragraphs: readonly string[];
  image: FeatureSplitImage;
  /** Puts the image on the right and the words on the left. */
  flipped?: boolean;
  /** Laid over the image, on its left side, such as a `MetricCard`. */
  widget?: ReactNode;
};

/** How far into view the module must come before it plays. */
const ARRIVAL_MARGIN = "0px 0px -20% 0px";

/**
 * A feature row: an image across two thirds of the window, running off its
 * edge, and the words on the page ground in the third beside it, optionally
 * with a widget laid over the image. Alternate rows flip, so the image runs
 * off the other edge.
 *
 * It builds itself once, when it arrives, in two beats. First a mask draws
 * the panel on from the edge of the window it runs off, as a dark fill.
 * Then, as the mask nears the far side, the picture slides into the panel
 * from the opposite direction, while the words slide out from behind it the
 * way the mask went: the picture and the words pass each other in contrary
 * motion. The widget rises in as the picture lands. Flipped, the image
 * runs off the right edge and every direction is mirrored. Anyone who has
 * asked for less motion gets it already built.
 *
 * Each moving part has a waiting and an arrived class, one or the other and
 * never both, so which transform wins never comes down to the order the
 * utilities are emitted in.
 */
const classes = {
  root: "relative isolate grid min-h-[560px] w-full grid-cols-3 max-md:min-h-0 max-md:grid-cols-1",
  // Above the words, so they can start out hidden behind it. Its mask draws
  // it on from the edge of the window it is attached to, and carries its
  // corners: square at that edge, rounded on the side facing the words. The
  // fill is what the mask draws on, before the picture arrives in it.
  imageCellArrived:
    "relative z-10 col-span-2 overflow-hidden bg-primary-950 transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] [clip-path:inset(0_0_0_0_round_0_28px_28px_0)] motion-reduce:transition-none max-md:col-span-1 max-md:h-[360px]",
  imageCellWaiting:
    "relative z-10 col-span-2 overflow-hidden bg-primary-950 [clip-path:inset(0_100%_0_0_round_0_28px_28px_0)] max-md:col-span-1 max-md:h-[360px]",
  imageCellArrivedFlipped:
    "relative z-10 order-last col-span-2 overflow-hidden bg-primary-950 transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] [clip-path:inset(0_0_0_0_round_28px_0_0_28px)] motion-reduce:transition-none max-md:order-none max-md:col-span-1 max-md:h-[360px]",
  imageCellWaitingFlipped:
    "relative z-10 order-last col-span-2 overflow-hidden bg-primary-950 [clip-path:inset(0_0_0_100%_round_28px_0_0_28px)] max-md:order-none max-md:col-span-1 max-md:h-[360px]",
  // The second beat: once the panel is mostly drawn, the picture slides in
  // from the far side, against the way the mask went, and fades up as it
  // comes, so its trailing edge is never seen against the fill.
  imageArrived:
    "absolute inset-0 size-full translate-x-0 object-cover opacity-100 transition-[translate,opacity] delay-[450ms] duration-[1300ms] ease-arrive motion-reduce:transition-none",
  imageWaiting:
    "absolute inset-0 size-full translate-x-[40%] object-cover opacity-0",
  imageWaitingFlipped:
    "-translate-x-[40%] absolute inset-0 size-full object-cover opacity-0",
  // On the left of the image whichever side the image is on, centred down it.
  widgetArrived:
    "-translate-y-1/2 absolute top-1/2 left-[max(44px,calc((100vw-var(--container-page))/2+44px))] z-10 opacity-100 transition-[translate,opacity] delay-[1400ms] duration-700 ease-out motion-reduce:transition-none max-sm:left-5",
  widgetWaiting:
    "absolute top-1/2 left-[max(44px,calc((100vw-var(--container-page))/2+44px))] z-10 translate-y-[calc(-50%+16px)] opacity-0 max-sm:left-5",
  // Flipped, the image starts mid window, so the widget sits in from its
  // inner edge rather than from the edge of the page.
  widgetArrivedFlipped:
    "-translate-y-1/2 absolute top-1/2 left-10 z-10 opacity-100 transition-[translate,opacity] delay-[1400ms] duration-700 ease-out motion-reduce:transition-none max-sm:left-5",
  widgetWaitingFlipped:
    "absolute top-1/2 left-10 z-10 translate-y-[calc(-50%+16px)] opacity-0 max-sm:left-5",
  // Starts behind the image, pushed most of its own width toward it, and
  // slides out from under it into place. On the ground, with no fill. Its
  // outer side keeps to the page gutter, and on a window wider than the page
  // to the edge of the page, so the words line up with the rest of the site.
  contentArrived:
    "relative z-0 flex translate-x-0 flex-col justify-center py-14 pr-[max(44px,calc((100vw-var(--container-page))/2+44px))] pl-16 opacity-100 transition-[translate,opacity] delay-[450ms] duration-[1300ms] ease-arrive motion-reduce:transition-none max-lg:pl-10 max-md:px-6 max-md:py-10",
  contentWaiting:
    "-translate-x-[70%] relative z-0 flex flex-col justify-center py-14 pr-[max(44px,calc((100vw-var(--container-page))/2+44px))] pl-16 opacity-0 max-lg:pl-10 max-md:px-6 max-md:py-10",
  contentArrivedFlipped:
    "relative z-0 flex translate-x-0 flex-col justify-center py-14 pr-16 pl-[max(44px,calc((100vw-var(--container-page))/2+44px))] opacity-100 transition-[translate,opacity] delay-[450ms] duration-[1300ms] ease-arrive motion-reduce:transition-none max-lg:pr-10 max-md:px-6 max-md:py-10",
  contentWaitingFlipped:
    "relative z-0 flex translate-x-[70%] flex-col justify-center py-14 pr-16 pl-[max(44px,calc((100vw-var(--container-page))/2+44px))] opacity-0 max-lg:pr-10 max-md:px-6 max-md:py-10",
  // The teal pill of the panel label on the homepage.
  badge:
    "m-0 inline-flex self-start rounded-full border border-teal-300/60 bg-teal-300/10 px-3.5 py-[7px] font-sans font-semibold text-[13px] text-teal-300 leading-none",
  headline:
    "mt-6 text-balance text-white leading-[1.1] tracking-[-0.01em] max-md:mt-4",
  // The first headline tucks under the badge; without one it leads.
  headlineLead: "text-balance text-white leading-[1.1] tracking-[-0.01em]",
  paragraphs: "mt-4 flex flex-col gap-4",
  paragraph:
    "m-0 text-pretty font-sans text-[16px] text-white/75 leading-[1.6] max-md:text-[15px]",
} as const;

/** The class for each part, waiting or arrived, mirrored when flipped. */
const PARTS = {
  normal: {
    arrived: {
      cell: classes.imageCellArrived,
      image: classes.imageArrived,
      content: classes.contentArrived,
      widget: classes.widgetArrived,
    },
    waiting: {
      cell: classes.imageCellWaiting,
      image: classes.imageWaiting,
      content: classes.contentWaiting,
      widget: classes.widgetWaiting,
    },
  },
  flipped: {
    arrived: {
      cell: classes.imageCellArrivedFlipped,
      image: classes.imageArrived,
      content: classes.contentArrivedFlipped,
      widget: classes.widgetArrivedFlipped,
    },
    waiting: {
      cell: classes.imageCellWaitingFlipped,
      image: classes.imageWaitingFlipped,
      content: classes.contentWaitingFlipped,
      widget: classes.widgetWaitingFlipped,
    },
  },
} as const;

export const FeatureSplit = ({
  badge,
  headline,
  paragraphs,
  image,
  flipped = false,
  widget,
}: FeatureSplitProperties) => {
  const rootRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const arrived = useArrived(rootRef, ARRIVAL_MARGIN) || prefersReducedMotion;
  const parts =
    PARTS[flipped ? "flipped" : "normal"][arrived ? "arrived" : "waiting"];

  return (
    <section className={classes.root} ref={rootRef}>
      <div className={parts.cell}>
        {/** biome-ignore lint/performance/noImgElement: static export, unoptimized */}
        <img
          alt={image.alt}
          className={parts.image}
          decoding="async"
          height={image.height}
          loading="lazy"
          src={image.src}
          width={image.width}
          {...(image.focus ? { style: { objectPosition: image.focus } } : {})}
        />
        {widget ? <div className={parts.widget}>{widget}</div> : null}
      </div>

      <div className={parts.content}>
        {badge ? <p className={classes.badge}>{badge}</p> : null}
        <Heading
          as={2}
          className={badge ? classes.headline : classes.headlineLead}
          level={2}
        >
          {headline}
        </Heading>
        <div className={classes.paragraphs}>
          {paragraphs.map((paragraph) => (
            <p className={classes.paragraph} key={paragraph.slice(0, 40)}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};
