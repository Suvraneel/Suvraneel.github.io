import SplineObj from "@components/SplineObject";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [isReady, setReady] = useState(false);
  const [isVisible, setVisible] = useState(router.pathname === "/");
  const [isReturnOverlay, setReturnOverlay] = useState(false);

  const revealForReturn = useCallback(() => {
    setReturnOverlay(true);
    setVisible(true);
  }, []);

  useEffect(() => {
    const handleRouteComplete = (url: string) => {
      const isHome = url === "/";
      setVisible(isHome);
      setReturnOverlay(false);
    };

    router.events.on("routeChangeComplete", handleRouteComplete);
    return () => router.events.off("routeChangeComplete", handleRouteComplete);
  }, [router.events]);

  return (
    <DashboardSceneContext.Provider value={{ app, isReady, revealForReturn }}>
      <div
        className={`fixed inset-0 ${isReturnOverlay ? "z-[200]" : "z-0"} ${
          isVisible ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!isVisible}
      >
        <SplineObj
          scene="https://prod.spline.design/bMG02F4Rm1UpL5wP/scene.splinecode"
          onLoad={(loadedApp) => {
            setApp(loadedApp);
            setReady(true);
          }}
        />
      </div>
      {children}
    </DashboardSceneContext.Provider>
  );
};
