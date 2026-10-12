"use client";

import { useSpring } from "motion/react";
import { useEffect, useRef } from "react";

const MAGNET_MAX_PX = 6;
const MAGNET_SPRING = { stiffness: 260, damping: 20, mass: 0.5 };
const FINE_HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Magnetic call to action: while a fine pointer hovers it, the element drifts
 * toward the pointer by at most 6px on a spring and springs back on leave.
 *
 * The offset is written to the CSS `translate` property, which composes with
 * (and never replaces) the element's own `transform`, so press scales,
 * focus rings and transitions on `transform` keep working. Touch, coarse
 * pointers and reduced motion get nothing.
 */
export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const x = useSpring(0, MAGNET_SPRING);
  const y = useSpring(0, MAGNET_SPRING);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const fineHover = window.matchMedia(FINE_HOVER_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    // The element's resting box, measured once per hover.
    let rest: { cx: number; cy: number; rx: number; ry: number } | null = null;

    const render = () => {
      const dx = x.get();
      const dy = y.get();
      element.style.translate = Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 ? "" : `${dx}px ${dy}px`;
    };
    const stopX = x.on("change", render);
    const stopY = y.on("change", render);

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fineHover.matches || reducedMotion.matches) return;
      if (!rest) {
        const rect = element.getBoundingClientRect();
        rest = {
          cx: rect.left + rect.width / 2 - x.get(),
          cy: rect.top + rect.height / 2 - y.get(),
          rx: Math.max(rect.width / 2, 1),
          ry: Math.max(rect.height / 2, 1),
        };
      }
      let dx = ((event.clientX - rest.cx) / rest.rx) * MAGNET_MAX_PX;
      let dy = ((event.clientY - rest.cy) / rest.ry) * MAGNET_MAX_PX;
      const length = Math.hypot(dx, dy);
      if (length > MAGNET_MAX_PX) {
        dx = (dx / length) * MAGNET_MAX_PX;
        dy = (dy / length) * MAGNET_MAX_PX;
      }
      x.set(dx);
      y.set(dy);
    };

    const onPointerLeave = () => {
      rest = null;
      x.set(0);
      y.set(0);
    };

    // Turning reduced motion on mid-hover drops the offset at once.
    const onReducedMotion = () => {
      if (!reducedMotion.matches) return;
      rest = null;
      x.jump(0);
      y.jump(0);
    };

    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerleave", onPointerLeave);
    reducedMotion.addEventListener("change", onReducedMotion);
    return () => {
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
      reducedMotion.removeEventListener("change", onReducedMotion);
      stopX();
      stopY();
      element.style.translate = "";
    };
  }, [x, y]);

  return ref;
}
