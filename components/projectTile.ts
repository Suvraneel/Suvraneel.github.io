// What the Projects gallery shares with its dialog (ProjectModal): the tile a
// dialog opens from, and how a tile draws a contained thumbnail. Kept apart from
// the dialog so the page loads without the dialog's code (fetched on demand).

import type { CSSProperties } from "react";

/**
 * The tile that opened the dialog. Its media becomes the preview frame, which
 * starts over it and goes back to it (re-measured) on close.
 */
export type ModalSource = {
  tile: HTMLElement;
  /**
   * The element drawing the tile's still, as it stands (depth drift and hover
   * scale included); null draws the frame over the whole tile.
   */
  media: HTMLElement | null;
  /** The still the tile is showing, already decoded, so the preview is never black. */
  poster: string | null;
  /** How strong the tile showed its still when pressed (its opacity: dimmed at rest, full on hover). */
  strength: number;
  /**
   * The tile was at least partly in the window when it was pressed. Read then,
   * before the dialog locks the page: right after the lock, WebKit reports
   * every box a scroll's length from where it is drawn.
   */
  onScreen: boolean;
  /**
   * A tile whose picture is composed in the page (footage, scrim and type, as
   * the flagship heroes are) rather than one image: the frame carries a copy
   * of it, laid over the tile as the tile draws it, so it can still travel.
   */
  composite?: HTMLElement | null;
  /** The tile's name row (logo and name): it flies into the dialog's title and back. */
  title?: HTMLElement | null;
};

/** At least partly inside the window. */
export const isOnScreen = (box: DOMRect) =>
  box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0 && box.top < window.innerHeight && box.left < window.innerWidth;

/**
 * How a tile draws a contained thumbnail, shared with the preview frame, which
 * carries it the same way (see the frame's still): the image over a blurred
 * copy of itself on a dark mount, under a veil.
 */
export const THUMBNAIL_MOUNT_CLASS = "bg-[#060606]";
export const THUMBNAIL_BACKDROP_CLASS = "absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl will-change-transform";
export const THUMBNAIL_VEIL_CLASS = "pointer-events-none absolute inset-0 bg-[#060606]/35";

// Soft edges on the drawn thumbnail itself (its box is the contained image, not
// the tile), so a letterboxed image never meets its blurred copy in a hard line,
// even as it moves.
const THUMBNAIL_EDGE_MASK =
  "linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent), linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)";
export const THUMBNAIL_EDGE_STYLE: CSSProperties = {
  WebkitMaskImage: THUMBNAIL_EDGE_MASK,
  WebkitMaskComposite: "source-in",
  maskImage: THUMBNAIL_EDGE_MASK,
  maskComposite: "intersect",
};

/**
 * What carries a still's dim and hover scale: the still itself, or, for a designed
 * thumbnail whose footage loops over its poster, the frame they share.
 */
export const dimmedBy = (media: HTMLElement) => media.closest<HTMLElement>("[data-thumb-frame]") ?? media;
