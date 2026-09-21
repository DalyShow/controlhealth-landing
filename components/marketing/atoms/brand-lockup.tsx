type BrandLockupProperties = {
  src: string;
  alt?: string;
};

/**
 * Control Health logo lockup — mark plus wordmark.
 *
 * The artwork is cropped to the lockup itself, so the image simply fills this
 * box. Earlier revisions carried the Figma export's drop-shadow filter, which
 * made the browser rasterise the glyphs and left the logo looking soft.
 */
const classes = {
  root: "block h-[23px] w-[168.26px] shrink-0 max-sm:h-[18px] max-sm:w-[131.7px]",
  image: "block size-full",
} as const;

export const BrandLockup = ({
  src,
  alt = "Control Health",
}: BrandLockupProperties) => (
  <span className={classes.root}>
    {/** biome-ignore lint/performance/noImgElement: static SVG, next/image would need dangerouslyAllowSVG */}
    <img
      alt={alt}
      className={classes.image}
      height={23}
      src={src}
      width={168}
    />
  </span>
);
