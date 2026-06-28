"use client";

import { useEffect, useRef } from "react";

type RipplePoint = {
  x: number;
  y: number;
  strength: number;
  radius: number;
};

type StoneDrop = {
  x: number;
  y: number;
  startedAt: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

const DISTURBANCE_RADIUS_MULTIPLIER = 0.56;

export function WaterOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    const reduceMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMedia = window.matchMedia("(max-width: 768px)");
    const deviceState = {
      reducedMotion: reduceMotionMedia.matches,
      mobile: mobileMedia.matches,
    };

    const pointer = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
    };

    const state = {
      gridWidth: 0,
      gridHeight: 0,
      front: new Float32Array(0),
      back: new Float32Array(0),
      offscreen: document.createElement("canvas"),
      offscreenContext: null as CanvasRenderingContext2D | null,
      imageData: null as ImageData | null,
      ripples: [] as RipplePoint[],
      stoneDrops: [] as StoneDrop[],
      animationId: 0,
    };

    const setCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      const quality = width < 768 ? 0.16 : 0.22;
      state.gridWidth = Math.max(96, Math.floor(width * quality));
      state.gridHeight = Math.max(56, Math.floor(height * quality));

      const length = state.gridWidth * state.gridHeight;
      state.front = new Float32Array(length);
      state.back = new Float32Array(length);

      state.offscreen.width = state.gridWidth;
      state.offscreen.height = state.gridHeight;
      state.offscreenContext = state.offscreen.getContext("2d", { alpha: true });
      state.imageData = state.offscreenContext
        ? state.offscreenContext.createImageData(state.gridWidth, state.gridHeight)
        : null;
    };

    const addRipple = (x: number, y: number, strength: number, radius: number) => {
      const motionScale = deviceState.reducedMotion ? 0.38 : deviceState.mobile ? 0.72 : 1;
      const radiusScale = (deviceState.mobile ? 0.86 : 1) * DISTURBANCE_RADIUS_MULTIPLIER;

      state.ripples.push({
        x,
        y,
        strength: strength * motionScale,
        radius: radius * radiusScale,
      });

      if (state.ripples.length > 48) {
        state.ripples.splice(0, state.ripples.length - 48);
      }
    };

    const addRippleTrail = (
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      strength: number,
      radius: number
    ) => {
      const distance = Math.hypot(toX - fromX, toY - fromY);
      const stepPx = deviceState.mobile ? 10 : 8;
      const steps = Math.max(1, Math.min(14, Math.ceil(distance / stepPx)));

      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const taper = 1 - t * 0.38;

        addRipple(
          lerp(fromX, toX, t),
          lerp(fromY, toY, t),
          strength * taper,
          radius * (0.85 + (1 - t) * 0.15)
        );
      }
    };

    const applyRipples = () => {
      if (!state.ripples.length) {
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      while (state.ripples.length) {
        const ripple = state.ripples.shift();

        if (!ripple) {
          continue;
        }

        const centerX = Math.floor((ripple.x / width) * (state.gridWidth - 1));
        const centerY = Math.floor((ripple.y / height) * (state.gridHeight - 1));
        const gridRadius = Math.max(
          2,
          Math.floor((ripple.radius / Math.max(width, height)) * Math.max(state.gridWidth, state.gridHeight))
        );

        for (let y = -gridRadius; y <= gridRadius; y += 1) {
          const yy = centerY + y;

          if (yy < 1 || yy >= state.gridHeight - 1) {
            continue;
          }

          for (let x = -gridRadius; x <= gridRadius; x += 1) {
            const xx = centerX + x;

            if (xx < 1 || xx >= state.gridWidth - 1) {
              continue;
            }

            const distance = Math.sqrt(x * x + y * y) / gridRadius;

            if (distance > 1) {
              continue;
            }

            const falloff = 1 - distance;
            const index = yy * state.gridWidth + xx;
            state.front[index] += ripple.strength * falloff * falloff * falloff;
          }
        }
      }
    };

    const injectStoneDrops = (now: number) => {
      if (!state.stoneDrops.length) {
        return;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxViewport = Math.max(viewportWidth, viewportHeight);
      const toGrid = Math.max(state.gridWidth, state.gridHeight) / maxViewport;
      const waveVelocityPx = deviceState.reducedMotion ? 104 : deviceState.mobile ? 138 : 158;
      const dropLifetimeMs = deviceState.reducedMotion ? 560 : deviceState.mobile ? 700 : 780;
      const ringThicknessGrid = Math.max(1.45, (deviceState.mobile ? 13 : 11) * toGrid);

      const activeDrops: StoneDrop[] = [];

      for (const drop of state.stoneDrops) {
        const elapsed = now - drop.startedAt;

        if (elapsed >= dropLifetimeMs) {
          continue;
        }

        const ageSeconds = elapsed / 1000;
        const decay = Math.exp(-ageSeconds * 3.35);
        const centerX = (drop.x / viewportWidth) * (state.gridWidth - 1);
        const centerY = (drop.y / viewportHeight) * (state.gridHeight - 1);
        const ringRadiusGrid = (26 + waveVelocityPx * ageSeconds) * toGrid;
        const influenceRadius = Math.max(3, ringRadiusGrid + ringThicknessGrid * 2.4);

        const minX = Math.max(1, Math.floor(centerX - influenceRadius));
        const maxX = Math.min(state.gridWidth - 2, Math.ceil(centerX + influenceRadius));
        const minY = Math.max(1, Math.floor(centerY - influenceRadius));
        const maxY = Math.min(state.gridHeight - 2, Math.ceil(centerY + influenceRadius));

        const corePull = elapsed < 190 ? -0.28 * (1 - elapsed / 190) : 0;
        const coreSigma = Math.max(0.8, ringThicknessGrid * 0.9);
        const ringFrequency = deviceState.reducedMotion ? 0.95 : 1.08;
        const timeFrequency = deviceState.reducedMotion ? 3.6 : 4.2;

        for (let y = minY; y <= maxY; y += 1) {
          for (let x = minX; x <= maxX; x += 1) {
            const deltaX = x - centerX;
            const deltaY = y - centerY;
            const distance = Math.hypot(deltaX, deltaY);

            if (distance > influenceRadius) {
              continue;
            }

            const ringDelta = distance - ringRadiusGrid;
            const ringBand = Math.exp(-(ringDelta * ringDelta) / (2 * ringThicknessGrid * ringThicknessGrid));
            const ringWave = Math.sin(ringDelta * ringFrequency - ageSeconds * timeFrequency);
            const ringContribution = ringWave * ringBand * 0.72 * decay;
            const coreContribution =
              corePull === 0 ? 0 : corePull * Math.exp(-(distance * distance) / (2 * coreSigma * coreSigma));

            const index = y * state.gridWidth + x;
            state.front[index] += ringContribution + coreContribution;
          }
        }

        activeDrops.push(drop);
      }

      state.stoneDrops = activeDrops;
    };

    const updateFluid = () => {
      const width = state.gridWidth;
      const height = state.gridHeight;
      const damping = deviceState.reducedMotion ? 0.84 : deviceState.mobile ? 0.908 : 0.946;
      const edgeAbsorbBand = 7;

      for (let y = 1; y < height - 1; y += 1) {
        for (let x = 1; x < width - 1; x += 1) {
          const index = y * width + x;
          const distanceToEdge = Math.min(x, y, width - 1 - x, height - 1 - y);
          const edgeMix = clamp(distanceToEdge / edgeAbsorbBand, 0, 1);
          const localDamping = damping * (0.7 + edgeMix * 0.3);

          state.back[index] =
            ((state.front[index - 1] +
              state.front[index + 1] +
              state.front[index - width] +
              state.front[index + width]) /
              2 -
              state.back[index]) *
            localDamping;
        }
      }

      const temp = state.front;
      state.front = state.back;
      state.back = temp;
    };

    const drawFluid = () => {
      const offscreenContext = state.offscreenContext;
      const imageData = state.imageData;

      if (!offscreenContext || !imageData) {
        return;
      }

      const width = state.gridWidth;
      const height = state.gridHeight;
      const data = imageData.data;
      const time = performance.now() * 0.001;

      const colorA = [34, 211, 238] as const;
      const colorB = [168, 85, 247] as const;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const index = y * width + x;
          const pixelIndex = index * 4;

          const wave = state.front[index];
          const right = state.front[index + 1] ?? wave;
          const down = state.front[index + width] ?? wave;
          const dx = right - wave;
          const dy = down - wave;

          const slope = Math.abs(dx) + Math.abs(dy);
          const refract = Math.max(-1, Math.min(1, wave * 0.9));
          const noiseSeed = Math.sin(x * 13.11 + y * 81.73 + time * 0.7) * 43758.5453;
          const noise = (noiseSeed - Math.floor(noiseSeed) - 0.5) * 2;
          const streak = Math.sin(x * 0.048 + y * 0.012 + time * 0.36) * 0.5 + 0.5;

          const displacementX = clamp(x + (dx * 14 + wave * 6), 0, width - 1);
          const displacementY = clamp(y + (dy * 18 + wave * 8), 0, height - 1);
          const boundaryWave =
            displacementY / height +
            Math.sin(displacementX * 0.032 + time * 0.42) * 0.045 +
            wave * 1.15;
          const split = 0.52 + Math.sin(time * 0.16) * 0.04;
          const blend = smoothstep(split - 0.06, split + 0.06, boundaryWave);

          const pathBoost = clamp(slope * 2.2 + Math.abs(wave) * 1.1, 0, 1.2);
          const edgeLight = 0.82 + refract * 0.16 + slope * 1.05 + streak * 0.08 + noise * 0.03 + pathBoost * 0.12;
          const red = clamp((colorA[0] * (1 - blend) + colorB[0] * blend) * edgeLight * (1 + pathBoost * 0.06), 0, 255);
          const green = clamp((colorA[1] * (1 - blend) + colorB[1] * blend) * edgeLight * (1 + pathBoost * 0.1), 0, 255);
          const blue = clamp((colorA[2] * (1 - blend) + colorB[2] * blend) * edgeLight * (1 + pathBoost * 0.08), 0, 255);
          const alpha = clamp(8 + Math.abs(wave) * 104 + slope * 72 + pathBoost * 28, 0, 255);

          data[pixelIndex] = red;
          data[pixelIndex + 1] = green;
          data[pixelIndex + 2] = blue;
          data[pixelIndex + 3] = alpha;
        }
      }

      offscreenContext.putImageData(imageData, 0, 0);

      const widthPx = window.innerWidth;
      const heightPx = window.innerHeight;
      context.clearRect(0, 0, widthPx, heightPx);
      context.globalCompositeOperation = "source-over";
      context.globalAlpha = deviceState.reducedMotion ? 0.09 : deviceState.mobile ? 0.145 : 0.2;
      context.drawImage(state.offscreen, 0, 0, widthPx, heightPx);

      const sheen = context.createLinearGradient(0, 0, widthPx, heightPx);
      sheen.addColorStop(0, "rgba(245, 246, 248, 0.045)");
      sheen.addColorStop(0.4, "rgba(208, 211, 218, 0.018)");
      sheen.addColorStop(1, "rgba(120, 126, 140, 0.03)");

      const streakOffset = (performance.now() * 0.012) % (widthPx * 1.6);
      const gloss = context.createLinearGradient(-widthPx * 0.4 + streakOffset, 0, streakOffset, heightPx);
      gloss.addColorStop(0, "rgba(255, 255, 255, 0)");
      gloss.addColorStop(0.5, "rgba(255, 255, 255, 0.06)");
      gloss.addColorStop(1, "rgba(255, 255, 255, 0)");

      context.globalCompositeOperation = "screen";
      context.globalAlpha = deviceState.reducedMotion ? 0.07 : deviceState.mobile ? 0.125 : 0.18;
      context.fillStyle = sheen;
      context.fillRect(0, 0, widthPx, heightPx);
      context.fillStyle = gloss;
      context.fillRect(0, 0, widthPx, heightPx);
      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 1;
    };

    const animate = () => {
      injectStoneDrops(performance.now());
      applyRipples();
      updateFluid();
      drawFluid();
      state.animationId = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      const fromX = pointer.x;
      const fromY = pointer.y;
      const dx = event.clientX - fromX;
      const dy = event.clientY - fromY;
      const speed = Math.hypot(dx, dy);

      pointer.x = event.clientX;
      pointer.y = event.clientY;

      if (speed > 0.35) {
        const strength = Math.min(0.33, 0.03 + speed * 0.0036);
        const radius = Math.min(102, 18 + speed * 1.3);
        addRippleTrail(fromX, fromY, event.clientX, event.clientY, strength, radius);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      addRipple(event.clientX, event.clientY, 0.42, 42);
      state.stoneDrops.push({
        x: event.clientX,
        y: event.clientY,
        startedAt: performance.now(),
      });

      if (state.stoneDrops.length > 7) {
        state.stoneDrops.splice(0, state.stoneDrops.length - 7);
      }
    };

    const onResize = () => {
      setCanvasSize();
      addRipple(window.innerWidth * 0.5, window.innerHeight * 0.5, 0.15, 132);
    };

    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      deviceState.reducedMotion = event.matches;
    };

    const onMobileChange = (event: MediaQueryListEvent) => {
      deviceState.mobile = event.matches;
    };

    setCanvasSize();
    addRipple(window.innerWidth * 0.5, window.innerHeight * 0.5, 0.2, 138);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reduceMotionMedia.addEventListener("change", onReducedMotionChange);
    mobileMedia.addEventListener("change", onMobileChange);

    animate();

    return () => {
      window.cancelAnimationFrame(state.animationId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      reduceMotionMedia.removeEventListener("change", onReducedMotionChange);
      mobileMedia.removeEventListener("change", onMobileChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="water-overlay-canvas" aria-hidden="true" />;
}

