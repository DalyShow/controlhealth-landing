import { Heading } from "@/components/marketing/atoms/heading";
import { ProgressiveBlur } from "@/components/marketing/atoms/progressive-blur";
import type { CaseStudyScenario } from "@/lib/case-study-scenarios";

type ScenarioCardProperties = {
  scenario: CaseStudyScenario;
  /** Whether its markers are the ones pinned on the strip. */
  selected: boolean;
  onSelect: () => void;
};

/**
 * One tile of the case study wall: a tall photograph with the situation set
 * over it, at the foot, on a progressive blur, and what the person notices
 * beneath it. The tests the scenario carries are held back for now.
 *
 * The whole tile selects it, which pins its markers on the strip below the
 * wall. The button is laid over the tile rather than wrapping it, since a
 * button may not hold a heading; it names what it does for assistive
 * technology and reports whether it is the one selected.
 */
const classes = {
  // Tall and narrow, so a row shows several and the next peeks in. Its own
  // stacking context, so the layers inside it stay inside it.
  root: "group relative isolate h-[480px] w-[340px] shrink-0 snap-start overflow-hidden rounded-2xl bg-primary-950 outline-2 outline-transparent outline-offset-[3px] transition-[outline-color] duration-300 max-sm:h-[440px] max-sm:w-[78vw]",
  rootSelected:
    "group relative isolate h-[480px] w-[340px] shrink-0 snap-start overflow-hidden rounded-2xl bg-primary-950 outline-2 outline-teal-300 outline-offset-[3px] transition-[outline-color] duration-300 max-sm:h-[440px] max-sm:w-[78vw]",
  image:
    "absolute inset-0 size-full object-cover transition-transform duration-700 ease-arrive group-hover:scale-[1.03] motion-reduce:transition-none",
  // Over the blur, at the foot of the tile.
  words:
    "absolute inset-x-0 bottom-0 z-[1] flex flex-col gap-2 p-6 max-sm:p-5",
  title: "m-0 text-balance text-white",
  body: "m-0 text-pretty font-sans text-[14px] text-white/75 leading-[1.5]",
  button:
    "absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-teal-300 focus-visible:outline-offset-[3px]",
} as const;

export const ScenarioCard = ({
  scenario,
  selected,
  onSelect,
}: ScenarioCardProperties) => (
  <article className={selected ? classes.rootSelected : classes.root}>
    {/** biome-ignore lint/performance/noImgElement: static export, unoptimized */}
    <img
      alt={scenario.image.alt}
      className={classes.image}
      decoding="async"
      draggable={false}
      height={960}
      loading="lazy"
      src={scenario.image.src}
      width={680}
    />
    <ProgressiveBlur />
    <div className={classes.words}>
      <Heading as={3} className={classes.title} level={3}>
        {scenario.title}
      </Heading>
      <p className={classes.body}>{scenario.body}</p>
    </div>

    <button
      aria-label={`Show the markers for “${scenario.title}” on the strip`}
      aria-pressed={selected}
      className={classes.button}
      onClick={onSelect}
      type="button"
    />
  </article>
);
