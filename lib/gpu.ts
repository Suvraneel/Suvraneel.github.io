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

/**
 * Where the renderer's name is hidden, hasFastWebGL2() times PROBE_DRAWS draws of a PROBE_SEGMENTS²
 * grid (DepthPortrait's mesh, the heaviest vertex load here) into a PROBE_SIZE px canvas: vertex work
 * alone, so the same on any screen. Once warm, a GPU takes 1–5 ms; a software rasteriser 40 ms or more,
 * even on an M5 Pro's CPU. The cut also sits under a 60 Hz frame, so a timer coarsened to 16.7 ms
 * (resistFingerprinting) still reads a GPU as 0 and software as 16.7 or more.
 */
const PROBE_DRAWS = 16;
const PROBE_SEGMENTS = 192;
const PROBE_SIZE = 16;
const SOFTWARE_PROBE_MS = 16;
/**
 * Probes run until one is fast. The first also compiles the shaders, and any one can wait behind other
 * GPU work, so later ones spread out, each gap PROBE_BACKOFF ms longer: software is ruled only after
 * PROBE_TRIES slow probes across about 2.5 s.
 */
const PROBE_TRIES = 6;
const PROBE_BACKOFF = 250;
/** The probe's verdict ("fast" or "slow") holds for the tab's session, so it runs once per tab. */
const SPEED_KEY = "gpu:webgl2-speed";

const PROBE_VERTEX = /* glsl */ `#version 300 es
in vec2 uv;
uniform sampler2D uDepth;
void main() {
  gl_Position = vec4((uv - 0.5) * 1.8, texture(uDepth, uv).r * 0.5, 1.0);
}`;

const PROBE_FRAGMENT = /* glsl */ `#version 300 es
precision mediump float;
out vec4 color;
void main() {
  color = vec4(1.0);
}`;

type Adapter = { isFallbackAdapter?: boolean; info?: { isFallbackAdapter?: boolean } };
type NavigatorGPU = { gpu?: { requestAdapter: () => Promise<Adapter | null> } };
type WebGL2Verdict = { hardware: boolean; named: boolean };

let rendererVerdict: Promise<boolean> | undefined;
let webgl2Verdict: WebGL2Verdict | undefined;
let speedVerdict: Promise<boolean> | undefined;

/** Resolves true if Spline's renderer would run on a GPU. Probed once per page load. */
export function hasHardwareRenderer(): Promise<boolean> {
  rendererVerdict ??= probeRenderer();
  return rendererVerdict;
}

/** True if WebGL 2 is available and its renderer's name is not a software one. Probed once per page load. */
export function hasHardwareWebGL2(): boolean {
  webgl2Verdict ??= probeWebGL2();
  return webgl2Verdict.hardware;
}

/**
 * Resolves true if WebGL 2 runs on a GPU (WebGL shaders such as LiquidMetalButton's and DepthPortrait's).
 * The renderer's name rules where the browser gives it; where it is hidden, a timed draw does. Firefox
 * reports SwiftShader and softpipe as "Generic Renderer" and Apple's as "Apple M1, or similar",
 * resistFingerprinting reports every renderer as "Mozilla", and Chrome names one only through an
 * extension a browser may withhold. Where Chrome or Safari do name it, nothing is timed: there a read
 * waits behind every other page's GPU work, so a GPU busy in another window would read as software.
 */
export function hasFastWebGL2(): Promise<boolean> {
  speedVerdict ??= probeSpeed();
  return speedVerdict;
}

async function probeRenderer() {
  // Spline takes any WebGPU adapter, without asking whether it is a fallback
  // (software) one; with none it renders through WebGL 2. Chrome logs "No
  // available adapters." when it has none, as it does for Spline's own request.
  const gpu = (navigator as NavigatorGPU).gpu;
  const adapter = gpu ? await gpu.requestAdapter().catch(() => null) : null;
  if (adapter) return !(adapter.info?.isFallbackAdapter ?? adapter.isFallbackAdapter);
  return hasFastWebGL2();
}

