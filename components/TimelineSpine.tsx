"use client";

import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { isUnrendered, layoutTop } from "@components/transition/arrival";
import { prefersReducedMotion } from "@lib/pageTransition";

/** Matches useTimelineDots: a point is "reached" when it passes this share of the view. */
const REACHED_AT = 0.5;
/** The line breaks this far above and below each section heading it would cross. */
const HEADING_GAP = 12;
/** The ring marking where the line resumes under a heading. */
const RING = 5;

type Geometry = {
  top: number;
  height: number;
  /** Scroll offsets at which the fill reaches each stop, ascending... */
  reach: number[];
  /** ...and how far down the line (0-1) it stands at each. */
  stops: number[];
  /** [from, to] in px down the line: cut around each heading, a ring at `to`. */
  gaps: Array<[number, number]>;
};
/** Fully drawn: reduced motion, no JS measurement yet, or nothing to scroll. */
const FULL: Geometry = { top: 0, height: 0, reach: [-1, 0], stops: [0, 1], gaps: [] };

/**
 * One continuous line through every timeline dot in a list, across its
 * sections. A faint track runs from the first dot to the last, cut around the
 * section headings it would cross; an accent fill follows the scroller (Work's
 * <main>) and reaches each dot as that dot lights, at the middle of the view.
 * The fill stays quiet along its length and brightens into a glowing head.
 * At the scroller's end (a backward arrival included) the fill is complete.
 */
export default function TimelineSpine({ scrollY }: Readonly<{ scrollY: MotionValue<number> }>) {
  const spineRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<Geometry>(FULL);
  const still = useMotionValue(0);
  const progress = useTransform(scrollY ?? still, geometry.reach, geometry.stops);
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
      const centre = (dot: HTMLElement) => layoutTop(dot) + dot.offsetHeight / 2;
      const first = centre(dots[0]);
      const height = centre(dots[dots.length - 1]) - first;
      const view = scroller.clientHeight;
      const max = Math.max(0, scroller.scrollHeight - view);
      const origin = layoutTop(scroller);

      // Piecewise, one stop per dot: the head reaches each dot's centre as the dot
      // lights (its top at REACHED_AT of the view), even where the page's end cuts
      // the scroll short. Dots past the end all light there, as the fill completes.
      const reach: number[] = [];
      const stops: number[] = [];
      for (const dot of dots) {
        const at = layoutTop(dot) - origin - view * REACHED_AT;
        if (at >= max) break;
        reach.push(at);
        stops.push((centre(dot) - first) / height);
      }
      if (reach.length === 0) {
        reach.push(max - 1);
        stops.push(0);
      }
      if (stops[stops.length - 1] < 1) {
        reach.push(max);
        stops.push(1);
      }

      const gaps = Array.from(list.querySelectorAll<HTMLElement>("h2")).flatMap((heading): Geometry["gaps"] => {
        if (isUnrendered(heading)) return [];
        const from = layoutTop(heading) - first - HEADING_GAP;
        const to = from + heading.offsetHeight + HEADING_GAP * 2;
        return to > 0 && from < height ? [[Math.max(0, from), Math.min(height, to)]] : [];
      });

      const next: Geometry = {
        top: first - layoutTop(list),
        height,
        ...(prefersReducedMotion() || reach[reach.length - 1] <= 0 ? { reach: FULL.reach, stops: FULL.stops } : { reach, stops }),
        gaps,
      };
      setGeometry((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // Each cut runs on through its ring, so the line resumes from the ring's lower edge.
  const mask = geometry.gaps.length
    ? `linear-gradient(${geometry.gaps
        .flatMap(([from, to]) => [`#000 ${from}px`, `transparent ${from}px`, `transparent ${to + RING}px`, `#000 ${to + RING}px`])
        .join(", ")})`
    : undefined;

  return (
    <>
      <div
        ref={spineRef}
        aria-hidden="true"
        // 12px either side of the line, so the head's glow fits inside the clip and the cuts.
        className="pointer-events-none absolute hidden w-[25px] overflow-hidden sm:[@container(min-width:28rem)]:block"
        style={{
          // Through the dots at the left edge of the content column (6rem dates column + 1.5rem gap + dot centre).
          left: "calc(7.5rem + 3.5px - 12px)",
          top: geometry.top,
          height: geometry.height,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        <span className="absolute inset-y-0 left-[12px] w-px bg-white/[0.12]" />
        <motion.span className="timeline-spine-fill absolute inset-y-0 left-[12px] w-px" style={{ y: fillY }}>
          <motion.span
            className="absolute bottom-0 left-0 h-4 w-px rounded-full shadow-[0_0_10px_2px_rgb(var(--accent)/0.45)]"
            style={{ opacity: headOpacity }}
          />
        </motion.span>
      </div>
      {geometry.gaps.map(([, to]) =>
        to + RING < geometry.height ? (
          <span
            key={to}
            aria-hidden="true"
            className="pointer-events-none absolute hidden size-[5px] rounded-full border border-white/20 sm:[@container(min-width:28rem)]:block"
            style={{ left: "calc(7.5rem + 1.5px)", top: geometry.top + to }}
          />
        ) : null,
      )}
    </>
  );
}
