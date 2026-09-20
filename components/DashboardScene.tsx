/* eslint-disable react-hooks/set-state-in-effect */

import SplineObj from "@components/SplineObject";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

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
  const shouldMountDashboard =
    pathname === "/" || pathname === "/about" || isReturnOverlay;

  const revealForReturn = useCallback(() => {
    setReturnOverlay(true);
    setVisible(true);
  }, []);

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
    }, 8000);

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
        {shouldMountDashboard && !hasSceneError && (
          <SplineObj
            // scene="https://prod.spline.design/bMG02F4Rm1UpL5wP/scene.splinecode"
              scene="./spline/sceneDACCORD_NEW.splinecode"
              onLoad={(loadedApp) => {
              setApp(loadedApp);
              setReady(true);
            }}
          />
        )}
        {shouldMountDashboard && hasSceneError && <DashboardFallback />}
      </div>
      {children}
    </DashboardSceneContext.Provider>
  );
};

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
