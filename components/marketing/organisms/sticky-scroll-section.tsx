"use client";

import { Heading } from "@/components/marketing/atoms/heading";
import type { ProseBlock } from "@/components/marketing/organisms/prose-section";
import { type CSSProperties, useEffect, useRef, useState } from "react";

type StickyScrollSectionProperties = {
  /** Optional label above the run, e.g. "Why we built this". */
  eyebrow?: string;
  panels: ProseBlock[];
};

/**
 * A run of panels the page pins and steps through as you scroll.
 *
 * The section is a tall runway; the stage sticks to the top of the viewport
 * inside it, so scrolling the runway advances the panel rather than moving the
 * page. Copy stays on the left and the picture on the right throughout — the
 * alternation this replaces only existed to keep a static page from looking
 * repetitive, and here it would read as the layout flinching.
 *
 * Narrow viewports and reduced motion unwind it to an ordinary stack; see the
 * scroll-* rules, which own that fallback so the markup does not have to.
 */
const classes = {
  section: "scroll-runway w-full bg-figure-ground",
  stage: "scroll-stage w-full py-24 max-lg:py-16",
  shell:
    "mx-auto flex w-full max-w-page flex-col gap-10 px-24 max-xl:px-10 max-sm:px-6",
  eyebrow:
    "font-medium font-mono text-[11px] text-figure-accent uppercase tracking-[0.18em]",
  rail: "scroll-rail flex items-center gap-2",
  tick: "h-px w-10 bg-figure-rule transition-colors duration-500",
  tickOn: "h-px w-10 bg-figure-accent transition-colors duration-500",
  stack: "scroll-stack",
  panel: "grid grid-cols-12 items-center gap-x-6 gap-y-10",
  copy: "col-span-5 flex flex-col gap-5 max-lg:col-span-12",
  heading: "text-primary-foreground",
  paragraph:
    "text-pretty font-sans text-figure-body text-base leading-[1.7] max-sm:text-[15px]",
  figure:
    "col-span-6 col-start-7 overflow-hidden rounded-2xl border border-figure-rule bg-figure-glass-near max-lg:col-span-12 max-lg:col-start-1",
  image: "block h-auto w-full",
} as const;

export const StickyScrollSection = ({
  eyebrow,
  panels,
}: StickyScrollSectionProperties) => {
  const runwayRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const runway = runwayRef.current;

    if (!runway || panels.length < 2) {
      return;
    }

    // The fallbacks flatten the runway, at which point there is nothing to
    // drive and the listener would only fight the page.
    const flattened = window.matchMedia(
      "(width < 64rem), (prefers-reduced-motion: reduce)"
    );

    let handle = 0;

    const measure = () => {
      handle = 0;

      const { top, height } = runway.getBoundingClientRect();
      const travel = height - window.innerHeight;

      if (travel <= 0) {
        return;
      }

      const progress = Math.min(1, Math.max(0, -top / travel));
      // Each panel gets an equal share of the runway; the last one holds from
      // its share to the end rather than flicking past at the bottom.
      const next = Math.min(
        panels.length - 1,
        Math.floor(progress * panels.length)
      );

      setActive(next);
    };

    const onScroll = () => {
      if (handle === 0) {
        handle = requestAnimationFrame(measure);
      }
    };

    const sync = () => {
      if (flattened.matches) {
        window.removeEventListener("scroll", onScroll);
        setActive(0);
        return;
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      measure();
    };

    sync();
    flattened.addEventListener("change", sync);
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(handle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      flattened.removeEventListener("change", sync);
    };
  }, [panels.length]);

  const runwayStyle = { "--panels": panels.length } as CSSProperties;

  return (
    <section className={classes.section} ref={runwayRef} style={runwayStyle}>
      <div className={classes.stage}>
        <div className={classes.shell}>
          {eyebrow ? <p className={classes.eyebrow}>{eyebrow}</p> : null}

          <div className={classes.rail}>
            {panels.map((panel, index) => (
              <span
                className={index <= active ? classes.tickOn : classes.tick}
                key={panel.heading}
              />
            ))}
          </div>

          <div className={classes.stack}>
            {panels.map((panel, index) => (
              <div
                aria-hidden={index === active ? undefined : "true"}
                className={classes.panel}
                key={panel.heading}
                style={{ opacity: index === active ? 1 : 0 }}
              >
                <div className={classes.copy}>
                  <Heading className={classes.heading} level={2}>
                    {panel.heading}
                  </Heading>
                  {panel.paragraphs.map((paragraph) => (
                    <p
                      className={classes.paragraph}
                      key={paragraph.slice(0, 40)}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {panel.image ? (
                  <figure className={classes.figure}>
                    {/** biome-ignore lint/performance/noImgElement: static export, unoptimized */}
                    <img
                      alt={panel.image.alt}
                      className={classes.image}
                      decoding="async"
                      height={panel.image.height}
                      loading="lazy"
                      src={panel.image.src}
                      width={panel.image.width}
                    />
                  </figure>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
