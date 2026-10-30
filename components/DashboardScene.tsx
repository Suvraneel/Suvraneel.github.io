/* eslint-disable react-hooks/set-state-in-effect */

import SplineObj, { subscribeRuntimeDisposals } from "@components/SplineObject";
import StairsPreloader, { PRELOADER_FAILSAFE_MS, type PreloaderStatus } from "@components/StairsPreloader";
import { isInFlight, useTransitionState } from "@components/transition/transitionStore";
import { SHEET_SHADOW } from "@lib/pageTransition";
import { hasHardwareRenderer } from "@lib/gpu";
import { renderOnDemand, requestSceneFrame } from "@lib/splineScroll";
// WAAPI only: no motion value is left behind to write the transform back after it is cleared.
import { animate } from "motion/mini";
import { AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

const DASHBOARD_SCENE = "/spline/sceneDACCORD_NEW.splinecode";
const FLIP_RIG = "Dashboard Flip Rig";
const BLOB = "Blob | Primary";
/** Pulled all the way in, the blob is this small, and hidden (a zero scale would leave it a singular matrix). */
const BLOB_PULLED_SCALE = 0.02;
// SplineObj skips rendering at or below this width.
export const SPLINE_MIN_WIDTH = 550;
const FALLBACK_AFTER_MS = 8000;
const PRELOADER_MAX_MS = 30000;
// How long the preloader shows "still loading" or "unavailable" before opening onto the fallback.
const SLOW_NOTICE_MS = 1200;
// Extra hold at 100% so slow GPUs finish settling before the reveal.
const READY_HOLD_MS = 2000;
// Under the preloader the scene waits slightly large and low, then settles into
// place as the columns lift, so they open onto a scene still arriving.
const PRELOADER_HOLD = "translateY(10px) scale(1.04)";
const SETTLE_TO = "translateY(0px) scale(1)";
const SETTLE_EASE = [0.16, 1, 0.3, 1] as const;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type DashboardSceneContextValue = {
  app: any;
  isReady: boolean;
  /** Viewport is wide enough for the 3D dashboard (phones get the static hero). */
  sceneViewport: boolean;
  /** The scene failed to load or start. */
  sceneFailed: boolean;
  /** The first-visit stairs preloader is covering the screen. */
  preloaderActive: boolean;
  /** The fixed full-screen scene wrapper; page transitions lift it with the Home sheet. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** The flip rig of the live Spline app (never a disposed or replaced one). */
  getRig: () => any;
  /** Sets the rig's flip rotation (radians) on the live app, if it has loaded. */
  setFlip: (rotation: number) => void;
  /**
   * Pulls the blob in behind the turning dashboard: 0 as Home rests (the blob
   * exactly as its idle loop has it), 1 gone.
   */
  setBlobPull: (amount: number) => void;
  /** HomePage reports whether its static hero is on screen. */
  setHeroShown: (shown: boolean) => void;
};

const noop = () => undefined;

const DashboardSceneContext = createContext<DashboardSceneContextValue>({
  app: null,
  isReady: false,
  sceneViewport: false,
  sceneFailed: false,
  preloaderActive: false,
  containerRef: { current: null },
  getRig: () => null,
  setFlip: noop,
  setBlobPull: noop,
  setHeroShown: noop,
});

export const useDashboardScene = () => useContext(DashboardSceneContext);

export const DashboardSceneProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const transition = useTransitionState();
  const inFlight = isInFlight(transition);
  const [app, setApp] = useState<any>(null);
  const [isReady, setReady] = useState(false);
  const [hasSceneError, setSceneError] = useState(false);
  // Spline reported a failed load (hasSceneError alone may just mean "slow").
  const [sceneLoadFailed, setSceneLoadFailed] = useState(false);
  const [isSplineViewport, setSplineViewport] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Home's static hero is on screen (HomePage's heroOnScreen, reported here).
  const [heroShown, setHeroShown] = useState(false);
  // While a transition into or out of Home is in flight, the scene is Home's
  // sheet (it lifts away or comes down with Home), so it stays shown and mounted.
  const homeFlight = inFlight && (transition.from === "/" || transition.to === "/");
  const isVisible = pathname === "/" || homeFlight;
  // The scene rides above the page underneath whenever it is the moving sheet.
  // Reduced motion into Home keeps it below: the outgoing page fades over it.
  const sceneOnTop =
    homeFlight &&
    transition.homeVisualIsScene &&
    transition.kind !== "instant" &&
    !(transition.kind === "fade" && transition.to === "/");
  const sceneShadow = sceneOnTop && transition.kind !== "fade";
  // While Home shows its static hero instead of the scene, the hero rides the
  // sheet over the scene's fallback: at the sheet's own z-index the container
  // paints first and Home's transparent layer, which carries the hero, paints over it.
  const sceneZ = heroShown ? 2 : 3;
  // Once the dashboard has loaded it stays mounted for the session (paused
  // while hidden), so it is never torn down and loaded again next to another
  // live Spline runtime: a dashboard created while one is alive renders
  // ghosted (the backface mask stops occluding the mirrored back panel). Its
  // first load waits for that too (SplineObj's waitForSoleRuntime).
  const [hasLoaded, setHasLoaded] = useState(false);
  const shouldMountDashboard =
    hasLoaded ||
    pathname === "/" ||
    pathname === "/about" ||
    (inFlight &&
      (transition.from === "/" || transition.from === "/about" || transition.to === "/"));
  // Only a direct first load of Home gets the stairs preloader. A direct load
  // of About shows About at once while the scene loads quietly behind it
  // (the fallback covers Home if it is not ready by the flip back).
  const [isInitialLoad, setInitialLoad] = useState(pathname === "/");
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  /** ms from navigation start to the scene's first rendered frames (the preloader prints it). */
  const [readyAt, setReadyAt] = useState<number | null>(null);
  // The server HTML of Home carries the preloader's first frame; it stays until
  // the effects below decide whether this visit gets the preloader at all.
  const [hydrated, setHydrated] = useState(false);
  const needsScene = shouldMountDashboard && !sceneUrl;
  const containerRef = useRef<HTMLDivElement | null>(null);
  // The wrapper inside containerRef: page transitions own containerRef's transform.
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const wasPreloading = useRef(false);
  const appRef = useRef<any>(null);

  useEffect(() => {
    const viewport = window.matchMedia(`(min-width: ${SPLINE_MIN_WIDTH + 1}px)`);
    const updateViewport = () => setSplineViewport(viewport.matches);
    updateViewport();
    // Hydrated after the server-rendered cover's failsafe hid it: no preloader this visit.
    if (performance.now() >= PRELOADER_FAILSAFE_MS) setInitialLoad(false);
    setHydrated(true);
    viewport.addEventListener("change", updateViewport);
    return () => viewport.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = () => setReduceMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  // Download the scene ourselves for real progress, then hand Spline the same bytes.
  // Phones never download it; one widened or rotated past SPLINE_MIN_WIDTH does then.
  useEffect(() => {
    if (!needsScene || !isSplineViewport) return;

    const controller = new AbortController();
    const load = async () => {
      const hardware = await hasHardwareRenderer();
      if (controller.signal.aborted) return;
      // Without a GPU the scene would hold the main thread for seconds a frame
      // (lib/gpu.ts): skip the download and open onto the static fallback.
      if (!hardware) {
        setSceneError(true);
        setSceneLoadFailed(true);
        return;
      }
      // Warm the lazy Spline runtime chunk in parallel with the scene download.
      void import("@splinetool/react-spline");
      try {
        const blob = await fetchWithProgress(DASHBOARD_SCENE, controller.signal, setDownloadProgress);
        // Fragment satisfies Spline's extension check; fetch ignores it on blob URLs.
        setSceneUrl(`${URL.createObjectURL(blob)}#.splinecode`);
      } catch {
        if (!controller.signal.aborted) setSceneUrl(DASHBOARD_SCENE);
      }
    };
    void load();

    return () => controller.abort();
  }, [needsScene, isSplineViewport]);

  // Re-checked when the viewport crosses SPLINE_MIN_WIDTH: once narrow, the first
  // visit has no preloader (widened later, Home keeps its hero until the scene is
  // ready). The width is read directly: isSplineViewport is false on the first pass.
  useEffect(() => {
    if (!shouldMountDashboard || window.innerWidth <= SPLINE_MIN_WIDTH) {
      setInitialLoad(false);
      return;
    }
    if (!isReady) return;

    const timeoutId = window.setTimeout(() => setInitialLoad(false), READY_HOLD_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isReady, isSplineViewport, shouldMountDashboard]);

  // Not ready by FALLBACK_AFTER_MS: say so for a moment, then open onto the static
  // dashboard, which the scene replaces whenever it does arrive.
  useEffect(() => {
    if (!isInitialLoad || !hasSceneError || isReady) return;
    const timeoutId = window.setTimeout(() => setInitialLoad(false), SLOW_NOTICE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [hasSceneError, isInitialLoad, isReady]);

  useEffect(() => {
    if (!isInitialLoad) return;

    const timeoutId = window.setTimeout(() => setInitialLoad(false), PRELOADER_MAX_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isInitialLoad]);

  // Hidden, the scene does no work: its render loop and events are paused
  // (only after its first frames are compiled, so a later reveal never stalls).
  // play() rebuilds its events, and the idle loop is put back where it paused
  // (resumeIdleLoop); under reduced motion a shown scene is held still, so the
  // hold follows every play().
  useLayoutEffect(() => {
    if (!app || !isReady) return;
    // The idle loop is kept before stop() or play() can leave only a rebuilt copy of it.
    keepIdleLoop(app);
    if (!isVisible) {
      app.stop?.();
      return;
    }
    // Released from reduced motion: a restart brings the idle loop back.
    if (!reduceMotion && releaseSceneStill(app)) app.stop?.();
    app.play?.();
    resumeIdleLoop(app);
    if (reduceMotion) holdSceneStill(app);
  }, [app, isReady, isVisible, reduceMotion]);

  // Another runtime's disposal (Work's plant, once Work has gone) takes the
  // idle loop off the shared ticker; the shown scene puts it back.
  useEffect(() => {
    if (!app || !isReady || !isVisible || reduceMotion) return;
    return subscribeRuntimeDisposals(() => resumeIdleLoop(app));
  }, [app, isReady, isVisible, reduceMotion]);

  useEffect(() => {
    if (!shouldMountDashboard || isReady) return;

    const timeoutId = window.setTimeout(() => {
      setSceneError(true);
    }, FALLBACK_AFTER_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isReady, shouldMountDashboard]);

  // Always resolved through the live app, so a rig handle can never outlive the
  // Spline runtime that owns it (the scene unmounts past About and reloads).
  const getRig = useCallback(() => appRef.current?.findObjectByName?.(FLIP_RIG) ?? null, []);

  const setFlip = useCallback(
    (rotation: number) => {
      const rig = getRig();
      if (!rig || rig.rotation.x === rotation) return;
      rig.rotation.x = rotation;
      // A scene held still draws only on request (a rig write makes none).
      requestSceneFrame(appRef.current);
    },
    [getRig]
  );

  const setBlobPull = useCallback((amount: number) => pullBlob(appRef.current, amount), []);

  // A lift that has settled away from Home leaves the hidden scene at its last
  // keyframe; drop that before it can be shown again.
  useLayoutEffect(() => {
    if (isVisible) return;
    const container = containerRef.current;
    if (!container) return;
    container.getAnimations().forEach((animation) => animation.cancel());
    container.style.transform = "";
  }, [isVisible]);

  const preloaderActive = isInitialLoad && isSplineViewport;
  const holdUnderPreloader = preloaderActive && !reduceMotion;

  // The cover leaving (its hold ending, or a skip) lets the held scene settle
  // under the lifting columns. Reduced motion never held it.
  useLayoutEffect(() => {
    const handOff = wasPreloading.current && !preloaderActive;
    wasPreloading.current = preloaderActive;
    const scene = sceneRef.current;
    if (!handOff || !scene || reduceMotion) return;
    // React has just dropped the held transform; keep it until the settle starts.
    scene.style.transform = PRELOADER_HOLD;
    const settle = animate(
      scene,
      { transform: [PRELOADER_HOLD, SETTLE_TO] },
      { duration: 1.1, delay: 0.1, ease: SETTLE_EASE }
    );
    const clear = () => {
      scene.style.transform = "";
      // Spline caches the canvas rect for pointer hits and re-reads it only on resize or
      // document scroll (which this site never fires); it was read under the hold.
      appRef.current?._onScroll?.();
    };
    void settle.then(clear);
    return () => {
      settle.stop();
      clear();
    };
  }, [preloaderActive, reduceMotion]);

  // Weighted so the end means "the scene is drawing", not just "bytes arrived":
  // download 0-70%, scene handed to Spline 72%, loaded 85%, first frames 100%.
  const preloaderProgress = isReady
    ? 1
    : app
      ? 0.85
      : sceneUrl
        ? 0.72
        : (downloadProgress ?? 0.02) * 0.7;
  // The scene error timer fires on a slow load too; the preloader says which, then opens onto the fallback.
  const preloaderStatus: PreloaderStatus = isReady
    ? "ready"
    : sceneLoadFailed
      ? "failed"
      : hasSceneError
        ? "slow"
        : "loading";
  const skipPreloaderHold = useCallback(() => setInitialLoad(false), []);

  const value = useMemo<DashboardSceneContextValue>(
    () => ({
      app,
      isReady,
      sceneViewport: isSplineViewport,
      sceneFailed: hasSceneError,
      preloaderActive,
      containerRef,
      getRig,
      setFlip,
      setBlobPull,
      setHeroShown,
    }),
    [app, getRig, hasSceneError, isReady, isSplineViewport, preloaderActive, setFlip, setBlobPull]
  );

  // Off the first visit, an unready scene shows the static dashboard as its
  // backdrop (never bare black). The canvas sits fully opaque underneath and
  // the fallback fades away once Spline has painted its first frames.
  const showFallback = shouldMountDashboard && (hasSceneError || !isInitialLoad);

  return (
    <DashboardSceneContext.Provider value={value}>
      <div
        ref={containerRef}
        className={`fixed inset-0 z-0 ${isVisible ? "visible" : "invisible pointer-events-none"}`}
        style={
          sceneOnTop
            ? {
                zIndex: sceneZ,
                pointerEvents: "none",
                // The Spline canvas is transparent over the black body; as a
                // sheet it carries that same black so it stays opaque.
                backgroundColor: "#000",
                boxShadow: sceneShadow ? SHEET_SHADOW : undefined,
              }
            : undefined
        }
        aria-hidden={!isVisible}
      >
        {shouldMountDashboard && sceneUrl && (
          <div
            ref={sceneRef}
            style={holdUnderPreloader ? { transform: PRELOADER_HOLD } : undefined}
            className={`absolute inset-0 ${
              showFallback
                ? "opacity-100"
                : `transition-opacity duration-700 ease-out ${isReady ? "opacity-100" : "opacity-0"}`
            }`}
          >
            <SplineObj
              // scene="https://prod.spline.design/bMG02F4Rm1UpL5wP/scene.splinecode"
              scene={sceneUrl}
              // Its first load must not overlap another live Spline runtime
              // (Work's plant on an exiting page), or it renders ghosted.
              waitForSoleRuntime
              onError={() => {
                // Show the static fallback right away instead of waiting out the timers;
                // a first-visit preloader says so for a moment first (SLOW_NOTICE_MS).
                setSceneError(true);
                setSceneLoadFailed(true);
              }}
              onLoad={(loadedApp) => {
                // react-spline reports load for an Application it has already
                // disposed (Strict Mode remount, or an unmount mid-load). Adopting
                // that one would point every later rig write at a dead scene.
                if (!loadedApp || loadedApp.disposed) return;
                appRef.current = loadedApp;
                setHasLoaded(true);
                // A freshly loaded dashboard always faces forward; a running flip
                // re-applies its own rotation on the next frame.
                const rig = loadedApp.findObjectByName?.(FLIP_RIG);
                if (rig) rig.rotation.x = 0;
                setApp(loadedApp);
                // Canvas is unhidden and first frames compiled only after load resolves.
                waitForFrames(4, () => {
                  setReadyAt((current) => current ?? performance.now());
                  setReady(true);
                });
              }}
            />
          </div>
        )}
        {showFallback && (
          <div
            className={`pointer-events-none absolute inset-0 hidden transition-opacity duration-700 ease-out min-[551px]:block ${
              isReady ? "opacity-0" : "opacity-100"
            }`}
          >
            <DashboardFallback />
          </div>
        )}
      </div>
      <AnimatePresence>
        {(preloaderActive || (!hydrated && pathname === "/")) && (
          <StairsPreloader
            progress={preloaderProgress}
            status={preloaderStatus}
            readyAt={readyAt}
            onSkip={isReady ? skipPreloaderHold : undefined}
          />
        )}
      </AnimatePresence>
      {children}
    </DashboardSceneContext.Provider>
  );
};

async function fetchWithProgress(
  url: string,
  signal: AbortSignal,
  onProgress: (progress: number) => void
) {
  const response = await fetch(url, { signal });
  if (!response.ok || !response.body) throw new Error(`Scene fetch failed: ${response.status}`);

  // Compressed responses report encoded length, so progress is only an estimate there.
  const total = Number(response.headers.get("content-length")) || 0;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total) onProgress(received / total);
  }

  onProgress(1);
  return new Blob(chunks as BlobPart[]);
}

function waitForFrames(count: number, callback: () => void) {
  if (count <= 0) {
    callback();
    return;
  }
  window.requestAnimationFrame(() => waitForFrames(count - 1, callback));
}

// ---------------------------------------------------------------------------
// Reduced motion holds the dashboard still: its idle loop (the blob's looping
// Start transition) and its autoplaying card videos are paused, its camera no
// longer turns toward the pointer, and frames are drawn only when something
// changes. Hover states and links still run: they are the scene's own events,
// and they request their frames themselves.
//
// This reaches into the runtime's event manager and controls, which are not
// public API (lib/splineScroll.ts does the same). Checked against
// @splinetool/runtime 2.0.75 (pinned): on any other shape it does nothing.
// ---------------------------------------------------------------------------

type StartTransition = { loopsForever?: boolean; pause: () => void };
type StartEvent = { actions?: { Transition?: StartTransition[] } };
type OrbitControls = { hoverRotatePanMode?: unknown };

/** Hover mode (1 rotate, 2 pan) of each held camera, put back on release. */
const heldHoverModes = new WeakMap<OrbitControls, number>();

function holdSceneStill(app: any) {
  // The pointer-follow is the camera's hover rotate (the scene has no LookAt or
  // Follow events); mode 0 turns it off. It does not depend on the checks below,
  // and the controls outlive stop() / play(), so only a release puts it back.
  const orbit: OrbitControls | undefined = app?._controls?.orbitControls;
  if (typeof orbit?.hoverRotatePanMode === "number" && !heldHoverModes.has(orbit)) {
    heldHoverModes.set(orbit, orbit.hoverRotatePanMode);
    orbit.hoverRotatePanMode = 0;
  }

  const start = app?.eventManager?.handlers?.Start;
  const controls = app?._controls;
  const update = controls && Object.getPrototypeOf(controls).update;
  if (
    !(start?.eventsPerObject instanceof Map) ||
    typeof start.pauseVideos !== "function" ||
    typeof update !== "function" ||
    typeof app._requestRenderAutoMode !== "function"
  ) {
    return;
  }

  for (const events of start.eventsPerObject.values() as Iterable<StartEvent[]>) {
    for (const event of events) {
      event.actions?.Transition?.forEach((transition) => {
        if (transition.loopsForever) transition.pause();
      });
    }
  }
  start.pauseVideos();
  // Otherwise the runtime draws every frame while the scene has videos.
  start.hasVideoAction = false;
  // Frames stop once the image settles (lib/splineScroll.ts).
  renderOnDemand(app);
}

/** Undoes holdSceneStill's patches; true if the idle loop was held (it needs a restart). */
function releaseSceneStill(app: any) {
  const orbit: OrbitControls | undefined = app?._controls?.orbitControls;
  const hoverMode = orbit ? heldHoverModes.get(orbit) : undefined;
  if (orbit && hoverMode !== undefined) {
    orbit.hoverRotatePanMode = hoverMode;
    heldHoverModes.delete(orbit);
  }

  const controls = app?._controls;
  if (!controls || !Object.hasOwn(controls, "update")) return false;
  delete controls.update;
  return true;
}

// ---------------------------------------------------------------------------
// The idle loop (the blob's looping Start transition) resumes where it paused.
// Two things in the runtime would otherwise leave the blob frozen on Home:
//
// - play() rebuilds every Start event, and the rebuilt loop opens on the
//   blob's current state, which the loop itself moves to its far state halfway
//   through each pass. Rebuilt past that point, it runs from that state to
//   itself and never moves. So the loop the scene loaded with is kept for the
//   session: play()'s rebuilt copy is set aside, and the kept loop takes its
//   place again, its pass stopped where stop() left it.
// - Disposing any other runtime (Work's plant, once Work has gone) disposes
//   the transition ticker all runtimes share: the loop is no longer updated,
//   and the ticker's clock starts again from zero. The kept loop is put back.
//
// Either way the ticker time the loop was off it is skipped, so its pass
// picks up exactly where it was last drawn.
//
// Same runtime internals and pinned version as holdSceneStill (the Start
// handler's transitions and their runners): on any other shape the loop is
// left as the runtime has it.
// ---------------------------------------------------------------------------

type LoopPass = { isPlaying: boolean; startTime: number; endTime: number };
type LoopRunner = {
  isPlaying: boolean;
  hasPlayedOnce: boolean;
  hasClaimed: boolean;
  claimedAt?: number;
  startTime: number;
  currentTween?: LoopPass;
};
type IdleLoop = StartTransition & {
  data: object;
  object: { previousAction?: unknown };
  runner?: LoopRunner;
  start: () => void;
  update: (time: number) => unknown;
};
type KeptLoop = {
  loop: IdleLoop;
  /** The ticker time the loop was last drawn at. */
  lastTime?: number;
  /** Set on resume: the next update first skips the ticker time the loop was off it. */
  catchUp: boolean;
};

/** The kept loop of each looping Start transition, by its action data (the same object in every rebuild). */
const keptLoops = new WeakMap<object, KeptLoop>();

/** Calls `visit` with each looping Start transition the scene has, and the list it sits in. */
function forEachIdleLoop(app: any, visit: (loop: IdleLoop, list: IdleLoop[], index: number) => void) {
  const start = app?.eventManager?.handlers?.Start;
  if (!(start?.eventsPerObject instanceof Map)) return;
  for (const events of start.eventsPerObject.values() as Iterable<{ actions?: { Transition?: IdleLoop[] } }[]>) {
    for (const event of events) {
      event.actions?.Transition?.forEach((transition, index, list) => {
        if (transition.loopsForever) visit(transition, list, index);
      });
    }
  }
}

/** Moves a loop's running pass later by `by` seconds of ticker time. */
function shiftPass(runner: LoopRunner | undefined, by: number) {
  const pass = runner?.currentTween;
  if (!runner || !pass) return;
  runner.startTime += by;
  if (runner.claimedAt !== undefined) runner.claimedAt += by;
  pass.startTime += by;
  pass.endTime += by;
}

/** The shared ticker's time, read through a transition's start() on a stand-in runner that starts nothing. */
function tickerTime(loop: IdleLoop) {
  let time: number | undefined;
  // start() hands the runner the ticker's time, and goes on the ticker only if the runner is then playing.
  const standIn = {
    isPlaying: false,
    play: (at: unknown) => {
      if (typeof at === "number") time = at;
    },
  };
  loop.start.call({ runner: standIn });
  return time;
}

/** Keeps each idle loop the scene runs that is not kept yet (called while it still runs the one it loaded with). */
function keepIdleLoop(app: any) {
  forEachIdleLoop(app, (loop) => {
    const update = Object.getPrototypeOf(loop).update;
    if (
      keptLoops.has(loop.data) ||
      typeof update !== "function" ||
      typeof loop.start !== "function" ||
      !loop.runner?.currentTween
    ) {
      return;
    }
    // The loop runs now, so the ticker's time is the time it was last drawn at: a
    // loop held or stopped before its next update still takes up from there.
    const kept: KeptLoop = { loop, catchUp: false, lastTime: tickerTime(loop) };
    loop.update = function (time: number) {
      // Back from a pause or a reset ticker: the pass takes up at the time it was last drawn at.
      if (kept.catchUp && kept.lastTime !== undefined) shiftPass(loop.runner, time - kept.lastTime);
      kept.catchUp = false;
      kept.lastTime = time;
      return update.call(this, time);
    };
    keptLoops.set(loop.data, kept);
  });
}

/**
 * Puts each kept idle loop back in place of play()'s rebuilt copy and back on
 * the ticker, to carry on from where it was last drawn. Only for a playing scene.
 */
function resumeIdleLoop(app: any) {
  if (!app || app.isStopped) return;
  forEachIdleLoop(app, (transition, list, index) => {
    const kept = keptLoops.get(transition.data);
    const runner = kept?.loop.runner;
    const pass = runner?.currentTween;
    if (!kept || !runner?.hasPlayedOnce || !pass) return;
    const { loop } = kept;
    if (transition !== loop) {
      // play() started the rebuilt copy: stopping it also takes it off the ticker.
      transition.pause();
      list[index] = loop;
    }
    // stop() (or a hold) stopped the pass in place; it carries on from there.
    runner.isPlaying = true;
    pass.isPlaying = true;
    // A fresh claim would rebuild the pass from the blob's current scale with
    // its time already part-way through (a jump), so it stays claimed.
    runner.hasClaimed = true;
    loop.object.previousAction = loop;
    kept.catchUp = true;
    // Its runner is playing, so start() only puts it back on the ticker.
    loop.start();
  });
}

// ---------------------------------------------------------------------------
// The flip pulls the blob in behind the turning dashboard. Its idle loop (the
// looping Start transition) writes its scale from the runtime's own animation
// frame, so a scale written from outside is gone before the next draw. The
// pull is applied inside the scene's render instead, after the idle loop has
// moved the blob and before it is drawn, on top of the scale the loop wrote.
// Its material has no opacity that fades (set, it draws flat), so the blob
// shrinks almost to nothing and is then hidden.
//
// Only the drawn frame sees the pull: the blob gets its own scale back as soon
// as the frame is drawn. The loop starts every pass from the blob's live scale,
// so a pulled scale left on the blob between frames would become the loop's
// own and Home would land without its blob.
//
// Same runtime internals and pinned version as holdSceneStill: on any other
// shape the blob is left as it is.
// ---------------------------------------------------------------------------

type Scale = { x: number; y: number; z: number };
type BlobPull = {
  blob: { scale: Scale; visible: boolean };
  amount: number;
  /** Takes the pull back out of the scene's render. */
  detach: () => void;
};

/** The pull on each app's blob, while it is pulled in at all. */
const blobPulls = new WeakMap<object, BlobPull>();

const copyScale = (to: Scale, from: Scale) => {
  to.x = from.x;
  to.y = from.y;
  to.z = from.z;
};

/** Pulls the blob in by `amount` (0 at rest, 1 gone); at 0 it is put back as its idle loop has it. */
function pullBlob(app: any, amount: number) {
  const current = app ? blobPulls.get(app) : undefined;

  if (amount <= 0) {
    if (!current) return;
    blobPulls.delete(app);
    // Its scale is its own again: detach takes back a pull still on it.
    current.detach();
    current.blob.visible = true;
    requestSceneFrame(app);
    return;
  }

  let pull = current;
  if (!pull) {
    const blob = app?.findObjectByName?.(BLOB);
    const animation = app?._animationControls;
    const update = animation && Object.getPrototypeOf(animation).update;
    // The runtime fires "rendered" on its canvas right after each draw.
    const canvas: EventTarget | undefined = app?.canvas;
    if (!blob?.scale || typeof update !== "function" || typeof canvas?.addEventListener !== "function") return;
    /** The blob's own scale, held aside while a frame is drawn with it pulled in. */
    const base = { x: blob.scale.x, y: blob.scale.y, z: blob.scale.z };
    /** Whether the blob carries the pull: from the patched update until its frame is drawn. */
    let carriesPull = false;
    const putBack = () => {
      if (!carriesPull) return;
      copyScale(blob.scale, base);
      carriesPull = false;
    };
    const started: BlobPull = {
      blob,
      amount,
      detach: () => {
        putBack();
        canvas.removeEventListener("rendered", putBack);
        if (Object.hasOwn(animation, "update")) delete animation.update;
      },
    };
    // Runs in every render, after the idle loop's latest write and before the draw.
    animation.update = function (dt: number) {
      // A draw that threw never fired "rendered": its pull comes off first, so
      // it is never saved below as the blob's own scale.
      putBack();
      const result = update.call(this, dt);
      // Between frames the blob carries its own scale, as the idle loop last wrote it.
      copyScale(base, blob.scale);
      const factor = 1 - started.amount * (1 - BLOB_PULLED_SCALE);
      blob.scale.x = base.x * factor;
      blob.scale.y = base.y * factor;
      blob.scale.z = base.z * factor;
      blob.visible = started.amount < 1;
      carriesPull = true;
      return result;
    };
    canvas.addEventListener("rendered", putBack);
    blobPulls.set(app, started);
    pull = started;
  }
  pull.amount = Math.min(1, amount);
  // A scene held still draws only on request; a stopped one is hidden and draws the pull once it plays.
  requestSceneFrame(app);
}


function DashboardFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black" aria-hidden="true">
      <div className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgb(var(--accent)/0.8)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--accent)/0.8)_1px,transparent_1px)] [background-size:4rem_4rem]" />
      <div className="absolute left-[18%] top-[20%] h-[26rem] w-[26rem] rounded-full border border-accent/25 bg-[#0b2730]/30 blur-[1px]" />
      <div className="absolute right-[14%] top-[14%] h-[18rem] w-[18rem] rounded-full border border-white/10 bg-white/[0.025]" />
      <div className="absolute bottom-[18%] right-[25%] h-28 w-28 rotate-45 border border-accent/30 bg-accent/[0.04]" />
    </div>
  );
}
