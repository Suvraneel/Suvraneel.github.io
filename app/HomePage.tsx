"use client";

import "../styles/Home.module.css";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LiquidMetalButton from "@components/LiquidMetalButton";
import * as gtag from "@lib/gtag";
import { useDashboardScene } from "@components/DashboardScene";
import { spaceBoards, tasaOrbiter } from "@font";

const Home = () => {
  const router = useRouter();
  const { app: splineApp } = useDashboardScene();
  const isTransitioning = useRef(false);
  const scrollIntent = useRef(0);
  const lastWheelAt = useRef(0);
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
      return;
    }

    const flipRig = splineApp.findObjectByName("Dashboard Flip Rig");

    if (!flipRig) {
      console.warn("Dashboard flip rig is not ready; keeping the visitor on Home.");
      isTransitioning.current = false;
      return;
    }

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
    <main className="min-h-[100dvh] max-[550px]:relative max-[550px]:z-10">
      {/* Phones never load the 3D dashboard, so this hero is their landing view. */}
      <section
        aria-label="Portfolio introduction"
        className="flex min-h-[100dvh] flex-col justify-start px-5 pb-10 pt-8 text-white min-[551px]:sr-only"
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
          className="mt-4"
        >
          <h1 className={`text-[1.5rem] font-bold leading-[1.05] tracking-normal min-[320px]:text-[1.8rem] min-[360px]:text-[2.1rem] min-[390px]:text-[2.4rem] min-[480px]:text-[2.6rem] ${spaceBoards.className}`}>
            Suvraneel Bhuin
          </h1>
          <p className={`mt-4 max-w-[32ch] text-base leading-7 text-white/70 ${tasaOrbiter.className}`}>
            <span className="block">Sr. Software Engineer at Accenture.</span>
            <span className="mt-4 block">I build backend systems beyond the happy path, turning complex problems into software people can trust.</span>
          </p>
        </motion.div>
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 grid w-full grid-cols-2 gap-3"
        >
          <LiquidMetalButton href="/work" mobileOnly className="h-[54px] w-full">
            View work
          </LiquidMetalButton>
          <Link
            href="https://suvraneel.bio.link"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-[54px] w-full items-center justify-center rounded-full border border-white/25 px-3 py-0 text-sm font-bold text-white transition active:scale-[0.98]"
          >
            Get in touch
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default Home;
