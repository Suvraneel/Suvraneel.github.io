"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTransition, isInFlight } from "@components/transition/transitionStore";

/** Where the floating menu toggle shows (the rail/drawer swap in globals.css). */
const DRAWER_LAYOUT = "only screen and (max-width: 768px), only screen and (max-height: 520px)";
/** Within this far of a scroller's top the toggle always shows. */
const NEAR_TOP_PX = 80;
/** Steady scrolling down this far (px) moves it away; a much shorter pull back up returns it. */
const HIDE_AFTER_PX = 32;
const SHOW_AFTER_PX = 12;

/**
 * Steps the floating menu toggle aside while the visitor reads down a page and
 * brings it back on the first scroll up (or near the top), so it never sits on
 * the text it floats over. Watches whichever element scrolls (the window, or
 * Work's own <main>) through one passive capture listener; scrolls inside a
 * dialog or the open drawer, and the ones a page lift makes as it lands, don't
 * count. A new page always starts with it shown. Focus brings it back too, so
 * the keyboard always reaches it.
 */
export function useScrollAway(paused: boolean) {
  const pathname = usePathname();
  // The page it was moved away on: another page (a navigation) shows it again.
  const [awayOn, setAwayOn] = useState<string | null>(null);
  const awayRef = useRef<string | null>(null);
  const pathRef = useRef(pathname);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  const set = useCallback((away: boolean) => {
    const next = away ? pathRef.current : null;
    if (awayRef.current === next) return;
    awayRef.current = next;
    setAwayOn(next);
  }, []);

  useEffect(() => {
    const layout = window.matchMedia(DRAWER_LAYOUT);
    const last = new WeakMap<EventTarget, number>();
    let down = 0;
    let up = 0;
    const readY = (target: EventTarget | null) =>
      target instanceof HTMLElement && target !== document.documentElement && target !== document.body
        ? target.scrollTop
        : window.scrollY;

    const onScroll = (event: Event) => {
      const target = event.target ?? document;
      if (!layout.matches) return;
      if (target instanceof Element && target.closest('dialog, [role="dialog"], [data-drawer-open]')) return;
      const y = readY(target);
      const previous = last.get(target) ?? y;
      last.set(target, y);
      // A lift landing a page (and its arrival offset) is not the visitor scrolling.
      if (isInFlight(getTransition())) {
        down = 0;
        up = 0;
        return;
      }
      if (y <= NEAR_TOP_PX) {
        down = 0;
        up = 0;
        set(false);
        return;
      }
      const delta = y - previous;
      if (delta > 0) {
        down += delta;
        up = 0;
        if (down >= HIDE_AFTER_PX) set(true);
      } else if (delta < 0) {
        up -= delta;
        down = 0;
        if (up >= SHOW_AFTER_PX) set(false);
      }
    };
    const onLayout = () => {
      if (!layout.matches) set(false);
    };

    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    layout.addEventListener("change", onLayout);
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      layout.removeEventListener("change", onLayout);
    };
  }, [set]);

  return { away: !paused && awayOn === pathname, show: () => set(false) };
}
