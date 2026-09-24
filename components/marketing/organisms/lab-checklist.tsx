"use client";

import { MetricLabel } from "@/components/marketing/atoms/metric-label";
import { SPRITE_ICON_STROKE_WIDTH } from "@/components/marketing/icon-stroke";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { Check } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

export type LabGroup = {
  name: string;
  /** How many markers the group covers. */
  markers: number;
};

type LabChecklistProperties = {
  icon: ReactNode;
  label: string;
  groups: readonly LabGroup[];
};

/** Milliseconds between one group being ticked and the next. */
const STEP_MS = 420;

/**
 * Labs being ordered: the groups tick off one at a time when the section
 * comes on screen, as if placed from the tablet in the photograph. Ticks are
 * the calm tone, since this is
 * where the story turns toward an answer. It starts over each time it
 * arrives, and is complete from the start for anyone who has asked for less
 * motion.
 */
const classes = {
  root: "flex flex-col gap-2.5",
  // Tighter where the card has to share the corner with the headline.
  list: "m-0 flex list-none flex-col gap-2 p-0 max-xl:gap-1",
  item: "flex items-center gap-2",
  markDone:
    "flex size-4 shrink-0 items-center justify-center rounded-full bg-teal-300 text-primary-950 transition-colors duration-300 motion-reduce:transition-none",
  markPending:
    "flex size-4 shrink-0 items-center justify-center rounded-full border border-white/35 text-transparent transition-colors duration-300 motion-reduce:transition-none",
  checkIcon: "size-2.5",
  nameDone:
    "font-sans text-[13px] text-primary-foreground leading-none transition-colors duration-300 motion-reduce:transition-none",
  namePending:
    "font-sans text-[13px] text-primary-foreground/55 leading-none transition-colors duration-300 motion-reduce:transition-none",
  count:
    "ml-auto whitespace-nowrap font-sans text-[12px] text-primary-foreground/55 leading-none tabular-nums",
} as const;

const markerCount = (markers: number) =>
  markers === 1 ? "1 marker" : `${markers} markers`;

export const LabChecklist = ({
  icon,
  label,
  groups,
}: LabChecklistProperties) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, "0px");
  const prefersReducedMotion = usePrefersReducedMotion();
  const [ticked, setTicked] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTicked(groups.length);
      return;
    }

    if (!inView) {
      setTicked(0);
      return;
    }

    if (ticked >= groups.length) {
      return;
    }

    const timer = window.setTimeout(
      () => setTicked((count) => count + 1),
      STEP_MS
    );

    return () => window.clearTimeout(timer);
  }, [groups.length, inView, prefersReducedMotion, ticked]);

  return (
    <div className={classes.root} ref={rootRef}>
      <MetricLabel icon={icon} label={label} />
      <ul className={classes.list}>
        {groups.map((group, index) => {
          const done = index < ticked;

          return (
            <li className={classes.item} key={group.name}>
              <span
                aria-hidden="true"
                className={done ? classes.markDone : classes.markPending}
              >
                <Check
                  className={classes.checkIcon}
                  strokeWidth={SPRITE_ICON_STROKE_WIDTH + 1}
                />
              </span>
              <span className={done ? classes.nameDone : classes.namePending}>
                {group.name}
              </span>
              <span className={classes.count}>
                {markerCount(group.markers)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
