import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const pageOrder = ["/", "/about", "/work", "/projects", "/skills", "/contact"];
const intentThreshold = 520;
const intentWindowMs = 500;
const minimumIntentEvents = 3;
const postNavigationCooldownMs = 1000;

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

const PageSequenceScroll = () => {
  const router = useRouter();
  const pathname = usePathname();
  const scrollIntent = useRef(0);
  const scrollIntentEvents = useRef(0);
  const scrollDirection = useRef<1 | -1 | null>(null);
  const boundaryReachedAt = useRef<number | null>(null);
  const pendingBottomScroll = useRef<string | null>(null);
  const navigationCooldownUntil = useRef(0);
  const cooldownSpringShown = useRef(false);
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

    const pageIndex = pageOrder.indexOf(pathname);
    if (pageIndex === -1) return;

    const handleWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        event.deltaY === 0 ||
        isNavigating.current ||
        document.querySelector("[role='dialog'][aria-modal='true']")
      ) {
        return;
      }

      const scrollContainer = findScrollContainer(event.target);
      const maximumScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const movingForward = event.deltaY > 0;
      const atTop = scrollContainer.scrollTop <= 2;
      const atBottom = scrollContainer.scrollTop >= maximumScroll - 2;
      const nextPath = movingForward ? pageOrder[pageIndex + 1] : pageOrder[pageIndex - 1];

      const isAtBoundary = movingForward ? atBottom : atTop;

      if (!nextPath || !isAtBoundary) {
        boundaryReachedAt.current = null;
        return;
      }

      event.preventDefault();
      const now = window.performance.now();

      // Absorb carried trackpad momentum for a short, fixed handoff window.
      // The next route may still use its first edge gesture once it expires.
      if (now < navigationCooldownUntil.current) {
        scrollIntent.current = 0;
        scrollIntentEvents.current = 0;
        scrollDirection.current = null;

        if (!cooldownSpringShown.current) {
          cooldownSpringShown.current = true;
          scrollContainer.animate(
            [
              { transform: "translateY(0)" },
              { transform: `translateY(${movingForward ? -8 : 8}px)` },
              { transform: "translateY(0)" },
            ],
            { duration: 260, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
          );
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
        scrollContainer.animate(
          [
            { transform: "translateY(0)" },
            { transform: `translateY(${movingForward ? -8 : 8}px)` },
            { transform: "translateY(0)" },
          ],
          { duration: 260, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        );
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

      isNavigating.current = true;
      navigationCooldownUntil.current = now + postNavigationCooldownMs;
      cooldownSpringShown.current = false;

      if (!movingForward) pendingBottomScroll.current = nextPath;

      router.push(nextPath, { scroll: false });
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, true);
  }, [pathname, router]);

  useLayoutEffect(() => {
    if (pendingBottomScroll.current !== pathname) return;

    const scrollContainer = document.querySelector(`[data-page="${pathname}"] main`);
    if (!scrollContainer) return;

    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    pendingBottomScroll.current = null;
  }, [pathname]);

  useEffect(() => {
    const pageIndex = pageOrder.indexOf(pathname);
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
