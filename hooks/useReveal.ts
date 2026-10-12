"use client";

import { useIsPresent } from "motion/react";
import { useLayoutEffect, useRef, type RefObject } from "react";
import { arrivalView, whenPlaced } from "@components/transition/arrival";
import { prefersReducedMotion } from "@lib/pageTransition";

export const REVEAL_MS = 700;
export const REVEAL_STAGGER_MS = 60;
export const REVEAL_DISTANCE_PX = 16;
export const REVEAL_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

type RevealOptions = {
  /** The page's own scroller (Work's <main>); the window when omitted. */
  rootRef?: RefObject<HTMLElement | null>;
  /** Elements inside the container that reveal; default `[data-reveal]`. */
  selector?: string;
};

const byDocumentOrder = (a: IntersectionObserverEntry, b: IntersectionObserverEntry) =>
  a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

/**
 * Below-the-fold scroll reveals for the `[data-reveal]` elements inside
 * `containerRef`: fade in and rise 16px (or settle down 16px when they come
 * in from above), 60ms apart within one batch, once per mount.
 *
 * Everything starts visible (server HTML, no JS, reduced motion). Once the
 * page stands where the visitor will see it (at once, or at its lift's
 * arrival offset), only elements wholly outside that view are hidden, so the
 * lift never reveals a page with gaps. Hiding and revealing are Web
 * Animations on opacity and transform, so inline styles (and Motion's) stay
 * untouched. An exiting page never reveals again.
 */
export function useReveal(containerRef: RefObject<HTMLElement | null>, options: RevealOptions = {}) {
  const { rootRef, selector = "[data-reveal]" } = options;
  const isPresent = useIsPresent();
  const presentRef = useRef(isPresent);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useLayoutEffect(() => {
    presentRef.current = isPresent;
    if (!isPresent) observerRef.current?.disconnect();
  }, [isPresent]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const held = new Map<Element, Animation>();
    let observer: IntersectionObserver | null = null;

    const reveal = (entries: IntersectionObserverEntry[]) => {
      if (!presentRef.current) return;
      const entering = entries.filter((entry) => entry.isIntersecting && held.has(entry.target)).sort(byDocumentOrder);
      entering.forEach((entry, index) => {
        const element = entry.target as HTMLElement;
        observer?.unobserve(element);
        const fromAbove = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
        const offset = fromAbove ? -REVEAL_DISTANCE_PX : REVEAL_DISTANCE_PX;
        element.animate(
          [
            { opacity: 0, transform: `translate3d(0px, ${offset}px, 0px)` },
            { opacity: 1, transform: "translate3d(0px, 0px, 0px)" },
          ],
          { duration: REVEAL_MS, delay: index * REVEAL_STAGGER_MS, easing: REVEAL_EASE, fill: "backwards" }
        );
        held.get(element)?.cancel();
        held.delete(element);
      });
      if (held.size === 0) observer?.disconnect();
    };

    const stopWaiting = whenPlaced(container, (t) => {
      if (!presentRef.current) return;
      const root = rootRef?.current ?? null;
      const view = arrivalView(root, t);
      container.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (view.side(element) === 0) return;
        // Held invisible by a zero-length filling animation; its position is untouched.
        held.set(element, element.animate([{ opacity: 0 }], { duration: 0, fill: "forwards" }));
      });
      if (held.size === 0) return;
      observer = new IntersectionObserver(reveal, { root });
      observerRef.current = observer;
      held.forEach((_hold, element) => observer?.observe(element));
    });

    return () => {
      stopWaiting();
      observer?.disconnect();
      if (observerRef.current === observer) observerRef.current = null;
      // A remount (Strict Mode) measures again from a visible start.
      held.forEach((hold) => hold.cancel());
      held.clear();
    };
  }, [containerRef, rootRef, selector]);
}
