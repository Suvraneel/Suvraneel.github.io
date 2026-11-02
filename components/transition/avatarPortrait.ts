import { cubicBezier } from "motion/react";
import {
  PHOTO_FADE_BOTTOM_SHARE,
  PHOTO_FADE_LEFT,
  PHOTO_FADE_TOP_SHARE,
  PHOTO_POSITION,
  PORTRAIT_SRC,
} from "@lib/portrait";

// ---------------------------------------------------------------------------
// Home ↔ About on a desktop showing About's portrait column: the dashboard's
// avatar (the same photo, in an octagon) opens into the portrait, and closes
// back into it on the way home, instead of Home lifting away as a black sheet.
//
// A copy of the photo travels in a fixed layer above the scene and the pages,
// so the turning dashboard never passes over the face. It starts as exactly
// the avatar (which is hidden meanwhile), grows about the eyes into About's
// photo, and hands over to the real one where it lands. Its last frame is the
// real photo's own layout (column clip, frame fades, cover crop), so the
// hand-over changes no pixel.
// ---------------------------------------------------------------------------

/**
 * The avatar's octagon on screen: its centre, and where its full width and
 * full height (downward) run, as screen vectors in px. Its plate is turned in
 * depth, so they are neither square to each other nor level.
 */
export type AvatarPlacement = { x: number; y: number; across: [number, number]; down: [number, number] };

type Box = { left: number; top: number; width: number; height: number };

/** About's portrait on screen: the column that clips it and the frame the photo is cover-fit in. */
export type PortraitPlacement = { column: Box; frame: Box };

type Point = { x: number; y: number };

