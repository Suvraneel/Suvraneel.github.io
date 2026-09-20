import { lazy, Suspense, useEffect, useState } from "react";

// Keep each scene out of the initial route bundle. React.lazy is the Spline
// package's supported client-side loading path for App Router components.
const Spline = lazy(() => import("@splinetool/react-spline"));
const SplineObj = (props: {
  scene: string;
  onLoad?: (spline: any) => void;
  onSplineMouseUp?: (event: any) => void;
}) => {
  const [isDesktop, setDesktop] = useState(false);

  useEffect(() => {
    const updateMedia = () => {
      setDesktop(window.innerWidth > 550);
    };

    updateMedia();
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);
  return (
    <Suspense fallback={<>Loading...</>}>
      {isDesktop && (
        <Spline
          className="absolute top-0 right-0"
          scene={props.scene}
          onLoad={props.onLoad}
          onMouseUp={props.onSplineMouseUp}
        />
      )}
    </Suspense>
  );
};

export default SplineObj;
