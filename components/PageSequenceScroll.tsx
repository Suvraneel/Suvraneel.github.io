import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const pageOrder = ["/", "/about", "/work", "/projects", "/skills", "/contact"];
const intentThreshold = 80;

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
  const lastWheelAt = useRef(0);
  const isNavigating = useRef(false);

  useEffect(() => {
    // Home and About own their dashboard flip interaction. Every subsequent
    // page uses its physical scroll boundary to move through the sequence.
    // This component now persists in the App Router shell, so clear the
    // one-shot navigation guard whenever a new screen has arrived.
    isNavigating.current = false;
    scrollIntent.current = 0;

    if (pathname === "/" || pathname === "/about") return;

    const pageIndex = pageOrder.indexOf(pathname);
    if (pageIndex === -1) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaY === 0 || isNavigating.current) return;

      const scrollContainer = findScrollContainer(event.target);
      const maximumScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const movingForward = event.deltaY > 0;
      const atTop = scrollContainer.scrollTop <= 2;
      const atBottom = scrollContainer.scrollTop >= maximumScroll - 2;
      const nextPath = movingForward ? pageOrder[pageIndex + 1] : pageOrder[pageIndex - 1];

      if (!nextPath || (movingForward ? !atBottom : !atTop)) return;

      event.preventDefault();
      const now = window.performance.now();

      if (now - lastWheelAt.current > 180) {
        scrollIntent.current = 0;
      }

      lastWheelAt.current = now;
      scrollIntent.current += Math.abs(event.deltaY);

      if (scrollIntent.current < intentThreshold) return;

      isNavigating.current = true;
      router.push(nextPath);
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", handleWheel, true);
  }, [pathname, router]);

  return null;
};

export default PageSequenceScroll;
