/* eslint-disable react-hooks/set-state-in-effect */

import SplineObj from "@components/SplineObject";
import StairsPreloader from "@components/StairsPreloader";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

const DASHBOARD_SCENE = "/spline/sceneDACCORD_NEW.splinecode";
// SplineObj skips rendering at or below this width.
const SPLINE_MIN_WIDTH = 550;
const FALLBACK_AFTER_MS = 8000;
const PRELOADER_MAX_MS = 30000;
// Extra hold at 100% so slow GPUs finish settling before the reveal.
const READY_HOLD_MS = 2000;

type DashboardSceneContextValue = {
  app: any;
  isReady: boolean;
  revealForReturn: () => void;
};

const DashboardSceneContext = createContext<DashboardSceneContextValue>({
  app: null,
  isReady: false,
  revealForReturn: () => undefined,
});

export const useDashboardScene = () => useContext(DashboardSceneContext);

export const DashboardSceneProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [app, setApp] = useState<any>(null);
  const [isReady, setReady] = useState(false);
  const [hasSceneError, setSceneError] = useState(false);
  const [isVisible, setVisible] = useState(pathname === "/");
  const [isReturnOverlay, setReturnOverlay] = useState(false);
  const [isSplineViewport, setSplineViewport] = useState(false);
  const shouldMountDashboard =
    pathname === "/" || pathname === "/about" || isReturnOverlay;
  // Only gate the very first visit; later route changes reuse or skip the scene.
  const [isInitialLoad, setInitialLoad] = useState(shouldMountDashboard);
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const needsScene = shouldMountDashboard && !sceneUrl;

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

  const revealForReturn = useCallback(() => {
    setReturnOverlay(true);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (pathname !== "/" || !app) return;

    const flipRig = app.findObjectByName("Dashboard Flip Rig");
    if (flipRig) flipRig.rotation.x = 0;
  }, [app, pathname]);

  useEffect(() => {
    setVisible(pathname === "/");
    setReturnOverlay(false);

    if (pathname !== "/" && pathname !== "/about") {
      setApp(null);
      setReady(false);
      setSceneError(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!shouldMountDashboard || isReady) return;

    const timeoutId = window.setTimeout(() => {
      setSceneError(true);
    }, FALLBACK_AFTER_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isReady, shouldMountDashboard]);

  return (
    <DashboardSceneContext.Provider value={{ app, isReady, revealForReturn }}>
      <div
        className={`fixed inset-0 ${isReturnOverlay ? "z-[200]" : "z-0"} ${
          isVisible ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!isVisible}
      >
        {shouldMountDashboard && sceneUrl && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <SplineObj
              // scene="https://prod.spline.design/bMG02F4Rm1UpL5wP/scene.splinecode"
              scene={sceneUrl}
              onLoad={(loadedApp) => {
                setApp(loadedApp);
                // Canvas is unhidden and first frames compiled only after load resolves.
                waitForFrames(4, () => setReady(true));
              }}
            />
          </div>
        )}
        {shouldMountDashboard && hasSceneError && (
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
        {isInitialLoad && isSplineViewport && (
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
