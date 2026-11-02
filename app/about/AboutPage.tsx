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
  PORTRAIT_COLUMN_MEDIA,
  PORTRAIT_MEDIA,
  PORTRAIT_SRC,
} from "@lib/portrait";

const isAtPageBottom = () =>
  window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

/** What the <img> holds where no portrait shows: a 1x1 transparent GIF, inline, so phones fetch nothing. */
const NO_PHOTO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
/**
 * The photo's frame, in its overscanned layer: a little short of it so the
 * hair keeps some headroom under the top fade, and no taller than 2.22x its
 * width, so the cover crop never cuts into the face. Bottom-anchored, unless
 * the width cap leaves it short of the column (a tall, narrow window): then it
 * hangs from just below the column's top, the face high in the screen, and
 * fades out at its foot instead of sinking to the bottom. The split layout
 * (upright tablets) sets its own height and side and foot fades through the
 * variables (see the frame's `split:` classes).
 */
const FRAME_HEIGHT = "var(--photo-height, min(95%, 222cqw))";
const PHOTO_FRAME: CSSProperties = {
  height: FRAME_HEIGHT,
  top: `min(calc(100% - ${FRAME_HEIGHT}), 9%)`,
  maskImage: `var(--photo-fade-side, ${PHOTO_FADE_LEFT}), ${PHOTO_FADE_TOP}, var(--photo-fade-foot, ${PHOTO_FADE_BOTTOM})`,
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
    if (window.matchMedia(PORTRAIT_COLUMN_MEDIA).matches) warmPortrait();
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
        {/* Split (upright tablets, short windows below lg): the copy keeps the left
            60% and the portrait spans the whole row under it, its faded side behind
            the copy and its face clear of it. */}
        <div className="relative z-10 grid min-h-[100dvh] grid-cols-1 split:grid-cols-[60%_40%] lg:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)]">
          {/* Phones: the bottom padding keeps the CTAs clear of the "Pull for" pill.
              Tablets: the text starts past the 50px nav rail (shown from 769px wide and
              521px tall, as in globals.css), as .nav-gap does on the other pages. */}
          {/* Short landscape screens (short:, up to 820px tall) tighten the copy's
              vertical rhythm so the buttons stay above the fold, and on desktop let
              it run past its column over the portrait's faded side, up to 24px short
              of the face (--copy-overlap: the column's right padding, plus where the
              face starts in the portrait's column, 0.4 x its 41vw width less 0.092 x
              the photo's height, less 24px), up to 44rem (about 66 characters a line).
              Taller desktops keep the copy to its column. */}
          <section className="flex min-h-[100dvh] items-start px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-20 sm:px-10 sm:pb-16 sm:pt-20 min-[769px]:max-lg:[@media(min-height:521px)]:pl-[calc(50px+2.5rem)] split:relative split:z-10 split:col-start-1 split:row-start-1 split:items-center split:!pr-0 short:!pb-8 short:!pt-10 lg:relative lg:z-10 lg:items-center lg:pl-28 lg:pr-14 lg:[--copy-overlap:calc(3.5rem_+_16.4vw_-_min(9.79dvh,8.374vw)_-_24px)] xl:pl-36 xl:pr-20 xl:[--copy-overlap:calc(5rem_+_16.4vw_-_min(9.79dvh,8.374vw)_-_24px)]">
            {/* The column itself is the sheet's depth layer, so the entrance goes on its children. */}
            <div ref={copy} className="max-w-2xl short:lg:w-[min(44rem,calc(100%_+_var(--copy-overlap)))] short:lg:max-w-none short:lg:shrink-0">
              <p data-reveal className={`mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent/70 ${tasaOrbiter.className}`}>
                Profile
              </p>
              <LiftHeading data-reveal className={`max-w-xl text-display leading-none tracking-[-0.045em] ${spaceBoards.className}`}>
                About Me
              </LiftHeading>
              {/* The type scales with the window (text-lead, text-body); in the split
                  layout the copy's spacing tightens to match it and leave the portrait room. */}
              <div className="mt-8 max-w-2xl space-y-5 split:mt-6 split:space-y-4 short:!mt-5 short:!space-y-[0.9rem]">
                <p data-reveal className={`text-lead font-medium leading-[1.35] tracking-[-0.025em] text-white ${tasaOrbiter.className}`}>
                  I like building things that are useful, not just impressive.
                </p>
                <p data-reveal className={`text-body leading-[1.75] short:!leading-[1.6] text-white/75 ${tasaOrbiter.className}`}>
                  I&apos;m Suvraneel Bhuin, an Advanced Application Engineering Senior Analyst at Accenture. I build dependable backend services, integrations, and workflows for enterprise-scale products.
                </p>
                <p data-reveal className={`text-body leading-[1.75] short:!leading-[1.6] text-white/60 ${tasaOrbiter.className}`}>
                  I studied Computer Science &amp; Engineering at the University of Calcutta. Open-source programmes and Web3 communities taught me to pair technical depth with clear ownership, useful documentation, and thoughtful collaboration.
                </p>
                <p data-reveal className={`text-body leading-[1.75] short:!leading-[1.6] text-white/60 ${tasaOrbiter.className}`}>
                  I like turning ambiguous requirements into clear, maintainable systems and working closely with the people who rely on them.
                </p>
              </div>
              {/* On the row, so the buttons' own press and magnetic transforms stay theirs. */}
              <div data-reveal className="mt-9 flex flex-wrap gap-3 short:!mt-6">
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
            className="sticky top-0 hidden h-[100dvh] self-start overflow-hidden split:col-span-2 split:col-start-1 split:row-start-1 split:block lg:block"
          >
            <div data-depth="photo" className="pointer-events-none absolute inset-x-0 -inset-y-[6%] [container-type:inline-size]">
              {/* PHOTO_FRAME places it. The fades mask the photo and its relief
                  together, so the cross-fade between them never doubles the faded edges.
                  Split: right-aligned and cover-fit from its left, the photo (side
                  --photo-d) placed by the face (0.308-0.61 of its width): the frame is
                  as wide as puts the face 24px right of the copy's 60%, so the photo
                  runs as far under the copy as the face allows. Its side fades in under
                  the copy and is opaque by the face; its foot fades out, as it may hang
                  short of the screen's bottom. The photo is a screen tall or, where the
                  window is narrow for that, no taller than leaves the face 3% of it
                  short of the screen's edge: (0.4 x width - 24px) / 0.332.
                  Short desktops: the copy may run over the column's left, so its side
                  fade runs to the face (--face-x: 0.4 x the column's width less 0.092 x
                  the photo's height), dark under the copy and opaque by the face. */}
              <div
                data-portrait-photo=""
                className="absolute left-0 w-full split:left-auto split:right-0 split:w-[calc(40cqw_-_24px_+_0.308_*_var(--photo-d))] split:[--photo-d:min(106.4dvh,calc(120.48cqw_-_72.3px))] split:[--photo-fade-foot:linear-gradient(to_top,transparent,#000_15%)] split:[--photo-fade-side:linear-gradient(to_right,transparent_0,rgba(0,0,0,.08)_calc(var(--photo-d)*.179),rgba(0,0,0,.5)_calc(var(--photo-d)*.262),rgba(0,0,0,.85)_calc(var(--photo-d)*.301),#000_calc(var(--photo-d)*.346))] split:[--photo-height:var(--photo-d)] lg:[--face-x:calc(40cqw_-_0.092_*_min(106.4dvh,222cqw))] short:lg:[--photo-fade-side:linear-gradient(to_right,transparent_0,rgba(0,0,0,.05)_calc(var(--face-x)*.6),rgba(0,0,0,.35)_calc(var(--face-x)*.85),rgba(0,0,0,.8)_var(--face-x),#000_max(4.5rem,calc(var(--face-x)*1.12)))]"
                style={PHOTO_FRAME}
              >
                <picture>
                  <source media={PORTRAIT_MEDIA} srcSet={PORTRAIT_SRC} />
                  {/* Under the relief it turns transparent rather than hidden, so its alt text stays readable. */}
                  <img
                    src={NO_PHOTO}
                    alt="Black-and-white portrait of Suvraneel Bhuin"
                    width={1456}
                    height={1456}
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover object-[40%_100%] grayscale split:object-[0%_100%] ${relief ? "opacity-0 transition-opacity delay-700 duration-0" : ""}`}
                  />
                </picture>
                {/* The same photo in relief, turning a few degrees toward the pointer. */}
                <DepthPortrait
                  src={PORTRAIT_SRC}
                  depthSrc="/images/Suvraneel_DP-depth.webp"
                  media={PORTRAIT_COLUMN_MEDIA}
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
