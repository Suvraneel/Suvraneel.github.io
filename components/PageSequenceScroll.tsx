import { spaceBoards, tasaOrbiter } from "@font";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { usePageTransition } from "@components/transition/PageTransitionProvider";
import {
  edgeTail,
  gestureGate,
  getLastSettleAt,
  getLastStartAt,
  isTransitionLocked,
} from "@components/transition/transitionStore";
import { COMMIT_WATCHDOG_MS, isDialogOpen, pageOrder, prefersReducedMotion } from "@lib/pageTransition";

const intentThreshold = 520;
const intentWindowMs = 500;
const minimumIntentEvents = 3;
// Measured from the moment the previous page transition started: a lift
// outlasts it, so after one settles only the gesture gate decides what is
// momentum and a continuous scroll carries straight on. A shorter transition
// (a reduced-motion fade, a touch throw) ends it as it settles.
const postNavigationCooldownMs = 999;
/** How far past a scroll edge a touch pull must travel to move to the next page. */
const pullThreshold = 70;
/** Pull distance from which the hint starts to show. */
const pullHintFrom = 20;
/** How far the page may scroll back under a finger easing off a pull before the pull is over. */
const pullSlack = 12;
/** Finger travel after which a touch can be read as vertical (a pull) or sideways (ignored). */
const axisLockAfter = 10;
/** How much more sideways than vertical a touch must be to count as a swipe (about 63° off vertical). */
const sidewaysRatio = 2;
/** Share of the wheel's intent threshold from which the hint starts to show. */
const wheelHintFrom = 0.15;
/** The rail's collapsed width (.sidebar-container, globals.css); the content column starts past it. */
const railWidth = 50;

const pageLabels: Record<(typeof pageOrder)[number], string> = {
  "/": "Home",
  "/about": "About",
  "/work": "Work",
  "/projects": "Projects",
  "/skills": "Skills",
  "/contact": "Contact",
};

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

const isDocumentScroller = (element: Element) =>
  element === document.scrollingElement || element === document.documentElement;

/**
 * The furthest a container can scroll. The document is measured against
 * window.innerHeight, not <html>'s clientHeight: phones report clientHeight
 * as the small viewport (toolbar shown), but once the toolbar collapses, as
 * it does on the way to the bottom, the window scrolls against the larger
 * one, so clientHeight would put the bottom edge out of reach.
 */
const maxScrollOf = (element: Element) =>
  Math.max(
    0,
    element.scrollHeight -
      (isDocumentScroller(element) ? Math.max(element.clientHeight, window.innerHeight) : element.clientHeight)
  );

/** Fractional offsets on high-DPR phones leave the document a pixel or two short of its maximum. */
const edgeTolerance = (element: Element) => (isDocumentScroller(element) ? 4 : 2);

const isAtEdge = (element: Element, direction: 1 | -1) =>
  direction === 1
    ? element.scrollTop >= maxScrollOf(element) - edgeTolerance(element)
    : element.scrollTop <= 2;

// The edge spring nudges the page itself, never <html>: the window-scrolled
// pages' freeze wrapper, or the page's own scrolling <main>.
const springTarget = (scrollContainer: Element, pathname: string) =>
  scrollContainer === document.scrollingElement || scrollContainer === document.documentElement
    ? document.querySelector(`[data-page="${pathname}"] [data-freeze]`)
    : scrollContainer;

