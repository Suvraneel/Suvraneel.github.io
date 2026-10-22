"use client";

import Image from "next/image";
import { animate, useMotionValue, useScroll, useSpring, type AnimationPlaybackControls, type MotionValue } from "motion/react";
import type { Application } from "@splinetool/runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import ChronoCard from "@components/ChronoCard";
import TimelineSpine from "@components/TimelineSpine";
import TimelineDate from "@components/TimelineDate";
import LiftHeading from "@components/LiftHeading";
import { communityLeadershipData, educationData, workData } from "@data/workData";
import SplineObj from "@components/SplineObject";
import { spaceBoards, tasaOrbiter } from "@font";
import { isUnrendered, layoutTop, whenPlaced } from "@components/transition/arrival";
import { getTransition } from "@components/transition/transitionStore";
import { REVEAL_EASE, useReveal } from "@hooks/useReveal";
import { prefersReducedMotion } from "@lib/pageTransition";
import { renderOnDemand, scrubSplineScroll } from "@lib/splineScroll";

/** The plant trails the page by a short settle, so a mouse wheel's steps read as one motion. */
const PLANT_SPRING = { stiffness: 300, damping: 50 };

/** Reached from above, the plant starts this far back along its scrub and grows into place. */
const GROW_FROM = 0.35;
/** Softer than PLANT_SPRING, so the grow reads as growth, not as a correction. */
const GROW_SPRING = { type: "spring", stiffness: 120, damping: 22 } as const;
/** A scene in later than this after Work is placed skips the grow: the visitor is reading by then. */
const GROW_WINDOW_MS = 1500;
/** The grow starts this long before the lift settles, so it overlaps the landing. */
const GROW_LEAD_MS = 150;

/** The scene's first frame fades in (rising 8px) over this; reduced motion only fades, faster. */
const PLANT_FADE_MS = 600;
const PLANT_FADE_REDUCED_MS = 200;

/**
 * The scene's purple floor glow, drawn in CSS so the server HTML shows it
 * before the scene exists. Picked from captures of the loaded scene: it scales
 * with the column's height, centred, its disc fading out at a quarter of it.
 */
const PLANT_GLOW =
  "radial-gradient(ellipse 25dvh 6.3dvh at 50% 63%, rgb(74 47 200), rgb(74 47 200 / 0.7) 32%, rgb(74 47 200 / 0.46) 48%, rgb(74 47 200 / 0.3) 64%, rgb(74 47 200 / 0.165) 80%, rgb(74 47 200 / 0.065) 96%, transparent)";

/** An entry's dot lights once it has passed this share of the view. */
const DOT_LIGHT_AT = 0.5;

/** Where the plant's column shows (md, as on its <aside>). Below it the plant isn't mounted at all. */
const PLANT_QUERY = "(min-width: 768px)";
let plantQuery: MediaQueryList | null = null;
const getPlantQuery = () => (plantQuery ??= window.matchMedia(PLANT_QUERY));
const subscribePlantQuery = (onChange: () => void) => {
  const query = getPlantQuery();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const isPlantShown = () => getPlantQuery().matches;
const isPlantShownOnServer = () => false;

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

type PlantArrival = {
  /** The transition that brought Work in; null for a direct load. */
  id: number | null;
  /** performance.now() once Work stands where the visitor sees it. */
  placedAt: number;
  /** A forward arrival at the top, or a direct load; never a backward or restored arrival. */
  fromAbove: boolean;
  /** Runs `start` GROW_LEAD_MS before the lift settles (at once without a lift). Returns a cancel. */
  whenLanding: (start: () => void) => () => void;
};

/**
 * How and when Work arrived, for the plant's grow. A lift carries a silent
 * cue on its own timeline that ends GROW_LEAD_MS before it settles, so seeks,
 * resumes and settle move the grow's start with it.
 */
function usePlantArrival(mainRef: RefObject<HTMLElement | null>) {
  const arrival = useRef<PlantArrival | null>(null);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const stopWaiting = whenPlaced(main, (t, track) => {
      // Strict Mode runs this again after the arrival, without its track: keep the first.
      if (t && arrival.current?.id === t.id) return;
      let landed = !track;
      let onLanded: (() => void) | null = null;
      if (track) {
        const cue = new Animation(new KeyframeEffect(null, null, Math.max(0, track.duration - GROW_LEAD_MS)));
        const land = () => {
          landed = true;
          onLanded?.();
          onLanded = null;
        };
        // Settle finishes it; a cancelled lift rejects it. Either way the lift is over.
        cue.finished.then(land, land);
        track.add(cue);
      }
      arrival.current = {
        id: t?.id ?? null,
        placedAt: performance.now(),
        fromAbove: t ? t.direction > 0 && t.arrival === "top" : true,
        whenLanding: (start) => {
          if (landed) {
            start();
            return () => undefined;
          }
          onLanded = start;
          return () => {
            onLanded = null;
          };
        },
      };
    });
    return stopWaiting;
  }, [mainRef]);

  return arrival;
}

