"use client";

import { useLayoutEffect, type RefObject } from "react";
import { arrivalView, whenPlaced } from "@components/transition/arrival";
import { REVEAL_STAGGER_MS } from "@hooks/useReveal";
import { EASE_LIFT, cssEase, prefersReducedMotion } from "@lib/pageTransition";

/** Elements stand this far down and this faint when a lift starts revealing them. */
const ARRIVAL_FROM = { opacity: 0.4, y: 18 };

/**
 * Reached by a lift, the `[data-reveal]` elements inside `containerRef` that
 * the visitor arrives at settle with it: each rises from 18px and 40% opacity
 * (never invisible) on the lift's own timeline and curve, 60ms apart, all
 * landing as the lift settles, so seeks, resumes and settle carry them too.
 * Direct loads and reduced motion keep the server HTML as it is. Put
 * `data-reveal` on a wrapper (a grid cell, a CTA row) when the element inside
 * has hover, tap or tilt transforms of its own, so those stay its own.
 */
export function useLiftEntrance(containerRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;
    return whenPlaced(container, (t, track) => {
      if (!t || !track) return;
      const view = arrivalView(null, t);
      const cells = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
        (cell) => view.side(cell) === 0
      );
      const length = Math.max(track.duration - (cells.length - 1) * REVEAL_STAGGER_MS, track.duration / 2);
      cells.forEach((cell, index) => {
        track.add(
          cell.animate(
            [
              { opacity: ARRIVAL_FROM.opacity, transform: `translate3d(0px, ${ARRIVAL_FROM.y}px, 0px)` },
              { opacity: 1, transform: "translate3d(0px, 0px, 0px)" },
            ],
            // The lift's own curve: EASE_THROW on touch and phone lifts, else EASE_LIFT.
            { duration: length, delay: index * REVEAL_STAGGER_MS, easing: cssEase(t.ease ?? EASE_LIFT), fill: "both" }
          )
        );
      });
    });
  }, [containerRef]);
}
