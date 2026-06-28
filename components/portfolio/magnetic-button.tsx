"use client";

import { useMemo, useState } from "react";

type MagneticButtonProps = {
  href: string;
  label: string;
  variant?: "primary" | "ghost";
  ariaLabel?: string;
};

export function MagneticButton({
  href,
  label,
  variant = "primary",
  ariaLabel,
}: MagneticButtonProps) {
  const [transform, setTransform] = useState("translate3d(0, 0, 0)");

  const classes = useMemo(() => {
    const base =
      "inline-flex h-12 min-w-40 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-wide transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300";

    if (variant === "ghost") {
      return `${base} magnetic-button magnetic-button-ghost border border-white/25 bg-white/5 text-zinc-100 hover:border-cyan-300/65 hover:bg-cyan-500/10`;
    }

    return `${base} magnetic-button magnetic-button-primary bg-gradient-to-r from-cyan-300 to-fuchsia-400 text-zinc-950 shadow-[0_10px_40px_-15px_rgba(34,211,238,0.9)] hover:brightness-110`;
  }, [variant]);

  return (
    <a
      href={href}
      aria-label={ariaLabel ?? label}
      className={classes}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - bounds.left - bounds.width / 2;
        const y = event.clientY - bounds.top - bounds.height / 2;

        setTransform(`translate3d(${x * 0.08}px, ${y * 0.12}px, 0)`);
      }}
      onPointerLeave={() => setTransform("translate3d(0, 0, 0)")}
      style={{ transform }}
    >
      {label}
    </a>
  );
}

