import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";

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

// react-spline rethrows scene load failures during render; contain them so a
// broken or blocked scene can't take down the whole app shell.
class SceneErrorBoundary extends Component<
  { children: ReactNode; onError?: (error: unknown) => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const SplineObj = (props: {
  scene: string;
  onLoad?: (spline: any) => void;
  onError?: (error: unknown) => void;
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
    <SceneErrorBoundary onError={props.onError}>
      <Suspense fallback={null}>
        {isDesktop && (
          <Spline
            className="absolute top-0 right-0"
            scene={props.scene}
            onLoad={props.onLoad}
            onMouseUp={props.onSplineMouseUp}
          />
        )}
      </Suspense>
    </SceneErrorBoundary>
  );
};

export default SplineObj;
