"use client";

import { useEffect, useRef, type RefObject } from "react";

/** How much of the tile must be on screen for its loop to play. */
const LOOP_VISIBLE_SHARE = 0.25;
/** Loops play from tablet width up; phones keep the stills, as the hover previews always have. */
const LOOP_QUERY = "(min-width: 768px)";
type NetworkInformation = { saveData?: boolean };

/**
 * Plays a tile's muted loop only while a quarter of the tile is on screen and
 * `paused` (the project dialog is up) is off; never on phones or under reduced
 * motion or Data Saver. Either of those switched on mid-visit stops it again.
 * Stopped, it rests on its first frame, so the dialog's frame (which carries
 * the tile's still) leaves and lands on exactly what the tile shows.
 *
 * Returns the refs to put on the <video> and, optionally, one layer drawn
 * over it. With `hideUntilPlaying`, both stay hidden (their class's
 * `invisible`) until the first frame plays and again at rest: a loop laid over
 * a poster that already shows its first frame. Without it, the video's own
 * poster attribute stands in.
 */
export function useLoopPlayback(tile: RefObject<HTMLElement | null>, paused: boolean, hideUntilPlaying = false) {
  const video = useRef<HTMLVideoElement>(null);
  const overlay = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const clip = video.current;
    const box = tile.current;
    if (!clip || !box) return;
    const layers = hideUntilPlaying ? [clip, overlay.current] : [];
    // Shown and hidden here rather than in state, so the effect never re-renders the tile.
    const show = () => layers.forEach((layer) => layer?.style.setProperty("visibility", "visible"));
    const rest = () => {
      clip.pause();
      layers.forEach((layer) => layer?.style.removeProperty("visibility"));
      if (clip.readyState > 0) clip.currentTime = 0;
    };
    if (paused) {
      rest();
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(LOOP_QUERY);
    const saveData = (navigator as Navigator & { connection?: NetworkInformation }).connection?.saveData;
    const allowed = () => !reduce.matches && wide.matches && !saveData;
    // Set as a property too: autoplay without a gesture needs it muted before play().
    clip.muted = true;
    clip.addEventListener("playing", show);
    const inView = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!allowed()) rest();
        // isIntersecting holds for any overlap, whatever the threshold: the ratio says whether a quarter shows.
        else if (entry?.isIntersecting && entry.intersectionRatio >= LOOP_VISIBLE_SHARE) clip.play().catch(() => undefined);
        else clip.pause();
      },
      { threshold: LOOP_VISIBLE_SHARE }
    );
    inView.observe(box);
    // Observing afresh reports the tile again, so a change back resumes it if it is on screen.
    const recheck = () => {
      inView.unobserve(box);
      inView.observe(box);
    };
    reduce.addEventListener("change", recheck);
    wide.addEventListener("change", recheck);
    return () => {
      inView.disconnect();
      reduce.removeEventListener("change", recheck);
      wide.removeEventListener("change", recheck);
      clip.removeEventListener("playing", show);
      clip.pause();
    };
  }, [hideUntilPlaying, paused, tile]);

  return { video, overlay };
}