const playEdgeSpring = (target: Element | null, movingForward: boolean) => {
  // Under reduced motion the edge pill alone acknowledges the edge.
  if (prefersReducedMotion()) return;
  target?.animate(
    [
      { transform: "translateY(0)" },
      { transform: `translateY(${movingForward ? -8 : 8}px)` },
      { transform: "translateY(0)" },
    ],
    { duration: 260, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
  );
};

const cooldownUntil = () => {
  const startedAt = getLastStartAt();
  const settledAt = getLastSettleAt();
  return settledAt >= startedAt
    ? Math.min(startedAt + postNavigationCooldownMs, settledAt)
    : startedAt + postNavigationCooldownMs;
};

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
  // The touch pull's hint, as the wheel shows it (set up with the hint below).
  const wheelHint = useRef<((direction: 1 | -1, distance: number) => void) | null>(null);

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

    // The wheel's intent at an edge shows in the touch pull's pill, as a pull
    // distance (its fill is intent / threshold), painted in a frame. A pause
    // that lapses the intent takes the pill with it.
    let hintFrame = 0;
    let hintIdle = 0;
    let hintShownFor: 1 | -1 | null = null;
    const paintHint = (direction: 1 | -1, intent: number) => {
      window.cancelAnimationFrame(hintFrame);
      window.clearTimeout(hintIdle);
      hintShownFor = intent > 0 ? direction : null;
      const distance = (intent / intentThreshold) * pullThreshold;
      hintFrame = window.requestAnimationFrame(() => wheelHint.current?.(direction, distance));
      if (intent > 0) hintIdle = window.setTimeout(() => paintHint(direction, 0), intentWindowMs);
    };
    const hideHint = () => {
      if (hintShownFor !== null) paintHint(hintShownFor, 0);
    };

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
        hideHint();
        return;
      }

      const scrollContainer = findScrollContainer(event.target);
      const movingForward = event.deltaY > 0;
      const nextPath = movingForward ? pageOrder[pageIndex + 1] : pageOrder[pageIndex - 1];

      const isAtBoundary = isAtEdge(scrollContainer, movingForward ? 1 : -1);

      if (window.performance.now() < cooldownUntil() && !isAtBoundary) {
        event.preventDefault();
        hideHint();
        return;
      }

      if (!nextPath || !isAtBoundary) {
        boundaryReachedAt.current = null;
        edgeTail.disarm();
        hideHint();
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
        hideHint();

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
        edgeTail.arm(event);
      }

      // The momentum of a fling that ran into the edge is not a push past it.
      if (edgeTail.holds(event)) {
        hideHint();
        return;
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
        paintHint(direction, scrollIntent.current);
        return;
      }

      // Forward arrivals show the next page's top, backward ones its bottom.
      if (navigate(nextPath, { source: "sequence", input: "wheel" })) {
        isNavigating.current = true;
        hideHint();
      } else {
        paintHint(direction, scrollIntent.current);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener("wheel", handleWheel, true);
      edgeTail.disarm();
      // A frame still pending would paint the next page's hint.
      window.cancelAnimationFrame(hintFrame);
      window.clearTimeout(hintIdle);
    };
  }, [navigate, pathname]);

  // Keys move through the sequence from a page's edge, as Home and About take
  // them: down at the bottom, up at the top. A key held to reach the edge
  // stops there; it takes a fresh press to go on.
  useEffect(() => {
    if (pathname === "/" || pathname === "/about") return;
    const pageIndex = pageOrder.indexOf(pathname as (typeof pageOrder)[number]);
    if (pageIndex === -1) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isTransitionLocked() || isNavigating.current || isDialogOpen()) return;
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches("input, textarea, select, [contenteditable='true']");
      // Space and arrows belong to a focused control (e.g. Space activates a button).
      const isControl = target?.matches("a[href], button, summary, [role='button'], [role='link']");
      if (isTyping || isControl || event.altKey || event.ctrlKey || event.metaKey) return;

      const space = event.key === " ";
      if (event.shiftKey && !space) return;
      const direction: 1 | -1 | null =
        ["ArrowDown", "PageDown"].includes(event.key) || (space && !event.shiftKey)
          ? 1
          : ["ArrowUp", "PageUp"].includes(event.key) || (space && event.shiftKey)
            ? -1
            : null;
      const nextPath = direction ? pageOrder[pageIndex + direction] : undefined;
      if (!direction || !nextPath) return;
      // The page's own scroller (Work's <main>), else the document.
      const scroller = findScrollContainer(document.querySelector(`[data-page="${pathname}"] main`));
      if (!isAtEdge(scroller, direction)) return;

      if (navigate(nextPath, { source: "key", arrival: direction > 0 ? "top" : "bottom" })) {
        event.preventDefault();
        isNavigating.current = true;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, pathname]);

  // Touch devices: pulling past a scroll edge moves through the sequence. The
  // pull is measured from the moment the page reaches its edge, so a swipe
  // that starts mid-page and keeps going counts; a fling that only reaches the
  // edge after the finger lifts does not. While pulling, the page stretches
  // and a pill at the edge reads "Pull for <next>", the next page's name set
  // as its wordmark, with a progress fill, then "Release for <next>" once far
  // enough. The wheel above shows the same pill at an edge, the wordmark and
  // the fill only.
  useEffect(() => {
    const pageIndex = pageOrder.indexOf(pathname as (typeof pageOrder)[number]);
    if (pageIndex === -1) return;

    const hint = document.createElement("div");
    hint.setAttribute("aria-hidden", "true");
    hint.className = `pointer-events-none fixed left-1/2 z-[1500] flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${tasaOrbiter.className}`;
    hint.style.transform = "translate(-50%, 0.5rem)";
    // A faint fill, left to right with the pull; full at the threshold.
    const hintFill = document.createElement("span");
    hintFill.className =
      "absolute inset-0 origin-left bg-white/[0.14] transition-transform duration-100 ease-linear motion-reduce:transition-none";
    hintFill.style.transform = "scaleX(0)";
    // Both labels share one grid cell, so the pill keeps the longer one's width
    // and the words crossfade at the threshold instead of resizing it.
    const hintAction = document.createElement("span");
    hintAction.className = "relative grid justify-items-end text-sm font-medium text-white/85";
    const labelClass =
      "[grid-area:1/1] transition-opacity duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none";
    const pullLabel = document.createElement("span");
    pullLabel.className = labelClass;
    pullLabel.textContent = "Pull for";
    const releaseLabel = document.createElement("span");
    releaseLabel.className = labelClass;
    releaseLabel.textContent = "Release for";
    hintAction.append(pullLabel, releaseLabel);
    // The next page's name as its wordmark, at the label's scale.
    const hintTitle = document.createElement("span");
    hintTitle.className = `animated-heading relative text-[0.95rem] font-bold leading-none tracking-[-0.02em] ${spaceBoards.className}`;
    hint.append(hintFill, hintAction, hintTitle);
    document.body.append(hint);

    type Pull = {
      scroller: Element;
      /** Where the finger came down, to tell a vertical pull from a sideways swipe. */
      startX: number;
      startY: number;
      /** Clearly sideways (never a pull) or vertical, decided once the finger has travelled axisLockAfter px; null while in between. */
      axis: "y" | "x" | null;
      /** Finger Y when the page reached its edge in the pull's direction (null until then). */
      edgeY: number | null;
      direction: 1 | -1 | null;
      /** The scroller's offset when the edge was reached; a pull whose page then scrolls was never at it. */
      edgeScrollTop: number;
      /** The edge was inferred from a stall, not measured: any scroll at all means it was never there. */
      edgeFromStall: boolean;
      /** A stretch still springing back when this touch began, picked up where it was. */
      carry: number;
      lastY: number;
      lastScrollTop: number;
      /** Finger travel in one direction over which the scroller has not moved at all. */
      stallTravel: number;
      stallMoves: number;
      stallDirection: 1 | -1 | null;
      distance: number;
    };
    let pull: Pull | null = null;
    let frame = 0;
    // The latest spring-back, so a finger that grabs the page again takes it from where it is.
    let relaxing: { target: HTMLElement; animation: Animation } | null = null;

    // Window-scrolled pages stretch their <main>, else the content root inside
    // the freeze wrapper (never the wrapper itself, which the lift uses to hold
    // the page at its scroll offset).
    const pullTarget = (scroller: Element | undefined) =>
      !scroller
        ? null
        : isDocumentScroller(scroller)
          ? (document.querySelector<HTMLElement>(`[data-page="${pathname}"] main`) ??
            document.querySelector<HTMLElement>(`[data-page="${pathname}"] [data-freeze] > *`))
          : (scroller as HTMLElement);

    // The haptic tick fires once per crossing of the threshold.
    let crossed = false;
    // Shrinks the pill where it would not fit its row; kept while it fades out.
    let hintScale = 1;
    const gutter = 16;
    const menuGap = 8;

    /**
     * The hint for a pull `distance` px past the edge (0 hides it). The wheel
     * passes its intent in the same units; its pill drops the verb (it commits
     * on its own, with nothing to release) and centres on the content column.
     */
    const showHint = (direction: 1 | -1 | null, distance: number, input: "touch" | "wheel" = "touch") => {
      const wheel = input === "wheel";
      const nextPath = direction ? pageOrder[pageIndex + direction] : undefined;
      // Under reduced motion the wheel's pill only fades, without the slide.
      const away = wheel && prefersReducedMotion() ? 0 : direction === -1 ? -1 : 1;
      if (!nextPath || distance < (wheel ? wheelHintFrom * pullThreshold : pullHintFrom)) {
        hint.style.opacity = "0";
        hint.style.transform = `translate(-50%, ${away * 0.5}rem) scale(${hintScale})`;
        return;
      }

      const forward = direction === 1;
      const ready = distance >= pullThreshold;
      hintAction.style.display = wheel ? "none" : "";
      pullLabel.style.opacity = ready ? "0" : "1";
      releaseLabel.style.opacity = ready ? "1" : "0";
      hintTitle.textContent = pageLabels[nextPath];
      hintFill.style.transform = `scaleX(${Math.min(1, distance / pullThreshold)})`;

      // At the edge being pulled. Going forward: the bottom, over the page's
      // bottom padding. Going back: in the top bar's row, beside the menu
      // button, above the page's own heading rather than on it.
      const viewport = document.documentElement.clientWidth;
      const width = hint.offsetWidth;
      const menu = forward ? null : document.querySelector<HTMLElement>("button.hamburger")?.getBoundingClientRect();
      // A rail shown (display: none hides it with its client rects) starts the column past it.
      const rail = wheel && document.querySelector(".sidebar-container")?.getClientRects().length ? railWidth : 0;
      let center = rail + (viewport - rail) / 2;
      let room = viewport - rail - gutter * 2;
      if (menu && menu.width > 0 && menu.left - menuGap > viewport / 2) {
        const end = menu.left - menuGap;
        if (center + width / 2 > end) {
          // Centred on the page it would run into the button: centre it in the space left of it.
          center = (gutter + end) / 2;
          room = end - gutter;
        }
        hint.style.top = `${menu.top + (menu.height - hint.offsetHeight) / 2}px`;
      } else {
        hint.style.top = forward ? "" : "calc(env(safe-area-inset-top) + 0.75rem)";
      }
      hintScale = width > room ? room / width : 1;
      hint.style.left = `${center}px`;
      hint.style.bottom = forward ? "calc(env(safe-area-inset-bottom) + 1.5rem)" : "";
      hint.style.opacity = "1";
      hint.style.transform = `translate(-50%, 0) scale(${hintScale})`;
    };

    const tick = (ready: boolean) => {
      if (ready && !crossed) {
        try {
          navigator.vibrate?.(10);
        } catch {
          // No haptics here (iOS Safari, or no user activation yet).
        }
      }
      crossed = ready;
    };

    const stretch = (offset: number) => {
      const target = pullTarget(pull?.scroller);
      if (target) target.style.transform = offset ? `translate3d(0, ${offset}px, 0)` : "";
    };

    /** Springs the page back from its stretch; the pull itself carries on. */
    const relax = (target: HTMLElement | null) => {
      const current = target?.style.transform;
      if (!target || !current) return;
      target.style.transform = "";
      const animation = target.animate([{ transform: current }, { transform: "translate3d(0, 0, 0)" }], {
        duration: 320,
        easing: "cubic-bezier(0.32, 0.72, 0, 1)",
      });
      relaxing = { target, animation };
    };

    /** Stops a running spring-back where it is, held inline; returns that offset (0 if none). */
    const catchRelax = () => {
      const caught = relaxing;
      relaxing = null;
      if (!caught || caught.animation.playState !== "running" || !caught.target.isConnected) return 0;
      const offset = new DOMMatrix(getComputedStyle(caught.target).transform).m42;
      caught.animation.cancel();
      caught.target.style.transform = offset ? `translate3d(0, ${offset}px, 0)` : "";
      return offset;
    };

    const release = () => {
      cancelAnimationFrame(frame);
      relax(pullTarget(pull?.scroller));
      showHint(pull?.direction ?? null, 0);
      crossed = false;
      pull = null;
    };

    /** Ends the pull with the scroller not at an edge after all: no stretch, no hint. */
    const dropEdge = (current: Pull) => {
      const direction = current.direction;
      current.edgeY = null;
      current.direction = null;
      current.distance = 0;
      cancelAnimationFrame(frame);
      relax(pullTarget(current.scroller));
      showHint(direction, 0);
      crossed = false;
    };

    // Finger travel the scroller did not follow at all is a page held at its
    // edge, whatever the edge arithmetic says (a viewport that reports a stale
    // height, a nested scroller).
    const trackStall = (current: Pull, step: number, scrollTop: number) => {
      const moving: 1 | -1 = step > 0 ? 1 : -1;
      const scrolled = Math.abs(scrollTop - current.lastScrollTop) > 0.5;
      current.lastScrollTop = scrollTop;
      if (scrolled || current.stallDirection !== moving) {
        current.stallTravel = 0;
        current.stallMoves = 0;
        current.stallDirection = moving;
      }
      if (!scrolled) {
        current.stallTravel += Math.abs(step);
        current.stallMoves += 1;
      }
    };

    const isStalledAtEdge = (current: Pull, moving: 1 | -1, scrollTop: number) =>
      current.stallMoves >= 2 &&
      current.stallTravel >= 24 &&
      (moving === 1 ? scrollTop >= maxScrollOf(current.scroller) - 160 : scrollTop <= 160);

    const handleTouchStart = (event: TouchEvent) => {
      if (pull) release();
      if (event.touches.length !== 1 || isDialogOpen() || isTransitionLocked()) return;
      const touch = event.touches[0];
      const scroller = findScrollContainer(event.target);
      const carry = pullTarget(scroller) === relaxing?.target ? catchRelax() : 0;
      pull = {
        scroller,
        startX: touch.clientX,
        startY: touch.clientY,
        axis: null,
        edgeY: null,
        direction: null,
        edgeScrollTop: 0,
        edgeFromStall: false,
        carry,
        lastY: touch.clientY,
        lastScrollTop: scroller.scrollTop,
        stallTravel: 0,
        stallMoves: 0,
        stallDirection: null,
        distance: 0,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!pull || event.touches.length !== 1) return;
      const { clientX: x, clientY: y } = event.touches[0];

      // A sideways swipe is not a pull, wherever it drifts vertically. A thumb's
      // arc can lean sideways at first, so only a clearly sideways start counts;
      // anything in between stays undecided while the touch goes on.
      if (pull.axis === null && Math.hypot(x - pull.startX, y - pull.startY) >= axisLockAfter) {
        const dx = Math.abs(x - pull.startX);
        const dy = Math.abs(y - pull.startY);
        if (dx > dy * sidewaysRatio) pull.axis = "x";
        else if (dy >= dx) pull.axis = "y";
      }
      if (pull.axis === "x") {
        release();
        return;
      }

      const step = pull.lastY - y; // > 0: finger moving up (scrolling forward)
      pull.lastY = y;
      if (step === 0) return;

      const { scroller } = pull;
      const moving: 1 | -1 = step > 0 ? 1 : -1;
      const scrollTop = scroller.scrollTop;
      trackStall(pull, step, scrollTop);

      // The page scrolling after all ends the pull: it was never at the edge
      // (a stall that was only the browser's touch slop), or the finger turned
      // back far enough to scroll it away from the edge. A measured edge allows
      // the few px a finger easing off (or trembling) scrolls the page back.
      const slack = pull.edgeFromStall ? 2 : pullSlack;
      if (pull.edgeY !== null && Math.abs(scrollTop - pull.edgeScrollTop) > slack) {
        dropEdge(pull);
        return;
      }

      // The pull starts where the page meets its edge in the direction of travel.
      if (pull.edgeY === null) {
        const atEdge = isAtEdge(scroller, moving);
        if (!atEdge && !isStalledAtEdge(pull, moving, scrollTop)) {
          // Not pulling after all: a stretch picked up at touchstart springs back.
          if (pull.carry) {
            pull.carry = 0;
            relax(pullTarget(scroller));
          }
          return;
        }
        pull.edgeY = y;
        pull.direction = moving;
        pull.edgeScrollTop = scrollTop;
        pull.edgeFromStall = !atEdge;
        // A stretch caught mid spring-back carries on from where it was, if this
        // pull goes the same way (offsets are opposite to the pull's direction).
        const band = pageOrder[pageIndex + moving] ? 0.35 : 0.12;
        if (pull.carry && Math.sign(pull.carry) === -moving && Math.abs(pull.carry) < 120) {
          pull.edgeY = y + moving * (Math.abs(pull.carry) / band);
        } else if (pull.carry) {
          relax(pullTarget(scroller));
        }
        pull.carry = 0;
      }
      const direction = pull.direction ?? moving;

      // Easing back towards the edge eases the stretch with it; back past it, the pull is over.
      pull.distance = (pull.edgeY - y) * direction;
      if (pull.distance < 0) {
        dropEdge(pull);
        return;
      }
      const hasNext = Boolean(pageOrder[pageIndex + direction]);
      // Rubber band: about a third of the finger's travel, and stiffer at the very ends of the sequence.
      const offset = prefersReducedMotion() ? 0 : -direction * Math.min(pull.distance * (hasNext ? 0.35 : 0.12), 120);
      const distance = hasNext ? pull.distance : 0;
      tick(distance >= pullThreshold);

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        stretch(offset);
        showHint(direction, distance);
      });
    };

    const handleTouchEnd = () => {
      const ended = pull;
      const nextPath = ended?.direction ? pageOrder[pageIndex + ended.direction] : undefined;
      const qualifies =
        ended !== null &&
        ended.direction !== null &&
        ended.distance >= pullThreshold &&
        nextPath !== undefined &&
        !isNavigating.current &&
        !isTransitionLocked() &&
        window.performance.now() >= cooldownUntil() &&
        !isDialogOpen();

      if (ended && nextPath && qualifies) {
        // Decide before cleaning up: a page that goes keeps its stretch and
        // rides away with the lift from where the finger left it, instead of
        // springing back first and then setting off from rest.
        cancelAnimationFrame(frame);
        showHint(ended.direction, 0);
        crossed = false;
        const target = pullTarget(ended.scroller);
        pull = null;
        if (navigate(nextPath, { source: "sequence", input: "touch" })) {
          isNavigating.current = true;
          // The page leaves with its layer. Should the route never commit,
          // the page is still here once the transition gives up: let it go back.
          if (target) {
            window.setTimeout(() => {
              if (target.isConnected && !isTransitionLocked()) relax(target);
            }, COMMIT_WATCHDOG_MS + 500);
          }
          return;
        }
        pull = ended;
      }
      release();
    };

    wheelHint.current = (direction, distance) => showHint(direction, distance, "wheel");
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", release, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", release);
      release();
      wheelHint.current = null;
      hint.remove();
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
