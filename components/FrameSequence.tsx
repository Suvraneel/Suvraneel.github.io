"use client";

import type { MotionValue } from "motion/react";
import { useEffect, useRef } from "react";

type FrameSequenceProps = {
  /** URL of frame `index` (0 to count - 1). */
  frame: (index: number) => string;
  count: number;
  /** 0 shows the first frame, 1 the last; between two frames the nearer one is crossfaded in. */
  progress: MotionValue<number>;
  /** Only while this matches is anything fetched or drawn. */
  media: string;
  /** The frames' own width / height, contain-fitted to the box (bottom-centred). */
  aspect: number;
  className?: string;
};

/** Passes over the frames, sparse to dense, so the whole range can be scrubbed early and sharpens as the rest arrives. */
export const loadOrder = (count: number) => {
  // Both ends first: the scrub's whole range has a picture from the start.
  const order = count > 1 ? [0, count - 1] : count === 1 ? [0] : [];
  const seen = new Set(order);
  for (let step = 2 ** Math.floor(Math.log2(Math.max(count - 1, 1))); step >= 1; step /= 2)
    for (let i = 0; i < count; i += step)
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
  return order;
};

/** The loaded frames nearest below and above `at`, and how far `at` is from the lower toward the upper (0 to 1). */
export const nearestFrames = (loaded: ReadonlyArray<unknown>, at: number): [number, number, number] | null => {
  let below = Math.floor(at);
  while (below >= 0 && !loaded[below]) below--;
  let above = Math.ceil(at);
  while (above < loaded.length && !loaded[above]) above++;
  if (below < 0 && above >= loaded.length) return null;
  if (below < 0) return [above, above, 0];
  if (above >= loaded.length || above === below) return [below, below, 0];
  return [below, above, (at - below) / (above - below)];
};

/**
 * A pre-rendered animation scrubbed by `progress` (e.g. a Spline scene recorded
 * frame by frame), for screens that shouldn't run the scene itself. Draws into
 * one canvas only when the progress or a newly loaded frame changes the picture,
 * and not at all while out of view. With Save-Data on, only every fourth frame loads.
 */
export default function FrameSequence({ frame, count, progress, media, aspect, className = "" }: FrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;
    const query = window.matchMedia(media);
    const frames: Array<HTMLImageElement | undefined> = new Array(count);
    let started = false;
    let disposed = false;
    let visible = true;
    let pending = 0;
    let drawn = "";

    const draw = () => {
      pending = 0;
      if (!visible || !query.matches) return;
      const nearest = nearestFrames(frames, Math.min(Math.max(progress.get(), 0), 1) * (count - 1));
      if (!nearest) return;
      const [a, b, t] = nearest;
      // Quantised, so a spring settling by fractions of a step doesn't redraw an identical picture.
      const key = `${a}:${b}:${Math.round(t * 32)}:${canvas.width}x${canvas.height}`;
      if (key === drawn) return;
      drawn = key;
      const { width, height } = canvas;
      const w = Math.min(width, height * aspect);
      const h = w / aspect;
      const x = (width - w) / 2;
      const y = height - h;
      context.clearRect(0, 0, width, height);
      context.globalAlpha = 1;
      context.drawImage(frames[a]!, x, y, w, h);
      if (b !== a && t > 0) {
        context.globalAlpha = t;
        context.drawImage(frames[b]!, x, y, w, h);
      }
    };
    const schedule = () => {
      if (!pending && !disposed) pending = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (started || !query.matches) return;
      started = true;
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
      const order = loadOrder(count).filter((index) => !saveData || index % 4 === 0 || index === count - 1);
      // A few at a time, in order: the sparse pass first, so the full range is soon there to scrub.
      let next = 0;
      const loadNext = async (): Promise<void> => {
        while (!disposed && next < order.length) {
          const index = order[next++];
          const image = new Image();
          image.decoding = "async";
          image.src = frame(index);
          try {
            await image.decode();
          } catch {
            continue;
          }
          if (disposed) return;
          frames[index] = image;
          drawn = "";
          schedule();
        }
      };
      for (let lane = 0; lane < 4; lane++) void loadNext();
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        context.imageSmoothingQuality = "high";
        drawn = "";
      }
      schedule();
    };
    const resizer = new ResizeObserver(resize);
    resizer.observe(canvas);
    const viewer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    });
    viewer.observe(canvas);

    const onMedia = () => {
      start();
      drawn = "";
      schedule();
    };
    query.addEventListener("change", onMedia);
    const stopProgress = progress.on("change", schedule);
    start();
    resize();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(pending);
      resizer.disconnect();
      viewer.disconnect();
      query.removeEventListener("change", onMedia);
      stopProgress();
    };
  }, [frame, count, progress, media, aspect]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
