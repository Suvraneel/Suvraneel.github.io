"use client";

import {
  AnimatePresence,
  motion,
  useIsPresent,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import LiftHeading from "@components/LiftHeading";
import ProjectModal, {
  dimmedBy,
  isOnScreen,
  THUMBNAIL_BACKDROP_CLASS,
  THUMBNAIL_EDGE_STYLE,
  THUMBNAIL_MOUNT_CLASS,
  THUMBNAIL_VEIL_CLASS,
  type ModalSource,
} from "@components/ProjectModal";
import { ArrowRightIcon } from "@components/animate-ui/icons/arrow-right";
import { layerPathOf, layoutTop, whenPlaced } from "@components/transition/arrival";
import { getTransition, isInFlight } from "@components/transition/transitionStore";
import projectsData, { type ThumbLoop } from "@data/projectsDat";
import ProjectHero, { type HeroBrand } from "./ProjectHero";
import { useLoopPlayback } from "./useLoopPlayback";
import { spaceBoards, tasaOrbiter } from "@font";
import { useLiftEntrance } from "@hooks/useLiftEntrance";
import { useReveal } from "@hooks/useReveal";
import { useSfx } from "@hooks/useSfx";
import { prefersReducedMotion } from "@lib/pageTransition";

type Project = (typeof projectsData)[number];

const placeholderDemoId = "EKGJ-pzSEns";

function getYouTubeId(url: string) {
  const match = url.match(/embed\/([^?&#/]+)/);
  return match?.[1] ?? null;
}

// Bento, in gallery order, by tier. lg: the four flagships in two tall rows
// (7/5, 8/4), the two featured projects 6/6, then two 6×2 anchors (NFT Haven,
// LSTM) each beside four 3×1 tiles. md: the flagships 7/5 twice, then 6/6 pairs.
// Phones: one column at 16:10, Radlet square and SettleX 6:5 like their posters. Each row sums to 12 columns at md
// and lg. Row heights are in px, not rem (the root is 18px here), so each tile
// keeps the shape its thumbnail was designed for. Literal class names keep
// Tailwind's scanner happy.
const SMALL = "aspect-[16/10] md:aspect-auto md:col-span-6 lg:col-span-3";
/**
 * Phones show the first six as cards (the work since 2022); the rest, from NFT
 * Haven on, wait behind one button as a compact list. The bento on md and up
 * ranks them by size instead, so it shows all.
 */
const FEATURED_ON_PHONES = 6;
const EARLIER_OPEN_KEY = "projects:earlier-open";
const subscribeNever = () => () => undefined;
const readEarlierOpen = () => {
  try {
    return sessionStorage.getItem(EARLIER_OPEN_KEY) === "1";
  } catch {
    // Storage blocked (a private window): the list starts closed.
    return false;
  }
};
const ANCHOR = "aspect-[16/10] md:aspect-auto md:col-span-6 lg:col-span-6 lg:row-span-2";
const cardLayout = [
  "aspect-[16/10] md:aspect-auto md:col-span-7 lg:col-span-7", // Monoma
  "aspect-[6/5] md:aspect-auto md:col-span-5 lg:col-span-5", // SettleX: its poster is 6:5
  "aspect-[16/10] md:aspect-auto md:col-span-7 lg:col-span-8", // Sheetah
  "aspect-square md:aspect-auto md:col-span-5 lg:col-span-4", // Radlet
  "aspect-[16/10] md:aspect-auto md:col-span-6 lg:col-span-6", // StakeOverflow
  "aspect-[16/10] md:aspect-auto md:col-span-6 lg:col-span-6", // GSSoC
  ANCHOR, // NFT Haven
  SMALL,
  SMALL,
  SMALL,
  SMALL,
  SMALL,
  SMALL,
  ANCHOR, // LSTM
  SMALL,
  SMALL,
];

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [previewTime, setPreviewTime] = useState(0);
  const [openedFrom, setOpenedFrom] = useState<ModalSource | null>(null);
  // The dialog is up, open or still leaving: from the press until its exit has
  // finished and it has unlocked the page.
  const [dialogPresent, setDialogPresent] = useState(false);
  const reduceMotion = useReducedMotion();
  const gallery = useRef<HTMLDivElement>(null);
  // The window's scroll, shared by every tile's media drift.
  const { scrollY } = useScroll();
  // A lift ties the arriving cards' entrance to itself (useLiftEntrance); a
  // direct load keeps the cards' short mount entrance.
  const [arrivingByTransition] = useState(() => {
    const t = getTransition();
    return isInFlight(t) && t.to === "/projects";
  });

  useReveal(gallery);
  useLiftEntrance(gallery);
  const [playTick, { stop: stopTick }] = useSfx("tick");
  const [playOpen] = useSfx("open");

  // Phones: the earlier projects wait behind one button (see EarlierProjects).
  // Remembered for the visit, so coming back to the page finds it as it was left.
  // Read through useSyncExternalStore so the server's closed list hydrates first.
  const earlierStored = useSyncExternalStore(subscribeNever, readEarlierOpen, () => false);
  const [earlierOpenedNow, setEarlierOpenedNow] = useState(false);
  const earlierOpen = earlierStored || earlierOpenedNow;
  const openEarlier = () => {
    setEarlierOpenedNow(true);
    try {
      sessionStorage.setItem(EARLIER_OPEN_KEY, "1");
    } catch {
      // Storage blocked: open for now only.
    }
  };

  const openProject = (project: Project, time: number, source: ModalSource) => {
    setSelectedProject(project);
    setPreviewTime(time);
    setOpenedFrom(source);
    setDialogPresent(true);
    playOpen();
  };

  return (
    <main className="nav-gap min-h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#07090d] text-white">
      <div className="mx-auto max-w-[1500px] px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-20 sm:px-10 sm:pb-24 sm:pt-14 lg:px-14 lg:pt-16">
        <header className="max-w-3xl">
          <LiftHeading className={`text-4xl leading-[0.95] tracking-[-0.045em] sm:text-6xl ${spaceBoards.className}`}>
            Projects
          </LiftHeading>
          <p className={`mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg/7 ${tasaOrbiter.className}`}>
            A selection of web products, open-source tools, and experiments across engineering, community, and Web3.
          </p>
        </header>

        <section className="mt-10 sm:mt-14" aria-label="Project gallery">
          <div ref={gallery} className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-12 md:grid-rows-[256px_320px_repeat(6,208px)] lg:grid-rows-[448px_480px_400px_repeat(4,192px)]">
            {projectsData.map((project, index) => (
              // The grid cell carries the scroll reveal and the lift entrance; the card inside keeps its own motion.
              <div
                key={("id" in project && project.id) || project.name}
                data-reveal
                className={`min-h-0 ${cardLayout[index] ?? SMALL} ${index >= FEATURED_ON_PHONES ? "max-md:hidden" : ""}`}
              >
                <ProjectTile
                  project={project}
                  reduceMotion={Boolean(reduceMotion)}
                  mountEntrance={!arrivingByTransition}
                  scrollY={scrollY}
                  holdDepth={dialogPresent}
                  onOpen={(time, source) => openProject(project, time, source)}
                  onHoverStart={playTick}
                  onHoverEnd={stopTick}
                />
              </div>
            ))}
          </div>
          <EarlierProjects
            projects={projectsData.slice(FEATURED_ON_PHONES)}
            open={earlierOpen}
            onOpenList={openEarlier}
            reduceMotion={Boolean(reduceMotion)}
            onOpenProject={(project, source) => openProject(project, 0, source)}
          />
        </section>
      </div>

      <AnimatePresence onExitComplete={() => setDialogPresent(false)}>
        {selectedProject && (
          <ProjectModal
            key={("id" in selectedProject && selectedProject.id) || selectedProject.name}
            project={selectedProject}
            startAt={previewTime}
            source={openedFrom}
            handleClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

const TILT_MAX_DEG = 3;
const TILT_PERSPECTIVE_PX = 1000;
const TILT_SPRING = { stiffness: 220, damping: 24, mass: 0.6 };
const SHEEN_SPRING = { stiffness: 180, damping: 26 };
const FINE_HOVER_QUERY = "(hover: hover) and (pointer: fine)";
// One MediaQueryList per page, not one per pointermove.
let fineHoverQuery: MediaQueryList | null = null;
const hasFineHover = () => (fineHoverQuery ??= window.matchMedia(FINE_HOVER_QUERY)).matches;

/**
 * Fine-pointer hover only: the card tilts toward the pointer (up to 3deg) and
 * a faint light follows it. Springs on transform and opacity; nothing under
 * reduced motion.
 */
function useCardTilt(reduceMotion: boolean) {
  const rotateX = useSpring(0, TILT_SPRING);
  const rotateY = useSpring(0, TILT_SPRING);
  const sheenX = useMotionValue(0);
  const sheenY = useMotionValue(0);
  const sheenOpacity = useSpring(0, SHEEN_SPRING);
  // 0 leaves the perspective out of the transform entirely, so a card at rest
  // (and every card on touch or reduced motion) keeps `transform: none`.
  const perspective = useMotionValue(0);
  const bounds = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  // Drop the perspective once the pointer has left and the tilt has sprung back flat.
  const releaseWhenFlat = () => {
    if (!bounds.current && rotateX.get() === 0 && rotateY.get() === 0) perspective.set(0);
  };
  useMotionValueEvent(rotateX, "animationComplete", releaseWhenFlat);
  useMotionValueEvent(rotateY, "animationComplete", releaseWhenFlat);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== "mouse" || !hasFineHover()) return;
    const card = event.currentTarget;
    // Layout size and the untilted box: the tilt itself never feeds back into the pointer maths.
    if (!bounds.current) {
      const rect = card.getBoundingClientRect();
      bounds.current = {
        left: rect.left + (rect.width - card.offsetWidth) / 2,
        top: rect.top + (rect.height - card.offsetHeight) / 2,
        width: card.offsetWidth,
        height: card.offsetHeight,
      };
      perspective.set(TILT_PERSPECTIVE_PX);
    }
    const { left, top, width, height } = bounds.current;
    const x = Math.min(Math.max(event.clientX - left, 0), width);
    const y = Math.min(Math.max(event.clientY - top, 0), height);
    rotateY.set(((x / width) * 2 - 1) * TILT_MAX_DEG);
    rotateX.set(-((y / height) * 2 - 1) * TILT_MAX_DEG);
    sheenX.set(x);
    sheenY.set(y);
    sheenOpacity.set(1);
  };

  const onPointerLeave = () => {
    bounds.current = null;
    rotateX.set(0);
    rotateY.set(0);
    sheenOpacity.set(0);
    releaseWhenFlat();
  };

  return { rotateX, rotateY, perspective, sheenX, sheenY, sheenOpacity, onPointerMove, onPointerLeave };
}

// Media depth, on desktops with a fine pointer only: the media shifts against the
// tilt and drifts inside its frame as the page scrolls, so it reads as sitting
// behind the tile's glass. The frame, title, chips and brief panel never move.
const DEPTH_QUERY =
  "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
// The room that needs, under the same query: 8px either side for the pointer shift,
// and 6px plus the drift's reach above and below (.project-tile is a size container,
// so 6cqh is 6% of the tile). Contained thumbnails need none: their edges are soft.
const MEDIA_OVERSCAN =
  "[@media(min-width:768px)_and_(hover:hover)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:-inset-x-[8px] [@media(min-width:768px)_and_(hover:hover)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:inset-y-[calc(-6px_-_min(6cqh,24px))]";
/** At full tilt, against it. */
const POINTER_SHIFT_PX = { x: 8, y: 6 };
/** The drift's reach either side of centre: 6% of the tile's height, at most 24px. */
const DRIFT_SHARE = 0.06;
const DRIFT_MAX_PX = 24;
/** A contained thumbnail's blurred backdrop sits further back and moves less. */
const BACKDROP_RATE = { pointer: 0.4, drift: 0.5 };
const WILL_CHANGE_IDLE_MS = 150;
let depthQuery: MediaQueryList | null = null;
const getDepthQuery = () => (depthQuery ??= window.matchMedia(DEPTH_QUERY));

/**
 * The tile's media layers: `front` moves the media, `back` a contained
 * thumbnail's blurred backdrop. The pointer shift comes from the tilt's own
 * springs; the drift runs from -reach as the tile enters at the bottom of the
 * view to +reach as it leaves at the top, measured from layout offsets (no lift
 * or depth transform touches them). A lift's arriving page drifts as it will
 * stand once settled (a framed sheet at its arrival offset); an exiting page
 * keeps its last frame while the window scrolls on underneath it. Transforms
 * only, with will-change just while they move; touch, phones and reduced
 * motion leave the media where it is. The tile's layout is read once it is
 * placed and again only when something could have moved it (a resize, late
 * fonts or images), so a scroll event reads nothing but the scroll offset.
 * `held` (the project dialog is up) keeps the drift where it is until the
 * dialog has gone.
 */
function useMediaDepth(
  tileRef: RefObject<HTMLElement | null>,
  tilt: { rotateX: MotionValue<number>; rotateY: MotionValue<number> },
  scrollY: MotionValue<number>,
  held: boolean
) {
  const isPresent = useIsPresent();
  const presentRef = useRef(isPresent);
  const enabled = useRef(false);
  const drift = useMotionValue(0);
  const willChange = useMotionValue("auto");
  const idleTimer = useRef<number | null>(null);
  // The tile's layout offsets and sizes (no lift or depth transform touches them) and the view's height.
  const layout = useRef<{ top: number; height: number; clientHeight: number; viewport: number } | null>(null);
  // Kept in a layout effect, so it is set before the dialog's own effect locks the page.
  const heldRef = useRef(held);

  useLayoutEffect(() => {
    presentRef.current = isPresent;
  }, [isPresent]);

  useLayoutEffect(() => {
    heldRef.current = held;
  }, [held]);

  const measureLayout = useCallback(() => {
    const tile = tileRef.current;
    if (!tile || !presentRef.current || !enabled.current) return;
    layout.current = {
      top: layoutTop(tile),
      height: tile.offsetHeight,
      clientHeight: tile.clientHeight,
      viewport: window.innerHeight,
    };
  }, [tileRef]);

  const measureDrift = useCallback(() => {
    const tile = tileRef.current;
    if (!tile || !presentRef.current) return;
    if (!enabled.current) {
      drift.set(0);
      return;
    }
    // The project dialog pins the page at scrollY 0 under it: the media holds
    // where it was, so the preview frame lands back on it as the visitor left it.
    if (heldRef.current) return;
    if (!layout.current) measureLayout();
    const box = layout.current;
    if (!box) return;
    const t = getTransition();
    const scroll = isInFlight(t) && t.to === layerPathOf(tile) ? (t.arrivalScrollY ?? window.scrollY) : window.scrollY;
    const progress = (scroll + box.viewport - box.top) / (box.viewport + box.height);
    const reach = Math.min(box.clientHeight * DRIFT_SHARE, DRIFT_MAX_PX);
    drift.set((Math.min(Math.max(progress, 0), 1) * 2 - 1) * reach);
  }, [drift, measureLayout, tileRef]);

  const remeasure = useCallback(() => {
    measureLayout();
    measureDrift();
  }, [measureDrift, measureLayout]);

  const pointerX = (rotateY: number) => (enabled.current ? (-rotateY / TILT_MAX_DEG) * POINTER_SHIFT_PX.x : 0);
  const pointerY = (rotateX: number) => (enabled.current ? (rotateX / TILT_MAX_DEG) * POINTER_SHIFT_PX.y : 0);
  const frontX = useTransform(tilt.rotateY, pointerX);
  const frontY = useTransform([tilt.rotateX, drift], ([rotateX, offset]: number[]) => pointerY(rotateX) + offset);
  const backX = useTransform(tilt.rotateY, (rotateY) => pointerX(rotateY) * BACKDROP_RATE.pointer);
  const backY = useTransform(
    [tilt.rotateX, drift],
    ([rotateX, offset]: number[]) => pointerY(rotateX) * BACKDROP_RATE.pointer + offset * BACKDROP_RATE.drift
  );

  const releaseWhenIdle = useCallback(() => {
    if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      idleTimer.current = null;
      willChange.set("auto");
    }, WILL_CHANGE_IDLE_MS);
  }, [willChange]);
  const markMoving = () => {
    if (willChange.get() !== "transform") willChange.set("transform");
    releaseWhenIdle();
  };
  useMotionValueEvent(frontX, "change", markMoving);
  useMotionValueEvent(frontY, "change", markMoving);
  // A remount (Strict Mode) mid-move still lets go of will-change.
  useEffect(() => {
    if (willChange.get() !== "auto") releaseWhenIdle();
    return () => {
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
      idleTimer.current = null;
    };
  }, [releaseWhenIdle, willChange]);

  useMotionValueEvent(scrollY, "change", measureDrift);

  // Let go once the dialog has gone. Its own cleanup has unlocked the page and
  // restored the scroll by now (a removed component's effects clean up before
  // any effect runs), so this catches up on whatever moved while it held, such
  // as a resize; a tile that was never held measures nothing here.
  const wasHeld = useRef(false);
  useEffect(() => {
    if (held) wasHeld.current = true;
    else if (wasHeld.current) {
      wasHeld.current = false;
      remeasure();
    }
  }, [held, remeasure]);

  // Once the page stands where it will be seen, and again whenever the query flips.
  // After the transforms above: they subscribe to `drift` in their own layout effects.
  useLayoutEffect(() => {
    const tile = tileRef.current;
    if (!tile) return;
    const query = getDepthQuery();
    const sync = () => {
      enabled.current = query.matches;
      remeasure();
    };
    query.addEventListener("change", sync);
    // A resize that leaves scrollY alone (devtools, window snapping) still moves the tiles.
    window.addEventListener("resize", remeasure);
    // So do the tile or its page changing size, and fonts or images that load
    // late and reflow the page above it.
    const resizes = new ResizeObserver(remeasure);
    resizes.observe(tile);
    const page = tile.closest("[data-page]");
    if (page) resizes.observe(page);
    document.fonts.addEventListener("loadingdone", remeasure);
    window.addEventListener("load", remeasure);
    const stopWaiting = whenPlaced(tile, sync);
    return () => {
      stopWaiting();
      query.removeEventListener("change", sync);
      window.removeEventListener("resize", remeasure);
      resizes.disconnect();
      document.fonts.removeEventListener("loadingdone", remeasure);
      window.removeEventListener("load", remeasure);
      // The transforms drop their pending update as they unsubscribe, so a remount
      // (Strict Mode) must measure a change again.
      drift.jump(0);
    };
  }, [drift, remeasure, tileRef]);

  return {
    front: { x: frontX, y: frontY, willChange },
    back: { x: backX, y: backY, willChange },
  };
}

function ProjectTile({
  project,
  reduceMotion,
  mountEntrance,
  scrollY,
  holdDepth,
  onOpen,
  onHoverStart,
  onHoverEnd,
}: {
  project: Project;
  reduceMotion: boolean;
  /** Direct load: the short entrance on mount. A lift brings the cards in itself. */
  mountEntrance: boolean;
  scrollY: MotionValue<number>;
  /** The project dialog is up: the media's drift holds where it is. */
  holdDepth: boolean;
  /** Gets where the hover preview had got to (0 if it never played) and the tile with its still. */
  onOpen: (previewTime: number, source: ModalSource) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const tileRef = useRef<HTMLButtonElement>(null);
  const previewVideo = useRef<HTMLVideoElement>(null);
  const stillImage = useRef<HTMLImageElement>(null);
  const tilt = useCardTilt(reduceMotion);
  const depth = useMediaDepth(tileRef, tilt, scrollY, holdDepth);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const hasDedicatedPreview = project.gif !== "video-to-be-added.webm";
  const youtubeId = getYouTubeId(project.video);
  const hasVideoThumbnail = Boolean(youtubeId && youtubeId !== placeholderDemoId && !thumbnailFailed);
  const thumbnail = "thumbnail" in project ? project.thumbnail : undefined;
  const thumbLoop = "thumbLoop" in project ? project.thumbLoop : undefined;
  const posterText = "posterText" in project ? project.posterText : undefined;
  const logo = "logo" in project ? project.logo : undefined;
  const hero = "hero" in project ? (project.hero as HeroBrand) : undefined;
  const posterTextId = useId();
  const showsThumbnail = Boolean(thumbnail && !thumbnailFailed);
  const videoPoster = `/images/project-assets/${project.gif.replace(/\.webm$/, ".poster.webp")}`;
  const youtubeStill = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  // The still the tile shows, already decoded: the dialog's preview starts on it.
  const still = showsThumbnail ? thumbnail : hasDedicatedPreview ? videoPoster : hasVideoThumbnail ? youtubeStill : undefined;
  // The clips are 5-16 MB each, so a tile fetches its own only on the first hover
  // or keyboard focus, and never on touch screens or under reduced motion.
  const playPreview = () => {
    const video = previewVideo.current;
    // Read live as well: useReducedMotion only captures the setting at mount.
    if (!video || reduceMotion || prefersReducedMotion() || !hasFineHover()) return;
    if (!video.src) video.src = `/images/project-assets/${project.gif}`;
    video.play().catch(() => undefined);
  };

  const startPreview = () => {
    playPreview();
    onHoverStart();
  };

  const stopPreview = () => {
    previewVideo.current?.pause();
    onHoverEnd();
  };

  // Keyboard focus previews the tile silently; the tick is for pointer hover.
  // Pointer focus (a click, or focus handed back by a closed modal) leaves it to hover.
  const startFocusPreview = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.matches(":focus-visible")) playPreview();
  };

  const stopFocusPreview = () => {
    previewVideo.current?.pause();
  };

  return (
    <motion.button
      ref={tileRef}
      type="button"
      aria-haspopup="dialog"
      aria-label={`Open ${project.name}`}
      aria-describedby={posterText && showsThumbnail ? posterTextId : undefined}
      // A designed poster's two-line name sets smaller on short tiles (see globals.css).
      data-long-name={posterText && showsThumbnail && project.name.length > LONG_NAME_CHARS ? "" : undefined}
      className="project-tile group relative h-full min-h-0 w-full overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#10141c] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      initial={reduceMotion || !mountEntrance ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={{ scale: 0.985 }}
      style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformPerspective: tilt.perspective }}
      onClick={(event) => {
        const tile = event.currentTarget;
        const media = hero ? null : hasDedicatedPreview && !showsThumbnail ? previewVideo.current : stillImage.current;
        // An unplayed preview has no src, so its currentTime reads 0.
        onOpen(previewVideo.current?.currentTime ?? 0, {
          tile,
          media,
          poster: still ?? null,
          strength: media ? parseFloat(getComputedStyle(dimmedBy(media)).opacity) : 1,
          // Now, as it is pressed (a click, a key or a tap): before the dialog locks the page.
          // A flagship's composed hero (footage, scrim, brand type) has no still that
          // matches it, so its dialog fades in place rather than growing from the tile.
          onScreen: !hero && isOnScreen(tile.getBoundingClientRect()),
        });
      }}
      onHoverStart={startPreview}
      onHoverEnd={stopPreview}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      onFocus={startFocusPreview}
      onBlur={stopFocusPreview}
    >
      {hero ? (
        <ProjectHero brand={hero} tileRef={tileRef} paused={holdDepth} />
      ) : thumbnail && !thumbnailFailed ? (
        <div className={`relative z-0 h-full w-full overflow-hidden ${THUMBNAIL_MOUNT_CLASS}`}>
          {/* Let the thumbnail's colours soften into the tile behind its crisp, uncropped copy. */}
          {/* Own compositing layer: WebKit otherwise re-renders the 40px blur in software on every
              repaint of the page, which cost ~100ms frames as a lift mounted /projects and as it settled. */}
          {/* Depth layers (useMediaDepth): the backdrop sits furthest back, the crisp copy moves at the full rate. */}
          <motion.div className="absolute inset-0" style={depth.back}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={THUMBNAIL_BACKDROP_CLASS} src={thumbnail} alt="" aria-hidden="true" data-thumbnail-backdrop />
          </motion.div>
          <div className={THUMBNAIL_VEIL_CLASS} />
          <motion.div className="absolute inset-0 z-10" style={depth.front}>
            {thumbLoop ? (
              // A designed thumbnail with footage: the poster and its loop share one
              // contained frame (a size container, so the loop's cqw radius matches
              // the poster's), and it carries the poster's dim and hover scale for both.
              <div
                data-thumb-frame
                className="absolute inset-0 m-auto opacity-95 transition duration-500 ease-out [container-type:inline-size] group-hover:scale-[1.015] group-hover:opacity-100 motion-reduce:transition-none"
                style={{
                  width: `min(100cqw, 100cqh * ${thumbLoop.aspect})`,
                  height: `min(100cqh, 100cqw / (${thumbLoop.aspect}))`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={stillImage}
                  className="block h-full w-full"
                  src={thumbnail}
                  alt=""
                  onError={() => setThumbnailFailed(true)}
                  style={THUMBNAIL_EDGE_STYLE}
                />
                <ThumbLoopVideo loop={thumbLoop} tileRef={tileRef} paused={holdDepth} />
              </div>
            ) : (
              <>
                {/* Sized and centred like object-contain, so the mask fades the drawn image's own edges. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={stillImage}
                  className="absolute inset-0 m-auto max-h-full max-w-full opacity-95 transition duration-500 ease-out group-hover:scale-[1.015] group-hover:opacity-100 motion-reduce:transition-none"
                  src={thumbnail}
                  alt=""
                  onError={() => setThumbnailFailed(true)}
                  style={THUMBNAIL_EDGE_STYLE}
                />
              </>
            )}
          </motion.div>
        </div>
      ) : hasDedicatedPreview ? (
        <motion.div className={`absolute inset-0 ${MEDIA_OVERSCAN}`} style={depth.front}>
          {/* No src until playPreview: preload is only a hint browsers may override.
              The poster is the clip's first frame (what the tile showed when the video
              preloaded), so the tile looks the same at rest, on phones and under reduced motion. */}
          <video
            ref={previewVideo}
            aria-hidden="true"
            poster={videoPoster}
            className="h-full w-full object-cover opacity-75 transition duration-500 ease-out group-hover:scale-[1.035] group-hover:opacity-100 motion-reduce:transition-none"
            preload="none"
            muted
            loop
            playsInline
          />
        </motion.div>
      ) : hasVideoThumbnail ? (
        <motion.div className={`absolute inset-0 ${MEDIA_OVERSCAN}`} style={depth.front}>
          {/* YouTube provides a project-specific still until a real walkthrough is available. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={stillImage}
            className="h-full w-full object-cover opacity-80 transition duration-500 ease-out group-hover:scale-[1.035] group-hover:opacity-100 motion-reduce:transition-none"
            src={youtubeStill}
            alt=""
            onError={() => setThumbnailFailed(true)}
          />
        </motion.div>
      ) : (
        <ProjectArchivePreview project={project} />
      )}
      {/* Soft light that follows the pointer (fine-pointer hover only), above the media and below the title. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-[5] -ml-56 -mt-56 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.09),transparent_62%)]"
        style={{ x: tilt.sheenX, y: tilt.sheenY, opacity: tilt.sheenOpacity }}
      />
      {/* The poster's words as text: its pixels say them, but only this reaches screen readers, search and find-in-page. */}
      {posterText && showsThumbnail && (
        <span id={posterTextId} className="sr-only">
          {posterText}
        </span>
      )}
      <div className="tile-shade pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#07090d] via-[#07090d]/80 to-transparent px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
        {/* Tiles with room under the poster (see .tile-title-lift in globals.css): the title lifts and one compact row fades in under it. */}
        {/* A span, not a heading: a button may hold only phrasing content. Hidden from
            assistive tech because the button's aria-label already reads "Open <name>". */}
        <span aria-hidden="true" className="tile-title-lift flex max-w-[calc(22ch+1.25em)] items-start gap-[0.4em] text-xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-2xl/tight">
          {/* The project's own mark, centred on the name's first line and lifting with it. */}
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="mt-[0.2em] h-[0.85em] w-auto max-w-[2.1em] shrink-0 object-contain" />
          )}
          <span className="min-w-0">{project.name}</span>
        </span>
        <div aria-hidden="true" className="tile-brief-meta absolute inset-x-5 bottom-5 hidden items-center gap-1.5 sm:inset-x-6 sm:bottom-6">
          {/* Up to three chips, on one row: any that won't fit beside "Case notes" wraps out of sight. */}
          <span className="tile-brief-chips flex h-[calc(1.5rem+2px)] min-w-0 flex-wrap gap-1.5 overflow-hidden">
            {project.tech_stk.slice(0, 3).map((tech) => (
              <span key={tech} className="tile-brief-chip shrink-0 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[0.65rem] font-medium leading-4 text-white/75">
                {tech}
              </span>
            ))}
          </span>
          <span className="tile-brief-notes ml-auto inline-flex shrink-0 items-center gap-1.5 pl-2 text-xs font-semibold text-white">
            Case notes
            <ArrowRightIcon aria-hidden="true" size={14} className="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/** Names longer than this wrap to two lines on a short tile. */
const LONG_NAME_CHARS = 24;

/**
 * A designed thumbnail's footage, playing over the spot its poster shows on the
 * first frame, with whatever the poster paints above the footage laid back over
 * it. Plays only while a quarter of the tile is on screen and the dialog is
 * closed; never on phones or under reduced motion or Data Saver, where the
 * poster stands alone. Both layers stay hidden until the first frame plays and go again
 * (back to frame 0) when the dialog opens, so every hand-over is seamless.
 */
function ThumbLoopVideo({
  loop,
  tileRef,
  paused,
}: {
  loop: ThumbLoop;
  tileRef: RefObject<HTMLElement | null>;
  paused: boolean;
}) {
  const { video, overlay: top } = useLoopPlayback(tileRef, paused, true);

  const box = ([left, top, width, height]: ThumbLoop["rect"]) => ({
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
  });

  return (
    <>
      <video
        ref={video}
        aria-hidden="true"
        className="invisible absolute object-cover"
        style={{ ...box(loop.rect), borderRadius: loop.radius, WebkitMaskImage: loop.mask, maskImage: loop.mask }}
        preload="none"
        muted
        loop
        playsInline
        disablePictureInPicture
      >
        <source src={`${loop.src}.webm`} type="video/webm" />
        <source src={`${loop.src}.mp4`} type="video/mp4" />
      </video>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={top} aria-hidden="true" className="pointer-events-none invisible absolute" style={box(loop.topRect)} src={loop.top} alt="" />
    </>
  );
}

/**
 * Phones only: the projects past the first six, behind one button that says
 * how many there are, then as a compact list (thumbnail, name, two stack
 * chips) whose rows open the same dialog. Hidden with display, not removed, so
 * the cards stay in the page for search on every width; md and up show them
 * in the bento instead. Opening moves focus to the first row, since the
 * button it replaces goes.
 */
function EarlierProjects({
  projects,
  open,
  onOpenList,
  reduceMotion,
  onOpenProject,
}: {
  projects: Project[];
  open: boolean;
  onOpenList: () => void;
  reduceMotion: boolean;
  onOpenProject: (project: Project, source: ModalSource) => void;
}) {
  const list = useRef<HTMLUListElement>(null);
  const focusFirst = useRef(false);
  const listId = useId();

  useEffect(() => {
    if (!open || !focusFirst.current) return;
    focusFirst.current = false;
    list.current?.querySelector("button")?.focus({ preventScroll: true });
  }, [open]);

  if (projects.length === 0) return null;
  return (
    <div className="mt-6 md:hidden">
      {!open ? (
        <button
          type="button"
          aria-expanded={false}
          aria-controls={listId}
          onClick={() => {
            focusFirst.current = true;
            onOpenList();
          }}
          className="group flex w-full items-center justify-between rounded-full border border-white/10 bg-white/[0.03] py-2 pl-5 pr-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:scale-[0.98] motion-reduce:transition-none"
        >
          <span className="text-sm font-semibold text-white">
            {projects.length} earlier projects
          </span>
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white">
            <ArrowRightIcon size={16} className="rotate-90" />
          </span>
        </button>
      ) : (
        <>
          <h2 className={`px-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-white/50`}>Earlier projects</h2>
          <ul
            ref={list}
            id={listId}
            className="mt-3 divide-y divide-white/[0.07] overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#10141c] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            {projects.map((project, index) => {
              const thumbnail = "thumbnail" in project ? project.thumbnail : undefined;
              return (
                <motion.li
                  key={("id" in project && project.id) || project.name}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: reduceMotion ? 0 : index * 0.04 }}
                >
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={`Open ${project.name}`}
                    onClick={(event) => {
                      const row = event.currentTarget;
                      const media = row.querySelector("img");
                      // The thumbnail's rounded box is what the frame grows from and lands on.
                      const thumb = row.querySelector<HTMLElement>("[data-row-thumb]") ?? row;
                      onOpenProject(project, {
                        tile: thumb,
                        media,
                        poster: thumbnail ?? null,
                        strength: 1,
                        onScreen: isOnScreen(row.getBoundingClientRect()),
                      });
                    }}
                    className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors duration-200 active:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                  >
                    <span data-row-thumb className="relative h-12 w-[85px] shrink-0 overflow-hidden rounded-lg bg-[#060606]">
                      {thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span aria-hidden="true" className="min-w-0 flex-1">
                      <span className="block truncate text-[0.95rem] font-semibold leading-tight tracking-[-0.02em] text-white">{project.name}</span>
                      <span className="mt-1.5 flex gap-1.5 overflow-hidden">
                        {project.tech_stk.slice(0, 2).map((tech) => (
                          <span key={tech} className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[0.6rem] font-medium leading-4 text-white/70">
                            {tech}
                          </span>
                        ))}
                      </span>
                    </span>
                    <ArrowRightIcon aria-hidden="true" size={16} className="shrink-0 text-white/45" />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

// Decorative stand-in for missing media; the tile's aria-label carries its name.
function ProjectArchivePreview({ project }: { project: Project }) {
  return (
    <div aria-hidden="true" className="relative flex h-full w-full overflow-hidden bg-[#0c1420] p-6 sm:p-8">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgb(var(--accent)/0.09)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--accent)/0.09)_1px,transparent_1px)] [background-size:2rem_2rem]" />
      <div className="relative flex w-full flex-col justify-between border border-accent/20 p-4 sm:p-5">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-accent">Project archive</span>
        <div>
          <span className="block text-4xl font-semibold tracking-[-0.08em] text-white/15">{project.name.slice(0, 2).toUpperCase()}</span>
          <span className="mt-3 block max-w-[18ch] text-sm font-medium leading-6 text-white/75">Interactive walkthrough coming soon.</span>
        </div>
      </div>
    </div>
  );
}
