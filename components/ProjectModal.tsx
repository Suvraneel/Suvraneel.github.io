"use client";

import { motion, usePresence, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { spaceBoards, tasaOrbiter } from "@font";
import LiquidMetalButton from "@components/LiquidMetalButton";
import LiteYouTube from "@components/LiteYouTube";
import PillButton from "@components/PillButton";
import { AnimateIcon } from "@components/animate-ui/icons/icon";
import { SquareArrowOutUpRightIcon } from "@components/animate-ui/icons/square-arrow-out-up-right";
import { XIcon } from "@components/animate-ui/icons/x";
import {
  MODAL_BACKDROP_CLASS,
  MODAL_BACKDROP_EXIT_MOTION,
  MODAL_BACKDROP_MOTION,
  MODAL_PANEL_EASE,
  MODAL_PANEL_MOTION,
  MODAL_PANEL_S,
  MODAL_REDUCED_MOTION,
} from "@lib/modalMotion";
import { cssEase } from "@lib/pageTransition";

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
};

/** At least partly inside the window. */
export const isOnScreen = (box: DOMRect) =>
  box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0 && box.top < window.innerHeight && box.left < window.innerWidth;

type Size = { width: number; height: number };

/**
 * Where the tile and its still stand (viewport px), the tile's border and inner
 * corner radius, how big it draws its picture whole (null: not known) and how
 * strong (the still's opacity: dimmed at rest, full on hover).
 */
type TileRects = { box: DOMRect; still: DOMRect; picture: Size | null; border: number; radius: number; strength: number };

/**
 * The tile's picture whole, as big as the tile draws it: a still with
 * object-fit: cover runs past its box at its own aspect (for a clip that
 * hasn't loaded, its poster's, when the caller knows it; not known yet
 * otherwise); any other fills its box.
 */
function drawnPicture(media: HTMLElement, still: DOMRect, style: CSSStyleDeclaration, poster: Size | null): Size | null {
  if (style.objectFit !== "cover") return { width: still.width, height: still.height };
  const [width, height] =
    media instanceof HTMLImageElement
      ? [media.naturalWidth, media.naturalHeight]
      : media instanceof HTMLVideoElement
        ? media.videoWidth > 0
          ? [media.videoWidth, media.videoHeight]
          : [poster?.width ?? 0, poster?.height ?? 0]
        : [0, 0];
  if (width === 0 || height === 0) return null;
  const scale = Math.max(still.width / width, still.height / height);
  return { width: width * scale, height: height * scale };
}

/** The tile as it stands now (with its clip's poster size, where known); null once it is gone. */
function measureTile({ tile, media }: ModalSource, poster: Size | null = null): TileRects | null {
  if (!tile.isConnected) return null;
  const box = tile.getBoundingClientRect();
  const border = tile.clientTop;
  const radius = parseFloat(getComputedStyle(tile).borderTopLeftRadius) - border;
  if (!media?.isConnected) return { box, still: box, picture: null, border, radius, strength: 1 };
  const still = media.getBoundingClientRect();
  const style = getComputedStyle(media);
  return { box, still, picture: drawnPicture(media, still, style, poster), border, radius, strength: parseFloat(style.opacity) };
}

/**
 * Brings the tile's still to where its hover transitions are taking it, so it
 * is measured as it will stand. Chrome on phones keeps a tapped tile hovered
 * until the next tap, so the tap on Close has only just begun its fade and
 * shrink back to rest: measured mid-way, the frame would land brighter and
 * larger than the tile it leaves. The jump happens under the backdrop.
 */
function settleTile({ media }: ModalSource) {
  if (!media?.isConnected) return;
  // Read first: a hover change becomes a running transition only once style is computed.
  void getComputedStyle(media).opacity;
  media.getAnimations().forEach((animation) => {
    if (animation instanceof CSSTransition) animation.finish();
  });
}

/**
 * The colour the tile draws its dimmed still over: the nearest background
 * under it within the tile (a thumbnail's dark mount, or the tile's own under
 * a clip or a YouTube still).
 */
