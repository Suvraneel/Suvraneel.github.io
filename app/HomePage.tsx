"use client";

import "../styles/Home.module.css";
import Image from "next/image";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SPLINE_MIN_WIDTH, useDashboardScene } from "@components/DashboardScene";
import LiquidMetalButton from "@components/LiquidMetalButton";
import PillButton from "@components/PillButton";
import { usePageTransition } from "@components/transition/PageTransitionProvider";
import { gestureGate, isTransitionLocked } from "@components/transition/transitionStore";
import { spaceBoards, tasaOrbiter } from "@font";
import { isDialogOpen, isDrawerOpen } from "@lib/pageTransition";

const Home = () => {
  const { navigate } = usePageTransition();
  const { isReady, sceneViewport, sceneFailed, preloaderActive } = useDashboardScene();
  const scrollIntent = useRef(0);
  const lastWheelAt = useRef(0);
  const preloaderActiveRef = useRef(preloaderActive);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  /** Home has been seen at phone width (then widened or rotated past it). */
  const [wasNarrow, setWasNarrow] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= SPLINE_MIN_WIDTH
  );
  // Wide screens show the 3D dashboard instead of this hero. A phone widened
  // past SPLINE_MIN_WIDTH, or a scene that failed, keeps the hero on screen
  // until the scene is ready, so Home is never empty. Arriving from another
  // page while the scene loads keeps the dashboard's own backdrop, as before.
  const heroOnScreen = sceneViewport && !isReady && !preloaderActive && (wasNarrow || sceneFailed);

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

  // Read through a ref, so the wheel listener is not re-added when the preloader ends.
  useEffect(() => {
    preloaderActiveRef.current = preloaderActive;
  }, [preloaderActive]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

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

      if (now - lastWheelAt.current > 180) {
        scrollIntent.current = 0;
      }

      lastWheelAt.current = now;
      scrollIntent.current += event.deltaY;

      if (scrollIntent.current >= 80 && flipToAbout("sequence")) {
        scrollIntent.current = 0;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, true);
  }, [flipToAbout]);

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
      if (flipToAbout("key")) event.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipToAbout]);

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
          <Image
            src="/images/Suvraneel_DP.jpeg"
            alt="Sketch portrait of Suvraneel Bhuin wearing headphones"
            fill
            priority
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
          <h1 className={`text-[1.5rem] font-bold leading-[1.05] tracking-normal min-[320px]:text-[1.8rem] min-[360px]:text-[2.1rem] min-[390px]:text-[2.4rem] min-[480px]:text-[2.6rem] ${spaceBoards.className}`}>
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
