"use client";

import { useDashboardScene } from "@components/DashboardScene";
import * as gtag from "@lib/gtag";
import {
  COMMIT_WATCHDOG_MS,
  CONTENT_LEAD,
  DEPTH_SELECTORS,
  EASE_FADE,
  EASE_FLIP,
  EASE_LIFT,
  EASE_THROW,
  FADE_MS,
  FLIP_LEAD_MS,
  FLIP_MS,
  LAG_SELECTOR,
  LANDING_MS,
  LIFT_MS,
  PHOTO_LAG,
  PHOTO_SETTLE_FROM,
  BLOB_PULL_SPAN,
  SCRIM_MAX,
  THROW_MS,
  UNDER_OFFSET,
  cssEase,
  deriveKind,
  directionOf,
  dismissModalDialogs,
  isDialogOpen,
  isDrawerOpen,
  isPagePath,
  prefersPlainLift,
  prefersReducedMotion,
  timeScale,
  type Arrival,
  type PagePath,
  type PageTransition,
  type TransitionSource,
} from "@lib/pageTransition";
import { cubicBezier } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { adoptHistoryEntry, rememberScroll, savedScrollFor } from "./historyScroll";
import { TransitionTimeline } from "./timeline";
import {
  gestureGate,
  getLastSettleAt,
  getTransition,
  isInFlight,
  isTransitionLocked,
  layerRegistry,
  markClickDropped,
  markSettled,
  markStarted,
  notifyArrival,
  setTransition,
  setTransitionLocked,
  useTransitionState,
} from "./transitionStore";

export type NavigateOptions = {
  source: TransitionSource;
  arrival?: Arrival;
  /** Physical input behind a 'sequence' navigation; touch also freezes <html> overflow. */
  input?: "wheel" | "touch";
  /** popstate only: the browser already animated the history swipe itself. */
  uaTransition?: boolean;
};

