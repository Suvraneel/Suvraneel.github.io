"use client";

import Image from "next/image";
import { useMotionValue, useScroll, useSpring, type MotionValue } from "motion/react";
import type { Application } from "@splinetool/runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import ChronoCard from "@components/ChronoCard";
import TimelineSpine from "@components/TimelineSpine";
import TimelineDate from "@components/TimelineDate";
import { communityLeadershipData, educationData, workData } from "@data/workData";
import SplineObj from "@components/SplineObject";
import { spaceBoards, tasaOrbiter } from "@font";
import { isUnrendered, layoutTop, whenPlaced } from "@components/transition/arrival";
import { getTransition } from "@components/transition/transitionStore";
import { useReveal } from "@hooks/useReveal";
import { prefersReducedMotion } from "@lib/pageTransition";
import { scrubSplineScroll } from "@lib/splineScroll";

/** The plant trails the page by a short settle, so a mouse wheel's steps read as one motion. */
const PLANT_SPRING = { stiffness: 300, damping: 50 };

/** An entry's dot lights once it has passed this share of the view. */
const DOT_LIGHT_AT = 0.5;

/**
 * Lights each entry's dot (dim -> its own colour) as it passes the middle of
 * <main>'s view. Thresholds come from layout offsets and are clamped to the
 * end of the scroll, so the bottom (a backward arrival included) shows every
 * dot lit. Dots flip by a data attribute (CSS crossfades opacity), only when
 * one crosses; nothing re-renders while scrolling.
 */
function useTimelineDots(mainRef: RefObject<HTMLElement | null>, scrollY: MotionValue<number>) {
  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main || prefersReducedMotion()) return;

    let dots: Array<{ element: HTMLElement; at: number }> = [];
    let stopScroll: () => void = () => undefined;
    let resizeObserver: ResizeObserver | null = null;
    let liveFrame = 0;

    const measure = () => {
      const view = main.clientHeight;
      const max = Math.max(0, main.scrollHeight - view);
      const origin = layoutTop(main);
      dots = Array.from(main.querySelectorAll<HTMLElement>("[data-timeline-dot]"))
        .filter((element) => !isUnrendered(element))
        .map((element) => ({ element, at: Math.min(layoutTop(element) - origin - view * DOT_LIGHT_AT, max) }));
    };

    const apply = (y: number) => {
      for (const { element, at } of dots) {
        const unlit = at > 0 && y < at;
        if (unlit !== element.hasAttribute("data-unlit")) element.toggleAttribute("data-unlit", unlit);
      }
    };

    const stopWaiting = whenPlaced(main, () => {
      measure();
      // The arrival offset is already applied to <main>; scrollY catches up a frame later.
      apply(main.scrollTop);
      // Crossfades only once the placed state has been painted.
      liveFrame = requestAnimationFrame(() => main.setAttribute("data-timeline-live", ""));
      stopScroll = scrollY.on("change", apply);
      resizeObserver = new ResizeObserver(() => {
        measure();
        apply(main.scrollTop);
      });
      resizeObserver.observe(main);
      if (main.firstElementChild) resizeObserver.observe(main.firstElementChild);
    });

    return () => {
      stopWaiting();
      stopScroll();
      resizeObserver?.disconnect();
      cancelAnimationFrame(liveFrame);
      main.removeAttribute("data-timeline-live");
      main.querySelectorAll("[data-unlit]").forEach((element) => element.removeAttribute("data-unlit"));
    };
  }, [mainRef, scrollY]);
}

