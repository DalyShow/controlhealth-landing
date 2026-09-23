"use client";

import { useInView } from "@/hooks/use-in-view";
import { useEffect, useRef, useState } from "react";

type HeroMediaProperties = {
  src: string;
  /**
   * The still behind the footage. It paints first, and on a phone it is all
   * that is ever fetched, so treat it as the real image rather than a
   * placeholder. Ignored when `src` is already an image.
   */
  poster?: string;
  /**
   * How far up the layer fades once it is ready, 0 to 1. Lower it when the
   * footage is busy enough to compete with the copy sitting over it.
   */
  opacity?: number;
};

/** Sources with these extensions render as video; anything else as an image. */
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogv", ".mov"] satisfies string[];

/** Where the layer settles unless a page asks for something quieter. */
const DEFAULT_OPACITY = 0.9;

/** HTMLMediaElement.HAVE_ENOUGH_DATA — can play through without stalling. */
const HAVE_ENOUGH_DATA = 4;

/** HTMLMediaElement.HAVE_CURRENT_DATA — a frame is decoded and paintable. */
const HAVE_CURRENT_DATA = 2;

/**
 * How long to wait for a clean "can play through" before settling for a
 * painted frame. A slow connection should not leave the hero without its
 * media indefinitely.
 */
const READY_FALLBACK_MS = 5000;

/**
 * Narrower than this and the hero keeps the still. Matches Tailwind's `md`.
 *
 * The footage is landscape and the layer is full-bleed, so on a phone held
 * upright `object-cover` throws away most of the width to fill the height —
 * several megabytes decoded at 1920px to paint a cropped sliver, blended at
 * `overlay` underneath a gradient. The still is the same frame, the same crop,
 * and about one percent of the bytes.
 */
const VIDEO_MIN_WIDTH = 768;

const VIDEO_QUERY = `(min-width: ${VIDEO_MIN_WIDTH}px) and (prefers-reduced-motion: no-preference)`;

const isVideoSource = (src: string) =>
  VIDEO_EXTENSIONS.some((extension) => src.toLowerCase().endsWith(extension));

/**
 * Whether this viewport should carry moving footage at all.
 *
 * Starts false so the prerendered markup holds nothing but the still: a
 * `<video>` in the static HTML begins downloading before any of this can run,
 * which is the whole cost we are avoiding.
 */
const useWantsVideo = () => {
  const [wantsVideo, setWantsVideo] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(VIDEO_QUERY);

    setWantsVideo(query.matches);

    const handleChange = (event: MediaQueryListEvent) =>
      setWantsVideo(event.matches);

    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  return wantsVideo;
};

/**
 * Full-bleed media layer that sits behind the hero's content, overlay-blended
 * into the gradient. Takes a video or a still. Video plays silently on a loop
 * with no controls and never intercepts pointer events.
 *
 * The still paints first and the footage fades in over it once the browser can
 * play it through, so a part-buffered frame never flashes over the gradient.
 * On a phone, and for anyone who has asked for less motion, the footage is
 * never fetched and the still is the hero. How far the layer fades up is the
 * caller's to set, because it depends on how busy what sits under the copy is.
 */
const classes = {
  root: "pointer-events-none absolute inset-0 overflow-hidden mix-blend-overlay transition-opacity duration-700 ease-out motion-reduce:transition-none",
  still: "absolute inset-0 size-full object-cover",
  video:
    "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none",
} as const;

export const HeroMedia = ({
  src,
  poster,
  opacity = DEFAULT_OPACITY,
}: HeroMediaProperties) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stillRef = useRef<HTMLImageElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [isStillReady, setIsStillReady] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const inView = useInView(layerRef);

  const isVideo = isVideoSource(src);
  const wantsVideo = useWantsVideo() && isVideo;
  const still = isVideo ? poster : src;

  // A still served from cache — which is every navigation after the first —
  // finishes loading before React attaches `onLoad`, so the event never
  // arrives and the layer would sit at zero holding a picture it already has.
  useEffect(() => {
    const image = stillRef.current;

    if (image?.complete && image.naturalWidth > 0) {
      setIsStillReady(true);
    }
  }, []);

  // Video decoding is not free, and a hero is scrolled past within seconds.
  // Off screen there is nothing to show for the work, so stop doing it.
  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (inView) {
      video.play().catch(() => {
        // Autoplay can be refused; the still or the gradient still stands.
      });
    } else {
      video.pause();
    }
  }, [inView, wantsVideo]);

  // A cached video can reach its ready state before React attaches the
  // listeners, in which case the event never arrives. And on a slow connection
  // `canplaythrough` may be a long way off, so settle for a painted frame
  // rather than showing nothing.
  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.readyState >= HAVE_ENOUGH_DATA) {
      setIsVideoReady(true);
      return;
    }

    const fallback = window.setTimeout(() => {
      if (video.readyState >= HAVE_CURRENT_DATA) {
        setIsVideoReady(true);
      }
    }, READY_FALLBACK_MS);

    return () => window.clearTimeout(fallback);
  }, [wantsVideo]);

  const handleVideoReady = () => setIsVideoReady(true);

  // Nothing to reveal if the source failed; the still or gradient stands alone.
  const handleVideoError = () => setIsVideoReady(false);

  const isLayerReady = isStillReady || isVideoReady;

  return (
    <div
      aria-hidden="true"
      className={classes.root}
      ref={layerRef}
      style={{ opacity: isLayerReady ? opacity : 0 }}
    >
      {still ? (
        // biome-ignore lint/performance/noImgElement: full-bleed decorative layer, sized by CSS
        // biome-ignore lint/correctness/useImageSize: intrinsic size is irrelevant, the layer is stretched by object-cover
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onLoad is a resource event, not a user interaction
        <img
          alt=""
          className={classes.still}
          onLoad={() => setIsStillReady(true)}
          ref={stillRef}
          src={still}
        />
      ) : null}

      {wantsVideo ? (
        <video
          autoPlay
          className={classes.video}
          loop
          muted
          onCanPlayThrough={handleVideoReady}
          onError={handleVideoError}
          onPlaying={handleVideoReady}
          playsInline
          preload="auto"
          ref={videoRef}
          src={src}
          style={{ opacity: isVideoReady ? 1 : 0 }}
        />
      ) : null}
    </div>
  );
};
