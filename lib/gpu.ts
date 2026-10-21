// ---------------------------------------------------------------------------
// Spline draws every frame on the GPU: through WebGPU wherever the browser
// offers an adapter, else through WebGL 2 (@splinetool/runtime 2.0.75's own
// choice). Without a GPU (a blocklisted driver, a VM, or a headless test
// browser such as PageSpeed Insights' Lighthouse) that lands on a software
// rasteriser, and each frame then holds the main thread long enough that the
// page never becomes interactive: Lighthouse on software WebGL measured 29 s of
// blocking time and ran out its 60 s load limit, and PageSpeed Insights' own
// run crashed its tab. Such browsers get the static fallbacks instead.
// ---------------------------------------------------------------------------

/** Renderer names of the software rasterisers browsers fall back to. */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render driver/i;

type Adapter = { isFallbackAdapter?: boolean; info?: { isFallbackAdapter?: boolean } };
type NavigatorGPU = { gpu?: { requestAdapter: () => Promise<Adapter | null> } };

let rendererVerdict: Promise<boolean> | undefined;
let webgl2Verdict: boolean | undefined;

/** Resolves true if Spline's renderer would run on a GPU. Probed once per page load. */
export function hasHardwareRenderer(): Promise<boolean> {
  rendererVerdict ??= probeRenderer();
  return rendererVerdict;
}

/** True if WebGL 2 is available and GPU-accelerated (WebGL shaders such as LiquidMetalButton's). Probed once per page load. */
export function hasHardwareWebGL2(): boolean {
  webgl2Verdict ??= probeWebGL2();
  return webgl2Verdict;
}

async function probeRenderer() {
  // Spline takes any WebGPU adapter, without asking whether it is a fallback
  // (software) one; with none it renders through WebGL 2. Chrome logs "No
  // available adapters." when it has none, as it does for Spline's own request.
  const gpu = (navigator as NavigatorGPU).gpu;
  const adapter = gpu ? await gpu.requestAdapter().catch(() => null) : null;
  if (adapter) return !(adapter.info?.isFallbackAdapter ?? adapter.isFallbackAdapter);
  return hasHardwareWebGL2();
}

function probeWebGL2() {
  try {
    // failIfMajorPerformanceCaveat refuses some software contexts in Chrome
    // (Safari and Firefox ignore it); the renderer name catches the rest. The
    // probe canvas is left to GC: forcing its loss makes Firefox log "WebGL
    // context was lost" on every load.
    const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    // Chrome and Safari mask RENDERER and unmask it through the debug extension;
    // Firefox's RENDERER is already the (sanitised) real name, and it warns that
    // the extension is deprecated.
    let renderer = String(gl.getParameter(gl.RENDERER));
    if (renderer === "WebKit WebGL") {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    }
    return !SOFTWARE_RENDERER.test(renderer);
  } catch {
    return false;
  }
}
