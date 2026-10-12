import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { usePageTransition } from "@components/transition/PageTransitionProvider";
import {
  gestureGate,
  getLastStartAt,
  isTransitionLocked,
} from "@components/transition/transitionStore";
import { isDialogOpen, pageOrder } from "@lib/pageTransition";

const intentThreshold = 520;
const intentWindowMs = 500;
const minimumIntentEvents = 3;
// Measured from the moment the previous page transition started, as before
// the lift: a lift outlasts it, so after one settles only the gesture gate
// decides what is momentum and a continuous scroll carries straight on.
const postNavigationCooldownMs = 999;
const swipeThreshold = 80;

const findScrollContainer = (target: EventTarget | null) => {
  let element = target instanceof Element ? target : null;

  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const canScrollVertically =
      ["auto", "scroll"].includes(style.overflowY) &&
      element.scrollHeight > element.clientHeight;

    if (canScrollVertically) return element;
    element = element.parentElement;
  }

  return document.scrollingElement || document.documentElement;
};

// The edge spring nudges the page itself, never <html>: the window-scrolled
// pages' freeze wrapper, or the page's own scrolling <main>.
const springTarget = (scrollContainer: Element, pathname: string) =>
  scrollContainer === document.scrollingElement || scrollContainer === document.documentElement
    ? document.querySelector(`[data-page="${pathname}"] [data-freeze]`)
    : scrollContainer;

