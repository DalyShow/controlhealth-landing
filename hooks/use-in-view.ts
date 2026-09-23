"use client";

import { type RefObject, useEffect, useState } from "react";

/** Start a touch before the element arrives, so it is already going. */
const DEFAULT_MARGIN = "120px";

/** Whether the element is on screen. */
export const useInView = (
  ref: RefObject<Element | null>,
  rootMargin: string = DEFAULT_MARGIN
): boolean => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
};

/**
 * Runs the element's animations only while it is on screen, restarting them
 * from the top each time it arrives.
 *
 * The figures are declared with a small iteration count rather than running
 * forever, so this is what gives them a life at all: they play their couple of
 * cycles on arrival and then rest, instead of every timeline on the page
 * animating continuously whether or not anyone can see it.
 */
export const useReplayInView = (ref: RefObject<Element | null>): void => {
  const inView = useInView(ref);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    for (const animation of element.getAnimations({ subtree: true })) {
      if (inView) {
        animation.currentTime = 0;
        animation.play();
      } else {
        animation.pause();
      }
    }
  }, [inView, ref]);
};