function groundOf({ tile, media }: ModalSource) {
  for (let element = media?.parentElement ?? null; element && tile.contains(element); element = element.parentElement) {
    const color = getComputedStyle(element).backgroundColor;
    if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") return color;
  }
  return getComputedStyle(tile).backgroundColor;
}

/** The frame's transform and clip, and its picture layer's opacity. */
type FrameState = { transform: string; clipPath: string; opacity: number };

/** The frame where it stands in the panel: no travel, clipped to its own rounded box, its picture at its own strength. */
const frameHome = (frame: HTMLElement): FrameState => ({
  transform: "translate(0px, 0px) scale(1)",
  clipPath: `inset(0px 0px 0px 0px round ${getComputedStyle(frame).borderTopLeftRadius})`,
  opacity: 1,
});

/**
 * How strong the frame draws its picture on its own: its strongest image or
 * clip (YouTube's poster rests at 0.9), leaving out the tile's still, which
 * stands clear over them until the close.
 */
const pictureStrength = (layer: HTMLElement, tileStill: HTMLElement | null) =>
  Math.max(
    0,
    ...Array.from(layer.querySelectorAll("img, video"), (picture) => (tileStill?.contains(picture) ? 0 : parseFloat(getComputedStyle(picture).opacity)))
  ) || 1;

/**
 * Draws the clip's current frame where the tile shows that rather than its
 * poster (it has played its preview, on hover or keyboard focus, and stands
 * paused on it under the dialog), so the frame goes home on the very frame
 * the tile shows. Left blank, it lets the poster under it show.
 */
function drawClipFrame(media: HTMLElement | null, canvas: HTMLCanvasElement | null) {
  if (!(media instanceof HTMLVideoElement) || !canvas || media.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
  canvas.width = media.videoWidth;
  canvas.height = media.videoHeight;
  try {
    canvas.getContext("2d")?.drawImage(media, 0, 0);
  } catch {
    // A frame the browser won't hand over leaves the canvas blank: the poster shows.
  }
}

/**
 * The frame laid over the tile's still, from its own untransformed box: one
 * scale (so the picture never stretches) that lays the frame's picture over
 * the tile's, a clip to the part of the still the tile shows (inside the
 * tile's border, in the frame's own px so it scales with it), and its picture
 * layer dimmed to the still's strength from `own`, the strength the frame
 * draws its picture with on its own.
 */
function frameOverTile(frame: HTMLElement, { box, still, picture, border, radius, strength }: TileRects, own: number): FrameState | null {
  const home = frame.getBoundingClientRect();
  if (home.width === 0 || home.height === 0) return null;
  // The frame draws the same picture with object-fit: cover inside its border.
  // A picture of unknown aspect is taken as the frame's own, so the frame
  // covers the still's box; one wider or taller than the frame (a contained
  // thumbnail) leaves the frame inside the still's box, where the tile draws
  // the rest of the picture itself.
  const aspect = picture ? picture.width / picture.height : frame.clientWidth / frame.clientHeight;
  const tileWidth = picture?.width ?? Math.max(still.width, still.height * aspect);
  const scale = tileWidth / Math.max(frame.clientWidth, frame.clientHeight * aspect);
  const left = still.left + still.width / 2 - (home.width * scale) / 2;
  const top = still.top + still.height / 2 - (home.height * scale) / 2;
  // What the tile shows of it: the still's box, inside the tile's border.
  const shown = {
    left: Math.max(still.left, box.left + border),
    top: Math.max(still.top, box.top + border),
    right: Math.min(still.right, box.right - border),
    bottom: Math.min(still.bottom, box.bottom - border),
  };
  const inset = [
    shown.top - top,
    left + home.width * scale - shown.right,
    top + home.height * scale - shown.bottom,
    shown.left - left,
  ].map((edge) => `${Math.max(0, edge / scale)}px`);
  // Scaled about its centre (the default origin), so the move is centre to centre.
  const x = still.left + still.width / 2 - (home.left + home.width / 2);
  const y = still.top + still.height / 2 - (home.top + home.height / 2);
  return {
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    clipPath: `inset(${inset.join(" ")} round ${radius / scale}px)`,
    opacity: Math.min(1, strength / own),
  };
}

/** The frame's travel runs on the panel's own curve and duration. */
const FRAME_TRAVEL: KeyframeAnimationOptions = { duration: MODAL_PANEL_S * 1000, easing: cssEase(MODAL_PANEL_EASE) };

/**
 * The close's lead-in: the tile's still comes back over the frame's own
 * picture while the panel's fade does most of its work, and only then does the
 * frame set off home. The modal's own crossfade (reduced motion's, an
 * ease-out), so it reads as a fade over several frames, never a cut.
 */
const STILL_LEAD_IN_MS = (MODAL_REDUCED_MOTION.duration ?? 0.15) * 1000;
const STILL_RETURN: KeyframeAnimationOptions = { duration: STILL_LEAD_IN_MS, easing: "ease-out", fill: "forwards" };

/**
 * Moves the frame from one state to another. Separate animations, so the
 * transform and the picture's strength stay on the compositor even where a
 * clip-path animation can't. The strength fades the picture's own layer, not
 * the frame: the frame stays opaque (its black, or on the way home the tile's
 * own ground), so the tile under it never shows through and brightens it. A
 * delay holds the frame where it starts (fill "both") until the travel sets off.
 */
const travel = (frame: HTMLElement, layer: HTMLElement, from: FrameState, to: FrameState, fill?: FillMode, delay = 0) => [
  frame.animate([{ transform: from.transform }, { transform: to.transform }], { ...FRAME_TRAVEL, fill, delay }),
  frame.animate([{ clipPath: from.clipPath }, { clipPath: to.clipPath }], { ...FRAME_TRAVEL, fill, delay }),
  layer.animate([{ opacity: from.opacity }, { opacity: to.opacity }], { ...FRAME_TRAVEL, fill, delay }),
];

/** A case note's text, with markdown-style `[label](https://…)` links as real links. */
const NOTE_LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
function noteContent(note: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of note.matchAll(NOTE_LINK)) {
    parts.push(note.slice(last, match.index));
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noreferrer"
        className="text-white/85 underline decoration-white/30 underline-offset-[3px] transition-colors duration-200 hover:text-accent hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {match[1]}
      </a>
    );
    last = match.index + match[0].length;
  }
  parts.push(note.slice(last));
  return parts;
}

