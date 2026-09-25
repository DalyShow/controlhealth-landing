"use client";

import { type RefObject, useEffect } from "react";

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

/** Eases both ends, so a scrubbed move starts and lands softly. */
const smoothstep = (value: number) => value * value * (3 - 2 * value);

/**
 * Writes how far the reader has scrolled through a runway, 0 to 1, onto the
 * stage pinned inside it as `--p`, on every scroll event. `share` is the part
 * of the runway the move takes; the rest holds it settled before the page
 * moves on.
 *
 * Straight from the scroll event with no frame request in between: browsers
 * already fire scroll at most once a frame, in step with rendering, so gating
 * it again would only add a frame of lag. A frame costs one property write
 * and no render.
 */
export const useScrollProgress = (
  runwayRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  share = 1
) => {
  useEffect(() => {
    const runway = runwayRef.current;
    const stage = stageRef.current;

    if (!(runway && stage)) {
      return;
    }

    const update = () => {
      // Nothing to scroll through, as for a reader who asked for less
      // motion, leaves it where it starts.
      const distance = runway.offsetHeight - stage.offsetHeight;
      const travelled = -runway.getBoundingClientRect().top;
      const raw = distance > 0 ? travelled / (distance * share) : 0;

      stage.style.setProperty("--p", smoothstep(clampUnit(raw)).toFixed(4));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [runwayRef, share, stageRef]);
};
