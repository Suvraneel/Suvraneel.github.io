"use client";

import "../styles/Home.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as gtag from "@lib/gtag";
import { useDashboardScene } from "@components/DashboardScene";

const Home = () => {
  const router = useRouter();
  const { app: splineApp, isReady: isSceneReady } = useDashboardScene();
  const isTransitioning = useRef(false);
  const scrollIntent = useRef(0);
  const lastWheelAt = useRef(0);
  const [isFlipping, setFlipping] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const animateFlipRig = useCallback(
    (flipRig: any, targetRotation: number, onComplete?: () => void) => {
      const startRotation = flipRig.rotation.x;
      const duration = 420;
      const startedAt = window.performance.now();

      const frame = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        flipRig.rotation.x =
          startRotation + (targetRotation - startRotation) * easedProgress;

        if (progress < 1) {
          window.requestAnimationFrame(frame);
          return;
        }

        onComplete?.();
      };

      window.requestAnimationFrame(frame);
    },
    []
  );

  const flipToAbout = useCallback(() => {
    if (isTransitioning.current) return;

    isTransitioning.current = true;
    setFlipping(true);
    gtag.event({
      action: "dashboard_flip_started",
      category: "portfolio_navigation",
      label: "home_to_about",
      value: 1,
    });

    if (prefersReducedMotion) {
      router.push("/about");
      return;
    }

    if (!splineApp) {
      isTransitioning.current = false;
      setFlipping(false);
      return;
    }

    const flipRig = splineApp.findObjectByName("Dashboard Flip Rig");

    if (!flipRig) {
      console.warn("Dashboard flip rig is not ready; keeping the visitor on Home.");
      isTransitioning.current = false;
      setFlipping(false);
      return;
    }

    const blob = splineApp.findObjectByName("Blob | Primary");

    // if (blob) blob.visible = false;

    animateFlipRig(flipRig, -Math.PI, () => {
      gtag.event({
        action: "dashboard_flip_completed",
        category: "portfolio_navigation",
        label: "home_to_about",
        value: 1,
      });
      router.push("/about");
    });
  }, [animateFlipRig, prefersReducedMotion, router, splineApp]);

  useEffect(() => {
    if (window.innerWidth < 550) {
      window.location.replace("https://suvraneel.bio.link/");
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaY <= 0 || isTransitioning.current) return;

      event.preventDefault();
      const now = window.performance.now();

      if (now - lastWheelAt.current > 180) {
        scrollIntent.current = 0;
      }

      lastWheelAt.current = now;
      scrollIntent.current += event.deltaY;

      if (scrollIntent.current >= 80) {
        flipToAbout();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, true);
  }, [flipToAbout]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches("input, textarea, select, [contenteditable='true']");

      if (isTyping || !["ArrowDown", "PageDown", " "].includes(event.key)) return;

      event.preventDefault();
      flipToAbout();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipToAbout]);

  return (
    <div className="h-screen">
        {isSceneReady && !isFlipping && (
          <div
            className="pointer-events-none fixed inset-x-0 bottom-3 z-10 flex justify-center"
            aria-hidden="true"
          >
            <span className="inline-flex h-8 min-w-[184px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-black/20 px-5 text-[10px] uppercase leading-none tracking-[0.22em] text-white/70 backdrop-blur-sm">
              <span>Scroll to explore</span>
              <span className="text-sm leading-none text-white">↓</span>
            </span>
          </div>
        )}
    </div>
  );
};

export default Home;
