"use client";

import Image from "next/image";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import type { Application } from "@splinetool/runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import ChronoCard from "@components/ChronoCard";
import FrameSequence from "@components/FrameSequence";
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

/**
 * Phones get the plant as frames recorded from the scene (61, one per step of its
 * scroll event; public/images/work-plant), scrubbed by the same progress. Each
 * frame is the scene's middle, 400 x 360 CSS px of a 720px square view at 2x.
 */
const PHONE_PLANT_MEDIA = "(max-width: 767.98px)";
const PLANT_FRAME_COUNT = 61;
const PLANT_FRAME_ASPECT = 400 / 360;
const plantFrame = (index: number) => `/images/work-plant/${String(index).padStart(2, "0")}.webp`;
/**
 * Scrolled this far (px), the phone plant has dimmed to PHONE_PLANT_DIM: before the entries
 * cross its leaves, and far enough that small text over the leaves keeps 4.5:1.
 */
const PHONE_PLANT_DIM_BY = 240;
const PHONE_PLANT_DIM = 0.2;
/**
 * Where the plant shows in its frames (shares of a frame's height, across all 61): its tallest
 * leaves start at 0.07, the floor glow fades out by 0.8. That band is what fills the room under
 * the intro; the rest of the frame (black, under the edge mask) may run past it.
 */
const PLANT_VISIBLE_TOP = 0.07;
const PLANT_VISIBLE_BOTTOM = 0.8;
/**
 * Widest the phone plant gets: past the screen's edges only its glow's faded rim goes. The slot's
 * cap in CSS is the visible band at this width: min(120vw, 34rem) x 0.9 (the frame's height) x 0.73.
 */
const PHONE_PLANT_MAX_VW = 1.2;
const PHONE_PLANT_MAX_REM = 34;
/** Its width once it rests at the foot of the screen behind the entries (as before: 96vw at most). */
const PHONE_PLANT_REST_VW = 0.96;

/** The plant's progress where Work stands. In flight, the edge the lift lands at decides: a backward link lands at Work's top. */
function arrivalProgress(main: HTMLElement) {
  const t = getTransition();
  const edge = t && !t.settled && t.to === "/work" && typeof t.arrival === "string" ? t.arrival : null;
  const range = main.scrollHeight - main.clientHeight;
  return edge === "bottom" ? 1 : edge === "top" ? 0 : range > 0 ? main.scrollTop / range : 0;
}

/**
 * Places Work's phone plant: at the top, its visible band (PLANT_VISIBLE_*) fills the slot under
 * the intro (sized in CSS from the intro's height, which this keeps in --intro-h); over the first
 * PHONE_PLANT_DIM_BY px of scroll it sinks until its frame's foot meets the screen's, narrowing to
 * its resting width. Read from layout (no transforms) whenever the intro, the slot or the page
 * changes size; the scroll only moves it.
 */
