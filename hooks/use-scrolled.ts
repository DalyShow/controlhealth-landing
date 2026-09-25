"use client";

import { useEffect, useState } from "react";

/**
 * Whether the page has scrolled more than `threshold` pixels from the top.
 * Only re-renders when that flips, not on every scroll frame.
 */
export const useScrolled = (threshold = 8) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);

    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => window.removeEventListener("scroll", update);
  }, [threshold]);

  return scrolled;
};
