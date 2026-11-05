"use client";

import Image from "next/image";
import { motion, useSpring } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { SPLINE_MIN_WIDTH, useDashboardScene } from "@components/DashboardScene";
import DepthPortrait from "@components/DepthPortrait";
import LiquidMetalButton from "@components/LiquidMetalButton";
import PillButton from "@components/PillButton";
import { usePageTransition } from "@components/transition/PageTransitionProvider";
import { warmPortrait } from "@components/transition/avatarPortrait";
import {
  gestureGate,
  getTransition,
  isInFlight,
  isTransitionLocked,
  useTransitionState,
} from "@components/transition/transitionStore";
import { spaceBoards, tasaOrbiter } from "@font";
import { isDialogOpen, isDrawerOpen } from "@lib/pageTransition";
import { PORTRAIT_COLUMN_MEDIA } from "@lib/portrait";
import { needsTiltPermission, requestTilt, subscribeTiltState } from "@lib/tilt";

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
const readNeedsTiltOnServer = () => false;

/**
 * Home has been seen at phone width this session (then widened or rotated past
 * it). Kept outside the component so a Home remounted by a navigation still knows.
 */
let homeSeenNarrow = false;

/** The phone hero's photo; its relief samples the same file, so it is fetched once. */
const HERO_PHOTO = "/images/Suvraneel_DP-540.webp";
/** Phones: where the hero is the landing view (the 3D dashboard never loads). */
const HERO_RELIEF_MEDIA = `(max-width: ${SPLINE_MIN_WIDTH}px)`;
/** The square photo fills its square frame, centred. */
const HERO_PHOTO_POSITION: [number, number] = [0.5, 0.5];

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
  // The hero photo turns in relief on phones with a GPU (DepthPortrait). On iOS it follows the
  // phone's tilt only once a tap on the chip has asked for it; until then it drifts and follows touch.
  const [relief, setRelief] = useState(false);
  const needsTilt = useSyncExternalStore(subscribeTiltState, needsTiltPermission, readNeedsTiltOnServer);
  // Hidden once tapped, whatever the answer: a refusal is not asked again.
  const [tiltAsked, setTiltAsked] = useState(false);
  const showTiltChip = relief && needsTilt && !tiltAsked;
  const askForTilt = useCallback(() => {
    setTiltAsked(true);
    void requestTilt();
  }, []);
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

  // About's portrait (desktop only) is warmed and decoded once the scene is up,
  // or has given way to the static hero, so a first flip to About never shows
  // the photo arriving partway through (the avatar opens into it).
  useEffect(() => {
    if (!(isReady || sceneFailed) || !window.matchMedia(PORTRAIT_COLUMN_MEDIA).matches) return;
    warmPortrait();
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
            src={HERO_PHOTO}
            alt="Black-and-white portrait of Suvraneel Bhuin"
            fill
            loading="eager"
            fetchPriority="high"
            sizes="180px"
            className="object-cover grayscale"
          />
          <DepthPortrait
            src={HERO_PHOTO}
            depthSrc="/images/Suvraneel_DP-depth.webp"
            media={HERO_RELIEF_MEDIA}
            position={HERO_PHOTO_POSITION}
            onReady={setRelief}
            tilt
            className="absolute inset-0"
          />
          {showTiltChip && (
            <motion.button
              type="button"
              onClick={askForTilt}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              // The chip is small; its tap area reaches past it to 44px.
              className={`absolute bottom-2 left-2 inline-flex h-7 items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-2.5 text-[11px] leading-none text-white/85 backdrop-blur-md before:absolute before:-inset-2 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97] ${tasaOrbiter.className}`}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 -rotate-12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="2" width="12" height="20" rx="2.5" />
                <path d="M11 18h2" />
              </svg>
              Tilt to look around
            </motion.button>
          )}
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
          <h2 className={`mt-2 max-w-[28ch] text-lead font-bold leading-[1.4] text-white ${tasaOrbiter.className}`}>
            I build products, systems, and the things in between.
          </h2>
          <p className={`max-w-[32ch] text-body leading-[1.65] text-white/70 ${tasaOrbiter.className}`}>
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
