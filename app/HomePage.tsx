"use client";

import "../styles/Home.module.css";
import Image from "next/image";
import { motion, useSpring } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { SPLINE_MIN_WIDTH, useDashboardScene } from "@components/DashboardScene";
import LiquidMetalButton from "@components/LiquidMetalButton";
import PillButton from "@components/PillButton";
import { usePageTransition } from "@components/transition/PageTransitionProvider";
import {
  gestureGate,
  getTransition,
  isInFlight,
  isTransitionLocked,
  useTransitionState,
} from "@components/transition/transitionStore";
import { spaceBoards, tasaOrbiter } from "@font";
import { isDialogOpen, isDrawerOpen } from "@lib/pageTransition";

/** Wheel intent (px of deltaY) that turns the dashboard over to About. */
const FLIP_INTENT = 80;
/** A pause this long (ms) lapses the wheel intent. */
const INTENT_WINDOW_MS = 180;
/** How far wheel intent turns the dashboard toward its flip before it commits (radians, ~8deg). */
const PRE_TILT_MAX = 0.14;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const readReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const readReducedMotionOnServer = () => false;

/**
 * Home has been seen at phone width this session (then widened or rotated past
 * it). Kept outside the component so a Home remounted by a navigation still knows.
 */
let homeSeenNarrow = false;

/**
 * About's desktop portrait, warmed from Home. Held for the session: an
 * unreferenced Image can be collected, and About would fetch the photo again.
 */
let aboutPortrait: HTMLImageElement | null = null;

/** A flip or unflip in flight drives the rig itself. */
const flipOwnsRig = () => {
  const t = getTransition();
  return isInFlight(t) && (t.kind === "flip" || t.kind === "unflip");
};

