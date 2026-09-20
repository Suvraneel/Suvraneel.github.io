"use client";

import Link from "next/link";
import useSound from "use-sound";
import { motion } from "framer-motion";
import Canvas from "@components/Particle";
import { spaceBoards, tasaOrbiter } from "@font";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as gtag from "@lib/gtag";
import { useDashboardScene } from "@components/DashboardScene";

const About = () => {
  const router = useRouter();
  const { app: splineApp, revealForReturn } = useDashboardScene();
  const isReturning = useRef(false);
  const scrollIntent = useRef(0);
  const lastWheelAt = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isExiting, setExiting] = useState(false);
  const snapSfx = "./sounds/snap.wav";
  const confirmSfx = "./sounds/confirm.wav";
  const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.25 });
  const [playConfirm] = useSound(confirmSfx, { volume: 0.25 });

  const returnToDashboard = useCallback(() => {
    if (isReturning.current) return;

    isReturning.current = true;
    setExiting(true);
    gtag.event({
      action: "dashboard_return_started",
      category: "portfolio_navigation",
      label: "about_to_home",
      value: 1,
    });
    const startDashboardReturn = () => {
      if (prefersReducedMotion || !splineApp) {
        router.push("/");
        return;
      }

      const flipRig = splineApp.findObjectByName("Dashboard Flip Rig");

      if (!flipRig) {
        router.push("/");
        return;
      }

      // The global canvas stays mounted, so this is a true reverse flip rather
      // than a newly loaded Home scene appearing after navigation.
      flipRig.rotation.x = -Math.PI;
      revealForReturn();

      window.requestAnimationFrame(() => {
        const startedAt = window.performance.now();
        const duration = 420;

        const frame = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          flipRig.rotation.x = -Math.PI + Math.PI * easedProgress;

          if (progress < 1) {
            window.requestAnimationFrame(frame);
            return;
          }

          router.push("/");
        };

        window.requestAnimationFrame(frame);
      });
    };

    if (prefersReducedMotion) {
      startDashboardReturn();
      return;
    }

    // Let the About layer visibly leave before the dashboard overlays it.
    window.setTimeout(startDashboardReturn, 240);
  }, [prefersReducedMotion, revealForReturn, router, splineApp]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    // Keep the next route and its remote scene in the browser cache while the
    // visitor reads this page, so the return flip is not preceded by a cold load.
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (isReturning.current || event.ctrlKey || event.deltaY === 0) return;

      if (event.deltaY < 0 && window.scrollY > 0) return;

      event.preventDefault();
      const now = window.performance.now();

      if (now - lastWheelAt.current > 180) {
        scrollIntent.current = 0;
      }

      lastWheelAt.current = now;
      scrollIntent.current += Math.abs(event.deltaY);

      if (scrollIntent.current >= 80) {
        if (event.deltaY < 0) {
          returnToDashboard();
          return;
        }

        isReturning.current = true;
        router.push("/work");
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, true);
  }, [returnToDashboard, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches("input, textarea, select, [contenteditable='true']");

      if (isTyping || window.scrollY > 0) return;

      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        returnToDashboard();
      }

      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        isReturning.current = true;
        router.push("/work");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [returnToDashboard, router]);

  return (
      <motion.div
        initial={false}
        animate={prefersReducedMotion ? undefined : isExiting ? { opacity: 0, y: 28 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="relative min-h-[100dvh] overflow-hidden bg-black text-white"
      >
        <div className="relative z-10 grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)]">
          <section className="flex min-h-[100dvh] items-center px-5 pb-16 pt-24 sm:px-10 lg:pl-28 lg:pr-14 xl:pl-36 xl:pr-20">
            <div className="max-w-2xl">
              <p className="mb-5 !font-[var(--font-TASAOrb)] text-xs font-medium uppercase tracking-[0.2em] text-[#9bb7c0]">
                Profile
              </p>
              <h1 className={`animated-heading max-w-xl text-5xl font-bold leading-[0.95] tracking-[-0.055em] sm:text-6xl xl:text-7xl ${spaceBoards.className}`}>
                About Me
              </h1>
              <div className="mt-8 max-w-2xl space-y-5">
                <p className={`!font-[var(--font-TASAOrb)] text-xl font-medium leading-8 tracking-[-0.025em] text-white sm:text-2xl ${tasaOrbiter.className}`}>
                  Building systems that hold up in the real world.
                </p>
                <p className={`!font-[var(--font-TASAOrb)] text-base leading-7 text-white/75 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
                  I&apos;m Suvraneel Bhuin, an Advanced Application Engineering Senior Analyst at Accenture. I build dependable backend services, integrations, and workflows for enterprise-scale products.
                </p>
                <p className={`!font-[var(--font-TASAOrb)] text-base leading-7 text-white/60 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
                  I studied Computer Science &amp; Engineering at the University of Calcutta. Open-source programmes and Web3 communities taught me to pair technical depth with clear ownership, useful documentation, and thoughtful collaboration.
                </p>
                <p className={`!font-[var(--font-TASAOrb)] text-base leading-7 text-white/60 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
                  I enjoy turning ambiguous requirements into clear, maintainable systems, then working closely with the people who rely on them.
                </p>
              </div>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="./docs/Suvraneel_Bhuin_Resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="resume-button inline-flex items-center px-6 py-3 !font-[var(--font-TASAOrb)] text-sm font-bold tracking-[0.02em] text-white transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100 motion-reduce:transform-none motion-reduce:transition-none"
                  onMouseEnter={() => playSnap()}
                  onMouseLeave={() => stopSnap()}
                  onClick={() => {
                    gtag.event({
                      action: "resume_download_opened",
                      category: "portfolio_engagement",
                      label: "about",
                      value: 1,
                    });
                    playConfirm();
                  }}
                >
                  Download resume
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center border border-white/25 px-5 py-3 !font-[var(--font-TASAOrb)] text-sm font-bold tracking-[0.02em] text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </section>
          <aside aria-label="Portrait of Suvraneel Bhuin" className="relative hidden min-h-[100dvh] overflow-hidden border-l border-white/10 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_54%,rgba(139,205,215,0.13),transparent_48%)]" />
            <div className="absolute inset-0 flex items-end justify-center opacity-90">
              <Canvas />
            </div>
          </aside>
        </div>
      </motion.div>
  );
};

export default About;
