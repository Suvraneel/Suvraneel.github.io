"use client";

import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { isUnrendered, layoutTop } from "@components/transition/arrival";
import { prefersReducedMotion } from "@lib/pageTransition";

/** Matches useTimelineDots: a point is "reached" when it passes this share of the view. */
const REACHED_AT = 0.5;

type Geometry = { top: number; height: number; range: [number, number] };
/** Fully drawn: reduced motion, no JS measurement yet, or nothing to scroll. */
const FULL: Geometry = { top: 0, height: 0, range: [-1, 0] };

/**
 * One continuous line through a list's timeline dots. A faint track runs from
 * the first dot to the last; an accent fill follows the scroller (Work's
 * <main>) and reaches each dot as that dot lights, at the middle of the view.
 * The fill stays quiet along its length and brightens into a glowing head.
 * At the scroller's end (a backward arrival included) the fill is complete.
 */
export default function TimelineSpine({ scrollY }: Readonly<{ scrollY: MotionValue<number> }>) {
  const spineRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<Geometry>(FULL);
  const still = useMotionValue(0);
  const progress = useTransform(scrollY ?? still, geometry.range, [0, 1]);
  // The fill slides down inside the clipped spine instead of stretching, so its head keeps one length.
  const fillY = useTransform(progress, (reached) => `${(reached - 1) * 100}%`);
  const headOpacity = useTransform(progress, [0, 0.01], [0, 1]);

  useLayoutEffect(() => {
    const spine = spineRef.current;
    const list = spine?.parentElement;
    const scroller = spine?.closest("main");
    if (!spine || !list || !scroller) return;

    const measure = () => {
      const dots = Array.from(list.querySelectorAll<HTMLElement>("[data-timeline-dot]")).filter(
        (dot) => !isUnrendered(dot),
      );
      if (dots.length < 2) {
        setGeometry(FULL);
        return;
      }
      const listTop = layoutTop(list);
      const centre = (dot: HTMLElement) => layoutTop(dot) + dot.offsetHeight / 2;
      const first = centre(dots[0]);
      const last = centre(dots[dots.length - 1]);
      const view = scroller.clientHeight;
      const max = Math.max(0, scroller.scrollHeight - view);
      const origin = layoutTop(scroller);
      const end = Math.min(last - origin - view * REACHED_AT, max);
      const start = Math.min(first - origin - view * REACHED_AT, end - 1);
      const next: Geometry = {
        top: first - listTop,
        height: last - first,
        range: prefersReducedMotion() || end <= 0 ? FULL.range : [start, end],
      };
      setGeometry((previous) =>
        previous.top === next.top &&
        previous.height === next.height &&
        previous.range[0] === next.range[0] &&
        previous.range[1] === next.range[1]
          ? previous
          : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={spineRef}
      aria-hidden="true"
      // Clipped to its own length only; the head's glow may spill sideways.
      className="pointer-events-none absolute hidden w-px [clip-path:inset(0_-12px)] sm:block"
      // Through the dots at the left edge of the content column (6rem dates column + 1.5rem gap + dot centre).
      style={{ left: "calc(7.5rem + 3.5px)", top: geometry.top, height: geometry.height }}
    >
      <span className="absolute inset-0 bg-white/[0.12]" />
      <motion.span className="timeline-spine-fill absolute inset-0" style={{ y: fillY }}>
        <motion.span
          className="absolute bottom-0 left-0 h-4 w-px rounded-full shadow-[0_0_10px_2px_rgb(var(--accent)/0.45)]"
          style={{ opacity: headOpacity }}
        />
      </motion.span>
    </div>
  );
}
