"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode, RefObject } from "react";
import { tasaOrbiter } from "@font";
import { useMagnetic } from "@hooks/useMagnetic";
import { markFloodSide } from "@lib/floodSide";
import { isPlainAnchor } from "@lib/linkKind";

type PillButtonProps = {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  /** Link only: download the target instead of navigating to it. */
  download?: boolean | string;
  /** Internal page paths render next/link; files, new-tab and off-site links a plain <a>. */
  href?: string;
  /** Leading icon, e.g. an animate-ui icon. */
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  rel?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
};

// The calm secondary action that pairs with LiquidMetalButton: same height,
// font size and weight, with a hairline border and a faint fill. Under a
// pointer, white floods in from the side it entered and drains out the side it
// left (.pill-flood in globals.css); the label inverts over it by difference.
const baseClassName =
  "pill-button relative isolate inline-flex min-h-12 min-w-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-full border border-white/[0.18] bg-white/[0.04] px-5 text-sm font-normal text-white transition-[border-color,background-color,transform] duration-[250ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/[0.6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:translate-y-px active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none";


export default function PillButton({
  children,
  ariaLabel,
  className = "",
  disabled = false,
  download,
  href,
  icon,
  onClick,
  onMouseEnter,
  onMouseLeave,
  rel,
  target,
  type = "button",
}: PillButtonProps) {
  const magnet = useMagnetic<HTMLElement>();
  const classes = `${baseClassName} ${tasaOrbiter.className} ${className}`;
  const content = (
    <>
      <span aria-hidden="true" className="pill-flood" />
      <span className="pill-label inline-flex min-w-0 items-center justify-center gap-3">
        {icon}
        {children}
      </span>
    </>
  );
  const handlers = { onClick, onMouseEnter, onMouseLeave, onPointerEnter: markFloodSide, onPointerLeave: markFloodSide };

  if (href) {
    if (isPlainAnchor(href, target, download)) {
      return (
        <a ref={magnet as RefObject<HTMLAnchorElement | null>} href={href} target={target} rel={rel} download={download === true ? "" : download || undefined} aria-label={ariaLabel} className={classes} {...handlers}>
          {content}
        </a>
      );
    }

    return (
      <Link ref={magnet as RefObject<HTMLAnchorElement | null>} href={href} target={target} rel={rel} aria-label={ariaLabel} className={classes} {...handlers}>
        {content}
      </Link>
    );
  }

  return (
    <button ref={magnet as RefObject<HTMLButtonElement | null>} type={type} disabled={disabled} aria-label={ariaLabel} className={classes} {...handlers}>
      {content}
    </button>
  );
}
