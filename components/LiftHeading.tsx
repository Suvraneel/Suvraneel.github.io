"use client";

import { useEffect, useLayoutEffect, useRef, type ComponentPropsWithoutRef, type RefObject } from "react";
import { arrivalView, whenPlaced } from "@components/transition/arrival";
import { EASE_LIFT, cssEase, prefersReducedMotion } from "@lib/pageTransition";

/** The rise starts this far into the lift, as the sheet's edge nears the top, and runs to its end. */
const RISE_START = 0.45;
/** The texture's drift holds after this long (ms) without input, and picks up again at the next. */
const DRIFT_IDLE_MS = 5000;
/**
 * Input that wakes the drift. Scroll is caught in the capture phase, so the
 * scroll of a page's own <main> (Work's) counts too, though it never bubbles.
 */
const WAKE_EVENTS = ["pointermove", "pointerdown", "wheel", "scroll", "keydown", "touchstart"] as const;
const WAKE_OPTIONS: AddEventListenerOptions = { capture: true, passive: true };

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
 * including once the page has scrolled it out of view or the visitor has
 * stopped to read. It runs only while some of the heading is on screen and
 * the visitor has moved, scrolled, tapped or typed in the last few seconds
 * (DRIFT_IDLE_MS), and holds where it is otherwise: a page left open at its
 * heading settles to no frames at all, which the slow drift (a 50 s cycle,
 * some 10% of it in that time) barely shows. Of the ways to stop it at idle,
 * this keeps the drift as it was while anyone is there to see it; a
 * scroll-linked drift (animation-timeline: scroll()) would never move on a
 * page that fits its window, and would need a fallback where it is unsupported.
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

  // The drift runs while any of the line is in view, through every clip on the
  // way (Work's scrolling <main>, the h1's own mask while the line rises into
  // it), and the visitor has been active within DRIFT_IDLE_MS. A page that has
  // left is unmounted with its layer, so nothing else needs watching. Input
  // only stamps its time unless the drift is asleep: one timer checks the
  // stamp when it falls due and sleeps or waits out the rest, so a stream of
  // pointermoves never clears and sets timers.
  useEffect(() => {
    const text = line.current;
    if (!text) return;
    let inView = true;
    let awake = true;
    let lastInput = performance.now();
    let idleTimer = 0;
    const apply = () => {
      text.style.animationPlayState = inView && awake ? "" : "paused";
    };
    const sleepWhenIdle = () => {
      const idleFor = performance.now() - lastInput;
      if (idleFor < DRIFT_IDLE_MS) {
        idleTimer = window.setTimeout(sleepWhenIdle, DRIFT_IDLE_MS - idleFor);
        return;
      }
      awake = false;
      apply();
    };
    const wake = () => {
      lastInput = performance.now();
      if (awake) return;
      awake = true;
      apply();
      idleTimer = window.setTimeout(sleepWhenIdle, DRIFT_IDLE_MS);
    };
    idleTimer = window.setTimeout(sleepWhenIdle, DRIFT_IDLE_MS);
    for (const type of WAKE_EVENTS) window.addEventListener(type, wake, WAKE_OPTIONS);
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            inView = entry?.isIntersecting ?? true;
            apply();
          });
    observer?.observe(text);
    return () => {
      window.clearTimeout(idleTimer);
      for (const type of WAKE_EVENTS) window.removeEventListener(type, wake, WAKE_OPTIONS);
      observer?.disconnect();
    };
  }, []);

  return (
    <h1 ref={box} className={`-mb-[0.22em] -mt-[0.08em] overflow-hidden ${className}`} {...props}>
      <span ref={line} className="animated-heading block pb-[0.22em] pt-[0.08em]">
        {children}
      </span>
    </h1>
  );
}
