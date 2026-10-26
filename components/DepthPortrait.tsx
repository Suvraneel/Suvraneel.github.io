"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { hasHardwareWebGL2 } from "@lib/gpu";

/** Most the portrait turns toward the pointer: a few degrees, enough to read as depth, not as a spinning card. */
const MAX_YAW = (5 * Math.PI) / 180;
const MAX_PITCH = (3 * Math.PI) / 180;
/** How far the nearest point (the hands) stands off the backdrop, as a share of the photo's width. */
const RELIEF = 0.14;
/** The depth (0 far, 1 near) that stays put as it turns: about the face, so the eyes hold still. */
const PIVOT_DEPTH = 0.6;
/** Narrow lens, so at rest the mesh projects almost exactly onto the flat photo it replaces. */
const FOV = 14;
/** The mesh runs this far past the photo (its edge pixels stretched), so turning never shows its edge in the frame. */
const OVERSCAN = 1.06;
const SEGMENTS = 192;
const EASE = 0.06;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const VERTEX = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uRelief;
  uniform float uPivot;
  uniform float uOverscan;
  varying vec2 vUv;
  void main() {
    // Past 0..1 the textures clamp to their edge.
    vUv = (uv - 0.5) * uOverscan + 0.5;
    vec3 p = position;
    p.z = (texture2D(uDepth, vUv).r - uPivot) * uRelief;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uColor;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uColor, vUv).rgb;
    gl_FragColor = vec4(vec3(dot(c, vec3(0.299, 0.587, 0.114))), 1.0);
  }
`;

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
      const THREE = await import("three");
      if (!wanted()) return;

      const loader = new THREE.TextureLoader();
      let color: InstanceType<typeof THREE.Texture>;
      let depth: InstanceType<typeof THREE.Texture>;
      try {
        [color, depth] = await Promise.all([loader.loadAsync(src), loader.loadAsync(depthSrc)]);
      } catch {
        return;
      }
      if (!wanted()) {
        color.dispose();
        depth.dispose();
        return;
      }
      color.anisotropy = 4;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      } catch {
        color.dispose();
        depth.dispose();
        return;
      }
      // The shader writes the photo's own (sRGB) values straight through.
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.className = "absolute inset-0 h-full w-full";
      container.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
      // At z = 0 the view is one unit tall.
      camera.position.z = 0.5 / Math.tan((FOV * Math.PI) / 360);

      const geometry = new THREE.PlaneGeometry(OVERSCAN, OVERSCAN, SEGMENTS, SEGMENTS);
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
          uColor: { value: color },
          uDepth: { value: depth },
          uRelief: { value: RELIEF },
          uPivot: { value: PIVOT_DEPTH },
          uOverscan: { value: OVERSCAN },
        },
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      let width = 0;
      let height = 0;
      // Cover-fit the square photo into the frame at `position`, as object-fit does.
      const layout = () => {
        width = container.clientWidth;
        height = container.clientHeight;
        if (!width || !height) return;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height, false);
        const aspect = width / height;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        const side = Math.max(aspect, 1);
        const [px, py] = position;
        mesh.scale.set(side, side, side);
        mesh.position.x = (aspect - side) * px + side / 2 - aspect / 2;
        mesh.position.y = -((1 - side) * py + side / 2 - 0.5);
      };
      layout();
      const resizer = new ResizeObserver(layout);
      resizer.observe(container);

      const target = { x: 0, y: 0 };
      const handlePointer = (event: PointerEvent) => {
        target.x = (event.clientX / window.innerWidth) * 2 - 1;
        target.y = (event.clientY / window.innerHeight) * 2 - 1;
      };
      const handleLeave = () => {
        target.x = 0;
        target.y = 0;
      };
      window.addEventListener("pointermove", handlePointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", handleLeave);

      let frame = 0;
      let first = true;
      const tick = () => {
        frame = window.requestAnimationFrame(tick);
        if (!width || !height || document.hidden) return;
        const yaw = target.x * MAX_YAW;
        const pitch = target.y * MAX_PITCH;
        const dy = yaw - mesh.rotation.y;
        const dx = pitch - mesh.rotation.x;
        if (!first && Math.abs(dy) < 1e-5 && Math.abs(dx) < 1e-5) return;
        mesh.rotation.y += dy * EASE;
        mesh.rotation.x += dx * EASE;
        renderer.render(scene, camera);
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
        geometry.dispose();
        material.dispose();
        color.dispose();
        depth.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
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
