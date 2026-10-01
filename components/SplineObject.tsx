import { lazy, Suspense, useEffect, useState } from "react";

// Keep each scene out of the initial route bundle. React.lazy is the Spline
// package's supported client-side loading path for App Router components.
const Spline = lazy(() => import("@splinetool/react-spline"));
const SplineObj = (props: {
  scene: string;
  onLoad?: (spline: any) => void;
  onSplineMouseUp?: (event: any) => void;
  scrollProgress?: number;
}) => {
  const [isDesktop, setDesktop] = useState(false);
  const [splineApp, setSplineApp] = useState<any>(null);

  useEffect(() => {
    const updateMedia = () => {
      setDesktop(window.innerWidth > 550);
    };

    updateMedia();
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  // Apply rotation to 3D object based on scroll progress
  useEffect(() => {
    if (!splineApp || props.scrollProgress === undefined) return;

    try {
      const objectName = "Object"; // Adjust to match your plant object name in Spline
      const obj = splineApp.getScene().getObjectByName(objectName);
      if (obj) {
        obj.rotation.z = (props.scrollProgress || 0) * Math.PI * 2; // Full rotation 0-360°
      }
    } catch (error) {
      // Silently handle if object not found
    }
  }, [props.scrollProgress, splineApp]);

  const handleLoad = (spline: any) => {
    setSplineApp(spline);
    props.onLoad?.(spline);
  };

  return (
    <Suspense fallback={<>Loading...</>}>
      {isDesktop && (
        <Spline
          className="absolute top-0 right-0"
          scene={props.scene}
          onLoad={handleLoad}
          onMouseUp={props.onSplineMouseUp}
        />
      )}
    </Suspense>
  );
};

export default SplineObj;
