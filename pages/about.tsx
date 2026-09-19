import Head from "next/head";
import useSound from "use-sound";
import { motion } from "framer-motion";
import { NextPage } from "next";
import Canvas from "@components/Particle";
import { spaceBoards, tasaOrbiter } from "@font";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import * as gtag from "@lib/gtag";
import { useDashboardScene } from "@components/DashboardScene";

const About: NextPage = () => {
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
    <>
      <Head>
        <title>About | Portfolio - Suvraneel</title>
        <meta
          name="description"
          content="About | Official Portfolio Website | Suvraneel Bhuin"
        />
        <link rel="preconnect" href="https://prod.spline.design" />
        <link
          rel="preload"
          as="fetch"
          href="https://prod.spline.design/bMG02F4Rm1UpL5wP/scene.splinecode"
          crossOrigin="anonymous"
        />
      </Head>
      <motion.div
        initial={false}
        animate={prefersReducedMotion ? undefined : isExiting ? { opacity: 0, y: 28 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-fit w-full lg:w-3/5 xl:w-1/2 absolute left-2 sm:left-32 top-2 sm:top-10 z-100 text-white flex flex-col gap-5 sm:gap-6 px-5 sm:px-0">
          <div
            className={`ml-16 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold md:mb-10 ${spaceBoards.className}`}
          >
            About Me
          </div>
          <p className={tasaOrbiter.className}>
            I am a Full Stack Web3.0 Developer based in India. I recently
            graduated with a B.Tech in Computer Science & Engineering from UCSTA,
            University of Calcutta.
          </p>
          <p className={tasaOrbiter.className}>
            As a well-organized &amp; collaborative individual, I thrive in team
            environments and enjoy bringing innovative solutions to the table. I
            have a passion for problem-solving &amp; take pride in my
            conscientious &amp; active approach to projects. With a keen attention
            to detail, I strive for perfection &amp; aim to create dynamic &amp;
            intuitive user experiences through the utilization of contemporary
            technology stacks.
          </p>
          <p className={tasaOrbiter.className}>
            Interested in working on ambitious projects with dedicated &amp;
            driven team.
            <br />
            Have an idea?
          </p>
          <p className={tasaOrbiter.className}>
            Awesome! Let&apos;s BUIDL the next big thing...
          </p>
          <p className="w-full h-5 hidden sm:block"></p>
          <a href="./docs/Suvraneel_Bhuin_Resume.pdf" target="_blank">
            <button
              className={`resume-button h-fit w-fit px-5 py-2 text-md text-accent shadow-md font-semibold mb-3 ${spaceBoards.className}`}
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
              Download Resume
            </button>
          </a>
        </div>
        <div className="hidden h-screen w-1/2 lg:flex flex-grow flex-col flex-end absolute right-0 bottom-0">
          <Canvas />
        </div>
      </motion.div>
    </>
  );
};

export default About;
