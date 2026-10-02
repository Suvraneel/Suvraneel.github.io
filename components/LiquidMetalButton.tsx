"use client";

import Link from "next/link";
import { ReactNode, useEffect, useRef } from "react";

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
  type = "button",
}: LiquidMetalButtonProps) {
  const shaderContainer = useRef<HTMLSpanElement>(null);
  const shaderMount = useRef<ShaderMount | null>(null);

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
            u_shiftRed: 0.2,
            u_shiftBlue: 0.2,
            u_distortion: 0.02,
            u_contour: 0.15,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          0,
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
    };
  }, [mobileOnly]);

  const startMotion = () => {
    shaderMount.current?.setSpeed(0.7);
    onMouseEnter?.();
  };

  const stopMotion = () => {
    shaderMount.current?.setSpeed(0);
    onMouseLeave?.();
  };

  const sharedClassName = `group relative isolate inline-flex min-h-12 min-w-0 items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-full border border-white/20 bg-[#111] px-5 text-sm font-normal text-white/65 shadow-[0_3px_12px_rgba(0,0,0,0.3)] transition-[border-color,transform,box-shadow] duration-300 hover:border-white/45 hover:shadow-[0_6px_20px_rgba(255,255,255,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd] disabled:cursor-wait disabled:opacity-70 active:translate-y-px motion-reduce:transition-none ${className}`;

  const surface = (
    <>
      <span ref={shaderContainer} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 rounded-full" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-[2px] z-10 rounded-full bg-gradient-to-b from-[#202020] to-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]" />
      <span className="relative z-20 inline-flex items-center justify-center gap-3">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={sharedClassName} onMouseEnter={startMotion} onMouseLeave={stopMotion} onFocus={startMotion} onBlur={stopMotion}>
        {surface}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={sharedClassName} onMouseEnter={startMotion} onMouseLeave={stopMotion} onFocus={startMotion} onBlur={stopMotion}>
      {surface}
    </button>
  );
}