type Project = {
  name: string;
  details: string;
  github: string;
  url: string;
  gif: string;
  video: string;
  tech_stk: string[];
};

export default function ProjectModal({
  handleClose,
  project,
  startAt = 0,
  source = null,
}: Readonly<{
  handleClose: () => void;
  project: Project;
  /** Where the tile's hover preview of the same clip had got to, in seconds. */
  startAt?: number;
  /** The tile that opened the dialog: the preview frame travels from (and back to) its media. */
  source?: ModalSource | null;
}>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLDivElement>(null);
  const tileStill = useRef<HTMLDivElement>(null);
  const tileGround = useRef<HTMLDivElement>(null);
  const tileStillImage = useRef<HTMLImageElement>(null);
  const tileClipFrame = useRef<HTMLCanvasElement>(null);
  const clip = useRef<HTMLVideoElement>(null);
  const scroller = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [visitHovered, setVisitHovered] = useState(false);
  // The demo clip has a frame of its own to show, so the tile's still can go.
  const [clipHasFrame, setClipHasFrame] = useState(false);
  const reduceMotion = useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();
  // Decided once, as it opens: a tile off-screen when pressed (a keyboard open
  // after scrolling away) or reduced motion fades the frame with the rest instead.
  const [travels] = useState(() => !reduceMotion && source?.onScreen === true);
  // The frame stands in its place (at once when it doesn't travel). Until then
  // it keeps the tile's still, so the picture never changes mid-travel; the
  // demo's own frame takes over only once it has landed, and gives way to the
  // tile's still again before the frame goes back (see close).
  const [landed, setLanded] = useState(!travels);
  // How long the close holds the frame while the tile's still comes back over
  // it (0: it sets off at once, or doesn't travel).
  const [stillLeadIn, setStillLeadIn] = useState(0);
  // The tile drew this clip itself (its preview, or the clip's first frame as
  // its poster), so the clip can carry on from it at once. Any other still
  // holds the clip back, paused under it, until the frame has landed.
  const clipHolds = !landed && !(source?.media instanceof HTMLVideoElement);
  // The panel's surfaces and every part but the preview frame fade on their
  // own, opacity only, so the frame can travel opaque among them.
  const panelMotion = reduceMotion ? MODAL_REDUCED_MOTION : MODAL_PANEL_MOTION;
  const fade: Variants = { hidden: { opacity: 0, transition: panelMotion }, shown: { opacity: 1, transition: panelMotion } };
  const hasProjectDemo = !project.video.includes("EKGJ-pzSEns");
  const notes = project.details.split("|").map((detail) => detail.trim());
  const hasActions = project.url !== "#" || project.github !== "#";
  const stack =
    project.tech_stk.length > 0 ? (
      <section aria-label="Technology stack">
        <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/60">Stack</p>
        <div className="flex flex-wrap gap-2">
          {project.tech_stk.map((tech) => (
            <span key={tech} className="rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-[0.7rem] font-medium text-white/70">
              {tech}
            </span>
          ))}
        </div>
      </section>
    ) : null;

  useEffect(() => {
    const currentDialog = dialog.current;
    if (!currentDialog) return;

    // The tile that opened the dialog, to hand focus back to on close. Firefox
    // focuses a clicked tile's <video> (hidden from assistive tech) rather than
    // the tile, so focus goes back to the tile around it.
    const focused = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    const trigger = focused?.closest<HTMLElement>(".project-tile") ?? focused;
    const scrollPosition = window.scrollY;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollPosition}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    // Released once: on unmount, or as soon as the dialog is closed from
    // outside (browser Back closes it before the page transition snapshots
    // the scroll offset, so the page must be unlocked by then).
    let released = false;
    const releasePage = () => {
      if (released) return;
      released = true;
      root.style.overflow = previousRootOverflow;
      Object.assign(body.style, previousBodyStyles);
      window.scrollTo(0, scrollPosition);
    };

    // A queued close event from an earlier close() (Strict Mode re-runs this
    // effect) arrives after showModal() has reopened the dialog: ignore it.
    const onClose = () => {
      if (!currentDialog.open) releasePage();
    };

    currentDialog.showModal();
    closeButton.current?.focus();
    currentDialog.addEventListener("close", onClose);
    return () => {
      currentDialog.removeEventListener("close", onClose);
      if (currentDialog.open) currentDialog.close();
      releasePage();
      // By now the dialog has left the DOM after its exit animation, so the
      // browser's own focus restore never ran. Only when focus was dropped:
      // a page transition that closed the dialog keeps its own focus.
      const focusDropped = document.activeElement === null || document.activeElement === document.body;
      if (trigger?.isConnected && focusDropped) trigger.focus({ preventScroll: true });
    };
  }, []);

  // Open: the preview frame starts over the tile's still and grows into its
  // place. Measured after showModal() above, whose UA max-height re-centres
  // the panel; a click or key press flushes both before the first paint. Web
  // Animations: the frame is held over the tile until the next frame, then
  // the move runs on the compositor, and they leave no styles behind once
  // they end. A travel cut short by a close never lands.
  useEffect(() => {
    const preview = frame.current;
    const layer = picture.current;
    const tile = travels && source ? measureTile(source) : null;
    const from = preview && layer && tile ? frameOverTile(preview, tile, pictureStrength(layer, tileStill.current)) : null;
    if (!preview || !layer || !from) {
      // Meant to travel but can't (the tile has gone): it stands in its place already.
      if (travels) queueMicrotask(() => setLanded(true));
      return;
    }
    const animations = travel(preview, layer, from, frameHome(preview));
    // Held on the tile until the next frame: WebKit starts the clock at once,
    // and would otherwise lose the travel's quick start behind the mount.
    animations.forEach((animation) => animation.pause());
    const start = requestAnimationFrame(() => animations.forEach((animation) => animation.play()));
    Promise.all(animations.map((animation) => animation.finished)).then(
      () => setLanded(true),
      () => undefined
    );
    return () => {
      cancelAnimationFrame(start);
      animations.forEach((animation) => animation.cancel());
    };
  }, [source, travels]);

  // A clip held under the tile's still starts once the frame has landed:
  // autoplay acts only as the clip first becomes playable, which may have passed.
  useEffect(() => {
    if (landed && !reduceMotion) clip.current?.play().catch(() => undefined);
  }, [landed, reduceMotion]);

  // Asked to close (Close, Escape, a click on the backdrop). A frame that has
  // landed, showing the demo's own picture, and goes back to a tile on screen
  // first holds still for the lead-in while the tile's still comes back over
  // it (see the close effect). Decided here, as the close is asked for: the
  // backdrop's exit is fixed the moment the dialog starts to leave, and must
  // wait as long. A frame caught on its way in still carries the tile's
  // still, so it turns back at once. A dialog closed from outside (browser
  // Back) is already hidden.
  const close = () => {
    const tile = source?.tile;
    const leadsIn =
      travels && landed && tileStill.current !== null && dialog.current?.open === true && tile?.isConnected === true && isOnScreen(tile.getBoundingClientRect());
    setStillLeadIn(leadsIn ? STILL_LEAD_IN_MS : 0);
    handleClose();
  };

  // Close: the frame goes back over the tile, re-measured now, from wherever
  // the open had got to, carrying the tile's still, which first fades back
  // over everything the frame shows (YouTube's frame, the player, the playing
  // clip) during the lead-in (see close). Drawn whole, it lands at the tile's
  // own strength, whatever the frame's own picture rests at or the pointer
  // hovers on the way, over the tile's own ground, which comes in under it as
  // it fades back. A tile now off-screen fades the frame where it is instead.
  // AnimatePresence keeps the dialog until the frame has landed.
  const closing = useRef(false);
  useEffect(() => {
    if (isPresent || closing.current) return;
    closing.current = true;
    const preview = frame.current;
    const layer = picture.current;
    if (!travels || !preview || !layer || !source) {
      safeToRemove?.();
      return;
    }
    let animations: Animation[] = [];
    settleTile(source);
    // The still the frame carries home is the poster a clip that hasn't loaded
    // draws, so its size lays the frame exactly over it.
    const poster = tileStillImage.current;
    const tile = measureTile(source, poster?.naturalWidth ? { width: poster.naturalWidth, height: poster.naturalHeight } : null);
    if (tile && isOnScreen(tile.box)) {
      // Caught mid-open: carry on from the travel's current values.
      const style = getComputedStyle(preview);
      const home = frameHome(preview);
      const from = {
        transform: style.transform === "none" ? home.transform : style.transform,
        clipPath: style.clipPath === "none" ? home.clipPath : style.clipPath,
        opacity: parseFloat(getComputedStyle(layer).opacity),
      };
      // Cancelled first, so the frame's own box is measured untransformed.
      [...preview.getAnimations(), ...layer.getAnimations()].forEach((animation) => animation.cancel());
      const still = tileStill.current;
      const ground = tileGround.current;
      const to = frameOverTile(preview, tile, still ? 1 : pictureStrength(layer, null));
      if (to) {
        const fades: Animation[] = [];
        if (still) {
          drawClipFrame(source.media, tileClipFrame.current);
          fades.push(still.animate([{ opacity: 0 }, { opacity: 1 }], STILL_RETURN));
          // The tile shows its still over its own ground, not black: dimmed to
          // the tile's strength over the frame's black, the picture would land
          // a shade darker than the tile and lift as the dialog goes.
          if (ground) {
            ground.style.backgroundColor = groundOf(source);
            fades.push(ground.animate([{ opacity: 0 }, { opacity: 1 }], STILL_RETURN));
          }
        }
        animations = travel(preview, layer, from, to, "both", stillLeadIn);
        // With a lead-in, held where they start until the close's first frame
        // has been drawn: that frame (the panel starting its fade) can take
        // most of the lead-in, and a clock started before it (WebKit starts it
        // at once, even from that frame's own callback) would spend the fade
        // on it, so the still would jump in rather than fade. Started
        // together, the lead-in and the travel's delay stay in step. A frame
        // caught on its way in already shows the still, and turns back at once.
        if (stillLeadIn > 0) {
          const held = [...fades, ...animations];
          held.forEach((animation) => animation.pause());
          requestAnimationFrame(() => requestAnimationFrame(() => held.forEach((animation) => animation.play())));
        }
      }
    } else {
      animations = [preview.animate([{ opacity: 1 }, { opacity: 0 }], { ...FRAME_TRAVEL, fill: "forwards" })];
    }
    const done = () => safeToRemove?.();
    Promise.all(animations.map((animation) => animation.finished)).then(done, done);
  }, [isPresent, safeToRemove, source, stillLeadIn, travels]);

  return (
    // No opacity on the dialog itself: it would cut the backdrop's blur off
    // from the page behind it (a backdrop root) for the whole fade.
    <dialog
      ref={dialog}
      aria-modal="true"
      aria-labelledby="project-dialog-title"
      className="fixed inset-0 z-modal m-0 flex h-dvh w-full max-w-none items-center justify-center overflow-hidden border-0 bg-transparent p-2 backdrop:bg-transparent sm:p-5"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      {/* The dimmed, blurred page. The native ::backdrop can't fade, so it stays
          transparent (still blocking the page) and this layer fades instead:
          opacity only, never the blur radius. A click on it closes the dialog.
          The close's lead-in (see close) holds its exit back as long, so it
          still clears just after the frame has landed. */}
      <motion.div
        aria-hidden="true"
        className={MODAL_BACKDROP_CLASS}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: reduceMotion
            ? MODAL_REDUCED_MOTION
            : { ...MODAL_BACKDROP_EXIT_MOTION, delay: (MODAL_BACKDROP_EXIT_MOTION.delay ?? 0) + stillLeadIn / 1000 },
        }}
        transition={reduceMotion ? MODAL_REDUCED_MOTION : MODAL_BACKDROP_MOTION}
        onClick={close}
      />
      {/*
        Two layouts from one tree. Wide (>=1200px): a grid with the preview,
        stack and actions in the left column and the title + notes scrolling
        in the right, so the actions sit under the preview, above the fold.
        Narrower: one scrolling column with a sticky close bar on top and the
        actions in a sticky bar at the bottom (no nested scroll box).
      */}
      {/* The panel's box. Its surface (fill, border, shadow) is a layer of its own
          behind the content, so it can fade while the preview frame stays opaque.
          The scroller's own scrollbar is the one part that can't take the fade (a
          classic, always-shown one would stand at full strength throughout), so it
          is clear from the moment the panel starts to fade, in or out, until it
          stands fully faded in, and never while it is closing. */}
      <motion.div
        className="relative h-full w-full max-w-[1480px] sm:h-[min(92dvh,920px)]"
        initial="hidden"
        animate="shown"
        exit="hidden"
        onAnimationStart={() => scroller.current?.style.setProperty("scrollbar-color", "transparent transparent")}
        onAnimationComplete={(definition) => {
          if (definition === "shown" && !closing.current) scroller.current?.style.removeProperty("scrollbar-color");
        }}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[1.5rem] border border-white/10 bg-[#0b0f15] shadow-[0_32px_100px_rgba(0,0,0,0.55)]"
          variants={fade}
        />
        {/* Wide layout: the preview column is as wide as its 16:9 video can be at this
            height (the modal's height less 18.72rem of chrome, plus 5.61rem of side padding),
            capped at the old 1.5fr:0.78fr share, so short screens give the notes the room. */}
        {/* A transparent border keeps the content where the surface's border puts it.
            No sideways scroll: the content is fluid, and the frame's travel (whose
            transformed box runs past the edge for media narrower than 16:9) must
            not add a horizontal scrollbar or let a phone pan the panel. */}
        <section
          ref={scroller}
          className="relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden overscroll-contain rounded-[1.5rem] border border-transparent min-[1200px]:grid min-[1200px]:grid-cols-[min(65.8%,calc((min(92dvh,920px)_-_18.72rem)*16/9_+_5.61rem))_minmax(24rem,1fr)] min-[1200px]:grid-rows-[auto_minmax(0,1fr)_auto_auto] min-[1200px]:overflow-hidden">
          {/* Left column backdrop (wide layout only). */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none hidden bg-[radial-gradient(ellipse_at_18%_0%,rgb(var(--accent)/0.14),transparent_42%),linear-gradient(145deg,#070a0e_0%,#0a1117_100%)] min-[1200px]:block min-[1200px]:[grid-area:1/1/5/2]"
            variants={fade}
          />

          <motion.header
            className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.08] bg-[#0b0f15]/90 px-5 py-3 backdrop-blur-md sm:px-7 sm:py-4 min-[1200px]:static min-[1200px]:bg-[#0b0f15] min-[1200px]:py-5 min-[1200px]:backdrop-blur-none min-[1200px]:[grid-area:1/2/2/3]"
            variants={fade}
          >
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-accent/80">Project case notes</p>
            <AnimateIcon animateOnHover asChild>
            <button
              ref={closeButton}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-2.5 text-white/70 transition-[background-color,border-color,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/20 hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              type="button"
              aria-label="Close project details"
              onClick={close}
            >
              {/* A keyboard hint only where there is a keyboard-and-pointer setup. */}
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-white/60 [@media(hover:none)]:hidden">Esc</span>
              <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.07] text-base">
                <XIcon size={14} />
              </span>
            </button>
            </AnimateIcon>
          </motion.header>

          <div className="relative z-10 p-3 sm:p-6 min-[1200px]:flex min-[1200px]:min-h-0 min-[1200px]:flex-col min-[1200px]:justify-center min-[1200px]:px-9 min-[1200px]:pb-2 min-[1200px]:pt-9 min-[1200px]:[container-type:size] min-[1200px]:[grid-area:1/1/3/2]">
            {/* Narrow layouts' ground under the preview, a fading layer behind it. */}
            <motion.div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#070a0e] min-[1200px]:hidden" variants={fade} />
            {/* Wide layout: as wide as the column allows, but never taller than the space above the stack (16:9 + label + bezel). */}
            <div className="min-[1200px]:w-[min(100cqw,calc((100cqh-3.5rem)*16/9))]">
            <motion.span
              className="mb-4 hidden items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/55 min-[1200px]:inline-flex"
              variants={fade}
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span>Project preview</span>
            </motion.span>
            <div className="relative w-full p-1.5 sm:mx-auto sm:max-w-[40rem] sm:p-2 min-[1200px]:max-w-none">
              {/* The bezel, a fading layer behind the frame. */}
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-[1.5rem] bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] ring-1 ring-white/10"
                variants={fade}
              />
              {/* The tile's media, carried over: it travels in opaque (see the effects
                  above), or fades with the rest when it can't travel. Positioned, so
                  the tile's ground below lies inside its border. */}
              <motion.div
                ref={frame}
                className="relative aspect-video overflow-hidden rounded-[1.1rem] border border-white/[0.07] bg-black"
                variants={travels ? undefined : fade}
              >
                {/* The tile's own ground, under the picture layer: clear (the frame's
                    black) until the close, when it comes in with the tile's still, so
                    the still lands over the ground the tile draws it on (see the close
                    effect). Its colour is the tile's ground, read then. */}
                {travels && source?.poster && <div ref={tileGround} aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0" />}
                {/* The picture's own layer: the travel takes its strength from the
                    tile's still to the frame's own, over the frame's opaque black
                    (on the way home, over the tile's ground). */}
                <div ref={picture} className="relative h-full w-full">
                  {hasProjectDemo ? (
                    <LiteYouTube
                      src={project.video}
                      title={`${project.name} demo`}
                      initialPoster={source?.poster}
                      initialPosterStrength={source?.strength}
                      holdInitialPoster={!landed}
                    />
                  ) : (
                    // Reduced motion: the demo stays paused on its first frame.
                    // Otherwise it carries on from the hover preview instead of restarting.
                    // Until the clip has a frame to show, the tile's still stands in for it.
                    <video
                      ref={clip}
                      className="h-full w-full object-cover"
                      src={`/images/project-assets/${project.gif}`}
                      poster={clipHasFrame && !clipHolds ? undefined : (source?.poster ?? undefined)}
                      onLoadedMetadata={(event) => {
                        if (startAt > 0 && !reduceMotion) event.currentTarget.currentTime = startAt;
                      }}
                      onLoadedData={() => setClipHasFrame(true)}
                      autoPlay={!reduceMotion && !clipHolds}
                      muted
                      loop
                      playsInline
                    />
                  )}
                  {/* The tile's still, over all of the frame's own picture (the player
                      and its play button, the clip), clear until the frame goes home:
                      then it comes back over them and is the one picture the frame
                      carries (see the close effect). A clip the tile has played shows
                      the frame it is paused on, drawn in as it closes, not its poster. */}
                  {travels && source?.poster && (
                    <div ref={tileStill} aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img ref={tileStillImage} src={source.poster} alt="" className="h-full w-full object-cover" />
                      {source.media instanceof HTMLVideoElement && (
                        <canvas ref={tileClipFrame} className="absolute inset-0 h-full w-full object-cover" />
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
            </div>
          </div>

          {stack && (
            <motion.div className="relative z-10 hidden px-9 pt-6 min-[1200px]:block min-[1200px]:[grid-area:3/1/4/2]" variants={fade}>
              {stack}
            </motion.div>
          )}

          <motion.div
            className="px-5 pb-8 pt-6 sm:px-7 sm:pt-8 min-[1200px]:min-h-0 min-[1200px]:overflow-y-auto min-[1200px]:px-8 min-[1200px]:[grid-area:2/2/5/3]"
            variants={fade}
          >
            <h2 id="project-dialog-title" className={`text-balance text-[1.9rem] leading-[1.02] text-white sm:text-[2.2rem] ${spaceBoards.className}`}>
              {project.name}
            </h2>

            {stack && <div className="mt-6 min-[1200px]:hidden">{stack}</div>}

            <section className="mt-7 border-t border-white/[0.08] pt-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/90">Overview</h3>
                <span className="font-mono text-[0.62rem] text-white/55">{String(notes.length).padStart(2, "0")} NOTES</span>
              </div>
              <ol className="space-y-4">
                {notes.map((detail, index) => (
                  <li key={detail} className="grid grid-cols-[2rem_1fr] gap-3">
                    <span className="pt-0.5 font-mono text-[0.65rem] text-accent/70">{String(index + 1).padStart(2, "0")}</span>
                    <p className={`text-sm leading-[1.6] text-white/65 ${tasaOrbiter.className}`}>{noteContent(detail)}</p>
                  </li>
                ))}
              </ol>
            </section>
          </motion.div>

          {hasActions && (
            <motion.footer
              className="sticky bottom-0 z-30 mt-auto flex flex-wrap gap-3 border-t border-white/[0.08] bg-[#0b0f15]/90 px-5 py-3 backdrop-blur-md sm:px-7 min-[1200px]:relative min-[1200px]:z-10 min-[1200px]:mt-0 min-[1200px]:border-0 min-[1200px]:bg-transparent min-[1200px]:px-9 min-[1200px]:pb-9 min-[1200px]:pt-5 min-[1200px]:backdrop-blur-none min-[1200px]:[grid-area:4/1/5/2]"
              variants={fade}
            >
              {project.url !== "#" && (
                <LiquidMetalButton
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setVisitHovered(true)}
                  onMouseLeave={() => setVisitHovered(false)}
                >
                  <span>Visit project</span>
                  <SquareArrowOutUpRightIcon aria-hidden="true" size={16} animate={visitHovered} />
                </LiquidMetalButton>
              )}
              {project.github !== "#" && (
                <PillButton href={project.github} target="_blank" rel="noreferrer">
                  View source
                </PillButton>
              )}
            </motion.footer>
          )}
        </section>
      </motion.div>
    </dialog>
  );
}
