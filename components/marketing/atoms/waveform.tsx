"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { createTickPlayer } from "@/lib/tick-sound";
import type { CSSProperties, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Shape of the waveform, sampled from the Figma graphic (Control Health
 * Marketing Site, node 1262:3132) as 82 control points. The rendered strip is
 * resampled from this curve, so bar count and height are free to change
 * without redrawing the wave.
 */
const CURVE = [
  134, 140, 145, 150, 154, 157, 160, 161, 162, 162, 160, 158, 155, 151, 147,
  142, 137, 131, 126, 121, 116, 112, 108, 106, 104, 104, 104, 106, 109, 113,
  117, 121, 126, 130, 134, 137, 139, 139, 139, 137, 133, 129, 124, 119, 113,
  108, 103, 99, 96, 94, 94, 95, 97, 101, 105, 111, 118, 125, 132, 140, 147, 154,
  160, 166, 170, 173, 174, 174, 172, 169, 165, 159, 153, 145, 138, 129, 121,
  113, 106, 98, 92, 85,
] satisfies number[];

/** Bars rendered across the strip — denser than the source curve. */
const BAR_COUNT = 164;

/** Height of the tallest bar, in pixels. */
const MAX_BAR_HEIGHT = 92;

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

const BAR_HEIGHTS = resampleCurve(CURVE, BAR_COUNT, MAX_BAR_HEIGHT);

const LAST_BAR_INDEX = BAR_COUNT - 1;

/**
 * Upward shift in pixels applied to the rolled-over bar and its neighbours,
 * indexed by distance from the pointer. Bars further out are left alone.
 */
const LIFT_BY_DISTANCE = [7, 5, 3, 2, 1] satisfies number[];

const clampToBar = (index: number) =>
  Math.min(Math.max(index, 0), LAST_BAR_INDEX);

/**
 * Decorative waveform anchored to the bottom edge of the hero. It reacts to
 * hover alone: the bar under the pointer turns white while its neighbours
 * lift, and each bar entered ticks. Nothing here is clickable or focusable,
 * so it is hidden from assistive technology.
 */
const classes = {
  root: "-bottom-[33px] absolute inset-x-0 h-[96px] overflow-hidden drop-shadow-waveform",
  track:
    "-translate-x-1/2 absolute bottom-0 left-1/2 flex h-full w-full min-w-[1519px] items-end justify-between",
  bar: "w-[3px] shrink-0 rounded-full bg-waveform-slate transition-[background-color,transform] duration-150 ease-out",
  barHovered:
    "w-[3px] shrink-0 rounded-full bg-white transition-[background-color,transform] duration-150 ease-out",
} as const;

const barToneClass = (index: number, hoveredIndex: number | null) =>
  index === hoveredIndex ? classes.barHovered : classes.bar;

const liftFor = (index: number, hoveredIndex: number | null) => {
  if (hoveredIndex === null) {
    return 0;
  }

  return LIFT_BY_DISTANCE[Math.abs(index - hoveredIndex)] ?? 0;
};

export const Waveform = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackBoxRef = useRef<{ left: number; width: number } | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const tickPlayer = useMemo(createTickPlayer, []);

  // Browsers keep an AudioContext suspended until the page has been
  // interacted with, so arm it on the viewer's first gesture anywhere —
  // otherwise the first rollover is silent.
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

  const rollOverBar = useCallback(
    (index: number) => {
      if (hoveredIndexRef.current === index) {
        return;
      }

      hoveredIndexRef.current = index;
      tickPlayer.play();
      setHoveredIndex(index);
    },
    [tickPlayer]
  );

  // Measuring the track on every move forces a synchronous layout read. The
  // strip only moves on resize, so cache the box and refresh it there.
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

  const handlePointerEnter = () => measureTrack();

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = trackBoxRef.current;

    if (!box || box.width === 0) {
      return;
    }

    const ratio = (event.clientX - box.left) / box.width;

    rollOverBar(clampToBar(Math.floor(ratio * BAR_COUNT)));
  };

  const handlePointerLeave = () => {
    hoveredIndexRef.current = null;
    setHoveredIndex(null);
  };

  return (
    <div
      aria-hidden="true"
      className={classes.root}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <div className={classes.track} ref={trackRef}>
        {BAR_HEIGHTS.map((height, index) => {
          const lift = prefersReducedMotion ? 0 : liftFor(index, hoveredIndex);
          const style: CSSProperties = {
            height: `${height}px`,
            transform: `translateY(-${lift}px)`,
          };

          return (
            <div
              className={barToneClass(index, hoveredIndex)}
              // biome-ignore lint/suspicious/noArrayIndexKey: bars are a fixed, ordered dataset
              key={index}
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
};
