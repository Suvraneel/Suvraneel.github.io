import type { PointerEvent } from "react";

/**
 * Marks which half of a button the pointer crossed (data-flood-from), on enter
 * and on leave, so a hover fill (.pill-flood, .metal-flood in globals.css)
 * comes in from the side the pointer entered and drains out the side it left.
 */
export const markFloodSide = (event: PointerEvent<HTMLElement>) => {
  const target = event.currentTarget;
  const box = target.getBoundingClientRect();
  target.dataset.floodFrom = event.clientX < box.left + box.width / 2 ? "left" : "right";
};
