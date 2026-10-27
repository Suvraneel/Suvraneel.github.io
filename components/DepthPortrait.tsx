"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { hasHardwareWebGL2 } from "@lib/gpu";

const DEG = Math.PI / 180;
/** Most the portrait turns toward the pointer: enough to read plainly as depth, not as a spinning card. */
const MAX_YAW = 11 * DEG;
const MAX_PITCH = 6 * DEG;
/** How far the nearest point (the hands) stands off the backdrop, as a share of the photo's width. */
const RELIEF = 0.24;
/** With the pointer still (or none: touch), the portrait drifts on its own, this far and this slowly. */
const SWAY_YAW = 3 * DEG;
const SWAY_PITCH = 1.5 * DEG;
const SWAY_SPEED = 0.45;
/** How long the pointer rests before the drift takes over, and how long it takes to fade in (ms). */
const SWAY_DELAY = 1500;
const SWAY_FADE = 1500;
/** The depth (0 far, 1 near) that stays put as it turns: about the face, so the eyes hold still. */
const PIVOT_DEPTH = 0.6;
/** Narrow lens, so at rest the mesh projects almost exactly onto the flat photo it replaces. */
const FOV = 14;
const NEAR = 0.1;
const FAR = 100;
/** The mesh runs this far past the photo (its edge pixels stretched), so turning never shows its edge in the frame. */
const OVERSCAN = 1.06;
const SEGMENTS = 192;
const EASE = 0.06;
const ANISOTROPY = 4;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Plain WebGL2 rather than three.js: one grid, two textures and one shader don't need a
// 180 KB (gzip) engine. The grid is only its uv; the shader places each vertex.
const VERTEX = /* glsl */ `#version 300 es
  in vec2 uv;
  uniform mat4 uMvp;
  uniform sampler2D uDepth;
  uniform float uRelief;
  uniform float uPivot;
  uniform float uOverscan;
  out vec2 vUv;
  void main() {
    // Past 0..1 the textures clamp to their edge.
    vUv = (uv - 0.5) * uOverscan + 0.5;
    vec3 p = vec3((uv - 0.5) * uOverscan, (texture(uDepth, vUv).r - uPivot) * uRelief);
    gl_Position = uMvp * vec4(p, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `#version 300 es
  precision highp float;
  uniform sampler2D uColor;
  in vec2 vUv;
  out vec4 color;
  void main() {
    vec3 c = texture(uColor, vUv).rgb;
    color = vec4(vec3(dot(c, vec3(0.299, 0.587, 0.114))), 1.0);
  }
