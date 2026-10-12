"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode, RefObject } from "react";
import { useMagnetic } from "@hooks/useMagnetic";
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
  /** Leading icon, e.g. a FontAwesomeIcon. */
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  rel?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
};

// The calm secondary action that pairs with LiquidMetalButton: same height,
// font size and weight, with a hairline border and a faint fill.
const baseClassName =
  "inline-flex min-h-12 [font-family:Helvetica,Arial,sans-serif] min-w-0 items-center justify-center gap-3 whitespace-nowrap rounded-full border border-white/[0.18] bg-white/[0.04] px-5 text-sm font-normal text-white transition-[border-color,background-color,transform] duration-[250ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/[0.32] hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:translate-y-px active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none";

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
  const classes = `${baseClassName} ${className}`;
  const content = (
    <>
      {icon}
      {children}
    </>
  );
  const handlers = { onClick, onMouseEnter, onMouseLeave };

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