function probeWebGL2(): WebGL2Verdict {
  try {
    // failIfMajorPerformanceCaveat refuses some software contexts in Chrome
    // (Safari and Firefox ignore it); the renderer name catches the rest. The
    // probe canvas is left to GC: forcing its loss makes Firefox log "WebGL
    // context was lost" on every load.
    const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return { hardware: false, named: false };
    // Chrome and Safari mask RENDERER and unmask it through the debug extension;
    // Firefox's RENDERER is already the (sanitised) real name, and it warns that
    // the extension is deprecated.
    let renderer = String(gl.getParameter(gl.RENDERER));
    let named = false;
    if (renderer === "WebKit WebGL") {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
        named = true;
      }
    }
    return { hardware: !SOFTWARE_RENDERER.test(renderer), named };
  } catch {
    return { hardware: false, named: false };
  }
}

async function probeSpeed() {
  if (!hasHardwareWebGL2()) return false;
  if (webgl2Verdict?.named) return true;
  try {
    const remembered = window.sessionStorage.getItem(SPEED_KEY);
    if (remembered) return remembered === "fast";
  } catch {
    // Storage unavailable: probe this document.
  }
  const fast = await timeDraws();
  try {
    window.sessionStorage.setItem(SPEED_KEY, fast ? "fast" : "slow");
  } catch {
    // Storage unavailable: the verdict still covers this document.
  }
  return fast;
}

async function timeDraws() {
  const canvas = document.createElement("canvas");
  canvas.width = PROBE_SIZE;
  canvas.height = PROBE_SIZE;
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) return false;

  const program = gl.createProgram()!;
  const shaders = [
    [gl.VERTEX_SHADER, PROBE_VERTEX],
    [gl.FRAGMENT_SHADER, PROBE_FRAGMENT],
  ].map(([type, source]) => {
    const shader = gl.createShader(type as number)!;
    gl.shaderSource(shader, source as string);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    return shader;
  });
  gl.linkProgram(program);

  const row = PROBE_SEGMENTS + 1;
  const uv = new Float32Array(row * row * 2);
  for (let iy = 0; iy < row; iy++)
    for (let ix = 0; ix < row; ix++) uv.set([ix / PROBE_SEGMENTS, iy / PROBE_SEGMENTS], (iy * row + ix) * 2);
  const index = new Uint32Array(PROBE_SEGMENTS * PROBE_SEGMENTS * 6);
  for (let iy = 0, i = 0; iy < PROBE_SEGMENTS; iy++)
    for (let ix = 0; ix < PROBE_SEGMENTS; ix++, i += 6) {
      const a = iy * row + ix;
      index.set([a, a + row, a + 1, a + row, a + row + 1, a + 1], i);
    }
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
  const uvLocation = gl.getAttribLocation(program, "uv");
  gl.enableVertexAttribArray(uvLocation);
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
  // A small depth texture, so each vertex samples one as DepthPortrait's do.
  const depth = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, depth);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 64, 64, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(64 * 64).fill(128));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const pixel = new Uint8Array(4);
  /** ms to draw the probe and wait for it: a read waits for the GPU, where finish() is only a flush in Chrome. */
  const time = () => {
    const start = performance.now();
    for (let i = 0; i < PROBE_DRAWS; i++) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_INT, 0);
    }
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    return performance.now() - start;
  };

  try {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);
    for (let tries = 0; tries < PROBE_TRIES; tries++) {
      if (tries > 1) await new Promise((resolve) => window.setTimeout(resolve, (tries - 1) * PROBE_BACKOFF));
      // A frame callback, so a hidden tab (whose GPU work may be held back) waits until it shows.
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      if (time() < SOFTWARE_PROBE_MS) return true;
    }
    return false;
  } finally {
    // The canvas itself is left to GC, as above.
    gl.deleteBuffer(uvBuffer);
    gl.deleteBuffer(indexBuffer);
    gl.deleteVertexArray(vao);
    gl.deleteTexture(depth);
    gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
  }
}
