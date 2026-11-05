// Records Work's plant scene frame by frame for phones (public/images/work-plant/NN.webp),
// which play it back with components/FrameSequence instead of running the Spline runtime.
// Re-run after changing public/spline/scene-plantNEW.splinecode:
//
//   npm i -g playwright && npx playwright install chromium   (once; it is not a dependency here)
//   NODE_PATH="$(npm root -g)" node scripts/record-plant-frames.mjs
//
// No GPU
// needed: Chromium renders through SwiftShader's WebGPU adapter, the same pipeline the scene
// uses on desktops (classic WebGL would drop its PBR maps and floor glow). That is slow, about
// 10-30 s a frame, so the whole run takes 10-30 minutes.
//
// The scene's Scroll event has 60 steps: frame i is the scene seeked to i / 60, the same seek
// lib/splineScroll.ts makes on desktop (full plant at 0, its pot at 1), 400 x 360 CSS px from
// the middle of a 720px square view at 2x, scaled to 800px wide.

import { createRequire } from "node:module";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Through require, which honours NODE_PATH (an import doesn't): Playwright is installed globally.
const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RUNTIME = join(ROOT, "node_modules/@splinetool/runtime/build");
const SCENE = "scene-plantNEW.splinecode";
const OUT = join(ROOT, "public/images/work-plant");
const STEPS = 60;
const VIEW = 720;
const CLIP = { x: 154, y: 220, width: 400, height: 360 };
const OUT_WIDTH = 800;
const QUALITY = 72;

const PAGE = `<!doctype html><html><head><style>html,body{margin:0;background:#000}canvas{display:block;width:100vw;height:100vh}</style></head>
<body><canvas id="c"></canvas><script type="module">
import { Application } from "/runtime/runtime.js";
const app = new Application(document.getElementById("c"), { renderMode: "auto" });
await app.load("/spline/${SCENE}");
const wheel = app.eventManager?.handlers?.Scroll?.wheelEventsPerObject;
const events = wheel ? [...wheel.values()].flat() : [];
wheel?.clear();
window.steps = events.map((event) => event.data?.steps);
window.seek = (at) => {
  for (const event of events) {
    for (const t of event.actions.Transition)
      if (t.object.currentTransitionEvent !== event) { t.object.currentTransitionEvent = event; t.init(); }
    event.scrollCounter = at * event.data.steps;
    event.actions.Transition.forEach((t) => t.seek(at));
  }
  app._requestRenderAutoMode ? app._requestRenderAutoMode() : app.requestRender();
};
window.ready = true;
</script></body></html>`;

const TYPES = { ".js": "text/javascript", ".wasm": "application/wasm", ".png": "image/png" };
const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
  if (path === "/") return res.writeHead(200, { "content-type": "text/html" }).end(PAGE);
  const file = path.startsWith("/runtime/")
    ? join(RUNTIME, path.slice(9))
    : path.startsWith("/spline/")
      ? join(ROOT, "public/spline", path.slice(8))
      : null;
  if (!file || !existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
}).listen(0);
const origin = `http://localhost:${server.address().port}`;

const browser = await chromium.launch({
  args: ["--enable-unsafe-webgpu", "--use-webgpu-adapter=swiftshader", "--enable-features=Vulkan", "--use-vulkan=swiftshader", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({ viewport: { width: VIEW, height: VIEW }, deviceScaleFactor: 2 });
  // The runtime fetches its wasm helpers from Spline's CDN; serve the copies in node_modules.
  await page.route("https://cdn.spline.design/**", (route) => {
    const name = route.request().url().split("/build/")[1];
    const file = name && join(RUNTIME, name);
    if (file && existsSync(file)) route.fulfill({ path: file, contentType: TYPES[extname(file)] });
    else route.abort();
  });
  await page.goto(origin);
  await page.waitForFunction(() => window.ready, null, { timeout: 300_000 });
  const steps = await page.evaluate(() => window.steps);
  if (steps.length !== 1 || steps[0] !== STEPS) throw new Error(`Expected one Scroll event of ${STEPS} steps, found ${JSON.stringify(steps)}`);

  mkdirSync(OUT, { recursive: true });
  let bytes = 0;
  for (let i = 0; i <= STEPS; i++) {
    await page.evaluate((at) => window.seek(at), i / STEPS);
    // Long enough for SwiftShader to finish the frame (and the first to compile every pipeline).
    await page.waitForTimeout(i === 0 ? 5000 : 2500);
    const png = await page.screenshot({ clip: CLIP });
    const info = await sharp(png)
      .resize(OUT_WIDTH)
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(join(OUT, `${String(i).padStart(2, "0")}.webp`));
    bytes += info.size;
    console.log(`frame ${i}/${STEPS}: ${info.size} B`);
  }
  console.log(`${STEPS + 1} frames, ${Math.round(bytes / 1024)} KB in all`);
} finally {
  await browser.close();
  server.close();
}