/** The scene's first frame fades in over its glow placeholder, which crossfades out in place. */
function revealPlant(scene: HTMLElement | null, glow: HTMLElement | null) {
  const reduced = prefersReducedMotion();
  const timing = { duration: reduced ? PLANT_FADE_REDUCED_MS : PLANT_FADE_MS, easing: REVEAL_EASE };
  if (scene && scene.style.opacity !== "1") {
    scene.style.opacity = "1";
    scene.animate(
      reduced
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translate3d(0px, 8px, 0px)" },
            { opacity: 1, transform: "translate3d(0px, 0px, 0px)" },
          ],
      timing
    );
  }
  if (glow && glow.style.opacity !== "0") {
    // Held whole under the fading scene, then dropped once the scene covers it: fading
    // both at once would dim the glow mid-swap (the canvas is opaque over it).
    glow.style.opacity = "0";
    glow.animate([{ opacity: 1 }, { opacity: 1 }], { duration: timing.duration });
  }
}

const Work = () => {
  const mainRef = useRef<HTMLElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: mainRef });
  const plantTarget = useMotionValue(0);
  const plantProgress = useSpring(plantTarget, PLANT_SPRING);
  const seekPlant = useRef<((progress: number) => void) | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  /** Cancels the plant's arrival grow (waiting for its cue, or playing). */
  const stopGrow = useRef<(() => void) | null>(null);
  const plantArrival = usePlantArrival(mainRef);
  // Its column is display:none below md; an invisible canvas would still load
  // a Spline runtime. Mounted again later, the plant syncs on load (scrubPlant).
  const plantShown = useSyncExternalStore(subscribePlantQuery, isPlantShown, isPlantShownOnServer);

  useReveal(entriesRef, { rootRef: mainRef });
  useTimelineDots(mainRef, scrollY);

  // The plant follows <main>'s scroll: full at the top (today), back to its pot
  // at the bottom (where it started). Reduced motion drops the trailing settle.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const reduced = prefersReducedMotion();
    const stopScroll = scrollY.on("change", (y) => {
      // Any scroll takes the plant over from its arrival grow.
      stopGrow.current?.();
      stopGrow.current = null;
      const range = main.scrollHeight - main.clientHeight;
      const progress = range > 0 ? y / range : 0;
      if (reduced) plantProgress.jump(progress);
      else plantTarget.set(progress);
    });
    const stopSeek = plantProgress.on("change", (progress) => seekPlant.current?.(progress));
    return () => {
      stopScroll();
      stopSeek();
      stopGrow.current?.();
      stopGrow.current = null;
      seekPlant.current = null;
    };
  }, [scrollY, plantTarget, plantProgress]);

  // A hidden plant is unmounted (its runtime disposed); stop seeking it. Shown
  // again, its new canvas fades in over the glow afresh.
  useEffect(() => {
    if (plantShown) return;
    seekPlant.current = null;
    stopGrow.current?.();
    stopGrow.current = null;
    glowRef.current?.style.removeProperty("opacity");
  }, [plantShown]);

  // The scene loads as the full plant. Reached from below (a backward lift
  // lands at Work's bottom) or restored part way down, it starts where the page
  // is. A scene the runtime can't scrub keeps its own wheel stepping.
  const scrubPlant = useCallback(
    (spline: Application) => {
      const main = mainRef.current;
      revealPlant(sceneRef.current, glowRef.current);
      const seek = scrubSplineScroll(spline);
      if (!main || !seek) return;
      // The plant only moves with the scroll it follows: at rest it stops drawing.
      renderOnDemand(spline);

      // In flight, the edge the lift lands at decides: a backward link lands at Work's top.
      const t = getTransition();
      const edge = t && !t.settled && t.to === "/work" && typeof t.arrival === "string" ? t.arrival : null;
      const range = main.scrollHeight - main.clientHeight;
      const progress = edge === "bottom" ? 1 : edge === "top" ? 0 : range > 0 ? main.scrollTop / range : 0;
      // Reached from above (or loaded at the top) with the scene in early, the
      // plant fades in a little way back and grows into place as the lift lands.
      const arrival = plantArrival.current;
      const grows =
        progress === 0 &&
        arrival !== null &&
        arrival.fromAbove &&
        performance.now() - arrival.placedAt <= GROW_WINDOW_MS &&
        !prefersReducedMotion();
      const start = grows ? GROW_FROM : progress;
      seekPlant.current = seek;
      plantTarget.jump(progress);
      plantProgress.jump(start);
      seek(start);
      if (!grows) return;

      let growing: AnimationPlaybackControls | null = null;
      const stopWaiting = arrival.whenLanding(() => {
        // Driven by jumps, so the scroll's own spring picks up from wherever the grow is.
        growing = animate(GROW_FROM, 0, { ...GROW_SPRING, onUpdate: (value) => plantProgress.jump(value) });
      });
      stopGrow.current?.();
      stopGrow.current = () => {
        stopWaiting();
        growing?.stop();
      };
    },
    [plantArrival, plantTarget, plantProgress],
  );

  // Focusable, so scroll keys reach <main> without tabbing into the entries.
  // An arrival focuses it from script, which matches :focus-visible too, so the
  // inset ring waits for Tab (its keyup lands on the element it focused).
  return (
      <main
        ref={mainRef}
        tabIndex={0}
        aria-label="Work and experience"
        onKeyUp={(event) => {
          if (event.key === "Tab" && event.target === event.currentTarget) event.currentTarget.setAttribute("data-tab-focus", "");
        }}
        onBlur={(event) => event.currentTarget.removeAttribute("data-tab-focus")}
        className="page-scroller relative h-[100dvh] overflow-y-auto overflow-x-hidden text-gray-50 outline-none data-[tab-focus]:focus-visible:outline data-[tab-focus]:focus-visible:outline-2 data-[tab-focus]:focus-visible:-outline-offset-2 data-[tab-focus]:focus-visible:outline-accent"
      >
        <div className="min-h-[100dvh] grid md:grid-cols-[16rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)] 2xl:grid-cols-[24rem_minmax(0,1fr)] gap-0">
          <aside aria-label="Growing plant illustration" className="sticky top-0 hidden h-[100dvh] self-start md:block">
            {/* The plant centres in the space you can see (right of the nav rail). */}
            <div className="absolute inset-y-0 left-0 right-0 min-[769px]:[@media(min-height:521px)]:left-[var(--rail-w)]">
              {/* Never clipped: the canvas is at least as wide as the ground glow (about half
                  its height), so the glow fades out on its own, under the glass rail and the text. */}
              <div className="pointer-events-none absolute inset-y-0 left-[calc(50%-max(50%,32.5vh))] w-[max(100%,65vh)]">
                {/* The scene's floor glow until its first frame is in, so the column never starts black. */}
                <div ref={glowRef} aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: PLANT_GLOW }} />
                {plantShown && (
                  <div ref={sceneRef} className="absolute inset-0 opacity-0">
                    <SplineObj scene={"/spline/scene-plantNEW.splinecode"} onLoad={scrubPlant} />
                  </div>
                )}
              </div>
            </div>
          </aside>
          {/* Positioned, so the text paints over the plant's canvas where the glow runs under it. */}
          <div className="relative min-w-0">
            {/* A size container: beside the md plant (about 768-900px wide) the column is too
                narrow for the full-size title and the two-column entries, which ask it for room. */}
            <div className="max-w-6xl px-5 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-20 [container-type:inline-size] sm:px-10 sm:pb-28 sm:pt-14 lg:px-14">
          <header className="max-w-4xl">
            {/* Shrinks with the column only where "experience" would not fit at full size. */}
            <LiftHeading rootRef={mainRef} className={`text-4xl leading-none tracking-[-0.045em] sm:text-[length:min(3.75rem,13cqi)] ${spaceBoards.className}`}>
              Work &amp; experience
            </LiftHeading>
            <p className={`mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg/7 ${tasaOrbiter.className}`}>
              Enterprise engineering, open-source leadership, and the communities that shaped how I build.
            </p>
           </header>

           {/* Positioned for the one spine that runs through every section's dots. */}
           <div ref={entriesRef} className="relative">
           <TimelineSpine scrollY={scrollY} />
           <section className="mt-10 sm:mt-12" aria-labelledby="professional-work">
            <h2 id="professional-work" className={`text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl ${tasaOrbiter.className}`}>
              Professional experience
            </h2>
            <div className="mt-2">
              {workData.map((curElem) => (
                <ChronoCard key={`${curElem.company}-${curElem.duration}`} curElem={curElem} />
              ))}
            </div>
          </section>

          <section className="mt-16 sm:mt-20" aria-labelledby="community-leadership">
            <div className="max-w-2xl">
              <h2 id="community-leadership" className={`text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl ${tasaOrbiter.className}`}>
                Community &amp; leadership
              </h2>
            </div>
            <div className="mt-2">
              {communityLeadershipData.map((curElem) => (
                <ChronoCard key={`${curElem.company}-${curElem.duration}`} curElem={curElem} variant="community" />
              ))}
             </div>
           </section>

           <section className="mt-16 sm:mt-20" aria-labelledby="education">
            <h2 id="education" className={`text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl ${tasaOrbiter.className}`}>
              Education
            </h2>
            {/* Two columns (dates | details) as in ChronoCard: from sm, once the column has 28rem. */}
            <article data-reveal className="relative mt-2 grid gap-4 py-8 sm:py-7 sm:[@container(min-width:28rem)]:grid-cols-[6rem_minmax(0,1fr)] sm:[@container(min-width:28rem)]:gap-6">
              <div className="flex items-start gap-3 sm:[@container(min-width:28rem)]:flex-col sm:items-start sm:[@container(min-width:28rem)]:gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] p-1">
                  <Image
                    src={`/images/work-assets/${educationData.image}`}
                    alt="University College of Science, Technology & Agriculture emblem"
                    width={56}
                    height={56}
                    className="h-full w-full object-contain invert"
                  />
                </div>
                <div className="pt-2 sm:[@container(min-width:28rem)]:hidden">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/60">
                    {educationData.duration}
                  </p>
                  <p className={`mt-1 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-accent/70 ${tasaOrbiter.className}`}>
                    {educationData.institution}
                  </p>
                </div>
                <TimelineDate duration={educationData.duration} />
              </div>
              <div className="relative grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-8 sm:[@container(min-width:28rem)]:pl-5">
                <div aria-hidden="true" data-timeline-dot className="absolute left-0 top-1 hidden h-2 w-2 sm:[@container(min-width:28rem)]:block">
                  <span className="timeline-dot-dim absolute inset-0 rounded-full bg-white/25" />
                  <span className="timeline-dot-lit absolute inset-0 rounded-full bg-white/50" />
                </div>
                <div>
                  <p className={`hidden text-[0.68rem] font-medium uppercase tracking-[0.2em] text-accent/70 sm:[@container(min-width:28rem)]:block ${tasaOrbiter.className}`}>
                    {educationData.institution}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-2xl/tight">
                    {educationData.degree}
                  </h3>
                  <p className={`mt-1 text-sm leading-6 text-white/55 ${tasaOrbiter.className}`}>{educationData.campus}</p>
                </div>
                <p className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-1 sm:text-right">
                  <span className={`text-3xl font-semibold leading-none tracking-[-0.03em] text-white tabular-nums sm:text-4xl/none ${tasaOrbiter.className}`}>
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
