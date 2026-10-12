"use client";

import useSound from "use-sound";
import Canvas from "@components/Particle";
import { spaceBoards, tasaOrbiter } from "@font";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as gtag from "@lib/gtag";
import LiquidMetalButton from "@components/LiquidMetalButton";
import PillButton from "@components/PillButton";
import { usePageTransition } from "@components/transition/PageTransitionProvider";
import { gestureGate, isTransitionLocked } from "@components/transition/transitionStore";

const isAtPageBottom = () =>
  window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

const About = () => {
  const router = useRouter();
  const { navigate } = usePageTransition();
  const scrollIntent = useRef(0);
  const lastWheelAt = useRef(0);
  const snapSfx = "/sounds/snap.wav";
  const confirmSfx = "/sounds/confirm.wav";
  const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.25 });
  const [playConfirm] = useSound(confirmSfx, { volume: 0.25 });

  useEffect(() => {
    // Keep the next route and its remote scene in the browser cache while the
    // visitor reads this page, so the return flip is not preceded by a cold load.
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (isTransitionLocked() || event.ctrlKey || event.deltaY === 0) return;

      // The tail of the gesture that brought the visitor here never counts.
      if (gestureGate.swallow(event)) {
        event.preventDefault();
        return;
      }

      if (event.deltaY < 0 && window.scrollY > 0) return;

      // Let About's own content scroll first; the hand-off to Work happens
      // only once the reader reaches the bottom of the page.
      if (event.deltaY > 0 && !isAtPageBottom()) {
        scrollIntent.current = 0;
        return;
      }

      event.preventDefault();
      const now = window.performance.now();

      if (now - lastWheelAt.current > 180) {
        scrollIntent.current = 0;
      }

      lastWheelAt.current = now;
      scrollIntent.current += Math.abs(event.deltaY);

      if (scrollIntent.current < 80) return;

      // The page transition plays the reverse dashboard flip on the way home.
      const started =
        event.deltaY < 0
          ? navigate("/", { source: "sequence" })
          : navigate("/work", { source: "sequence", arrival: "top" });
      if (started) scrollIntent.current = 0;
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, true);
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTransitionLocked()) return;
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches("input, textarea, select, [contenteditable='true']");
      // Space and arrows belong to a focused control (e.g. Space activates a button).
      const isControl = target?.matches("a[href], button, summary, [role='button'], [role='link']");

      if (isTyping || isControl || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      if (["ArrowUp", "PageUp"].includes(event.key) && window.scrollY <= 0) {
        event.preventDefault();
        navigate("/", { source: "key" });
      }

      if (["ArrowDown", "PageDown", " "].includes(event.key) && isAtPageBottom()) {
        event.preventDefault();
        navigate("/work", { source: "key", arrival: "top" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
      <div className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
        <div className="relative z-10 grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)]">
          <section className="flex min-h-[100dvh] items-start px-5 pb-12 pt-16 sm:px-10 sm:pb-16 sm:pt-20 lg:items-center lg:pl-28 lg:pr-14 xl:pl-36 xl:pr-20">
            <div className="max-w-2xl">
              <p className={`mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent/70 ${tasaOrbiter.className}`}>
                Profile
              </p>
              <h1 className={`animated-heading max-w-xl text-4xl font-bold leading-none tracking-[-0.045em] sm:text-6xl ${spaceBoards.className}`}>
                About Me
              </h1>
              <div className="mt-8 max-w-2xl space-y-5">
                <p className={`text-xl font-medium leading-8 tracking-[-0.025em] text-white sm:text-2xl ${tasaOrbiter.className}`}>
                  I like building things that are useful, not just impressive.
                </p>
                <p className={`text-base leading-7 text-white/75 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
                  I&apos;m Suvraneel Bhuin, an Advanced Application Engineering Senior Analyst at Accenture. I build dependable backend services, integrations, and workflows for enterprise-scale products.
                </p>
                <p className={`text-base leading-7 text-white/60 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
                  I studied Computer Science &amp; Engineering at the University of Calcutta. Open-source programmes and Web3 communities taught me to pair technical depth with clear ownership, useful documentation, and thoughtful collaboration.
                </p>
                <p className={`text-base leading-7 text-white/60 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
                  I like turning ambiguous requirements into clear, maintainable systems and working closely with the people who rely on them.
                </p>
              </div>
              <div className="mt-9 flex flex-wrap gap-3">
                <LiquidMetalButton
                  href="/docs/Suvraneel_Bhuin_Resume.pdf"
                  target="_blank"
                  rel="noreferrer"
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
                </LiquidMetalButton>
                <PillButton href="/contact">Get in touch</PillButton>
              </div>
            </div>
          </section>
          <aside aria-label="Portrait of Suvraneel Bhuin" className="relative hidden min-h-[100dvh] overflow-hidden border-l border-white/10 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_54%,rgba(139,205,215,0.13),transparent_48%)]" />
            <div className="absolute inset-0 flex items-end justify-center opacity-90 pointer-events-none">
              <Canvas />
            </div>
          </aside>
        </div>
      </div>
  );
};

export default About;
