"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * Whether the element has come into view, by the margin given: a negative
 * bottom margin waits until it is that far up the screen. Latches, so an
 * entrance keyed to it plays once and not again on the way back.
 */
export const useArrived = (
  ref: RefObject<Element | null>,
  rootMargin: string
) => {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || arrived) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setArrived(true);
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [arrived, ref, rootMargin]);

  return arrived;
};
