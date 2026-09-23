"use client";

import { useInView } from "@/hooks/use-in-view";
import { useEffect, useRef, useState } from "react";

type HeroMediaProperties = {
  src: string;
  /** Still shown before a video has data; ignored for image sources. */
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

const isVideoSource = (src: string) =>
  VIDEO_EXTENSIONS.some((extension) => src.toLowerCase().endsWith(extension));

/**
 * Full-bleed media layer that sits behind the hero's content, overlay-blended
 * into the gradient. Takes a video or a still. Video plays silently on a loop
 * with no controls and never intercepts pointer events.
 *
 * It holds at zero opacity until the browser reports it can play through
 * without stalling, then fades up, so a part-buffered first frame never
 * flashes over the gradient. How far up is the caller's to set, because it
 * depends on how busy the footage underneath the copy is.
 */
const classes = {
  root: "pointer-events-none absolute inset-0 overflow-hidden mix-blend-overlay transition-opacity duration-700 ease-out motion-reduce:transition-none",
  media: "size-full object-cover",
} as const;

export const HeroMedia = ({
  src,
  poster,
  opacity = DEFAULT_OPACITY,
}: HeroMediaProperties) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const inView = useInView(layerRef);

  // Video decoding is not free, and a hero is scrolled past within seconds.
  // Off screen there is nothing to show for the work, so stop doing it.
  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (inView) {
      video.play().catch(() => {
        // Autoplay can be refused; the poster or the gradient still stands.
      });
    } else {
      video.pause();
    }
  }, [inView]);

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
      setIsReady(true);
      return;
    }

    const fallback = window.setTimeout(() => {
      if (video.readyState >= HAVE_CURRENT_DATA) {
        setIsReady(true);
      }
    }, READY_FALLBACK_MS);

    return () => window.clearTimeout(fallback);
  }, []);

  const handleReady = () => setIsReady(true);

  // Nothing to reveal if the source failed; the gradient stands on its own.
  const handleError = () => setIsReady(false);

  return (
    <div
      aria-hidden="true"
      className={classes.root}
      ref={layerRef}
      style={{ opacity: isReady ? opacity : 0 }}
    >
      {isVideoSource(src) ? (
        <video
          autoPlay
          className={classes.media}
          loop
          muted
          onCanPlayThrough={handleReady}
          onError={handleError}
          onPlaying={handleReady}
          playsInline
          preload="auto"
          ref={videoRef}
          src={src}
          {...(poster ? { poster } : {})}
        />
      ) : (
        // biome-ignore lint/performance/noImgElement: full-bleed decorative layer, sized by CSS
        // biome-ignore lint/correctness/useImageSize: intrinsic size is irrelevant, the layer is stretched by object-cover
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onLoad is a resource event, not a user interaction
        <img alt="" className={classes.media} onLoad={handleReady} src={src} />
      )}
    </div>
  );
};
