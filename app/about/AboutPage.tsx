"use client";

import { spaceBoards, tasaOrbiter } from "@font";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import * as gtag from "@lib/gtag";
import { useLiftEntrance } from "@hooks/useLiftEntrance";
import { useSfx } from "@hooks/useSfx";
import LiftHeading from "@components/LiftHeading";
import LiquidMetalButton from "@components/LiquidMetalButton";
import PillButton from "@components/PillButton";
import DepthPortrait from "@components/DepthPortrait";
import { usePageTransition } from "@components/transition/PageTransitionProvider";
import { gestureGate, isTransitionLocked, wasClickDropped } from "@components/transition/transitionStore";
import { warmPortrait } from "@components/transition/avatarPortrait";
import { isDialogOpen, isDrawerOpen } from "@lib/pageTransition";
import {
  PHOTO_FADE_BOTTOM,
  PHOTO_FADE_LEFT,
  PHOTO_FADE_TOP,
  PHOTO_POSITION,
  PORTRAIT_MEDIA,
  PORTRAIT_SRC,
} from "@lib/portrait";

const isAtPageBottom = () =>
  window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

/** What the <img> holds below lg: a 1x1 transparent GIF, inline, so phones and tablets fetch nothing. */
const NO_PHOTO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
/**
 * The photo's frame, in its overscanned layer: a little short of it so the
 * hair keeps some headroom under the top fade, and no taller than 2.22x its
 * width, so the cover crop never cuts into the face. Bottom-anchored, unless
 * the width cap leaves it short of the column (a tall, narrow window): then it
 * hangs from just below the column's top, the face high in the screen, and
 * fades out at its foot instead of sinking to the bottom.
 */
const PHOTO_FRAME: CSSProperties = {
  height: "min(95%, 222cqw)",
  top: "min(calc(100% - min(95%, 222cqw)), 9%)",
  maskImage: `${PHOTO_FADE_LEFT}, ${PHOTO_FADE_TOP}, ${PHOTO_FADE_BOTTOM}`,
  maskComposite: "intersect",
};

const About = () => {
  const router = useRouter();
  const { navigate } = usePageTransition();
  const scrollIntent = useRef(0);
  const lastWheelAt = useRef(0);
  const [playTick, { stop: stopTick }] = useSfx("tick");
  const [playPress] = useSfx("press");
  // Reached by a lift, the copy settles with it line by line instead of arriving as one block.
  const copy = useRef<HTMLDivElement>(null);
  useLiftEntrance(copy);
  // Once the relief draws, the flat photo under it steps aside (after the fade).
  const [relief, setRelief] = useState(false);
  const portraitColumn = useRef<HTMLElement>(null);

  // The portrait's column is pinned to the screen while the copy scrolls by.
  // A lift clips the page in its layer and frames it at an offset (leaving,
  // or arriving as the sheet), so sticky would measure against the layer
  // instead of the window and drop the column back to the page's top. While
  // the layer clips, the column is held where the window had it pinned (as
  // Skills holds its switcher).
  useLayoutEffect(() => {
    const column = portraitColumn.current;
    const layer = column?.closest<HTMLElement>("[data-page]");
    const freeze = column?.closest<HTMLElement>("[data-freeze]");
    if (!column || !layer || !freeze) return;

    const release = () => {
      column.style.position = "";
      column.style.top = "";
    };
    const hold = () => {
      release();
      if (column.offsetParent === null || getComputedStyle(layer).overflowY === "visible") return;
      const framedAt = freeze.style.transform ? -new DOMMatrixReadOnly(freeze.style.transform).m42 : 0;
      const travel = (column.parentElement?.offsetHeight ?? 0) - column.offsetHeight;
      column.style.position = "relative";
      column.style.top = `${Math.min(travel, Math.max(0, framedAt))}px`;
    };

    // Mutations are delivered before the frame is painted, so the held column never shows a frame out of place.
    const observer = new MutationObserver(hold);
    observer.observe(layer, { attributes: true, attributeFilter: ["class", "style"] });
    observer.observe(freeze, { attributes: true, attributeFilter: ["style"] });
    hold();
    return () => {
      observer.disconnect();
      release();
    };
  }, []);

  useEffect(() => {
    // Keep the next route and its remote scene in the browser cache while the
    // visitor reads this page, so the return flip is not preceded by a cold load.
    router.prefetch("/");
    // The photo the way home closes back into the dashboard's avatar, decoded ahead.
    if (window.matchMedia(PORTRAIT_MEDIA).matches) warmPortrait();
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

      if (isTyping || isControl || event.altKey || event.ctrlKey || event.metaKey) return;

      // Space with Shift goes up, as PageUp does; Shift with any other key is the browser's.
      const space = event.key === " ";
      if (event.shiftKey && !space) return;

      if ((["ArrowUp", "PageUp"].includes(event.key) || (space && event.shiftKey)) && window.scrollY <= 0) {
        event.preventDefault();
        navigate("/", { source: "key" });
      }

      if ((["ArrowDown", "PageDown"].includes(event.key) || (space && !event.shiftKey)) && isAtPageBottom()) {
        event.preventDefault();
        navigate("/work", { source: "key", arrival: "top" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
      // Clip, not hidden: a hidden overflow is a scroll container, and the
      // portrait's sticky column would stick to it instead of the window.
      <main className="relative min-h-[100dvh] overflow-clip bg-black text-white">
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
                  onMouseEnter={() => playTick()}
                  onMouseLeave={() => stopTick()}
                  onClick={() => {
                    gtag.event({
                      action: "resume_download_opened",
                      category: "portfolio_engagement",
                      label: "about",
                      value: 1,
                    });
                    playPress();
                  }}
                >
                  Download resume
                </LiquidMetalButton>
                <PillButton
                  href="/contact"
                  onMouseEnter={() => playTick()}
                  onMouseLeave={() => stopTick()}
                  onClick={(event) => {
                    if (!wasClickDropped(event.nativeEvent)) playPress();
                  }}
                >
                  Get in touch
                </PillButton>
              </div>
            </div>
          </section>
          {/* The aside is the photo's frame: one screen tall and pinned to it while
              the copy scrolls by, so the photo is framed to the screen however long
              the copy runs. It moves with the sheet and clips the photo layer,
              overscanned 6% above and below so it can trail the sheet in a lift
              (LAG_SELECTOR in lib/pageTransition) without an edge showing. */}
          <aside
            ref={portraitColumn}
            aria-label="Portrait of Suvraneel Bhuin"
            data-portrait=""
            className="sticky top-0 hidden h-[100dvh] self-start overflow-hidden lg:block"
          >
            <div data-depth="photo" className="pointer-events-none absolute inset-x-0 -inset-y-[6%] [container-type:inline-size]">
              {/* PHOTO_FRAME places it. The fades mask the photo and its relief
                  together, so the cross-fade between them never doubles the faded edges. */}
              <div data-portrait-photo="" className="absolute left-0 w-full" style={PHOTO_FRAME}>
                <picture>
                  <source media={PORTRAIT_MEDIA} srcSet={PORTRAIT_SRC} />
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
                  src={PORTRAIT_SRC}
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
