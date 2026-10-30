import type { Transition } from "motion/react";
import { EASE_FADE } from "@lib/pageTransition";

// ---------------------------------------------------------------------------
// One motion for the site's modal dialogs (the project case study, the
// scheduler). The scheduler's panel grows from the control that opened it and
// shrinks back toward it; the case study's preview frame travels from the
// tile's media and back while the rest of its panel fades. The backdrop fades
// under either and, on close, clears 70 ms after the panel has gone, so the
// page comes back sharp just as it lands.
// ---------------------------------------------------------------------------

/** The opener's centre, in viewport px. */
export type ModalOrigin = { x: number; y: number };

export const MODAL_PANEL_S = 0.42;
/** The panel's curve, also used by the case study's preview frame (a Web Animation, so it needs cubic-bezier). */
export const MODAL_PANEL_EASE = [0.16, 1, 0.3, 1] as const;
const MODAL_BACKDROP_S = 0.32;
export const MODAL_PANEL_MOTION: Transition = { duration: MODAL_PANEL_S, ease: MODAL_PANEL_EASE };
export const MODAL_BACKDROP_MOTION: Transition = { duration: MODAL_BACKDROP_S, ease: EASE_FADE };
export const MODAL_BACKDROP_EXIT_MOTION: Transition = {
  ...MODAL_BACKDROP_MOTION,
  delay: MODAL_PANEL_S + 0.07 - MODAL_BACKDROP_S,
};
/** Reduced motion: both layers crossfade, nothing scales. */
export const MODAL_REDUCED_MOTION: Transition = { duration: 0.15, ease: "easeOut" };

/** The dimmed, blurred page behind a modal (the native ::backdrop can't fade, so this layer does). */
export const MODAL_BACKDROP_CLASS = "fixed inset-0 bg-[#030609]/85 backdrop-blur-xl";

/**
 * Points a panel's scale at its opener, in the panel's own untransformed box
 * (the dialog has no transform). Call after showModal(), whose UA max-height
 * re-centres the panel.
 */
export function anchorToOrigin(dialog: HTMLDialogElement, panel: HTMLElement, origin: ModalOrigin) {
  const frame = dialog.getBoundingClientRect();
  const left = frame.left + dialog.clientLeft + panel.offsetLeft;
  const top = frame.top + dialog.clientTop + panel.offsetTop;
  panel.style.transformOrigin = `${origin.x - left}px ${origin.y - top}px`;
}