function usePhonePlantLayout(
  mainRef: RefObject<HTMLElement | null>,
  headerRef: RefObject<HTMLElement | null>,
  slotRef: RefObject<HTMLElement | null>,
  boxRef: RefObject<HTMLElement | null>,
  scrollY: MotionValue<number>,
  y: MotionValue<number>,
  scale: MotionValue<number>
) {
  useLayoutEffect(() => {
    const main = mainRef.current;
    const header = headerRef.current;
    const slot = slotRef.current;
    const box = boxRef.current;
    if (!main || !header || !slot || !box) return;
    const query = window.matchMedia(PHONE_PLANT_MEDIA);
    let travel = 0;
    let restScale = 1;

    const follow = (scrolled: number) => {
      const t = Math.min(Math.max(scrolled / PHONE_PLANT_DIM_BY, 0), 1);
      y.set(travel * t);
      scale.set(1 + (restScale - 1) * t);
    };

    const place = () => {
      slot.style.setProperty("--intro-h", `${header.offsetHeight}px`);
      const room = slot.offsetHeight;
      if (!query.matches || room === 0) {
        box.removeAttribute("data-placed");
        return;
      }
      const width = main.clientWidth;
      const rem = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
      const band = PLANT_VISIBLE_BOTTOM - PLANT_VISIBLE_TOP;
      const widest = Math.min(width * PHONE_PLANT_MAX_VW, PHONE_PLANT_MAX_REM * rem);
      const height = Math.min(room / band, widest / PLANT_FRAME_ASPECT);
      const frameWidth = height * PLANT_FRAME_ASPECT;
      // The visible band centred in the slot (the slot's CSS cap keeps the two the same height).
      const top = layoutTop(slot) - layoutTop(main) + room / 2 - ((PLANT_VISIBLE_TOP + PLANT_VISIBLE_BOTTOM) / 2) * height;
      box.style.top = `${top}px`;
      box.style.width = `${frameWidth}px`;
      box.style.height = `${height}px`;
      travel = Math.max(0, main.clientHeight - (top + height));
      restScale = Math.min(1, (width * PHONE_PLANT_REST_VW) / frameWidth);
      box.setAttribute("data-placed", "");
      follow(main.scrollTop);
    };

    place();
    const resizer = new ResizeObserver(place);
    resizer.observe(header);
    resizer.observe(slot);
    resizer.observe(main);
    query.addEventListener("change", place);
    const stopScroll = scrollY.on("change", follow);
    return () => {
      resizer.disconnect();
      query.removeEventListener("change", place);
      stopScroll();
    };
  }, [mainRef, headerRef, slotRef, boxRef, scrollY, y, scale]);
}

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
      // The content, not main's first child: on phones that is the plant's fixed-size stage.
      const content = main.querySelector("[data-work-content]");
      if (content) resizeObserver.observe(content);
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
  // Its column is display:none below md; an invisible canvas would still load
  // a Spline runtime. Mounted again later, the plant syncs on load (scrubPlant).
  const plantShown = useSyncExternalStore(subscribePlantQuery, isPlantShown, isPlantShownOnServer);
  // Full under the intro; dimmed once the entries scroll over it, so they read first.
  const phonePlantOpacity = useTransform(scrollY, [0, PHONE_PLANT_DIM_BY], [1, PHONE_PLANT_DIM]);
  const headerRef = useRef<HTMLElement>(null);
  const plantSlotRef = useRef<HTMLDivElement>(null);
  const plantBoxRef = useRef<HTMLDivElement>(null);
  const phonePlantY = useMotionValue(0);
  const phonePlantScale = useMotionValue(1);
  usePhonePlantLayout(mainRef, headerRef, plantSlotRef, plantBoxRef, scrollY, phonePlantY, phonePlantScale);

  useReveal(entriesRef, { rootRef: mainRef });
  useTimelineDots(mainRef, scrollY);

  // The plant follows <main>'s scroll: full at the top (today), back to its pot
  // at the bottom (where it started). Reduced motion drops the trailing settle.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const reduced = prefersReducedMotion();
    // Starts where the page lands (Back restores part way down, a backward lift lands at the
    // bottom): the phone plant has no scene load to sync it, and the spring would otherwise
    // play it all the way there from the full plant as the page arrives.
    const stopWaiting = whenPlaced(main, () => {
      const progress = arrivalProgress(main);
      plantTarget.jump(progress);
      plantProgress.jump(progress);
    });
    const stopScroll = scrollY.on("change", (y) => {
      const range = main.scrollHeight - main.clientHeight;
      const progress = range > 0 ? y / range : 0;
      if (reduced) plantProgress.jump(progress);
      else plantTarget.set(progress);
    });
    const stopSeek = plantProgress.on("change", (progress) => seekPlant.current?.(progress));
    return () => {
      stopWaiting();
      stopScroll();
      stopSeek();
      seekPlant.current = null;
    };
  }, [scrollY, plantTarget, plantProgress]);

  // A hidden plant is unmounted (its runtime disposed); stop seeking it. Shown
  // again, its new canvas fades in over the glow afresh.
  useEffect(() => {
    if (plantShown) return;
    seekPlant.current = null;
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

      const progress = arrivalProgress(main);
      seekPlant.current = seek;
      plantTarget.jump(progress);
      plantProgress.jump(progress);
      seek(progress);
    },
    [plantTarget, plantProgress],
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
        {/* Phones: the plant, recorded, on a stage held behind the page as it scrolls (taking no
            room: the stage's negative margin gives its height back). It starts in the room under the
            intro (usePhonePlantLayout) and, as the entries come up, sinks to the foot of the screen
            while it dims. Painted under the grid, which is positioned. */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: phonePlantOpacity }}
          // Short (landscape) phones have no room for it beside the copy.
          className="pointer-events-none sticky top-0 -mb-[100dvh] h-[100dvh] overflow-hidden md:hidden [@media(max-height:520px)]:hidden"
        >
          <motion.div
            ref={plantBoxRef}
            // Unseen until placed: before hydration nothing knows where the intro ends.
            className="invisible absolute left-1/2 top-0 data-[placed]:visible"
            style={{ x: "-50%", y: phonePlantY, scale: phonePlantScale, originY: 1 }}
          >
            <FrameSequence
              frame={plantFrame}
              count={PLANT_FRAME_COUNT}
              progress={plantProgress}
              media={PHONE_PLANT_MEDIA}
              aspect={PLANT_FRAME_ASPECT}
              className="phone-plant absolute inset-0 h-full w-full"
            />
          </motion.div>
        </motion.div>
        <div data-work-content className="min-h-[100dvh] grid md:grid-cols-[16rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)] 2xl:grid-cols-[24rem_minmax(0,1fr)] gap-0">
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
          <header ref={headerRef} className="max-w-4xl">
            {/* Shrinks with the column only where "experience" would not fit at full size. */}
            <LiftHeading rootRef={mainRef} className={`text-[length:min(var(--text-display),13cqi)] leading-none tracking-[-0.045em] ${spaceBoards.className}`}>
              Work &amp; experience
            </LiftHeading>
            <p className={`mt-5 max-w-2xl text-balance text-body leading-[1.6] text-white/65 ${tasaOrbiter.className}`}>
              Enterprise engineering, open-source leadership, and the communities that shaped how I build.
            </p>
           </header>
           {/* Phones: the first screen is the title, the intro, the plant and the first heading. The
               plant's slot takes the room the intro leaves (the page's top padding, the intro, and
               8rem kept for the heading and the start of the first entry: 13rem plus the intro's
               measured height, --intro-h), and no more than the plant fills at its widest, so the
               heading always follows the plant's glow. Short landscape phones go without it. */}
           <div
             ref={plantSlotRef}
             aria-hidden="true"
             className="h-[clamp(8rem,calc(100svh-13rem-var(--intro-h,11rem)),min(78.84vw,22.34rem))] md:hidden [@media(max-height:520px)]:hidden"
           />

           {/* Positioned for the one spine that runs through every section's dots. */}
           <div ref={entriesRef} className="relative">
           <TimelineSpine scrollY={scrollY} />
           <section className="mt-10 sm:mt-12" aria-labelledby="professional-work">
            <h2 id="professional-work" className={`text-title font-semibold tracking-[-0.03em] text-white ${tasaOrbiter.className}`}>
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
              <h2 id="community-leadership" className={`text-title font-semibold tracking-[-0.03em] text-white ${tasaOrbiter.className}`}>
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
            <h2 id="education" className={`text-title font-semibold tracking-[-0.03em] text-white ${tasaOrbiter.className}`}>
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
                  <span className="timeline-dot-lit absolute inset-0 rounded-full bg-accent shadow-[0_0_12px_rgb(var(--accent)/0.6)]" />
                </div>
                <div>
                  <p className={`hidden text-[0.68rem] font-medium uppercase tracking-[0.2em] text-accent/70 sm:[@container(min-width:28rem)]:block ${tasaOrbiter.className}`}>
                    {educationData.institution}
                  </p>
                  <h3 className="mt-2 text-lead font-semibold leading-tight tracking-[-0.035em] text-white">
                    {educationData.degree}
                  </h3>
                  <p className={`mt-1 text-sm leading-6 text-white/55 ${tasaOrbiter.className}`}>{educationData.campus}</p>
                </div>
                <p className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-1 sm:text-right">
                  <span className={`text-title font-semibold leading-none tracking-[-0.03em] text-white tabular-nums ${tasaOrbiter.className}`}>
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
