import { lazy, Suspense, useEffect, useState } from "react";

// Keep each scene out of the initial route bundle. React.lazy is the Spline
// package's supported client-side loading path for App Router components.
const Spline = lazy(() => import("@splinetool/react-spline"));

// Spline's WebGPU runtime recovers from transient "destroyed texture used in a submit"
// errors (e.g. ShadowDepthTexture rebuilds), but three.js still logs them. Mute only those.
const BENIGN_GPU_ERROR = /destroyed texture .* used in a submit/i;
const muteBenignWebGPUErrors = () => {
  if (typeof window === "undefined" || !("GPUAdapter" in window)) return;
  const proto = (window as any).GPUAdapter.prototype;
  if (proto.__benignErrorsMuted) return;
  proto.__benignErrorsMuted = true;
  const requestDevice = proto.requestDevice;
  proto.requestDevice = async function (...args: unknown[]) {
    const device = await requestDevice.apply(this, args);
    let handler: ((event: any) => void) | null = null;
    // Intercept three.js's onuncapturederror so it only sees non-benign errors.
    Object.defineProperty(device, "onuncapturederror", {
      configurable: true,
      get: () => handler,
      set: (fn) => {
        handler = fn;
      },
    });
    device.addEventListener("uncapturederror", (event: any) => {
      if (BENIGN_GPU_ERROR.test(event?.error?.message ?? "")) {
        event.preventDefault();
        return;
      }
      handler?.call(device, event);
    });
    return device;
  };
};
muteBenignWebGPUErrors();

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
