"use client";

import { useEffect, useLayoutEffect, useRef, type ComponentPropsWithoutRef, type RefObject } from "react";
import { arrivalView, whenPlaced } from "@components/transition/arrival";
import { EASE_LIFT, cssEase, prefersReducedMotion } from "@lib/pageTransition";

/** The rise starts this far into the lift, as the sheet's edge nears the top, and runs to its end. */
const RISE_START = 0.45;

type LiftHeadingProps = ComponentPropsWithoutRef<"h1"> & {
  /** The page's own scroller (Work's <main>); the window when omitted. */
  rootRef?: RefObject<HTMLElement | null>;
};

/**
 * The page's textured H1 in a masked line box. Arriving by a forward lift
 * with the heading in view, its text rises into the box from below on the
 * lift's own timeline and curve (from 0.45 of the lift to its end), so seeks,
 * resumes and settle carry it too. Direct loads keep the server HTML as it is
 * (it may be the LCP element); backward arrivals, reduced motion and the fade
 * leave it still.
 *
 * The texture (`animated-heading`, background-clip: text) sits on the moving
 * span, padded 0.08em 0 0.22em like the preloader's so the clip box keeps
 * Space Boards' descenders; the h1's matching negative margins keep the
 * page's layout as it was. Pass type and size classes, not margins.
 *
 * The texture's drift animates background-position, which no browser can
 * composite: each of its frames restyles and repaints the heading, forever,
 * including once the page has scrolled it out of view. It runs only while
 * some of the heading is on screen and holds where it is otherwise.
 */
export default function LiftHeading({ children, className = "", rootRef, ...props }: LiftHeadingProps) {
  const box = useRef<HTMLHeadingElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const heading = box.current;
    const text = line.current;
    if (!heading || !text || prefersReducedMotion()) return;
    return whenPlaced(heading, (t, track) => {
      if (!t || !track || t.direction < 0) return;
      if (arrivalView(rootRef?.current ?? null, t).side(heading) !== 0) return;
      track.add(
        text.animate([{ transform: "translate3d(0px, 100%, 0px)" }, { transform: "translate3d(0px, 0px, 0px)" }], {
          delay: RISE_START * track.duration,
          duration: (1 - RISE_START) * track.duration,
          easing: cssEase(t.ease ?? EASE_LIFT),
          fill: "both",
        })
      );
    });
  }, [rootRef]);

  // Any of the line in view, through every clip on the way (Work's scrolling
  // <main>, the h1's own mask while the line rises into it). A page that has
  // left is unmounted with its layer, so nothing else needs watching.
  useEffect(() => {
    const text = line.current;
    if (!text || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      text.style.animationPlayState = entry?.isIntersecting ? "" : "paused";
    });
    observer.observe(text);
    return () => observer.disconnect();
  }, []);

  return (
    <h1 ref={box} className={`-mb-[0.22em] -mt-[0.08em] overflow-hidden ${className}`} {...props}>
      <span ref={line} className="animated-heading block pb-[0.22em] pt-[0.08em]">
        {children}
      </span>
    </h1>
  );
}