// In the avatar's texture, measured in the photo's own side: where the
// octagon's centre sits on the photo, and how much wider the octagon is.
const OCTAGON_CENTRE: Point = { x: 0.4878, y: 0.4274 };
const OCTAGON_WIDTH = 1 / 0.967;
/** Between the eyes, in the photo's own units: the point the photo grows about. */
const EYES: Point = { x: 742 / 1456, y: 344 / 1456 };
/** The avatar's outline (violet top left, cyan bottom right), in hundredths of the octagon's width. */
const OUTLINE_WIDTH = 1.5;
/** The outline fades over this share of the travel, at the avatar's end. */
const OUTLINE_SPAN = 0.15;
/** Samples of the eased path; linear between them. */
const KEYFRAMES = 32;
/** A regular octagon with flat sides, in its own box. */
const CORNER = 100 / (2 + Math.SQRT2);
const OCTAGON_POINTS: [number, number][] = [
  [CORNER, 0],
  [100 - CORNER, 0],
  [100, CORNER],
  [100, 100 - CORNER],
  [100 - CORNER, 100],
  [CORNER, 100],
  [0, 100 - CORNER],
  [0, CORNER],
];
const OCTAGON_CLIP = `polygon(${OCTAGON_POINTS.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
const SVG = "http://www.w3.org/2000/svg";

// The photo, decoded ahead (from Home once its scene is up, and from About),
// so the copy never shows an empty octagon. Held for the session: an
// unreferenced Image can be collected, and the next trip would fetch it again.
let portrait: HTMLImageElement | null = null;
let portraitDecoded = false;

export function warmPortrait() {
  if (portrait || typeof window === "undefined") return;
  portrait = new window.Image();
  portrait.src = PORTRAIT_SRC;
  portrait.decode().then(
    () => {
      portraitDecoded = true;
    },
    () => undefined
  );
}

/** The decoded photo, or null while it is not ready to draw. */
export const decodedPortrait = () => (portraitDecoded ? portrait : null);

const box = (rect: DOMRect): Box => ({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });

/** About's portrait as it stands now, or null where its column is not shown. */
export function measurePortrait(layer: ParentNode | null | undefined): PortraitPlacement | null {
  const column = layer?.querySelector<HTMLElement>("[data-portrait]");
  const frame = layer?.querySelector<HTMLElement>("[data-portrait-photo]");
  if (!column || !frame || column.offsetParent === null) return null;
  const frameRect = frame.getBoundingClientRect();
  if (frameRect.width <= 0 || frameRect.height <= 0) return null;
  return { column: box(column.getBoundingClientRect()), frame: box(frameRect) };
}

/** The avatar is wholly in view, so the copy can start (or land) exactly on it. */
export const isAvatarInView = (avatar: AvatarPlacement) => {
  const halfX = (Math.abs(avatar.across[0]) + Math.abs(avatar.down[0])) / 2;
  const halfY = (Math.abs(avatar.across[1]) + Math.abs(avatar.down[1])) / 2;
  return (
    halfX > 0 &&
    halfY > 0 &&
    avatar.x - halfX >= 0 &&
    avatar.x + halfX <= document.documentElement.clientWidth &&
    avatar.y - halfY >= 0 &&
    avatar.y + halfY <= window.innerHeight
  );
};

/** Where the copy rests: the photo's square and the octagon round it (centre, width). */
type Rest = {
  photo: { left: number; top: number; size: number };
  octagon: { x: number; y: number; size: number };
  /** The column it is clipped to; null: the whole viewport. */
  column: Box | null;
  /** The frame's fades: the left one on the column, the top one there too or on the photo itself. */
  columnMask: string;
  photoMask: string;
};

export class AvatarTraveller {
  private readonly root: HTMLDivElement;
  private readonly column: HTMLDivElement;
  private readonly octagon: HTMLDivElement;
  private readonly outline: SVGSVGElement;
  private readonly photo: HTMLImageElement;
  private readonly avatar: AvatarPlacement;
  private rest!: Rest;
  private removed = false;

  constructor(avatar: AvatarPlacement, photo: HTMLImageElement) {
    this.avatar = avatar;
    this.photo = photo;

    this.root = document.createElement("div");
    this.root.setAttribute("aria-hidden", "true");
    this.root.dataset.avatarPortrait = "";
    // Above the dashboard (z 3 in flight) and every page layer, under the rail.
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "0",
      zIndex: "4",
      pointerEvents: "none",
      overflow: "hidden",
    });

    this.column = document.createElement("div");
    Object.assign(this.column.style, { position: "absolute", overflow: "hidden" });

    // Black behind the photo, as in the avatar (above the photo's own top) and on About's page.
    this.octagon = document.createElement("div");
    Object.assign(this.octagon.style, {
      position: "absolute",
      clipPath: OCTAGON_CLIP,
      background: "#000",
      willChange: "transform",
    });

    // The photo is black and white already: About's grayscale filter changes
    // no pixel of it, and a filter here would draw the copy through an
    // offscreen pass that softens it at the avatar's size.
    photo.alt = "";
    photo.decoding = "sync";
    Object.assign(photo.style, {
      position: "absolute",
      display: "block",
      maxWidth: "none",
      willChange: "transform",
    });

    this.outline = document.createElementNS(SVG, "svg");
    this.outline.setAttribute("viewBox", "0 0 100 100");
    this.outline.setAttribute("preserveAspectRatio", "none");
    Object.assign(this.outline.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });
    const gradient = document.createElementNS(SVG, "linearGradient");
    gradient.id = "avatar-portrait-outline";
    for (const [offset, color] of [
      ["0", "#8A6AFF"],
      ["1", "#0EE5FE"],
    ]) {
      const stop = document.createElementNS(SVG, "stop");
      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", color);
      gradient.append(stop);
    }
    gradient.setAttribute("x1", "0");
    gradient.setAttribute("y1", "0");
    gradient.setAttribute("x2", "1");
    gradient.setAttribute("y2", "1");
    const defs = document.createElementNS(SVG, "defs");
    defs.append(gradient);
    // Inset by half its width, so the clip leaves the whole stroke inside the octagon.
    const inset = OUTLINE_WIDTH / 2;
    const scale = (100 - OUTLINE_WIDTH) / 100;
    const polygon = document.createElementNS(SVG, "polygon");
    polygon.setAttribute("points", OCTAGON_POINTS.map(([x, y]) => `${inset + x * scale},${inset + y * scale}`).join(" "));
    polygon.setAttribute("fill", "none");
    polygon.setAttribute("stroke", "url(#avatar-portrait-outline)");
    polygon.setAttribute("stroke-width", String(OUTLINE_WIDTH));
    this.outline.append(defs, polygon);

    this.octagon.append(photo, this.outline);
    this.column.append(this.octagon);
    this.root.append(this.column);

    // Until About's portrait is placed, it rests at the avatar's own size.
    const octagonSize = Math.hypot(...avatar.across);
    const photoSize = octagonSize / OCTAGON_WIDTH;
    this.place({
      photo: {
        left: avatar.x - OCTAGON_CENTRE.x * photoSize,
        top: avatar.y - OCTAGON_CENTRE.y * photoSize,
        size: photoSize,
      },
      octagon: { x: avatar.x, y: avatar.y, size: octagonSize },
      column: null,
      columnMask: "none",
      photoMask: "none",
    });
    this.show(0);
    document.body.append(this.root);
  }

  /** Rests the copy on About's portrait, for the travel between it and the avatar. */
  arrive(portrait: PortraitPlacement) {
    const { column, frame } = portrait;
    // The photo is a square, cover-fit in its frame at PHOTO_POSITION.
    const size = Math.max(frame.width, frame.height);
    const left = frame.left + PHOTO_POSITION[0] * (frame.width - size);
    const top = frame.top + PHOTO_POSITION[1] * (frame.height - size);
    const centre = { x: left + OCTAGON_CENTRE.x * size, y: top + OCTAGON_CENTRE.y * size };
    // At rest the octagon reaches past every corner of the visible column, so
    // only the column's own edges remain.
    const visible: Box = {
      left: column.left,
      top: Math.max(0, column.top),
      width: column.width,
      height: Math.min(window.innerHeight, column.top + column.height) - Math.max(0, column.top),
    };
    let apothem = 0;
    for (const x of [visible.left, visible.left + visible.width]) {
      for (const y of [visible.top, visible.top + visible.height]) {
        const dx = Math.abs(x - centre.x);
        const dy = Math.abs(y - centre.y);
        apothem = Math.max(apothem, dx, dy, (dx + dy) / Math.SQRT2);
      }
    }
    // The frame's top fade. Where it runs above the avatar (the usual case),
    // it stays on the screen with the column's left fade and never touches the
    // copy while it is small; otherwise it rides on the photo, the frame's top
    // being the photo's own unless the frame crops it.
    const fadeEnd = frame.top + PHOTO_FADE_TOP_SHARE * frame.height;
    const avatarTop = this.avatar.y - (Math.abs(this.avatar.across[1]) + Math.abs(this.avatar.down[1])) / 2;
    const fadeOnScreen = avatarTop >= fadeEnd;
    const fadeFrom = (frame.top - top) / size;
    const fadeTo = fadeFrom + (PHOTO_FADE_TOP_SHARE * frame.height) / size;
    // The frame's foot fade, from its bottom edge up (it runs past the screen's unless the frame falls short).
    const foot = visible.top + visible.height - (frame.top + frame.height);
    const footFade = `linear-gradient(to top, transparent ${foot}px, #000 ${foot + PHOTO_FADE_BOTTOM_SHARE * frame.height}px)`;
    this.place({
      photo: { left, top, size },
      octagon: { x: centre.x, y: centre.y, size: Math.max(2 * apothem + 4, OCTAGON_WIDTH * size) },
      column: visible,
      columnMask: fadeOnScreen
        ? `${PHOTO_FADE_LEFT}, linear-gradient(to bottom, transparent ${frame.top - visible.top}px, #000 ${fadeEnd - visible.top}px), ${footFade}`
        : `${PHOTO_FADE_LEFT}, ${footFade}`,
      photoMask: fadeOnScreen
        ? "none"
        : `linear-gradient(to bottom, transparent ${fadeFrom * 100}%, #000 ${fadeTo * 100}%)`,
    });
  }

  /** Keeps the copy invisible where it stands, until fadeIn. */
  conceal() {
    this.root.style.opacity = "0";
  }

  /** Fades the copy in where it stands, as an animation for the transition's timeline. */
  fadeIn(duration: number) {
    const fade = this.root.animate([{ opacity: 0 }, { opacity: 1 }], { duration, fill: "both" });
    this.root.style.opacity = "";
    return fade;
  }

  /** Holds the copy at a point of its travel: 0 the avatar, 1 About's portrait. */
  show(progress: number) {
    const frame = this.frame(progress);
    this.octagon.style.transform = frame.octagon;
    this.photo.style.transform = frame.photo;
    this.outline.style.opacity = progress === 0 ? "1" : "0";
  }

  /**
   * The travel as animations to put on the transition's timeline: forward
   * (1) from the avatar to the portrait, backward (-1) the other way, both on
   * `ease`. Sampled, because the photo grows about the eyes on a log scale
   * (it is ~11x larger at the end) while the eyes move on a straight line.
   */
  animate(direction: 1 | -1, duration: number, ease: readonly number[]): Animation[] {
    const curve = cubicBezier(ease[0], ease[1], ease[2], ease[3]);
    const octagon: Keyframe[] = [];
    const photo: Keyframe[] = [];
    for (let index = 0; index < KEYFRAMES; index++) {
      const offset = index / (KEYFRAMES - 1);
      const frame = this.frame(direction > 0 ? curve(offset) : 1 - curve(offset));
      octagon.push({ offset, transform: frame.octagon });
      photo.push({ offset, transform: frame.photo });
    }
    const outline =
      direction > 0
        ? [{ opacity: 1 }, { opacity: 0, offset: OUTLINE_SPAN }, { opacity: 0 }]
        : [{ opacity: 0 }, { opacity: 0, offset: 1 - OUTLINE_SPAN }, { opacity: 1 }];
    const timing: KeyframeAnimationOptions = { duration, fill: "both" };
    return [
      this.octagon.animate(octagon, timing),
      this.photo.animate(photo, timing),
      this.outline.animate(outline, timing),
    ];
  }

  /** Leaves once `ready` settles (the real photo can draw), or after `timeout` ms at most. */
  removeWhen(ready: Promise<unknown>, timeout = 500) {
    const timer = window.setTimeout(() => this.remove(), timeout);
    const done = () => {
      window.clearTimeout(timer);
      this.remove();
    };
    ready.then(done, done);
  }

  /** Fades out over what now stands under it (the avatar drawn again), then leaves. */
  fadeOut(duration: number) {
    if (this.removed) return;
    const fade = this.root.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: "forwards" });
    fade.finished.then(
      () => this.remove(),
      () => this.remove()
    );
  }

  remove() {
    if (this.removed) return;
    this.removed = true;
    this.root.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    this.root.remove();
    this.photo.style.transform = "";
  }

  private place(rest: Rest) {
    this.rest = rest;
    const { photo, octagon, column } = rest;
    const origin = column ? { x: column.left, y: column.top } : { x: 0, y: 0 };
    Object.assign(this.column.style, {
      left: `${origin.x}px`,
      top: `${origin.y}px`,
      width: column ? `${column.width}px` : "100%",
      height: column ? `${column.height}px` : "100%",
      maskImage: rest.columnMask,
      maskComposite: "intersect",
    });
    const octagonLeft = octagon.x - octagon.size / 2;
    const octagonTop = octagon.y - octagon.size / 2;
    Object.assign(this.octagon.style, {
      left: `${octagonLeft - origin.x}px`,
      top: `${octagonTop - origin.y}px`,
      width: `${octagon.size}px`,
      height: `${octagon.size}px`,
    });
    Object.assign(this.photo.style, {
      left: `${photo.left - octagonLeft}px`,
      top: `${photo.top - octagonTop}px`,
      width: `${photo.size}px`,
      height: `${photo.size}px`,
      transformOrigin: `${octagon.x - photo.left}px ${octagon.y - photo.top}px`,
      maskImage: rest.photoMask,
    });
  }

  /**
   * The copy's transforms at eased progress q (0 the avatar, 1 at rest).
   *
   * At rest the photo is a square of side D. On the avatar it is the same
   * square seen through the avatar's axes (`across`, `down`): a linear map L0,
   * split into a turn, a slant (skewX) and two scales. On the way the turn and
   * slant ease out linearly, the scales log-interpolate (the photo grows ~11x),
   * and the eyes move in a straight line, the point the photo grows about.
   * The octagon is drawn on the photo and grows on it from the avatar's
   * proportion to its rest size (by m), so the octagon's element carries the
   * photo's map times m and the photo undoes the m.
   */
  private frame(q: number) {
    const { photo, octagon } = this.rest;
    const { across, down } = this.avatar;
    const D = photo.size;
    // Rest px -> avatar px: an octagon width on the avatar is OCTAGON_WIDTH photo widths.
    const unit = 1 / (D * OCTAGON_WIDTH);
    const [a, b] = [across[0] * unit, across[1] * unit];
    const [c, d] = [down[0] * unit, down[1] * unit];
    const turn0 = Math.atan2(b, a);
    const scaleX0 = Math.hypot(a, b);
    const slantX = Math.cos(turn0) * c + Math.sin(turn0) * d;
    const scaleY0 = -Math.sin(turn0) * c + Math.cos(turn0) * d;
    const slant0 = Math.atan(slantX / scaleY0);
    // The octagon's proportion to the photo on the avatar, to its rest proportion.
    const m0 = (D * OCTAGON_WIDTH) / octagon.size;
    const toEyes = { x: (EYES.x - OCTAGON_CENTRE.x) * D, y: (EYES.y - OCTAGON_CENTRE.y) * D };
    const eyesFrom = {
      x: this.avatar.x + a * toEyes.x + c * toEyes.y,
      y: this.avatar.y + b * toEyes.x + d * toEyes.y,
    };
    const eyesTo = { x: photo.left + EYES.x * D, y: photo.top + EYES.y * D };

    const turn = turn0 * (1 - q);
    const slant = slant0 * (1 - q);
    const scaleX = scaleX0 ** (1 - q);
    const scaleY = scaleY0 ** (1 - q);
    const m = m0 ** (1 - q);
    const eyes = { x: eyesFrom.x + (eyesTo.x - eyesFrom.x) * q, y: eyesFrom.y + (eyesTo.y - eyesFrom.y) * q };
    // L = turn · slant · scale, applied to the octagon's centre from the eyes.
    const vx = octagon.x - eyesTo.x;
    const vy = octagon.y - eyesTo.y;
    const sx = scaleX * vx + Math.tan(slant) * scaleY * vy;
    const sy = scaleY * vy;
    const cos = Math.cos(turn);
    const sin = Math.sin(turn);
    // The octagon's element turns, slants and scales about its own centre.
    const tx = eyes.x + cos * sx - sin * sy - octagon.x;
    const ty = eyes.y + sin * sx + cos * sy - octagon.y;
    return {
      octagon: `translate3d(${tx}px, ${ty}px, 0px) rotate(${turn}rad) skewX(${slant}rad) scale(${scaleX * m}, ${scaleY * m})`,
      photo: `scale(${1 / m})`,
    };
  }
}
