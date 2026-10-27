"use client";

import { spaceBoards, tasaOrbiter } from "@font";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import * as gtag from "@lib/gtag";
import { useLiftEntrance } from "@hooks/useLiftEntrance";
import { useSfx } from "@hooks/useSfx";
import LiftHeading from "@components/LiftHeading";
import LiquidMetalButton from "@components/LiquidMetalButton";
import PillButton from "@components/PillButton";
import DepthPortrait from "@components/DepthPortrait";
import { usePageTransition } from "@components/transition/PageTransitionProvider";
import { gestureGate, isTransitionLocked } from "@components/transition/transitionStore";
import { isDialogOpen, isDrawerOpen } from "@lib/pageTransition";

const isAtPageBottom = () =>
  window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

/** Where the portrait's column shows (lg, as on its <aside>); only there is the photo fetched. */
const PORTRAIT_MEDIA = "(min-width: 1024px)";
/** What the <img> holds below lg: a 1x1 transparent GIF, inline, so phones and tablets fetch nothing. */
const NO_PHOTO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
/**
 * The studio backdrop is near black, not the page's #000: its left and top
 * edges fade into the page so the frame never reads as a rectangle (the right
 * and bottom edges are the viewport's).
 */
const PHOTO_FADE: CSSProperties = {
  maskImage: "linear-gradient(to right, transparent, #000 4.5rem), linear-gradient(to bottom, transparent, #000 10%)",
  maskComposite: "intersect",
};
/** The photo's object-position (object-[40%_100%]), for the relief that replaces it. */
const PHOTO_POSITION: [number, number] = [0.4, 1];

const About = () => {
  const router = useRouter();
  const { navigate } = usePageTransition();
  const scrollIntent = useRef(0);
  const lastWheelAt = useRef(0);
  const [playSnap, { stop: stopSnap }] = useSfx("snap", { volume: 0.25 });
  const [playConfirm] = useSfx("confirm", { volume: 0.25 });
  // Reached by a lift, the copy settles with it line by line instead of arriving as one block.
  const copy = useRef<HTMLDivElement>(null);
  useLiftEntrance(copy);
  // Once the relief draws, the flat photo under it steps aside (after the fade).
  const [relief, setRelief] = useState(false);

  useEffect(() => {
    // Keep the next route and its remote scene in the browser cache while the
    // visitor reads this page, so the return flip is not preceded by a cold load.
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (isTransitionLocked() || event.ctrlKey || event.deltaY === 0) return;
      // An open drawer or dialog scrolls its own content.
      if (isDialogOpen() || isDrawerOpen()) return;

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
      <main className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
        <div className="relative z-10 grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)]">
          {/* Phones: the bottom padding keeps the CTAs clear of the "Pull for" pill.
              Tablets: the text starts past the 50px nav rail (shown from 769px wide and
              521px tall, as in globals.css), as .nav-gap does on the other pages. */}
          <section className="flex min-h-[100dvh] items-start px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-20 sm:px-10 sm:pb-16 sm:pt-20 min-[769px]:max-lg:[@media(min-height:521px)]:pl-[calc(50px+2.5rem)] lg:items-center lg:pl-28 lg:pr-14 xl:pl-36 xl:pr-20">
            {/* The column itself is the sheet's depth layer, so the entrance goes on its children. */}
            <div ref={copy} className="max-w-2xl">
              <p data-reveal className={`mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent/70 ${tasaOrbiter.className}`}>
                Profile
              </p>
              <LiftHeading data-reveal className={`max-w-xl text-4xl leading-none tracking-[-0.045em] sm:text-6xl ${spaceBoards.className}`}>
                About Me
              </LiftHeading>
              <div className="mt-8 max-w-2xl space-y-5">
                <p data-reveal className={`text-xl font-medium leading-8 tracking-[-0.025em] text-white sm:text-2xl/8 ${tasaOrbiter.className}`}>
                  I like building things that are useful, not just impressive.
                </p>
                <p data-reveal className={`text-base leading-7 text-white/75 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
                  I&apos;m Suvraneel Bhuin, an Advanced Application Engineering Senior Analyst at Accenture. I build dependable backend services, integrations, and workflows for enterprise-scale products.
                </p>
                <p data-reveal className={`text-base leading-7 text-white/60 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
                  I studied Computer Science &amp; Engineering at the University of Calcutta. Open-source programmes and Web3 communities taught me to pair technical depth with clear ownership, useful documentation, and thoughtful collaboration.
                </p>
                <p data-reveal className={`text-base leading-7 text-white/60 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
                  I like turning ambiguous requirements into clear, maintainable systems and working closely with the people who rely on them.
                </p>
              </div>
              {/* On the row, so the buttons' own press and magnetic transforms stay theirs. */}
              <div data-reveal className="mt-9 flex flex-wrap gap-3">
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
          {/* The aside is the photo's frame: it moves with the sheet and clips the
              photo layer, overscanned 6% above and below so it can trail the sheet
              in a lift (LAG_SELECTOR in lib/pageTransition) without an edge showing. */}
          <aside aria-label="Portrait of Suvraneel Bhuin" className="relative hidden min-h-[100dvh] overflow-hidden lg:block">
            <div data-depth="photo" className="pointer-events-none absolute inset-x-0 -inset-y-[6%] [container-type:inline-size]">
              {/* Bottom-anchored, a little short of the layer so the hair keeps some
                  headroom under the top fade and, in a tall narrow frame, no taller
                  than 2.22x its width, so the cover crop never cuts into the face.
                  The fade masks the photo and its relief together, so the cross-fade
                  between them never doubles the faded edges. */}
              <div className="absolute bottom-0 left-0 h-[95%] max-h-[222cqw] w-full" style={PHOTO_FADE}>
                <picture>
                  <source media={PORTRAIT_MEDIA} srcSet="/images/Suvraneel_DP.jpeg" />
                  {/* Under the relief it turns transparent rather than hidden, so its alt text stays readable. */}
                  <img
                    src={NO_PHOTO}
                    alt="Black-and-white portrait of Suvraneel Bhuin"
                    width={1456}
                    height={1456}
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover object-[40%_100%] grayscale ${relief ? "opacity-0 transition-opacity delay-700 duration-0" : ""}`}
                  />
                </picture>
                {/* The same photo in relief, turning a few degrees toward the pointer. */}
                <DepthPortrait
                  src="/images/Suvraneel_DP.jpeg"
                  depthSrc="/images/Suvraneel_DP-depth.webp"
                  media={PORTRAIT_MEDIA}
                  position={PHOTO_POSITION}
                  onReady={setRelief}
                  className="absolute inset-0"
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
  );
};

export default About;