const Home = () => {
  const { navigate } = usePageTransition();
  const { isReady, sceneViewport, sceneFailed, preloaderActive, getRig, setFlip, setHeroShown } = useDashboardScene();
  const transition = useTransitionState();
  const scrollIntent = useRef(0);
  const lastWheelAt = useRef(0);
  const preloaderActiveRef = useRef(preloaderActive);
  // False on the server and while hydrating (matching the server HTML), the live
  // setting after: a Home remounted by a navigation reads it on its first render,
  // so under reduced motion its hero skips the entrance.
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    readReducedMotionOnServer
  );
  // Wheel intent turns the dashboard a little toward its flip, a spring that
  // settles back if the wheel stops short. The flip that commits starts from
  // wherever the tilt has the rig (startFlip reads its rotation).
  const preTilt = useSpring(0, { stiffness: 260, damping: 28 });
  const preTilting = useRef(false);
  const preTiltIdle = useRef(0);
  const canPreTiltRef = useRef(false);
  /** Home has been seen at phone width (homeSeenNarrow). */
  const [wasNarrow, setWasNarrow] = useState(
    () => homeSeenNarrow || (typeof window !== "undefined" && window.innerWidth <= SPLINE_MIN_WIDTH)
  );
  // Wide screens show the 3D dashboard instead of this hero. A phone widened
  // past SPLINE_MIN_WIDTH, or a scene that failed, keeps the hero on screen
  // until the scene is ready, so Home is never empty. Arriving from another
  // page while the scene loads keeps the dashboard's own backdrop, as before.
  const heroLive = sceneViewport && !isReady && !preloaderActive && (wasNarrow || sceneFailed);
  // Held through a flight into or out of Home: the scene turning ready mid-flight
  // would otherwise swap the hero out while the sheet is still moving. It swaps
  // once the page has settled, as it does at rest.
  const homeFlight = isInFlight(transition) && (transition.from === "/" || transition.to === "/");
  const [heldHero, setHeldHero] = useState(heroLive);
  if (!homeFlight && heldHero !== heroLive) setHeldHero(heroLive);
  const heroOnScreen = homeFlight ? heldHero : heroLive;

  // The scene's layer stacks under the hero while it is on screen (DashboardScene).
  useLayoutEffect(() => {
    setHeroShown(heroOnScreen);
  }, [heroOnScreen, setHeroShown]);
  useLayoutEffect(() => () => setHeroShown(false), [setHeroShown]);

  useEffect(() => {
    if (wasNarrow) homeSeenNarrow = true;
  }, [wasNarrow]);

  useEffect(() => {
    const narrow = window.matchMedia(`(max-width: ${SPLINE_MIN_WIDTH}px)`);
    const onChange = () => {
      if (narrow.matches) setWasNarrow(true);
    };
    narrow.addEventListener("change", onChange);
    return () => narrow.removeEventListener("change", onChange);
  }, []);

  // The page transition owns the dashboard flip: About pushes up while the
  // rig turns, so the two read as one motion.
  const flipToAbout = useCallback(
    (source: "sequence" | "key") => navigate("/about", { source }),
    [navigate]
  );

  // Read through refs, so the wheel listener is not re-added when the preloader ends.
  useEffect(() => {
    preloaderActiveRef.current = preloaderActive;
  }, [preloaderActive]);

  // About's portrait (desktop only) is warmed once the scene is up, or has given
  // way to the static hero, so a first flip to About never shows the photo
  // arriving partway through.
  useEffect(() => {
    if (aboutPortrait || !(isReady || sceneFailed) || !window.matchMedia("(min-width: 1024px)").matches) return;
    aboutPortrait = new window.Image();
    aboutPortrait.src = "/images/Suvraneel_DP.jpeg";
  }, [isReady, sceneFailed]);

  // Under reduced motion the flip is a fade, so the rig is never turned partway.
  useEffect(() => {
    canPreTiltRef.current = isReady && !prefersReducedMotion;
  }, [isReady, prefersReducedMotion]);

  useEffect(
    () =>
      preTilt.on("change", (rotation) => {
        if (preTilting.current && !flipOwnsRig()) setFlip(rotation);
      }),
    [preTilt, setFlip]
  );

  /** Stops the tilt where it is and lets go of the rig, for a flip to carry on from there. */
  const handOffTilt = useCallback(() => {
    window.clearTimeout(preTiltIdle.current);
    preTilting.current = false;
    preTilt.jump(preTilt.get());
  }, [preTilt]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaY <= 0 || isTransitionLocked()) return;
      // The tail of the gesture that brought the visitor here never counts
      // (the provider's wheel gate holds it).
      if (gestureGate.swallow(event)) return;
      // While navigate() would refuse the flip (open drawer or dialog, preloader
      // up), the wheel is left to the page.
      if (preloaderActiveRef.current || isDialogOpen() || isDrawerOpen() || !gestureGate.canStart()) return;

      event.preventDefault();
      const now = window.performance.now();

      if (now - lastWheelAt.current > INTENT_WINDOW_MS) {
        scrollIntent.current = 0;
      }

      lastWheelAt.current = now;
      scrollIntent.current += event.deltaY;

      if (scrollIntent.current >= FLIP_INTENT && flipToAbout("sequence")) {
        scrollIntent.current = 0;
        handOffTilt();
        return;
      }

      if (!canPreTiltRef.current) return;
      if (!preTilting.current) {
        // From the rig's own rotation (a flip that never committed may have reset it).
        preTilt.jump(Number(getRig()?.rotation.x ?? 0));
        preTilting.current = true;
      }
      preTilt.set(-PRE_TILT_MAX * Math.min(1, scrollIntent.current / FLIP_INTENT));
      window.clearTimeout(preTiltIdle.current);
      preTiltIdle.current = window.setTimeout(() => preTilt.set(0), INTENT_WINDOW_MS);
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener("wheel", handleWheel, true);
      window.clearTimeout(preTiltIdle.current);
    };
  }, [flipToAbout, getRig, handOffTilt, preTilt]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTransitionLocked()) return;
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches("input, textarea, select, [contenteditable='true']");
      // Space and arrows belong to a focused control (e.g. Space activates a button).
      const isControl = target?.matches("a[href], button, summary, [role='button'], [role='link']");

      if (isTyping || isControl || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (!["ArrowDown", "PageDown", " "].includes(event.key)) return;

      // The key is only taken by a flip that starts; one navigate() refuses
      // (open drawer, preloader up) leaves it to the page.
      if (flipToAbout("key")) {
        event.preventDefault();
        handOffTilt();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipToAbout, handOffTilt]);

  return (
    <main
      className={`min-h-[100dvh] max-[550px]:relative max-[550px]:z-10 ${heroOnScreen ? "relative z-10" : ""}`}
    >
      {/* Phones never load the 3D dashboard, so this hero is their landing view. */}
      <section
        aria-label="Portfolio introduction"
        className={`flex min-h-[100dvh] flex-col justify-start px-5 pb-10 pt-8 text-white ${
          heroOnScreen ? "nav-gap" : "min-[551px]:sr-only"
        }`}
      >
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-square w-40 max-w-full overflow-hidden rounded-2xl"
        >
          {/* The phone LCP: a copy cut for its 180px box (w-40 at the 18px root; 540px
              covers 3x screens, and the export has no image optimizer), fetched ahead
              of the scripts. */}
          <Image
            src="/images/Suvraneel_DP-540.webp"
            alt="Black-and-white portrait of Suvraneel Bhuin"
            fill
            loading="eager"
            fetchPriority="high"
            sizes="180px"
            className="object-cover grayscale"
          />
        </motion.div>
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5"
        >
          <h1 className={`text-[1.5rem] leading-[1.05] tracking-normal min-[320px]:text-[1.8rem] min-[360px]:text-[2.1rem] min-[390px]:text-[2.4rem] min-[480px]:text-[2.6rem] ${spaceBoards.className}`}>
            Suvraneel Bhuin
          </h1>
          <h2 className={`mt-2 max-w-[28ch] text-lg font-bold leading-7 text-white ${tasaOrbiter.className}`}>
            I build products, systems, and the things in between.
          </h2>
          <p className={`max-w-[32ch] text-base leading-7 text-white/70 ${tasaOrbiter.className}`}>
            <span className="block">Software engineer by profession. <br/>Product builder by instinct.</span>
            <span className="mt-3 block">I like simplifying complex problems and building from interface to system.</span>
          </p>
          <p className={`mt-3 text-sm leading-6 text-white/55 ${tasaOrbiter.className}`}>
            Currently at Accenture.
          </p>
        </motion.div>
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          // Phone-only actions: on wider screens this hero is visually hidden (sr-only), so keep its buttons out of the tab order too.
          className="mt-4 grid w-full grid-cols-2 gap-3 min-[551px]:hidden"
        >
          <LiquidMetalButton href="/work" mobileOnly className="h-[54px] w-full">
            Explore my work
          </LiquidMetalButton>
          <PillButton href="https://suvraneel.bio.link" target="_blank" rel="noreferrer" className="h-[54px] w-full px-3">
            Contact me
          </PillButton>
        </motion.div>
      </section>
    </main>
  );
};

export default Home;
