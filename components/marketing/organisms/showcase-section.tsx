import { Heading } from "@/components/marketing/atoms/heading";

type ShowcaseImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type ShowcaseSectionProperties = {
  eyebrow?: string;
  headline: string;
  body: string;
  image: ShowcaseImage;
};

/**
 * A centred claim over a wide picture of the product.
 *
 * The picture runs the full grid rather than sharing a row with the copy,
 * because it is a screenshot of an interface: shrunk into half a row nothing
 * in it would be legible.
 */
const classes = {
  section: "w-full bg-figure-ground py-[120px] max-md:py-16",
  shell:
    "mx-auto flex w-full max-w-page flex-col gap-16 px-24 max-xl:px-10 max-md:gap-12 max-sm:px-6",
  grid: "grid grid-cols-12 gap-x-6",
  header:
    "col-span-8 col-start-3 flex flex-col items-center gap-5 text-center max-lg:col-span-10 max-lg:col-start-2 max-md:col-span-12 max-md:col-start-1",
  eyebrow:
    "font-medium font-mono text-[11px] text-figure-accent uppercase tracking-[0.18em]",
  headline: "text-balance text-primary-foreground",
  body: "max-w-[58ch] text-pretty font-sans text-figure-body text-base leading-[1.7]",
  figure:
    "overflow-hidden rounded-2xl border border-figure-rule bg-figure-glass-near",
  image: "block h-auto w-full",
} as const;

export const ShowcaseSection = ({
  eyebrow,
  headline,
  body,
  image,
}: ShowcaseSectionProperties) => (
  <section className={classes.section}>
    <div className={classes.shell}>
      <div className={classes.grid}>
        <header className={classes.header}>
          {eyebrow ? <p className={classes.eyebrow}>{eyebrow}</p> : null}
          <Heading className={classes.headline} level={2}>
            {headline}
          </Heading>
          <p className={classes.body}>{body}</p>
        </header>
      </div>

      <figure className={classes.figure}>
        {/** biome-ignore lint/performance/noImgElement: static export, unoptimized */}
        <img
          alt={image.alt}
          className={classes.image}
          decoding="async"
          height={image.height}
          loading="lazy"
          src={image.src}
          width={image.width}
        />
      </figure>
    </div>
  </section>
);
