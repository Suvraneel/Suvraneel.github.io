"use client";

import { useEffect } from "react";
import { usePageTransition } from "@components/transition/PageTransitionProvider";
import { isTransitionLocked } from "@components/transition/transitionStore";
import { isPagePath } from "@lib/pageTransition";

/** Movement beyond this between pointer-down and pointer-up makes it a drag (or a touch pull), not a tap. */
const DRAG_SLOP_PX = 10;
/** Only window.open calls this soon after a pointer-up on a scene canvas are treated as Spline links. */
const LINK_WINDOW_MS = 800;
const SITE_HOSTS = new Set(["suvraneel.github.io"]);

/**
 * Guards links baked into the Spline scenes (the dashboard's tiles, "See all",
 * socials). Spline opens them with window.open on pointer-down or pointer-up;
 * links opened while the pointer is down are held and decided on release, so:
 * - a pointer that moved (a drag, or a touch pull to the next page) opens nothing;
 * - links to this site's own pages play the page lift instead of opening a new tab;
 * - external links open as before.
 */
export default function SplineLinkGuard() {
  const { navigate } = usePageTransition();

  useEffect(() => {
    let start: { x: number; y: number } | null = null;
    let dragged = false;
    let downOnCanvas = false;
    let canvasUpAt = Number.NEGATIVE_INFINITY;
    /** A link a scene opened while the pointer was still down (Spline "Mouse Down" links); decided on release. */
    let pending: { url: string | URL; target?: string; features?: string } | null = null;

    const originalOpen = window.open;

    const follow = (url: string | URL, target?: string, features?: string) => {
      const destination = new URL(String(url), window.location.href);
      const sameSite = SITE_HOSTS.has(destination.hostname) || destination.origin === window.location.origin;
      if (sameSite && isPagePath(destination.pathname)) {
        navigate(destination.pathname, { source: "link" });
        return null;
      }
      return originalOpen.call(window, url, target, features);
    };

    const onDown = (event: PointerEvent) => {
      start = { x: event.clientX, y: event.clientY };
      dragged = false;
      pending = null;
      downOnCanvas = event.target instanceof HTMLCanvasElement;
    };
    const onMove = (event: PointerEvent) => {
      if (!start || dragged) return;
      dragged = Math.hypot(event.clientX - start.x, event.clientY - start.y) > DRAG_SLOP_PX;
    };
    const onUp = (event: PointerEvent) => {
      if (event.target instanceof HTMLCanvasElement || downOnCanvas) canvasUpAt = performance.now();
      const held = pending;
      pending = null;
      downOnCanvas = false;
      start = null;
      // Still inside the user's gesture, so popup blockers allow the deferred open.
      if (held && !dragged && !isTransitionLocked()) follow(held.url, held.target, held.features);
    };
    const onCancel = () => {
      pending = null;
      downOnCanvas = false;
      start = null;
    };

    window.open = function guardedOpen(url?: string | URL, target?: string, features?: string) {
      if (url === undefined) return originalOpen.call(window, url, target, features);
      if (downOnCanvas) {
        pending = { url, target, features };
        return null;
      }
      const fromScene = performance.now() - canvasUpAt < LINK_WINDOW_MS;
      if (!fromScene) return originalOpen.call(window, url, target, features);
      if (dragged || isTransitionLocked()) return null;
      return follow(url, target, features);
    };

    window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    window.addEventListener("pointermove", onMove, { capture: true, passive: true });
    window.addEventListener("pointerup", onUp, { capture: true, passive: true });
    window.addEventListener("pointercancel", onCancel, { capture: true, passive: true });
    return () => {
      window.open = originalOpen;
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onCancel, true);
    };
  }, [navigate]);

  return null;
}
