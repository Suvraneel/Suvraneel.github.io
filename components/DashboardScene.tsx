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
    }
  }, [pathname]);

  return (
    <DashboardSceneContext.Provider value={{ app, isReady, revealForReturn }}>
      <div
        className={`fixed inset-0 ${isReturnOverlay ? "z-[200]" : "z-0"} ${
          isVisible ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!isVisible}
      >
        {shouldMountDashboard && (
          <SplineObj
            // scene="https://prod.spline.design/bMG02F4Rm1UpL5wP/scene.splinecode"
              scene="./spline/sceneDACCORD_NEW.splinecode"
              onLoad={(loadedApp) => {
              setApp(loadedApp);
              setReady(true);
            }}
          />
        )}
      </div>
      {children}
    </DashboardSceneContext.Provider>
  );
};