const playEdgeSpring = (target: Element | null, movingForward: boolean) => {
  target?.animate(
    [
      { transform: "translateY(0)" },
      { transform: `translateY(${movingForward ? -8 : 8}px)` },
      { transform: "translateY(0)" },
    ],
    { duration: 260, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
  );
};

const cooldownUntil = () => getLastStartAt() + postNavigationCooldownMs;

const PageSequenceScroll = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { navigate } = usePageTransition();
  const scrollIntent = useRef(0);
  const scrollIntentEvents = useRef(0);
  const scrollDirection = useRef<1 | -1 | null>(null);
  const boundaryReachedAt = useRef<number | null>(null);
  // The transition whose cooldown already showed its spring.
  const cooldownSpringShownFor = useRef<number | null>(null);
  const lastWheelAt = useRef(0);
  const isNavigating = useRef(false);

  useEffect(() => {
    // Home and About own their dashboard flip interaction. Every subsequent
    // page uses its physical scroll boundary to move through the sequence.
    // This component now persists in the App Router shell, so clear the
    // one-shot navigation guard whenever a new screen has arrived.
    isNavigating.current = false;
    scrollIntent.current = 0;
    scrollIntentEvents.current = 0;
    scrollDirection.current = null;
    boundaryReachedAt.current = null;

    if (pathname === "/" || pathname === "/about") return;

    const pageIndex = pageOrder.indexOf(pathname as (typeof pageOrder)[number]);
    if (pageIndex === -1) return;

    const handleWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        event.deltaY === 0 ||
        isTransitionLocked() ||
        isNavigating.current ||
        isDialogOpen()
      ) {
        return;
      }

      // The tail of the gesture that brought the visitor here never counts.
      if (gestureGate.swallow(event)) {
        event.preventDefault();
        return;
      }

      const scrollContainer = findScrollContainer(event.target);
      const maximumScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const movingForward = event.deltaY > 0;
      const atTop = scrollContainer.scrollTop <= 2;
      const atBottom = scrollContainer.scrollTop >= maximumScroll - 2;
      const nextPath = movingForward ? pageOrder[pageIndex + 1] : pageOrder[pageIndex - 1];

      const isAtBoundary = movingForward ? atBottom : atTop;

      if (window.performance.now() < cooldownUntil() && !isAtBoundary) {
        event.preventDefault();
        return;
      }

      if (!nextPath || !isAtBoundary) {
        boundaryReachedAt.current = null;
        return;
      }

      event.preventDefault();
      const now = window.performance.now();

      // Absorb carried trackpad momentum for a short, fixed handoff window.
      // The next route may still use its first edge gesture once it expires.
      if (now < cooldownUntil()) {
        scrollIntent.current = 0;
        scrollIntentEvents.current = 0;
        scrollDirection.current = null;

        if (cooldownSpringShownFor.current !== getLastStartAt()) {
          cooldownSpringShownFor.current = getLastStartAt();
          playEdgeSpring(springTarget(scrollContainer, pathname), movingForward);
        }
        return;
      }

      // Reaching an edge gives a small elastic acknowledgement. This first
      // overscroll still counts toward the same continuous gesture.
      if (boundaryReachedAt.current === null) {
        boundaryReachedAt.current = now;
        scrollIntent.current = 0;
        scrollIntentEvents.current = 0;
        scrollDirection.current = null;
        playEdgeSpring(springTarget(scrollContainer, pathname), movingForward);
      }

      const direction = movingForward ? 1 : -1;

      if (now - lastWheelAt.current > intentWindowMs || scrollDirection.current !== direction) {
        scrollIntent.current = 0;
        scrollIntentEvents.current = 0;
      }

      lastWheelAt.current = now;
      scrollDirection.current = direction;
      scrollIntent.current += Math.abs(event.deltaY);
      scrollIntentEvents.current += 1;

      if (
        scrollIntent.current < intentThreshold ||
        scrollIntentEvents.current < minimumIntentEvents
      ) {
        return;
      }

      // Forward arrivals show the next page's top, backward ones its bottom.
      if (navigate(nextPath, { source: "sequence", input: "wheel" })) {
        isNavigating.current = true;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, true);
  }, [navigate, pathname]);

  // Touch devices: a deliberate swipe that starts at a scroll edge moves through the sequence.
  useEffect(() => {
    const pageIndex = pageOrder.indexOf(pathname as (typeof pageOrder)[number]);
    if (pageIndex === -1) return;

    let gesture: { x: number; y: number; atTop: boolean; atBottom: boolean } | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || isDialogOpen()) {
        gesture = null;
        return;
      }

      const touch = event.touches[0];
      const scrollContainer = findScrollContainer(event.target);
      const maximumScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      gesture = {
        x: touch.clientX,
        y: touch.clientY,
        atTop: scrollContainer.scrollTop <= 2,
        atBottom: scrollContainer.scrollTop >= maximumScroll - 2,
      };
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const start = gesture;
      gesture = null;
      if (!start || isNavigating.current || isTransitionLocked()) return;
      if (window.performance.now() < cooldownUntil()) return;

      if (isDialogOpen()) return;

      const touch = event.changedTouches[0];
      const deltaY = start.y - touch.clientY;
      const deltaX = start.x - touch.clientX;
      if (Math.abs(deltaY) < swipeThreshold || Math.abs(deltaY) < Math.abs(deltaX) * 1.5) return;

      const movingForward = deltaY > 0;
      if (movingForward ? !start.atBottom : !start.atTop) return;

      const nextPath = movingForward ? pageOrder[pageIndex + 1] : pageOrder[pageIndex - 1];
      if (!nextPath) return;

      if (navigate(nextPath, { source: "sequence", input: "touch" })) {
        isNavigating.current = true;
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate, pathname]);

  useEffect(() => {
    const pageIndex = pageOrder.indexOf(pathname as (typeof pageOrder)[number]);
    if (pageIndex === -1) return;

    const warmAdjacentRoutes = () => {
      const previousPath = pageOrder[pageIndex - 1];
      const nextPath = pageOrder[pageIndex + 1];

      if (previousPath) router.prefetch(previousPath);
      if (nextPath) router.prefetch(nextPath);
    };

    const timeoutId = window.setTimeout(warmAdjacentRoutes, 250);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, router]);

  return null;
};

export default PageSequenceScroll;
