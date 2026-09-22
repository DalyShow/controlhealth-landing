import { Heading } from "@/components/marketing/atoms/heading";
import { ProgressiveBlur } from "@/components/marketing/atoms/progressive-blur";

type ImageCardProperties = {
  src: string;
  /** Describes the photograph itself; the copy over it is read separately. */
  alt: string;
  /** The source file's own pixel dimensions, so the browser can plan for it. */
  width: number;
  height: number;
  title: string;
  body: string;
};

/** How far up the card the blur ramp and the scrim reach. */
const BLUR_HEIGHT = "62%";

/**
 * A full-bleed photograph with the copy set over its foot.
 *
 * The blur alone does not guarantee contrast — it softens the picture without
 * darkening it — so a scrim rides on top of the ramp. Between them the copy
 * stays legible whatever the photograph happens to be doing down there.
 */
const classes = {
  root: "relative col-span-4 aspect-[4/5] overflow-hidden rounded-2xl bg-figure-ground max-md:col-span-12",
  image: "absolute inset-0 size-full object-cover",
  scrim:
    "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent",
  copy: "absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8 max-sm:p-6",
  title: "text-white",
  body: "text-pretty font-sans text-[15px] text-white/75 leading-[1.6]",
} as const;

export const ImageCard = ({
  src,
  alt,
  width,
  height,
  title,
  body,
}: ImageCardProperties) => (
  <article className={classes.root}>
    {/* Plain <img>: these are decorative full-bleed plates, and the static
        export runs with image optimisation off anyway. */}
    {/** biome-ignore lint/performance/noImgElement: static export, unoptimized */}
    <img
      alt={alt}
      className={classes.image}
      height={height}
      src={src}
      width={width}
    />

    <ProgressiveBlur height={BLUR_HEIGHT} />
    <div className={classes.scrim} style={{ height: BLUR_HEIGHT }} />

    <div className={classes.copy}>
      <Heading className={classes.title} level={3}>
        {title}
      </Heading>
      <p className={classes.body}>{body}</p>
    </div>
  </article>
);
