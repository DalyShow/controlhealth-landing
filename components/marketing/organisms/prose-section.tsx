import { Heading } from "@/components/marketing/atoms/heading";

export type ProseBlock = {
  heading: string;
  paragraphs: string[];
};

type ProseSectionProperties = {
  /** Optional label above the whole run, e.g. "Why we built this". */
  eyebrow?: string;
  blocks: ProseBlock[];
};

/**
 * A run of prose on the page grid.
 *
 * Headings sit in the first four columns and the prose in the last seven, so
 * the measure stays readable rather than running the full 1248px — a line of
 * body copy that wide is hard to track back from on any ground, and harder on
 * a dark one.
 */
const classes = {
  section: "w-full bg-figure-ground py-24 max-md:py-16",
  shell:
    "mx-auto flex w-full max-w-page flex-col gap-16 px-24 max-xl:px-10 max-md:gap-12 max-sm:px-6",
  eyebrow:
    "font-medium font-mono text-[11px] text-figure-accent uppercase tracking-[0.18em]",
  blocks: "flex flex-col gap-16 max-md:gap-12",
  block: "grid grid-cols-12 gap-x-6 gap-y-5",
  heading: "col-span-4 text-primary-foreground max-md:col-span-12",
  prose:
    "col-span-7 col-start-6 flex flex-col gap-5 max-md:col-span-12 max-md:col-start-1",
  paragraph:
    "text-pretty font-sans text-figure-body text-base leading-[1.7] max-sm:text-[15px]",
} as const;

export const ProseSection = ({ eyebrow, blocks }: ProseSectionProperties) => (
  <section className={classes.section}>
    <div className={classes.shell}>
      {eyebrow ? <p className={classes.eyebrow}>{eyebrow}</p> : null}

      <div className={classes.blocks}>
        {blocks.map((block) => (
          <div className={classes.block} key={block.heading}>
            <Heading className={classes.heading} level={2}>
              {block.heading}
            </Heading>
            <div className={classes.prose}>
              {block.paragraphs.map((paragraph) => (
                <p className={classes.paragraph} key={paragraph.slice(0, 40)}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
