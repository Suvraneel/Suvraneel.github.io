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
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import LiftHeading from "@components/LiftHeading";
import ProjectModal, { type ModalOrigin } from "@components/ProjectModal";
import { ArrowRightIcon } from "@components/animate-ui/icons/arrow-right";
import { layerPathOf, layoutTop, whenPlaced } from "@components/transition/arrival";
import { getTransition, isInFlight } from "@components/transition/transitionStore";
import projectsData from "@data/projectsDat";
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

// Bento rhythm, in gallery order. Rows alternate which side gets the wide card and
// step down in height toward the end; at lg the last six cards move into two
// narrower 3-up rows so the final projects are the smallest. Each row sums to 12
// columns at md and lg. Literal class names keep Tailwind's scanner happy.
const cardLayout = [
  // lg rows: 7/5 · 8/4 · 4/8 · 5/7 · 4/5/3 · 5/3/4
  // md rows: 7/5 · 8/4 · 4/8 · 5/7 · 7/5 · 4/8 · 7/5
  "md:col-span-7 lg:col-span-7",
  "md:col-span-5 lg:col-span-5",
  "md:col-span-8 lg:col-span-8",
  "md:col-span-4 lg:col-span-4",
  "md:col-span-4 lg:col-span-4",
  "md:col-span-8 lg:col-span-8",
  "md:col-span-5 lg:col-span-5",
  "md:col-span-7 lg:col-span-7",
  "md:col-span-7 lg:col-span-4",
  "md:col-span-5 lg:col-span-5",
  "md:col-span-4 lg:col-span-3",
  "md:col-span-8 lg:col-span-5",
  "md:col-span-7 lg:col-span-3",
  "md:col-span-5 lg:col-span-4",
];

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [previewTime, setPreviewTime] = useState(0);
  const [openedFrom, setOpenedFrom] = useState<ModalOrigin | null>(null);
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
  const [playSnap, { stop: stopSnap }] = useSfx("snap", { volume: 0.35 });
  const [playPop] = useSfx("pop", { volume: 0.45 });

  const openProject = (project: Project, time: number, origin: ModalOrigin) => {
    setSelectedProject(project);
    setPreviewTime(time);
    setOpenedFrom(origin);
    playPop();
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
          <div ref={gallery} className="grid grid-cols-1 auto-rows-[15rem] gap-3 sm:auto-rows-[18rem] sm:gap-4 md:grid-cols-12 md:grid-rows-[24rem_20rem_18rem_17rem_16rem_14rem_13rem] lg:grid-rows-[24rem_21rem_19rem_17.5rem_16rem_12.5rem]">
            {projectsData.map((project, index) => (
              // The grid cell carries the scroll reveal and the lift entrance; the card inside keeps its own motion.
              <div
                key={("id" in project && project.id) || project.name}
                data-reveal
                className={`min-h-0 ${cardLayout[index] ?? "md:col-span-6 xl:col-span-4"}`}
              >
                <ProjectTile
                  project={project}
                  reduceMotion={Boolean(reduceMotion)}
                  mountEntrance={!arrivingByTransition}
                  scrollY={scrollY}
                  onOpen={(time, origin) => openProject(project, time, origin)}
                  onHoverStart={playSnap}
                  onHoverEnd={stopSnap}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            key={("id" in selectedProject && selectedProject.id) || selectedProject.name}
            project={selectedProject}
            startAt={previewTime}
            origin={openedFrom}
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
 * motion leave the media where it is.
 */
function useMediaDepth(
  tileRef: RefObject<HTMLElement | null>,
  tilt: { rotateX: MotionValue<number>; rotateY: MotionValue<number> },
  scrollY: MotionValue<number>
) {
  const isPresent = useIsPresent();
  const presentRef = useRef(isPresent);
  const enabled = useRef(false);
  const drift = useMotionValue(0);
  const willChange = useMotionValue("auto");
  const idleTimer = useRef<number | null>(null);

  useLayoutEffect(() => {
    presentRef.current = isPresent;
  }, [isPresent]);

  const measureDrift = useCallback(() => {
    const tile = tileRef.current;
    if (!tile || !presentRef.current) return;
    if (!enabled.current) {
      drift.set(0);
      return;
    }
    const t = getTransition();
    const scroll = isInFlight(t) && t.to === layerPathOf(tile) ? (t.arrivalScrollY ?? window.scrollY) : window.scrollY;
    const viewport = window.innerHeight;
    const progress = (scroll + viewport - layoutTop(tile)) / (viewport + tile.offsetHeight);
    const reach = Math.min(tile.clientHeight * DRIFT_SHARE, DRIFT_MAX_PX);
    drift.set((Math.min(Math.max(progress, 0), 1) * 2 - 1) * reach);
  }, [drift, tileRef]);

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

  // Once the page stands where it will be seen, and again whenever the query flips.
  // After the transforms above: they subscribe to `drift` in their own layout effects.
  useLayoutEffect(() => {
    const tile = tileRef.current;
    if (!tile) return;
    const query = getDepthQuery();
    const sync = () => {
      enabled.current = query.matches;
      measureDrift();
    };
    query.addEventListener("change", sync);
    // A resize that leaves scrollY alone (devtools, window snapping) still moves the tiles.
    window.addEventListener("resize", measureDrift);
    const stopWaiting = whenPlaced(tile, sync);
    return () => {
      stopWaiting();
      query.removeEventListener("change", sync);
      window.removeEventListener("resize", measureDrift);
      // The transforms drop their pending update as they unsubscribe, so a remount
      // (Strict Mode) must measure a change again.
      drift.jump(0);
    };
  }, [drift, measureDrift, tileRef]);

  return {
    front: { x: frontX, y: frontY, willChange },
    back: { x: backX, y: backY, willChange },
  };
}

// Soft edges on the drawn thumbnail itself (its box is the contained image, not
// the tile), so a letterboxed image never meets its blurred copy in a hard line,
// even as it moves.
const THUMBNAIL_EDGE_MASK =
  "linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent), linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)";

function ProjectTile({
  project,
  reduceMotion,
  mountEntrance,
  scrollY,
  onOpen,
  onHoverStart,
  onHoverEnd,
}: {
  project: Project;
  reduceMotion: boolean;
  /** Direct load: the short entrance on mount. A lift brings the cards in itself. */
  mountEntrance: boolean;
  scrollY: MotionValue<number>;
  /** Gets where the hover preview had got to (0 if it never played) and the tile's centre. */
  onOpen: (previewTime: number, origin: ModalOrigin) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const tileRef = useRef<HTMLButtonElement>(null);
  const previewVideo = useRef<HTMLVideoElement>(null);
  const tilt = useCardTilt(reduceMotion);
  const depth = useMediaDepth(tileRef, tilt, scrollY);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const hasDedicatedPreview = project.gif !== "video-to-be-added.webm";
  const youtubeId = getYouTubeId(project.video);
  const hasVideoThumbnail = Boolean(youtubeId && youtubeId !== placeholderDemoId && !thumbnailFailed);
  const thumbnail = "thumbnail" in project ? project.thumbnail : undefined;
  // Plain text here: case-note links ([label](url)) keep only their label on the tile.
  const overview = project.details
    .split("|")[0]
    ?.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1")
    .trim();

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

  // Keyboard focus previews the tile silently; the snap sound is for pointer hover.
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
      className="project-tile group relative h-full min-h-0 w-full overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#10141c] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      initial={reduceMotion || !mountEntrance ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={{ scale: 0.985 }}
      style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformPerspective: tilt.perspective }}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        // An unplayed preview has no src, so its currentTime reads 0.
        onOpen(previewVideo.current?.currentTime ?? 0, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
      }}
      onHoverStart={startPreview}
      onHoverEnd={stopPreview}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      onFocus={startFocusPreview}
      onBlur={stopFocusPreview}
    >
      {thumbnail && !thumbnailFailed ? (
        <div className="relative z-0 h-full w-full overflow-hidden bg-[#060606]">
          {/* Let the thumbnail's colours soften into the tile behind its crisp, uncropped copy. */}
          {/* Own compositing layer: WebKit otherwise re-renders the 40px blur in software on every
              repaint of the page, which cost ~100ms frames as a lift mounted /projects and as it settled. */}
          {/* Depth layers (useMediaDepth): the backdrop sits furthest back, the crisp copy moves at the full rate. */}
          <motion.div className="absolute inset-0" style={depth.back}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl will-change-transform"
              src={thumbnail}
              alt=""
              aria-hidden="true"
            />
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-[#060606]/35" />
          <motion.div className="absolute inset-0 z-10" style={depth.front}>
            {/* Sized and centred like object-contain, so the mask fades the drawn image's own edges. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="absolute inset-0 m-auto max-h-full max-w-full opacity-95 transition duration-500 ease-out group-hover:scale-[1.015] group-hover:opacity-100 motion-reduce:transition-none"
              src={thumbnail}
              alt=""
              onError={() => setThumbnailFailed(true)}
              style={{
                WebkitMaskImage: THUMBNAIL_EDGE_MASK,
                WebkitMaskComposite: "source-in",
                maskImage: THUMBNAIL_EDGE_MASK,
                maskComposite: "intersect",
              }}
            />
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
            poster={`/images/project-assets/${project.gif.replace(/\.webm$/, ".poster.webp")}`}
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
            className="h-full w-full object-cover opacity-80 transition duration-500 ease-out group-hover:scale-[1.035] group-hover:opacity-100 motion-reduce:transition-none"
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#07090d] via-[#07090d]/80 to-transparent px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
        {/* Smaller tiles (see .tile-title-lift in globals.css): the title lifts and one compact row fades in under it. */}
        {/* A span, not a heading: a button may hold only phrasing content. Hidden from
            assistive tech because the button's aria-label already reads "Open <name>". */}
        <span aria-hidden="true" className="tile-title-lift block max-w-[22ch] text-xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-2xl/tight">
          {project.name}
        </span>
        <div aria-hidden="true" className="tile-brief-meta absolute inset-x-5 bottom-5 hidden items-center gap-1.5 sm:inset-x-6 sm:bottom-6">
          {project.tech_stk.slice(0, 3).map((tech) => (
            <span key={tech} className="tile-brief-chip shrink-0 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[0.65rem] font-medium text-white/75">
              {tech}
            </span>
          ))}
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 pl-2 text-xs font-semibold text-white">
            Case notes
            <ArrowRightIcon aria-hidden="true" size={14} className="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </span>
        </div>
      </div>
      {/* A visual preview of the case notes the dialog opens, so assistive tech skips it. */}
      <div aria-hidden="true" className="tile-brief-side pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-[52%] translate-x-4 flex-col border-l border-white/10 bg-[#0a0f16]/90 p-5 opacity-0 backdrop-blur-md transition duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none sm:p-6">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-accent">Project brief</span>
        <span className="mt-3 block text-lg font-semibold leading-tight tracking-[-0.025em] text-white lg:text-xl/tight">{project.name}</span>
        <p className={`mt-3 line-clamp-4 text-sm leading-6 text-white/65 ${tasaOrbiter.className}`}>{overview}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {project.tech_stk.slice(0, 3).map((tech) => (
            <span key={tech} className="rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] font-medium text-white/70">
              {tech}
            </span>
          ))}
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white">
          Open case notes
          <ArrowRightIcon aria-hidden="true" size={14} className="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </span>
      </div>
    </motion.button>
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