const Work = () => {
  const mainRef = useRef<HTMLElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: mainRef });
  const plantTarget = useMotionValue(0);
  const plantProgress = useSpring(plantTarget, PLANT_SPRING);
  const seekPlant = useRef<((progress: number) => void) | null>(null);

  useReveal(entriesRef, { rootRef: mainRef });
  useTimelineDots(mainRef, scrollY);

  // The plant follows <main>'s scroll: full at the top (today), back to its pot
  // at the bottom (where it started). Reduced motion drops the trailing settle.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const reduced = prefersReducedMotion();
    const stopScroll = scrollY.on("change", (y) => {
      const range = main.scrollHeight - main.clientHeight;
      const progress = range > 0 ? y / range : 0;
      if (reduced) plantProgress.jump(progress);
      else plantTarget.set(progress);
    });
    const stopSeek = plantProgress.on("change", (progress) => seekPlant.current?.(progress));
    return () => {
      stopScroll();
      stopSeek();
      seekPlant.current = null;
    };
  }, [scrollY, plantTarget, plantProgress]);

  // The scene loads as the full plant. Reached from below (a backward lift
  // lands at Work's bottom) or restored part way down, it starts where the page
  // is. A scene the runtime can't scrub keeps its own wheel stepping.
  const scrubPlant = useCallback(
    (spline: Application) => {
      const main = mainRef.current;
      const seek = scrubSplineScroll(spline);
      if (!main || !seek) return;

      const t = getTransition();
      const range = main.scrollHeight - main.clientHeight;
      const progress =
        t && !t.settled && t.to === "/work"
          ? t.direction < 0 ? 1 : 0
          : range > 0 ? main.scrollTop / range : 0;
      seekPlant.current = seek;
      plantTarget.jump(progress);
      plantProgress.jump(progress);
      seek(progress);
    },
    [plantTarget, plantProgress],
  );

  return (
      <main ref={mainRef} className="page-scroller relative h-[100dvh] overflow-y-auto overflow-x-hidden text-gray-50">
        <div className="min-h-screen grid md:grid-cols-[16rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)] 2xl:grid-cols-[24rem_minmax(0,1fr)] gap-0">
          <aside aria-label="Growing plant illustration" className="sticky top-0 hidden h-screen self-start md:block">
            {/* The plant centres in the space you can see (right of the nav rail). */}
            <div className="absolute inset-y-0 left-0 right-0 min-[769px]:left-[50px]">
              {/* Never clipped: the canvas is at least as wide as the ground glow (about half
                  its height), so the glow fades out on its own, under the glass rail and the text. */}
              <div className="pointer-events-none absolute inset-y-0 left-[calc(50%-max(50%,32.5vh))] w-[max(100%,65vh)]">
                <SplineObj scene={"/spline/scene-plantNEW.splinecode"} onLoad={scrubPlant} />
              </div>
            </div>
          </aside>
          {/* Positioned, so the text paints over the plant's canvas where the glow runs under it. */}
          <div className="relative min-w-0">
            <div className="max-w-6xl px-5 pb-20 pt-20 sm:px-10 sm:pb-28 sm:pt-14 lg:px-14">
          <header className="max-w-4xl">
            <h1 className={`animated-heading text-4xl font-bold leading-none tracking-[-0.045em] sm:text-6xl ${spaceBoards.className}`}>
              Work &amp; experience
            </h1>
            <p className={`mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg ${tasaOrbiter.className}`}>
              Enterprise engineering, open-source leadership, and the communities that shaped how I build.
            </p>
           </header>

           <div ref={entriesRef}>
           <section className="mt-10 sm:mt-12" aria-labelledby="professional-work">
            <h2 id="professional-work" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Professional experience
            </h2>
            <div className="relative mt-2">
              <TimelineSpine scrollY={scrollY} />
              {workData.map((curElem) => (
                <ChronoCard key={`${curElem.company}-${curElem.duration}`} curElem={curElem} />
              ))}
            </div>
          </section>

          <section className="mt-16 sm:mt-20" aria-labelledby="community-leadership">
            <div className="max-w-2xl">
              <h2 id="community-leadership" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                Community &amp; leadership
              </h2>
            </div>
            <div className="relative mt-2">
              <TimelineSpine scrollY={scrollY} />
              {communityLeadershipData.map((curElem) => (
                <ChronoCard key={`${curElem.company}-${curElem.duration}`} curElem={curElem} variant="community" />
              ))}
             </div>
           </section>

           <section className="mt-16 sm:mt-20" aria-labelledby="education">
            <h2 id="education" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Education
            </h2>
            <article data-reveal className="relative mt-2 grid gap-4 py-8 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-6 sm:py-7">
              <div className="flex items-start gap-3 sm:flex-col sm:items-start sm:gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] p-1">
                  <Image
                    src={`/images/work-assets/${educationData.image}`}
                    alt="University College of Science, Technology & Agriculture emblem"
                    width={56}
                    height={56}
                    className="h-full w-full object-contain invert"
                  />
                </div>
                <div className="pt-2 sm:hidden">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/40">
                    {educationData.duration}
                  </p>
                  <p className={`mt-1 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-accent/70 ${tasaOrbiter.className}`}>
                    {educationData.institution}
                  </p>
                </div>
                <TimelineDate duration={educationData.duration} />
              </div>
              <div className="relative grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-8 sm:pl-5">
                <div aria-hidden="true" data-timeline-dot className="absolute left-0 top-1 hidden h-2 w-2 sm:block">
                  <span className="timeline-dot-dim absolute inset-0 rounded-full bg-white/25" />
                  <span className="timeline-dot-lit absolute inset-0 rounded-full bg-white/50" />
                </div>
                <div>
                  <p className={`hidden text-[0.68rem] font-medium uppercase tracking-[0.2em] text-accent/70 sm:block ${tasaOrbiter.className}`}>
                    {educationData.institution}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-2xl">
                    {educationData.degree}
                  </h3>
                  <p className={`mt-1 text-sm leading-6 text-white/55 ${tasaOrbiter.className}`}>{educationData.campus}</p>
                </div>
                <p className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-1 sm:text-right">
                  <span className={`text-3xl font-semibold leading-none tracking-[-0.03em] text-white tabular-nums sm:text-4xl ${tasaOrbiter.className}`}>
                    {educationData.score.split(" ")[0]}
                  </span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-accent/70">
                    {educationData.score.split(" ").slice(1).join(" ")}
                  </span>
                </p>
              </div>
             </article>
           </section>
           </div>

            </div>
          </div>
        </div>
      </main>
  );
};

export default Work;
