"use client";

import Link from "next/link";
import { type MouseEvent, ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import { tasaOrbiter } from "@font";
import { useMagnetic } from "@hooks/useMagnetic";
import { hasHardwareWebGL2 } from "@lib/gpu";
import { isPlainAnchor } from "@lib/linkKind";

// Shader speeds: calm at rest, livelier on hover/focus, a short burst on click.
const IDLE_SPEED = 0.6;
const HOVER_SPEED = 1;
const CLICK_SPEED = 2.4;
const CLICK_BURST_MS = 300;
const RIPPLE_MS = 600;
// Remounts allowed after the GPU drops a context, so a lost-context loop can't thrash.
const MAX_CONTEXT_RESTORES = 2;
const CONTEXT_RESTORE_DELAY_MS = 1000;

type ShaderMount = {
  canvasElement: HTMLCanvasElement;
  dispose: () => void;
  setSpeed: (speed: number) => void;
};

// Free a canvas's WebGL context now instead of at GC, so mounts/unmounts
// (page lifts, modal open/close) never pile up live contexts.
function releaseContext(canvas: HTMLCanvasElement) {
  try {
    canvas.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    // Already lost or never created.
  }
}

type LiquidMetalButtonProps = {
  children: ReactNode;
  ariaLabel?: string;
  /**
   * Below sm (640px): a 44px round icon button (pass an ariaLabel and hide the
   * text label there); from sm up, the regular pill.
   */
  circleBelowSm?: boolean;
  className?: string;
  disabled?: boolean;
  /** Link only: download the target instead of navigating to it. */
  download?: boolean | string;
  href?: string;
  mobileOnly?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Link only: e.g. "noreferrer" for a new-tab link. */
  rel?: string;
  /** Link only: e.g. "_blank". New-tab, download and off-site links render a plain <a>. */
  target?: string;
  type?: "button" | "submit" | "reset";
};

export default function LiquidMetalButton({
  children,
  ariaLabel,
  circleBelowSm = false,
  className = "",
  disabled = false,
  download,
  href,
  mobileOnly = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  rel,
  target,
  type = "button",
}: LiquidMetalButtonProps) {
  const magnet = useMagnetic<HTMLElement>();
  const shaderContainer = useRef<HTMLSpanElement>(null);
  const shaderMount = useRef<ShaderMount | null>(null);
  const burstTimer = useRef<number | null>(null);
  const rippleId = useRef(0);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    const container = shaderContainer.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileViewport = mobileOnly ? window.matchMedia("(max-width: 550px)") : null;
    let disposed = false;
    let contextRestores = 0;
    let restoreTimer: number | null = null;

    // data-metal: "shader" while the WebGL rim runs; "static" whenever it doesn't
    // (engine can't run it, reduced motion, or a mobileOnly button on a wide
    // screen), so globals.css paints a static rim and the primary never looks flat.
    const setMetal = (state: "shader" | "static") => {
      container.dataset.metal = state;
    };

    const shaderWanted = () => !reducedMotion.matches && (!mobileViewport || mobileViewport.matches);

    const releaseShader = () => {
      const mount = shaderMount.current;
      if (!mount) return;
      shaderMount.current = null;
      mount.canvasElement.removeEventListener("webglcontextlost", handleContextLost);
      mount.dispose();
      releaseContext(mount.canvasElement);
    };

    const fallBack = (reason: unknown) => {
      // ShaderMount adds its canvas before it asks for a context; drop any leftover.
      container.querySelectorAll(":scope > canvas").forEach((canvas) => {
        releaseContext(canvas as HTMLCanvasElement);
        canvas.remove();
      });
      container.removeAttribute("data-paper-shader");
      setMetal("static");
      if (process.env.NODE_ENV !== "production") {
        console.warn("[LiquidMetalButton] WebGL2 shader unavailable, using the static rim.", reason);
      }
    };

    // GPU reset, driver crash or too many live contexts: drop the dead mount and
    // try a fresh one shortly (bounded), else keep the static rim.
    function handleContextLost() {
      releaseShader();
      if (disposed) return;
      if (contextRestores >= MAX_CONTEXT_RESTORES) {
        fallBack(new Error("WebGL context lost"));
        return;
      }
      contextRestores += 1;
      setMetal("static");
      if (restoreTimer) window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(() => {
        restoreTimer = null;
        void mountShader();
      }, CONTEXT_RESTORE_DELAY_MS);
    }

    const mountShader = async () => {
      if (disposed || shaderMount.current) return;
      if (!shaderWanted()) {
        setMetal("static");
        return;
      }

      // The shader needs WebGL2 (GLSL ES 3.00). Some setups have none: hardened
      // Firefox forks (webgl.disabled), blocklisted GPUs/drivers,
      // webgl.enable-webgl2=false. Software WebGL2 (no GPU) would run it but
      // stall the main thread on every frame. Either way, skip the shader chunk.
      if (!hasHardwareWebGL2()) {
        fallBack(new Error("WebGL2 is unavailable or not GPU-accelerated"));
        return;
      }

      try {
        const { liquidMetalFragmentShader, ShaderMount } = await import("@paper-design/shaders");
        if (disposed || shaderMount.current) return;
        if (!shaderWanted()) {
          setMetal("static");
          return;
        }

        shaderMount.current = new ShaderMount(
          container,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            // Aspect-aware rectangle mode, so wide (full-width) buttons get a full rim.
            u_shape: 0,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          container.parentElement?.matches(":hover, :focus-within") ? HOVER_SPEED : IDLE_SPEED,
        );
        shaderMount.current.canvasElement.addEventListener("webglcontextlost", handleContextLost);
        setMetal("shader");
      } catch (error) {
        shaderMount.current = null;
        fallBack(error);
      }
    };

    const updateShader = () => {
      if (!shaderWanted()) {
        releaseShader();
        setMetal("static");
        return;
      }

      void mountShader();
    };

    reducedMotion.addEventListener("change", updateShader);
    mobileViewport?.addEventListener("change", updateShader);
    void mountShader();

    return () => {
      disposed = true;
      reducedMotion.removeEventListener("change", updateShader);
      mobileViewport?.removeEventListener("change", updateShader);
      if (restoreTimer) window.clearTimeout(restoreTimer);
      releaseShader();
      if (burstTimer.current) window.clearTimeout(burstTimer.current);
    };
  }, [mobileOnly]);

  const isInteracting = () =>
    Boolean(shaderContainer.current?.parentElement?.matches(":hover, :focus-within"));

  const settleSpeed = () => {
    shaderMount.current?.setSpeed(isInteracting() ? HOVER_SPEED : IDLE_SPEED);
  };

  // Pointer hover drives the caller's hover effects (e.g. sound); keyboard focus
  // only livens the shader so focus stays silent.
  const handleMouseEnter = () => {
    shaderMount.current?.setSpeed(HOVER_SPEED);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    settleSpeed();
    onMouseLeave?.();
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (shaderMount.current) {
      shaderMount.current.setSpeed(CLICK_SPEED);
      if (burstTimer.current) window.clearTimeout(burstTimer.current);
      burstTimer.current = window.setTimeout(settleSpeed, CLICK_BURST_MS);
    }

    // Ripple from the pointer; keyboard activation (detail 0) and reduced motion skip it.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (event.detail > 0 && !reduceMotion) {
      const rect = event.currentTarget.getBoundingClientRect();
      const ripple = { x: event.clientX - rect.left, y: event.clientY - rect.top, id: rippleId.current++ };
      setRipples((current) => [...current, ripple]);
      window.setTimeout(() => {
        setRipples((current) => current.filter((item) => item.id !== ripple.id));
      }, RIPPLE_MS);
    }

    onClick?.(event);
  };

  // The whole button (hairline border, metal band, inner pill) presses as one, so
  // the border never parts from the band; the inner pill also sinks (inset shadow).
  // Label: brighter than PillButton's at rest (white/90), pure white on hover/focus.
  const sizeClassName = circleBelowSm
    ? "h-[44px] w-[44px] min-h-[44px] px-0 sm:h-auto sm:w-auto sm:min-h-12 sm:px-5"
    : "min-h-12 px-5";
  const sharedClassName = `group relative isolate inline-flex ${sizeClassName} min-w-0 items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-full border border-white/20 bg-[#111] text-sm font-normal text-white/90 shadow-[0_3px_12px_rgba(0,0,0,0.3)] transition-[border-color,color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-white/45 hover:text-white hover:shadow-[0_6px_20px_rgba(255,255,255,0.1)] focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:translate-y-px active:scale-[0.98] active:duration-150 disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none ${tasaOrbiter.className} ${className}`;

  const surface = (
    <>
      {/* [&>canvas]: the shader library positions its canvas with nested CSS, which
          Firefox < 117 (ESR 115) ignores; these flat rules do the same job everywhere. */}
      <span ref={shaderContainer} aria-hidden="true" className="liquid-metal-shader pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full [&>canvas]:absolute [&>canvas]:inset-0 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full" />
      {/* Inner pill: inset 3px leaves an even 3px metal band. On press it sinks with
          an inset shadow, like a physical key. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-[3px] z-10 rounded-full bg-gradient-to-b from-[#202020] to-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] transition-shadow duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] group-active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(0,0,0,0.3)] motion-reduce:transition-none" />
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden="true"
          className="liquid-metal-ripple pointer-events-none absolute z-[15] h-5 w-5 rounded-full"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
      <span className="relative z-20 inline-flex items-center justify-center gap-3">{children}</span>
    </>
  );

  const handlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: settleSpeed,
    onBlur: settleSpeed,
    onClick: handleClick,
  };

  if (href) {
    // Files, new-tab and off-site links are not page navigations, so they skip next/link.
    if (isPlainAnchor(href, target, download)) {
      return (
        <a ref={magnet as RefObject<HTMLAnchorElement | null>} href={href} target={target} rel={rel} download={download === true ? "" : download || undefined} aria-label={ariaLabel} className={sharedClassName} {...handlers}>
          {surface}
        </a>
      );
    }

    return (
      <Link ref={magnet as RefObject<HTMLAnchorElement | null>} href={href} target={target} rel={rel} aria-label={ariaLabel} className={sharedClassName} {...handlers}>
        {surface}
      </Link>
    );
  }

  return (
    <button ref={magnet as RefObject<HTMLButtonElement | null>} type={type} disabled={disabled} aria-label={ariaLabel} className={sharedClassName} {...handlers}>
      {surface}
    </button>
  );
}