type PageTransitionContextValue = {
  navigate: (to: string, options: NavigateOptions) => boolean;
  settle: () => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue>({
  navigate: () => false,
  settle: () => undefined,
});

export const usePageTransition = () => useContext(PageTransitionContext);

const NAV_KEYS = new Set([" ", "PageUp", "PageDown", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"]);

const isTextInput = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || Boolean(target.closest("input, textarea, select, [contenteditable='true']")));

// Space/Enter on a focused control activate it rather than scroll, so the
// in-flight key lock leaves them alone.
const isActivationOnControl = (event: KeyboardEvent) =>
  (event.key === " " || event.key === "Enter") &&
  event.target instanceof HTMLElement &&
  Boolean(event.target.closest("button, a[href], summary, [role='button'], [role='link'], [role='tab']"));

const translateY = (px: number) => `translate3d(0px, ${px}px, 0px)`;

/** The document timeline clock every transition track is pinned to. */
const timelineNow = () => {
  const time = Number(document.timeline.currentTime);
  return Number.isFinite(time) ? time : window.performance.now();
};

const isLiftKind = (t: PageTransition) => t.kind === "lift" || t.kind === "flip" || t.kind === "unflip";

/** Foreground content of a sheet: each selector part scoped to that page's layer. */
const depthTargets = (layer: HTMLElement | null | undefined, path: PagePath) => {
  const selector = DEPTH_SELECTORS[path];
  if (!layer || !selector) return [];
  return Array.from(layer.querySelectorAll<HTMLElement>(selector));
};

/**
 * A page's lag layers that are rendered at this width (About's portrait
 * column is lg only), each with how far it may trail: PHOTO_LAG of the
 * viewport, capped by its overscan past the frame that clips it.
 */
const lagTargets = (layer: HTMLElement | null | undefined, vh: number) => {
  if (!layer) return [];
  return Array.from(layer.querySelectorAll<HTMLElement>(LAG_SELECTOR)).flatMap((element) => {
    if (element.offsetParent === null) return [];
    const style = getComputedStyle(element);
    const overscan = Math.min(-parseFloat(style.top), -parseFloat(style.bottom));
    const lag = Math.min(PHOTO_LAG * vh, overscan);
    return lag > 0 ? [{ element, lag }] : [];
  });
};

type FlipDriver = {
  effect: KeyframeEffect;
  from: number;
  to: number;
  ease: (progress: number) => number;
  /** How far the blob is pulled in at a progress of this turn (0 as it rests, 1 gone). */
  pull: (progress: number) => number;
};

const easePull = cubicBezier(EASE_FLIP[0], EASE_FLIP[1], EASE_FLIP[2], EASE_FLIP[3]);

/** The flip pulls the blob in over its first BLOB_PULL_SPAN; the return flip plays that backwards. */
const pullAt = (progress: number) => easePull(Math.max(0, Math.min(1, progress / BLOB_PULL_SPAN)));
const returnPullAt = (progress: number) => pullAt(1 - progress);

type DevWindow = Window & {
  __pageTransitionSeek?: (p: number) => void;
  __pageTransitionResume?: () => void;
};

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const scene = useDashboardScene();
  const transitionState = useTransitionState();
  const sceneRef = useRef(scene);
  const pathnameRef = useRef(pathname);
  const nextId = useRef(1);
  const timeline = useRef<TransitionTimeline | null>(null);
  const flipDriver = useRef<FlipDriver | null>(null);
  const flipFrame = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  const watchdogTimer = useRef<number | null>(null);
  const unlock = useRef<(() => void) | null>(null);
  // An arriving sheet is framed at its arrival offset until it settles; the
  // real window scroll is applied in the commit that unframes it.
  const pendingArrival = useRef<{ path: PagePath; y: number } | null>(null);
  // Dev only: a seek requested while nothing is in flight pauses the next transition.
  const armedSeek = useRef<number | null>(null);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  const clearTimers = useCallback(() => {
    if (safetyTimer.current !== null) window.clearTimeout(safetyTimer.current);
    if (watchdogTimer.current !== null) window.clearTimeout(watchdogTimer.current);
    safetyTimer.current = null;
    watchdogTimer.current = null;
  }, []);

  const releaseLocks = useCallback(() => {
    unlock.current?.();
    unlock.current = null;
    setTransitionLocked(false);
  }, []);

  // The dashboard rig is not a DOM node, so its rotation follows a timing-only
  // track on the same timeline, sampled every frame (seeks included).
  const applyFlip = useCallback(() => {
    const driver = flipDriver.current;
    if (!driver) return;
    const progress = Number(driver.effect.getComputedTiming().progress ?? 0);
    const clamped = Math.max(0, Math.min(1, progress));
    const eased = driver.ease(clamped);
    sceneRef.current.setFlip(driver.from + (driver.to - driver.from) * eased);
    sceneRef.current.setBlobPull(driver.pull(clamped));
  }, []);

  const stopFlip = useCallback(
    (land: boolean) => {
      if (flipFrame.current !== null) window.cancelAnimationFrame(flipFrame.current);
      flipFrame.current = null;
      const driver = flipDriver.current;
      if (driver && land) {
        sceneRef.current.setFlip(driver.to);
        sceneRef.current.setBlobPull(driver.pull(1));
      }
      flipDriver.current = null;
    },
    []
  );

  const startFlip = useCallback(
    (
      track: TransitionTimeline,
      options: {
        offset: number;
        duration: number;
        ease: readonly number[];
        from: number;
        to: number;
        pull: (progress: number) => number;
      }
    ) => {
      stopFlip(false);
      const effect = new KeyframeEffect(null, [], { duration: options.duration, fill: "both" });
      const animation = new Animation(effect, document.timeline);
      const [x1, y1, x2, y2] = options.ease;
      flipDriver.current = {
        effect,
        from: options.from,
        to: options.to,
        ease: cubicBezier(x1, y1, x2, y2),
        pull: options.pull,
      };
      track.add(animation, options.offset, true);
      applyFlip();
      const frame = () => {
        applyFlip();
        flipFrame.current = window.requestAnimationFrame(frame);
      };
      flipFrame.current = window.requestAnimationFrame(frame);
      return animation;
    },
    [applyFlip, stopFlip]
  );

  const settle = useCallback(() => {
    const t = getTransition();
    if (!t || t.settled) return;

    clearTimers();
    // Land every track on its final frame. The exiting page keeps its last
    // frame until it is removed; layers that stay carry no transform.
    stopFlip(true);
    timeline.current?.finish();
    timeline.current = null;

    // Nothing may have scrolled the arriving page in flight, but a top arrival
    // is put back at its top regardless, so it never lands part way down.
    if (t.arrival === "top") {
      const main = document.querySelector<HTMLElement>(`[data-page="${t.to}"] main`);
      if (main) main.scrollTop = 0;
      if (t.arrivalScrollY === undefined) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    const at = window.performance.now();
    releaseLocks();
    markSettled(at);
    gestureGate.arm(at);
    pendingArrival.current =
      t.arrivalScrollY === undefined ? null : { path: t.to, y: t.arrivalScrollY };
    setTransition({ ...t, settled: true });
    adoptHistoryEntry(t.to);

    // Release an exiting page the coordinator has not removed yet.
    const exiting = layerRegistry.get(t.from);
    if (exiting && !exiting.isPresent) exiting.safeToRemove?.();

    if (document.activeElement === document.body || document.activeElement === null) {
      const main = document.querySelector<HTMLElement>(`[data-page="${t.to}"] main`);
      if (main) {
        if (!main.hasAttribute("tabindex")) {
          main.setAttribute("tabindex", "-1");
          main.style.outline = "none";
        }
        main.focus({ preventScroll: true });
      }
    }
  }, [clearTimers, releaseLocks, stopFlip]);

  // Settles once every track has played out. A track cancelled from outside
  // (or a timeline left paused by a dev seek and resumed) still settles.
  const armSettle = useCallback(
    (t: PageTransition, track: TransitionTimeline) => {
      const done = () => {
        const current = getTransition();
        if (current?.id === t.id && !track.isPaused) settle();
      };
      track.finished.then(done, done);
      if (safetyTimer.current !== null) window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
      if (track.isPaused) return;
      safetyTimer.current = window.setTimeout(done, track.duration + 1500 * timeScale());
    },
    [settle]
  );

  // The arriving sheet has just been unframed in this commit: give the window
  // the scroll offset it was framed at, before the frame is painted.
  useLayoutEffect(() => {
    const pending = pendingArrival.current;
    if (!pending) return;
    const t = getTransition();
    if (!t?.settled || t.to !== pending.path) return;
    pendingArrival.current = null;
    const handle = layerRegistry.get(pending.path);
    if (handle?.freeze) handle.freeze.style.transform = "";
    window.scrollTo({ top: pending.y, left: 0, behavior: "instant" });
  }, [transitionState]);

  // In flight no scroll input reaches any page, scroller or 3D scene. Wheel
  // events are gated by the always-on listener further down; touch moves and
  // scroll keys are held here. Stopping propagation at the window's capture
  // phase still runs the other window capture listeners (every page handler
  // returns early while locked) but skips the targets and every bubble
  // listener, React's root and the Spline runtime's included.
  const lock = useCallback((options: NavigateOptions) => {
    // A finger that goes down in flight keeps being held for LANDING_MS after
    // settle, so a drag that carries on does not scroll the arrived page.
    let touchHeld = false;
    const onTouchStart = () => {
      touchHeld = true;
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 0) touchHeld = false;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTextInput(event.target) || isActivationOnControl(event)) return;
      if (!NAV_KEYS.has(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("touchend", onTouchEnd, { capture: true, passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    window.addEventListener("keydown", onKeyDown, { capture: true });

    const html = document.documentElement;
    const freezeOverflow = options.source === "sequence" && options.input === "touch";
    const previousOverflow = html.style.overflow;
    if (freezeOverflow) html.style.overflow = "hidden";

    setTransitionLocked(true);
    unlock.current = () => {
      window.removeEventListener("keydown", onKeyDown, true);
      if (freezeOverflow) html.style.overflow = previousOverflow;
      let landingTimer = 0;
      const releaseTouch = () => {
        window.clearTimeout(landingTimer);
        window.removeEventListener("touchstart", onTouchStart, true);
        window.removeEventListener("touchend", onTouchEnd, true);
        window.removeEventListener("touchcancel", onTouchEnd, true);
        window.removeEventListener("touchend", releaseTouch, true);
        window.removeEventListener("touchcancel", releaseTouch, true);
        window.removeEventListener("touchmove", onTouchMove, true);
      };
      if (!touchHeld) {
        releaseTouch();
        return;
      }
      window.addEventListener("touchend", releaseTouch, { capture: true, passive: true });
      window.addEventListener("touchcancel", releaseTouch, { capture: true, passive: true });
      landingTimer = window.setTimeout(releaseTouch, LANDING_MS);
    };
  }, []);

  const fastForward = useCallback(() => {
    if (!isInFlight(getTransition())) return;
    timeline.current?.resume();
    settle();
  }, [settle]);

  const navigate = useCallback(
    (to: string, options: NavigateOptions) => {
      // A history step that interrupts a lift whose route never committed
      // has no settled page to remember.
      let leavingSettledEntry = true;
      if (isTransitionLocked()) {
        if (options.source !== "pop") return false;
        leavingSettledEntry = getTransition()?.commitAt != null;
        fastForward();
      }

      const from = pathnameRef.current;
      if (!isPagePath(to) || !isPagePath(from) || to === from) return false;
      if (options.source === "pop" || options.source === "link") dismissModalDialogs();

      const currentScene = sceneRef.current;
      if (
        options.source !== "link" &&
        options.source !== "pop" &&
        (isDialogOpen() || isDrawerOpen() || currentScene.preloaderActive)
      ) {
        return false;
      }
      if ((options.source === "sequence" || options.source === "key") && !gestureGate.canStart()) {
        return false;
      }

      // 1. Edge springs would fight the frozen offset and the lift transforms.
      document
        .querySelectorAll<HTMLElement>(`[data-page="${from}"] [data-freeze], [data-page="${from}"] main`)
        .forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));

      // 2. Decide the choreography.
      const scale = timeScale();
      const origin = timelineNow();
      const rigFound = Boolean(currentScene.getRig());
      const kind = deriveKind(from, to, {
        sceneViewport: currentScene.sceneViewport,
        sceneReady: currentScene.isReady,
        rigFound,
        reduced: prefersReducedMotion(),
        uaTransition: Boolean(options.uaTransition),
      });
      const direction = directionOf(from, to);
      const homeVisualIsScene = currentScene.sceneViewport && (from === "/" || to === "/");
      // The earlier page is always the sheet; reduced motion fades the outgoing one.
      const sheet: PagePath =
        kind === "fade" || kind === "instant" ? from : direction > 0 ? from : to;
      // A lift a finger started (a touch pull, or any lift in the phone
      // layout) is thrown: shorter, leaving at speed and decelerating. The
      // dashboard flip, where it applies, keeps its proportions to the lift.
      const plain = prefersPlainLift();
      const thrown = options.input === "touch" || plain;
      const liftScale = thrown ? THROW_MS / LIFT_MS : 1;
      const duration =
        kind === "instant" ? 0 : kind === "fade" ? FADE_MS * scale : (thrown ? THROW_MS : LIFT_MS) * scale;
      // A sheet that arrived but has not been unframed yet (a history step
      // fast-forwarded it) is still framed at this offset, not window.scrollY.
      const pending = pendingArrival.current;
      pendingArrival.current = null;
      const framedScrollY = pending && pending.path === from ? pending.y : undefined;

      // Remember where the page being left was, for a later Back/Forward onto
      // it. A history step lands where its entry was left; one this session
      // never saw falls back to the sequence rule (backward shows the bottom).
      if (leavingSettledEntry) {
        rememberScroll({
          y: framedScrollY ?? window.scrollY,
          main: document.querySelector<HTMLElement>(`[data-page="${from}"] main`)?.scrollTop ?? 0,
        });
      }
      const restored = options.source === "pop" ? savedScrollFor(window.history.state) : null;
      const arrival: Arrival =
        restored ??
        options.arrival ??
        ((options.source === "sequence" || options.source === "pop") && direction < 0 ? "bottom" : "top");

      const t: PageTransition = {
        id: nextId.current++,
        from,
        to,
        kind,
        direction,
        arrival,
        source: options.source,
        plain,
        sheet,
        startedAt: origin,
        liftStartAt: kind === "flip" ? origin + FLIP_LEAD_MS * liftScale * scale : origin,
        commitAt: null,
        duration,
        ease: thrown ? EASE_THROW : EASE_LIFT,
        flipDuration: FLIP_MS * liftScale * scale,
        homeVisualIsScene,
        popScrollY: framedScrollY ?? (options.source === "pop" ? window.scrollY : undefined),
        settled: false,
      };

      const track = new TransitionTimeline(origin);
      timeline.current = track;
      if (process.env.NODE_ENV !== "production" && armedSeek.current !== null) {
        track.seek(armedSeek.current);
      }

      // 3. Lock input for the whole flight.
      lock(options);
      markStarted(window.performance.now());

      // Home's scene waits one viewport up, ready to come down as Home's sheet.
      if (homeVisualIsScene && to === "/" && isLiftKind(t)) {
        const container = currentScene.containerRef.current;
        if (container) container.style.transform = translateY(-window.innerHeight);
      }

      // 4. Publish: layers take their stacking order and the scene is shown
      //    (above the page underneath when it is Home's sheet) in one render.
      setTransition(t);

      // 5–6. Drive the dashboard rig.
      if (kind === "flip") {
        const rig = currentScene.getRig();
        const flip = startFlip(track, {
          offset: 0,
          duration: t.flipDuration,
          ease: EASE_FLIP,
          from: Number(rig?.rotation.x ?? 0),
          to: -Math.PI,
          pull: pullAt,
        });
        flip.finished.then(
          () =>
            gtag.event({
              action: "dashboard_flip_completed",
              category: "portfolio_navigation",
              label: "home_to_about",
              value: 1,
            }),
          () => undefined
        );
      } else if (kind === "unflip") {
        // Starts turning back with the lift, once the route has committed.
        currentScene.setFlip(-Math.PI);
        currentScene.setBlobPull(1);
      } else if (to === "/") {
        // Off screen (or underneath) until it lands, so this never shows as a rotation.
        currentScene.setFlip(0);
        currentScene.setBlobPull(0);
      }

      // 7. Analytics.
      if (from === "/" && to === "/about") {
        gtag.event({
          action: "dashboard_flip_started",
          category: "portfolio_navigation",
          label: "home_to_about",
          value: 1,
        });
      } else if (from === "/about" && to === "/") {
        gtag.event({
          action: "dashboard_return_started",
          category: "portfolio_navigation",
          label: "about_to_home",
          value: 1,
        });
      }

      // A route that never commits must not leave the site locked.
      watchdogTimer.current = window.setTimeout(() => {
        const current = getTransition();
        if (!current || current.id !== t.id || current.commitAt !== null) return;
        stopFlip(false);
        timeline.current?.cancel();
        timeline.current = null;
        sceneRef.current.setFlip(0);
        sceneRef.current.setBlobPull(0);
        const container = sceneRef.current.containerRef.current;
        if (container) container.style.transform = "";
        releaseLocks();
        setTransition(null);
      }, COMMIT_WATCHDOG_MS);

      // 8. Route change (history navigations are already being applied by the router).
      if (options.source !== "pop") router.push(to, { scroll: false });
      return true;
    },
    [fastForward, lock, releaseLocks, router, startFlip, stopFlip]
  );

  // Arrival + choreography. Runs in the commit that mounts the next route,
  // after every layer has registered (child layout effects run first), so all
  // tracks are created in one frame and pinned to the same start time.
  useLayoutEffect(() => {
    pathnameRef.current = pathname;
    // The router has written the new history entry in this commit (or, for
    // Back/Forward, the browser already stands on it).
    adoptHistoryEntry(pathname);
    const t = getTransition();
    const track = timeline.current;
    if (!isInFlight(t) || t.to !== pathname || t.commitAt !== null || !track) return;

    t.commitAt = window.performance.now();
    if (watchdogTimer.current !== null) window.clearTimeout(watchdogTimer.current);
    watchdogTimer.current = null;

    const vh = window.innerHeight;
    const lift = isLiftKind(t);
    const forward = t.direction > 0;
    const exiting = layerRegistry.get(t.from);
    const incoming = layerRegistry.get(t.to);
    const container = sceneRef.current.containerRef.current;
    const main = document.querySelector<HTMLElement>(`[data-page="${t.to}"] main`);
    const mainScrolls = Boolean(main && main.scrollHeight > main.clientHeight);

    // Arrival scroll: forward shows the next page's top, backward its bottom,
    // and a history step the offset its entry was left at.
    const restored = typeof t.arrival === "object" ? t.arrival : null;
    if (lift && !forward) {
      // The arriving page is the sheet: one viewport tall, framed at its
      // arrival offset so its bottom edge is the edge that comes down.
      let framedY = 0;
      if (main && mainScrolls) {
        main.scrollTop = restored ? restored.main : t.arrival === "top" ? 0 : main.scrollHeight;
      }
      if (incoming?.freeze && (restored || (t.arrival === "bottom" && !mainScrolls))) {
        const maxY = Math.max(0, incoming.freeze.offsetHeight - vh);
        framedY = restored ? Math.min(restored.y, maxY) : maxY;
      }
      if (incoming?.freeze) incoming.freeze.style.transform = framedY ? translateY(-framedY) : "";
      t.arrivalScrollY = framedY;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } else if (restored) {
      if (main) main.scrollTop = restored.main;
      window.scrollTo({ top: restored.y, left: 0, behavior: "instant" });
    } else if (t.arrival === "top") {
      if (main) main.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } else if (main && mainScrolls) {
      main.scrollTop = main.scrollHeight;
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, left: 0, behavior: "instant" });
    }

    // Every lift track starts together, after the flip lead (or now, if the
    // route took longer than the lead to commit).
    const committedAt = timelineNow();
    track.rebase(committedAt);
    const offset = Math.max(t.liftStartAt, committedAt) - track.origin;
    const timing: KeyframeAnimationOptions = {
      duration: t.duration,
      easing: cssEase(t.ease),
      fill: "both",
    };
    const play = (
      element: Element | null | undefined,
      keyframes: Keyframe[],
      cancelOnSettle: boolean,
      options: KeyframeAnimationOptions = timing
    ) => {
      if (!element) return;
      track.add(element.animate(keyframes, options), offset, cancelOnSettle);
    };
    const move = (fromPx: number, toPx: number) => [
      { transform: translateY(fromPx) },
      { transform: translateY(toPx) },
    ];

    if (lift) {
      const sheet = forward ? exiting : incoming;
      const under = forward ? incoming : exiting;
      // Forward tracks on the exiting page hold their last frame until it is
      // removed; tracks on the page that stays are dropped on settle.
      const keepSheet = !forward;
      const keepUnder = forward;

      // The sheet: lifts one viewport away, or comes back down from it.
      play(sheet?.el, forward ? move(0, -vh) : move(-vh, 0), keepSheet);

      // Depth inside the sheet: foreground content pulls ahead of it, and
      // decorative layers trail it inside their frames.
      if (!t.plain) {
        const lead = CONTENT_LEAD * vh;
        for (const element of depthTargets(sheet?.el, t.sheet)) {
          play(element, forward ? move(0, -lead) : move(-lead, 0), keepSheet);
        }
        for (const { element, lag } of lagTargets(sheet?.el, vh)) {
          play(element, forward ? move(0, lag) : move(lag, 0), keepSheet);
        }
        // Underneath, they trail the page as it sinks, or settle into place
        // as it rises (a forward arrival: Home to About).
        for (const { element, lag } of lagTargets(under?.el, vh)) {
          play(
            element,
            forward
              ? [{ transform: PHOTO_SETTLE_FROM }, { transform: "translate3d(0px, 0px, 0px) scale(1)" }]
              : move(0, -lag),
            keepUnder
          );
        }
      }

      // The page underneath rises ~0.2x the sheet's travel (phones: it only un-dims).
      if (!t.plain) {
        const sink = UNDER_OFFSET * vh;
        play(under?.el, forward ? move(sink, 0) : move(0, sink), keepUnder);
      }
      play(
        under?.scrim,
        forward ? [{ opacity: SCRIM_MAX }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: SCRIM_MAX }],
        keepUnder
      );

      // Home's desktop sheet is the 3D scene: it lifts and lands with Home.
      if (t.homeVisualIsScene && t.sheet === "/" && container) {
        play(container, forward ? move(0, -vh) : move(-vh, 0), !forward);
        container.style.transform = "";
      }

      // The dashboard turns back upright as Home lands.
      if (t.kind === "unflip") {
        startFlip(track, {
          offset,
          duration: t.duration,
          ease: t.ease,
          from: -Math.PI,
          to: 0,
          pull: returnPullAt,
        });
      }
    } else if (t.kind === "fade") {
      // Reduced motion: nothing moves. The arrived page is fully there
      // underneath and the outgoing one fades away over it.
      const fade: KeyframeAnimationOptions = {
        duration: t.duration,
        easing: cssEase(EASE_FADE),
        fill: "both",
      };
      const out = [{ opacity: 1 }, { opacity: 0 }];
      play(exiting?.el, out, false, fade);
      if (t.homeVisualIsScene && t.from === "/" && container) play(container, out, false, fade);
    }

    // The arriving page is placed: let it measure its arrival view and, on a
    // lift, tie its own entrance to this timeline.
    notifyArrival(
      t,
      lift
        ? { add: (animation) => track.add(animation, offset, true), duration: t.duration }
        : null
    );

    if (track.duration > 0) armSettle(t, track);
    else window.requestAnimationFrame(() => settle());
  }, [armSettle, pathname, settle, startFlip]);

  // Development hooks for deterministic frames: `__pageTransitionSeek(p)`
  // pauses the in-flight transition at overall progress p in [0, 1] (or the
  // next one, when nothing is in flight); `__pageTransitionResume()` plays on.
  useEffect(() => {
    // Inlined (not the shared flag) so production builds drop the hooks entirely.
    if (process.env.NODE_ENV === "production") return;
    const devWindow = window as DevWindow;
    devWindow.__pageTransitionSeek = (p: number) => {
      const t = getTransition();
      const track = timeline.current;
      if (!isInFlight(t) || !track) {
        armedSeek.current = p;
        return;
      }
      track.seek(p);
      applyFlip();
      if (safetyTimer.current !== null) window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    };
    devWindow.__pageTransitionResume = () => {
      armedSeek.current = null;
      const t = getTransition();
      const track = timeline.current;
      if (!isInFlight(t) || !track) return;
      track.resume();
      if (t.commitAt !== null) armSettle(t, track);
    };
    return () => {
      delete devWindow.__pageTransitionSeek;
      delete devWindow.__pageTransitionResume;
    };
  }, [applyFlip, armSettle]);

  // Browser history: snapshot and choreograph before the router swaps pages.
  // This child effect registers before AppRouter's own popstate listener.
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    adoptHistoryEntry(window.location.pathname);

    const pageMain = () =>
      document.querySelector<HTMLElement>(`[data-page="${window.location.pathname}"] main`);

    // Manual restoration also turns off the browser's own restore on reload and
    // cross-document Back/Forward, so this document's offset is saved on the
    // way out and put back here when it is reloaded or traversed back to.
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const saved =
      navEntry && (navEntry.type === "reload" || navEntry.type === "back_forward")
        ? savedScrollFor(window.history.state)
        : null;
    let restoreFrame = 0;
    if (saved && (saved.y > 0 || saved.main > 0)) {
      const startedAt = performance.now();
      const restore = () => {
        window.scrollTo(0, saved.y);
        const main = pageMain();
        if (main) main.scrollTop = saved.main;
        const reached =
          Math.abs(window.scrollY - saved.y) < 2 && (!main || Math.abs(main.scrollTop - saved.main) < 2);
        // Content (images, the scene) can still be growing the page; keep trying briefly.
        if (!reached && performance.now() - startedAt < 1500) restoreFrame = requestAnimationFrame(restore);
      };
      restore();
    }

    const onPageHide = () => {
      rememberScroll({ y: window.scrollY, main: pageMain()?.scrollTop ?? 0 });
    };

    const onPopState = (event: PopStateEvent) => {
      navigate(window.location.pathname, {
        source: "pop",
        uaTransition: Boolean((event as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition),
      });
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      cancelAnimationFrame(restoreFrame);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [navigate]);

  // Rail, drawer and in-page links to sequence pages use the same lift.
  // Next's <Link> skips its own navigation once the click is defaultPrevented,
  // while its onClick props (drawer close, rail sounds) still run.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.search || url.hash) return;
      if (!isPagePath(url.pathname)) return;
      // Off the sequence (the 404 page) there is no lift, and a client-side
      // route change would leave the old layer's exit unreleased: load the page.
      if (!isPagePath(pathnameRef.current)) {
        event.preventDefault();
        window.location.assign(url.href);
        return;
      }
      if (url.pathname === pathnameRef.current && !isTransitionLocked()) return;

      event.preventDefault();
      if (isTransitionLocked() || !navigate(url.pathname, { source: "link" })) markClickDropped(event);
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [navigate]);

  // The one wheel gate. Every event is recorded (cadence is tracked in flight
  // too, so the gate knows whether input is still the same gesture at
  // settle). In flight, and while the gesture that brought the visitor here
  // is still being swallowed, the event neither scrolls nor reaches anything
  // past the window's capture phase: Spline scenes take raw wheel events on a
  // window listener whatever their defaultPrevented. Pinch-zoom
  // (ctrlKey) keeps its default and, once settled, is never gated.
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const swallowed = gestureGate.swallow(event);
      const locked = isTransitionLocked();
      // An open modal scrolls its own content, as it always has.
      if (!locked && (event.ctrlKey || !swallowed || isDialogOpen())) return;
      if (!event.ctrlKey && event.cancelable) event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => window.removeEventListener("wheel", onWheel, true);
  }, []);

  // Settle focuses the arrived page's <main>, so a scroll key still
  // auto-repeating from before settle would scroll it at once: its repeats are
  // held for LANDING_MS, like a wheel still spinning.
  useEffect(() => {
    const pressedAt = new Map<string, number>();
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.repeat) {
        pressedAt.set(event.key, window.performance.now());
        return;
      }
      if (isTransitionLocked() || !NAV_KEYS.has(event.key)) return;
      if (isTextInput(event.target) || isActivationOnControl(event)) return;
      const settledAt = getLastSettleAt();
      const now = window.performance.now();
      if ((pressedAt.get(event.key) ?? Number.NEGATIVE_INFINITY) >= settledAt || now - settledAt >= LANDING_MS) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      pressedAt.delete(event.key);
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, []);

  useEffect(
    () => () => {
      clearTimers();
      stopFlip(false);
      releaseLocks();
    },
    [clearTimers, releaseLocks, stopFlip]
  );

  const value = useMemo(() => ({ navigate, settle }), [navigate, settle]);

  return <PageTransitionContext.Provider value={value}>{children}</PageTransitionContext.Provider>;
}
