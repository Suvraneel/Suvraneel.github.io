/* eslint-disable react-hooks/set-state-in-effect */

import SplineObj from "@components/SplineObject";
import StairsPreloader from "@components/StairsPreloader";
import { isInFlight, useTransitionState } from "@components/transition/transitionStore";
import { SHEET_SHADOW } from "@lib/pageTransition";
import { AnimatePresence } from "framer-motion";
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
// SplineObj skips rendering at or below this width.
const SPLINE_MIN_WIDTH = 550;
const FALLBACK_AFTER_MS = 8000;
const PRELOADER_MAX_MS = 30000;
// Extra hold at 100% so slow GPUs finish settling before the reveal.
const READY_HOLD_MS = 2000;

type DashboardSceneContextValue = {
  app: any;
  isReady: boolean;
  /** Viewport is wide enough for the 3D dashboard (phones get the static hero). */
  sceneViewport: boolean;
  /** The first-visit stairs preloader is covering the screen. */
  preloaderActive: boolean;
  /** The fixed full-screen scene wrapper; page transitions lift it with the Home sheet. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** The flip rig of the live Spline app (never a disposed or replaced one). */
  getRig: () => any;
  /** Sets the rig's flip rotation (radians) on the live app, if it has loaded. */
  setFlip: (rotation: number) => void;
};

const noop = () => undefined;

const DashboardSceneContext = createContext<DashboardSceneContextValue>({
  app: null,
  isReady: false,
  sceneViewport: false,
  preloaderActive: false,
  containerRef: { current: null },
  getRig: () => null,
  setFlip: noop,
});

export const useDashboardScene = () => useContext(DashboardSceneContext);

export const DashboardSceneProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const transition = useTransitionState();
  const inFlight = isInFlight(transition);
  const [app, setApp] = useState<any>(null);
  const [isReady, setReady] = useState(false);
  const [hasSceneError, setSceneError] = useState(false);
  const [isSplineViewport, setSplineViewport] = useState(false);
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
  // Only gate the very first visit; later route changes reuse or skip the scene.
  const [isInitialLoad, setInitialLoad] = useState(shouldMountDashboard);
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const needsScene = shouldMountDashboard && !sceneUrl;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    const viewport = window.matchMedia(`(min-width: ${SPLINE_MIN_WIDTH + 1}px)`);
    const updateViewport = () => setSplineViewport(viewport.matches);
    updateViewport();
    viewport.addEventListener("change", updateViewport);
    return () => viewport.removeEventListener("change", updateViewport);
  }, []);

  // Download the scene ourselves for real progress, then hand Spline the same bytes.
  useEffect(() => {
    if (!needsScene || window.innerWidth <= SPLINE_MIN_WIDTH) return;

    const controller = new AbortController();
    // Warm the lazy Spline runtime chunk in parallel with the scene download.
    void import("@splinetool/react-spline");
    fetchWithProgress(DASHBOARD_SCENE, controller.signal, setDownloadProgress)
      // Fragment satisfies Spline's extension check; fetch ignores it on blob URLs.
      .then((blob) => setSceneUrl(`${URL.createObjectURL(blob)}#.splinecode`))
      .catch(() => {
        if (!controller.signal.aborted) setSceneUrl(DASHBOARD_SCENE);
      });

    return () => controller.abort();
  }, [needsScene]);

  useEffect(() => {
    if (!shouldMountDashboard || window.innerWidth <= SPLINE_MIN_WIDTH) {
      setInitialLoad(false);
      return;
    }
    if (!isReady) return;

    const timeoutId = window.setTimeout(() => setInitialLoad(false), READY_HOLD_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isReady, shouldMountDashboard]);

  useEffect(() => {
    if (!isInitialLoad) return;

    const timeoutId = window.setTimeout(() => setInitialLoad(false), PRELOADER_MAX_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isInitialLoad]);

  // Hidden, the scene does no work: its render loop and events are paused
  // (only after its first frames are compiled, so a later reveal never stalls).
  useLayoutEffect(() => {
    if (!app || !isReady) return;
    if (isVisible) app.play?.();
    else app.stop?.();
  }, [app, isReady, isVisible]);

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
      if (rig && rig.rotation.x !== rotation) rig.rotation.x = rotation;
    },
    [getRig]
  );

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

  const value = useMemo<DashboardSceneContextValue>(
    () => ({
      app,
      isReady,
      sceneViewport: isSplineViewport,
      preloaderActive,
      containerRef,
      getRig,
      setFlip,
    }),
    [app, getRig, isReady, isSplineViewport, preloaderActive, setFlip]
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
                zIndex: 3,
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
                // Show the static fallback right away instead of waiting out the timers.
                setSceneError(true);
                setInitialLoad(false);
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
                waitForFrames(4, () => setReady(true));
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
        {preloaderActive && (
          <StairsPreloader
            progress={
              isReady ? 1 : downloadProgress === null ? null : Math.min(downloadProgress, 0.99)
            }
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

function DashboardFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#05080c]" aria-hidden="true">
      <div className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(131,211,221,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(131,211,221,0.8)_1px,transparent_1px)] [background-size:4rem_4rem]" />
      <div className="absolute left-[18%] top-[20%] h-[26rem] w-[26rem] rounded-full border border-[#83d3dd]/25 bg-[#0b2730]/30 blur-[1px]" />
      <div className="absolute right-[14%] top-[14%] h-[18rem] w-[18rem] rounded-full border border-white/10 bg-white/[0.025]" />
      <div className="absolute bottom-[18%] right-[25%] h-28 w-28 rotate-45 border border-[#83d3dd]/30 bg-[#83d3dd]/[0.04]" />
    </div>
  );
}
