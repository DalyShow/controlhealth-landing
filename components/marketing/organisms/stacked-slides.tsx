import { Heading } from "@/components/marketing/atoms/heading";
import type { CSSProperties, ReactNode } from "react";

export type StackedSlide = {
  /** Set in the pill at the top, which stays in view as later slides stack. */
  title: string;
  /** The colour of the pill, as a CSS value, such as a theme variable. */
  tone: string;
  /** Laid centred under the pill, above the words, such as a `MetricCard`. */
  widget?: ReactNode;
  headline: string;
  body: string;
  image: {
    src: string;
    /** Empty when the picture is decoration behind the words. */
    alt: string;
    width: number;
    height: number;
  };
};

type StackedSlidesProperties = {
  slides: readonly StackedSlide[];
};

/**
 * A stack of full-width image slides that pin as they reach the top of the
 * window, each sliding up over the one before and stopping a strip lower,
 * so the pill at the top of every slide it covers stays in view. Once the
 * last has landed, the stack scrolls on with the page.
 *
 * It is all position: sticky, with no script. Each slide sticks one strip
 * lower than the last (`--i` strips down, all of them beneath the fixed nav
 * bar) and is one strip shorter, so every
 * slide ends at the bottom of the window once it has pinned: the first is
 * the full window tall, and the last fills exactly the space beneath the
 * strips. That shared bottom edge matters as the stack leaves. A pinned
 * slide cannot pass the bottom of the stack, so slides of one height would
 * all be pushed up into line as it ran out, covering the pills; ending
 * together, they scroll away together, the pills still showing. The strip is
 * the height the pill needs, and is set once, here.
 *
 * Each slide has its own colour for its pill, and may carry a widget,
 * centred under the pill, whose accents take the same colour.
 */
const classes = {
  root: "relative w-full [--strip:64px]",
  slide:
    "sticky top-[calc(var(--nav-bar-h)+var(--i)*var(--strip))] h-[calc(100dvh-var(--nav-bar-h)-var(--i)*var(--strip))] min-h-[480px] w-full overflow-hidden bg-primary-950 shadow-[0_-8px_20px_-8px_rgb(0_0_0/0.45)]",
  image: "absolute inset-0 size-full object-cover",
  // Darkest behind the words in the middle, so they read over a bright
  // picture, and toward the top, under the pill.
  scrim:
    "absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_55%,rgb(15_18_25/0.62),rgb(15_18_25/0.28)_70%,rgb(15_18_25/0.18)),linear-gradient(to_bottom,rgb(15_18_25/0.45),transparent_22%)]",
  // Centred at the top of the slide within its strip: the tinted badge of
  // the homepage label in the slide colour, on dark glass so it reads over
  // any picture. One width for every slide, so the pills line up as they
  // stack.
  pill: "-translate-x-1/2 absolute top-4 left-1/2 m-0 inline-flex w-[216px] items-center justify-center whitespace-nowrap rounded-full border border-[color-mix(in_oklab,var(--tone)_60%,transparent)] bg-[color-mix(in_oklab,var(--tone)_14%,rgb(15_18_25/0.72))] px-4 py-2 font-sans font-semibold text-[13px] text-[var(--tone)] leading-none backdrop-blur-md",
  // Three rows: the words in the middle, with equal rows above and below so
  // they stay centred on the slide, and the widget at the top of the row
  // above, under the pill. That row is never shorter than the widget and its
  // breathing room, so on a short window the words give way downward rather
  // than the widget crowding them.
  message:
    "absolute inset-0 grid grid-rows-[minmax(min-content,1fr)_auto_1fr] justify-items-center px-6 text-center",
  // Kept 32px from the bottom of the pill (16px from the top plus its 31px
  // height), or 80px on desktop, where it is zoomed down so it does not
  // cover the faces in the picture, and 32px from the headline below. The
  // figure accent is pointed at the slide colour, so a figure drawing in the
  // widget, such as the lab panel, draws its highlights in the colour of the
  // pill above it.
  widgetRow:
    "flex items-start justify-center pt-[79px] pb-8 [--color-figure-accent:var(--tone)] lg:pt-[127px] lg:[&>*]:[zoom:0.8]",
  copy: "flex flex-col items-center",
  headline:
    "max-w-[15em] text-balance text-[clamp(2rem,1.2rem+2.4vw,3.5rem)] text-white leading-[1.08] tracking-[-0.01em] max-md:text-[28px]",
  body: "mt-5 max-w-[600px] text-pretty font-sans text-[18px] text-white/85 leading-[28px] max-md:mt-3 max-md:text-[15px] max-md:leading-[22px]",
} as const;

export const StackedSlides = ({ slides }: StackedSlidesProperties) => (
  <div className={classes.root}>
    {slides.map((slide, index) => (
      <article
        className={classes.slide}
        key={slide.title + slide.image.src}
        style={{ "--i": index, "--tone": slide.tone } as CSSProperties}
      >
        {/** biome-ignore lint/performance/noImgElement: static export, unoptimized */}
        <img
          alt={slide.image.alt}
          className={classes.image}
          decoding="async"
          height={slide.image.height}
          loading={index === 0 ? "eager" : "lazy"}
          src={slide.image.src}
          width={slide.image.width}
        />
        <div className={classes.scrim} />
        <p className={classes.pill}>{slide.title}</p>
        <div className={classes.message}>
          <div className={classes.widgetRow}>{slide.widget}</div>
          <div className={classes.copy}>
            <Heading as={2} className={classes.headline} level={1}>
              {slide.headline}
            </Heading>
            <p className={classes.body}>{slide.body}</p>
          </div>
          <div />
        </div>
      </article>
    ))}
  </div>
);