`;

/** Column-major 4x4 product a × b. */
const multiply = (a: Float32Array, b: Float32Array) => {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 4; row++)
      out[col * 4 + row] =
        a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];
  return out;
};

const perspective = (fovDeg: number, aspect: number) => {
  const f = 1 / Math.tan((fovDeg * DEG) / 2);
  const nf = 1 / (NEAR - FAR);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (FAR + NEAR) * nf, -1, 0, 0, 2 * FAR * NEAR * nf, 0]);
};

/** Model-view: translate, rotate X then Y (Euler XYZ), scale uniformly, then back off the camera distance. */
const modelView = (x: number, y: number, distance: number, pitch: number, yaw: number, scale: number) => {
  const a = Math.cos(pitch), b = Math.sin(pitch), c = Math.cos(yaw), d = Math.sin(yaw);
  return new Float32Array([
    c * scale, b * d * scale, -a * d * scale, 0,
    0, a * scale, b * scale, 0,
    d * scale, -b * c * scale, a * c * scale, 0,
    x, y, -distance, 1,
  ]);
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

/** Same-origin and without crossOrigin, so it shares the cache entry the flat <img> already filled. */
const loadImage = async (url: string) => {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
};

const upload = (gl: WebGL2RenderingContext, image: HTMLImageElement, mipmaps: boolean) => {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  if (mipmaps) gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
};

/** The grid's uv (top row v = 1) and its triangles, wound counter-clockwise toward the camera. */
const grid = () => {
  const row = SEGMENTS + 1;
  const uv = new Float32Array(row * row * 2);
  for (let iy = 0; iy < row; iy++)
    for (let ix = 0; ix < row; ix++) uv.set([ix / SEGMENTS, 1 - iy / SEGMENTS], (iy * row + ix) * 2);
  const index = new Uint32Array(SEGMENTS * SEGMENTS * 6);
  let i = 0;
  for (let iy = 0; iy < SEGMENTS; iy++)
    for (let ix = 0; ix < SEGMENTS; ix++) {
      const a = iy * row + ix, b = a + row, c = b + 1, d = a + 1;
      index.set([a, b, d, b, c, d], i);
      i += 6;
    }
  return { uv, index };
};

type DepthPortraitProps = {
  src: string;
  depthSrc: string;
  /** Only while this matches is the scene built (the portrait's column is hidden otherwise). */
  media: string;
  /** object-position of the photo it replaces, as fractions (object-[40%_100%] → 0.4, 1). */
  position: [number, number];
  className?: string;
  style?: CSSProperties;
  /** Called with true once the first frame is drawn, and false if the scene is lost. */
  onReady?: (ready: boolean) => void;
};

/**
 * The portrait as a relief: the photo laid over a mesh pushed out by its depth
 * map (Depth Anything V2, precomputed into public/images), turning a few
 * degrees toward the pointer. Without a GPU, with reduced motion, or outside
 * `media` nothing is built and the flat photo underneath stays.
 */
export default function DepthPortrait({ src, depthSrc, media, position, className = "", style, onReady }: DepthPortraitProps) {
  const host = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const readyRef = useRef(onReady);
  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const wide = window.matchMedia(media);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    let teardown: (() => void) | null = null;
    let building = false;
    let disposed = false;

    const report = (ready: boolean) => {
      setShown(ready);
      readyRef.current?.(ready);
    };

    const wanted = () => !disposed && wide.matches && !reducedMotion.matches;

    const build = async () => {
      if (building || teardown || !wanted() || !hasHardwareWebGL2()) return;
      building = true;
      try {
        await mount();
      } finally {
        building = false;
      }
    };

    const mount = async () => {
      let photo: HTMLImageElement;
      let depthMap: HTMLImageElement;
      try {
        [photo, depthMap] = await Promise.all([loadImage(src), loadImage(depthSrc)]);
      } catch {
        return;
      }
      if (!wanted()) return;

      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        depth: true,
        stencil: false,
        powerPreference: "low-power",
      });
      if (!gl) return;

      const program = gl.createProgram()!;
      const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX);
      const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return;
      }
      gl.useProgram(program);

      // The shader writes the photo's own (sRGB) values straight through, the right way up.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      gl.activeTexture(gl.TEXTURE0);
      const color = upload(gl, photo, true);
      const anisotropic = gl.getExtension("EXT_texture_filter_anisotropic");
      if (anisotropic) {
        const max = gl.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
        gl.texParameterf(gl.TEXTURE_2D, anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(ANISOTROPY, max));
      }
      gl.activeTexture(gl.TEXTURE1);
      const depth = upload(gl, depthMap, false);

      const { uv, index } = grid();
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

      gl.uniform1i(gl.getUniformLocation(program, "uColor"), 0);
      gl.uniform1i(gl.getUniformLocation(program, "uDepth"), 1);
      gl.uniform1f(gl.getUniformLocation(program, "uRelief"), RELIEF);
      gl.uniform1f(gl.getUniformLocation(program, "uPivot"), PIVOT_DEPTH);
      gl.uniform1f(gl.getUniformLocation(program, "uOverscan"), OVERSCAN);
      const mvpLocation = gl.getUniformLocation(program, "uMvp");

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      gl.clearColor(0, 0, 0, 0);

      canvas.className = "absolute inset-0 h-full w-full";
      container.appendChild(canvas);

      // At z = 0 the view is one unit tall.
      const distance = 0.5 / Math.tan((FOV * DEG) / 2);
      let width = 0;
      let height = 0;
      let projection = perspective(FOV, 1);
      let side = 1;
      let offsetX = 0;
      let offsetY = 0;
      // Cover-fit the square photo into the frame at `position`, as object-fit does.
      const layout = () => {
        width = container.clientWidth;
        height = container.clientHeight;
        if (!width || !height) return;
        const ratio = Math.min(window.devicePixelRatio, 2);
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        gl.viewport(0, 0, canvas.width, canvas.height);
        const aspect = width / height;
        projection = perspective(FOV, aspect);
        side = Math.max(aspect, 1);
        const [px, py] = position;
        offsetX = (aspect - side) * px + side / 2 - aspect / 2;
        offsetY = -((1 - side) * py + side / 2 - 0.5);
      };
      layout();
      const resizer = new ResizeObserver(layout);
      resizer.observe(container);

      const rotation = { x: 0, y: 0 };
      const render = () => {
        gl.uniformMatrix4fv(mvpLocation, false, multiply(projection, modelView(offsetX, offsetY, distance, rotation.x, rotation.y, side)));
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_INT, 0);
      };

      const target = { x: 0, y: 0 };
      let pointerAt = -Infinity;
      const handlePointer = (event: PointerEvent) => {
        target.x = (event.clientX / window.innerWidth) * 2 - 1;
        target.y = (event.clientY / window.innerHeight) * 2 - 1;
        pointerAt = performance.now();
      };
      const handleLeave = () => {
        target.x = 0;
        target.y = 0;
      };
      window.addEventListener("pointermove", handlePointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", handleLeave);

      let frame = 0;
      let first = true;
      const tick = (now: number) => {
        frame = window.requestAnimationFrame(tick);
        if (!width || !height || document.hidden) return;
        const t = (now / 1000) * SWAY_SPEED;
        const sway = Math.min(Math.max((now - pointerAt - SWAY_DELAY) / SWAY_FADE, 0), 1);
        const yaw = target.x * MAX_YAW + Math.sin(t) * SWAY_YAW * sway;
        const pitch = target.y * MAX_PITCH + Math.sin(t * 0.7 + 1) * SWAY_PITCH * sway;
        const dy = yaw - rotation.y;
        const dx = pitch - rotation.x;
        if (!first && Math.abs(dy) < 1e-5 && Math.abs(dx) < 1e-5) return;
        rotation.y += dy * EASE;
        rotation.x += dx * EASE;
        render();
        if (first) {
          first = false;
          report(true);
        }
      };
      frame = window.requestAnimationFrame(tick);

      const handleContextLost = (event: Event) => {
        event.preventDefault();
        teardown?.();
      };
      canvas.addEventListener("webglcontextlost", handleContextLost);

      teardown = () => {
        teardown = null;
        window.cancelAnimationFrame(frame);
        resizer.disconnect();
        window.removeEventListener("pointermove", handlePointer);
        document.documentElement.removeEventListener("pointerleave", handleLeave);
        canvas.removeEventListener("webglcontextlost", handleContextLost);
        if (!gl.isContextLost()) {
          gl.deleteBuffer(uvBuffer);
          gl.deleteBuffer(indexBuffer);
          gl.deleteVertexArray(vao);
          gl.deleteTexture(color);
          gl.deleteTexture(depth);
          gl.deleteProgram(program);
          gl.deleteShader(vertexShader);
          gl.deleteShader(fragmentShader);
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        }
        canvas.remove();
        if (!disposed) report(false);
      };
    };

    const update = () => {
      if (wanted()) void build();
      else teardown?.();
    };
    update();
    wide.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      disposed = true;
      wide.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
      teardown?.();
    };
  }, [src, depthSrc, media, position]);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={`transition-opacity duration-700 ${shown ? "opacity-100" : "opacity-0"} ${className}`}
      style={style}
    />
  );
}
