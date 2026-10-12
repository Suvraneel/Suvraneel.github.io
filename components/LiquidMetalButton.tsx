"use client";

import Link from "next/link";
import { type MouseEvent, ReactNode, useEffect, useRef, useState } from "react";

// Shader speeds: calm at rest, livelier on hover/focus, a short burst on click.
const IDLE_SPEED = 0.6;
const HOVER_SPEED = 1;
const CLICK_SPEED = 2.4;
const CLICK_BURST_MS = 300;
const RIPPLE_MS = 600;

type ShaderMount = {
  dispose: () => void;
  setSpeed: (speed: number) => void;
};

type LiquidMetalButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  mobileOnly?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export default function LiquidMetalButton({
  children,
  className = "",
  disabled = false,
  href,
  mobileOnly = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  type = "button",
}: LiquidMetalButtonProps) {
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

    const mountShader = async () => {
      if (
        disposed ||
        reducedMotion.matches ||
        (mobileViewport && !mobileViewport.matches) ||
        shaderMount.current
      ) return;

      try {
        const { liquidMetalFragmentShader, ShaderMount } = await import("@paper-design/shaders");
        if (
          disposed ||
          reducedMotion.matches ||
          (mobileViewport && !mobileViewport.matches) ||
          shaderMount.current
        ) return;

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
      } catch {
        shaderMount.current = null;
      }
    };

    const updateShader = () => {
      if (reducedMotion.matches || (mobileViewport && !mobileViewport.matches)) {
        shaderMount.current?.dispose();
        shaderMount.current = null;
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
      shaderMount.current?.dispose();
      shaderMount.current = null;
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

    onClick?.();
  };

  const sharedClassName = `group relative isolate inline-flex min-h-12 min-w-0 items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-full border border-white/20 bg-[#111] px-5 text-sm font-normal text-white/65 shadow-[0_3px_12px_rgba(0,0,0,0.3)] transition-[border-color,transform,box-shadow] duration-300 hover:border-white/45 hover:shadow-[0_6px_20px_rgba(255,255,255,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd] disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none ${className}`;

  const surface = (
    <>
      <span ref={shaderContainer} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] group-active:translate-y-px group-active:scale-[0.98] motion-reduce:transition-none" />
      {/* Inner pill sinks on press with an inset shadow, like a physical key. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-[2px] z-10 rounded-full bg-gradient-to-b from-[#202020] to-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] group-active:translate-y-px group-active:scale-[0.98] group-active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(0,0,0,0.3)] motion-reduce:transition-none" />
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

  if (href) {
    return (
      <Link href={href} className={sharedClassName} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onFocus={settleSpeed} onBlur={settleSpeed} onClick={handleClick}>
        {surface}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={sharedClassName} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onFocus={settleSpeed} onBlur={settleSpeed} onClick={handleClick}>
      {surface}
    </button>
  );
}