/**
 * A blur that deepens toward the bottom edge of whatever it sits in, for
 * setting words over a photograph without a hard band.
 *
 * A single backdrop blur can only be one strength, so this is four laid over
 * one another, each twice as strong as the last, and each masked to its own
 * stretch of the height, so the strength climbs smoothly from nothing at the
 * top of the area to the most at the bottom. A shade of the ground runs
 * under them all, so light words hold up over a bright picture.
 *
 * It fills the bottom half of its parent, which must be positioned and clip
 * its overflow.
 */
const classes = {
  root: "pointer-events-none absolute inset-x-0 bottom-0 h-1/2",
  shade:
    "absolute inset-0 bg-gradient-to-b from-transparent via-figure-ground/35 to-figure-ground/80",
  layer1:
    "absolute inset-0 backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_100%)]",
  layer2:
    "absolute inset-0 backdrop-blur-[4px] [mask-image:linear-gradient(to_bottom,transparent_20%,black_45%,black_100%)]",
  layer3:
    "absolute inset-0 backdrop-blur-[8px] [mask-image:linear-gradient(to_bottom,transparent_40%,black_65%,black_100%)]",
  layer4:
    "absolute inset-0 backdrop-blur-[16px] [mask-image:linear-gradient(to_bottom,transparent_60%,black_85%,black_100%)]",
} as const;

export const ProgressiveBlur = () => (
  <div aria-hidden="true" className={classes.root}>
    <div className={classes.layer1} />
    <div className={classes.layer2} />
    <div className={classes.layer3} />
    <div className={classes.layer4} />
    <div className={classes.shade} />
  </div>
);
