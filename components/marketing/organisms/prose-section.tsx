import { Heading } from "@/components/marketing/atoms/heading";

export type ProseImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ProseBlock = {
  heading: string;
  paragraphs: string[];
  /** Sits beside the prose, alternating side by side down the run. */
  image?: ProseImage;
};

type ProseSectionProperties = {
  /** Optional label above the whole run, e.g. "Why we built this". */
  eyebrow?: string;
  blocks: ProseBlock[];
};

/**
 * A run of prose on the page grid, each block optionally paired with a
 * picture that alternates sides down the page.
 *
 * Blocks without a picture keep the heading in the first four columns and the
 * prose in the last seven, so the measure stays readable either way rather
 * than running the full 1248px.
 */
const classes = {
  section: "w-full bg-figure-ground py-24 max-md:py-16",
  shell:
    "mx-auto flex w-full max-w-page flex-col gap-24 px-24 max-xl:px-10 max-md:gap-16 max-sm:px-6",
  eyebrow:
    "font-medium font-mono text-[11px] text-figure-accent uppercase tracking-[0.18em]",
  blocks: "flex flex-col gap-24 max-md:gap-16",
  block: "grid grid-cols-12 items-center gap-x-6 gap-y-10",
  // Paired: copy takes five columns, the picture six, with a column of air
  // between them. The order swaps on alternate blocks, and unwinds to a
  // single column once there is no room to sit side by side.
  copyLeft: "col-span-5 flex flex-col gap-5 max-lg:col-span-12",
  copyRight:
    "col-span-5 col-start-8 flex flex-col gap-5 max-lg:col-span-12 max-lg:col-start-1 max-lg:row-start-1",
  imageRight: "col-span-6 col-start-7 max-lg:col-span-12 max-lg:col-start-1",
  imageLeft: "col-span-6 max-lg:col-span-12",
  // Unpaired: the two-column editorial setting.
  soloHeading: "col-span-4 max-md:col-span-12",
  soloProse:
    "col-span-7 col-start-6 flex flex-col gap-5 max-md:col-span-12 max-md:col-start-1",
  heading: "text-primary-foreground",
  paragraph:
    "text-pretty font-sans text-figure-body text-base leading-[1.7] max-sm:text-[15px]",
  figure:
    "overflow-hidden rounded-2xl border border-figure-rule bg-figure-glass-near",
  image: "block h-auto w-full",
} as const;

export const ProseSection = ({ eyebrow, blocks }: ProseSectionProperties) => (
  <section className={classes.section}>
    <div className={classes.shell}>
      {eyebrow ? <p className={classes.eyebrow}>{eyebrow}</p> : null}

      <div className={classes.blocks}>
        {blocks.map((block, index) => {
          const image = block.image;
          // Alternates down the run: odd blocks put the picture first.
          const flipped = index % 2 === 1;

          if (!image) {
            return (
              <div className={classes.block} key={block.heading}>
                <Heading
                  className={`${classes.soloHeading} ${classes.heading}`}
                  level={2}
                >
                  {block.heading}
                </Heading>
                <div className={classes.soloProse}>
                  {block.paragraphs.map((paragraph) => (
                    <p
                      className={classes.paragraph}
                      key={paragraph.slice(0, 40)}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div className={classes.block} key={block.heading}>
              <div className={flipped ? classes.copyRight : classes.copyLeft}>
                <Heading className={classes.heading} level={2}>
                  {block.heading}
                </Heading>
                {block.paragraphs.map((paragraph) => (
                  <p className={classes.paragraph} key={paragraph.slice(0, 40)}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <figure
                className={`${flipped ? classes.imageLeft : classes.imageRight} ${classes.figure}`}
              >
                {/** biome-ignore lint/performance/noImgElement: static export, unoptimized */}
                <img
                  alt={image.alt}
                  className={classes.image}
                  height={image.height}
                  src={image.src}
                  width={image.width}
                />
              </figure>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
