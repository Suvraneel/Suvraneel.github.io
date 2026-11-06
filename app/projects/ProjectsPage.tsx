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
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import LiftHeading from "@components/LiftHeading";
import ProjectModal, {
  isOnScreen,
  THUMBNAIL_BACKDROP_CLASS,
  THUMBNAIL_EDGE_STYLE,
  THUMBNAIL_MOUNT_CLASS,
  THUMBNAIL_VEIL_CLASS,
  type ModalSource,
  type ProjectModalHandle,
} from "@components/ProjectModal";
import { ArrowRightIcon } from "@components/animate-ui/icons/arrow-right";
import { layerPathOf, layoutTop, whenPlaced, whenSettled } from "@components/transition/arrival";
import { getTransition, isInFlight } from "@components/transition/transitionStore";
import projectsData from "@data/projectsDat";
import { spaceBoards, tasaOrbiter } from "@font";
import { useLiftEntrance } from "@hooks/useLiftEntrance";
import { useReveal } from "@hooks/useReveal";
import { hasFastWebGL2 } from "@lib/gpu";
import { subscribeDeviceTilt } from "@lib/tilt";
import { useSfx } from "@hooks/useSfx";
import { dismissModalDialogs, isDrawerOpen, prefersReducedMotion } from "@lib/pageTransition";
import { siteName } from "@lib/seo";

type Project = (typeof projectsData)[number];

/** What a tile opens the dialog from: where its hover preview had got to (0 if it never played) and the tile with its still. */
type TileOpening = { time: number; source: ModalSource };

// ---------------------------------------------------------------------------
// An open project is a page of its own as far as history goes. On a phone the
// dialog fills the screen and reads as one, so Back (an iPhone's edge swipe)
// is how people try to leave it: opening it pushes a history entry over
// /projects, carrying the project's id in its state and as its #id, and Back
// off that entry closes the dialog and leaves the visitor on the gallery,
// where they were. The #id is also the project's link: /projects#settlex
// opens SettleX. The pushed state spreads the entry it covers, so it keeps
// that entry's scroll key (historyScroll) and Next's own state: Next then
// treats the push as one of its own and leaves the route alone, and the page
// transitions see the same path and start nothing.
// ---------------------------------------------------------------------------

const PROJECTS_PATH = "/projects";
const PROJECT_STATE_KEY = "project";

/** The project id a history entry's state carries, if it is a project's entry. */
const projectIdOf = (state: unknown) => {
  const id = typeof state === "object" && state !== null ? (state as Record<string, unknown>)[PROJECT_STATE_KEY] : null;
  return typeof id === "string" ? id : null;
};

const projectById = (id: string | null) => (id ? (projectsData.find((project) => project.id === id) ?? null) : null);

/** The project a link's #id names; any case, so #crews finds CrewS. */
const projectNamed = (hash: string) => {
  let id: string;
  try {
    id = decodeURIComponent(hash.replace(/^#/, "")).toLowerCase();
  } catch {
    return null;
  }
  return id ? (projectsData.find((project) => project.id.toLowerCase() === id) ?? null) : null;
};

/** A history state with the project's id taken out, everything else (Next's state, the scroll key) kept. */
const withoutProject = (state: unknown) => {
  const rest: Record<string, unknown> = typeof state === "object" && state !== null ? { ...state } : {};
  delete rest[PROJECT_STATE_KEY];
  return rest;
};

/** Gives an open project its history entry and #id link. */
const pushProjectEntry = (project: Project) => {
  window.history.pushState({ ...window.history.state, [PROJECT_STATE_KEY]: project.id }, "", `#${project.id}`);
};

/**
 * A link's dialog waits this long at most for its tile's still to decode, so
 * the preview frame sets off from the picture rather than from black. Only a
 * direct load can find it still loading.
 */
const STILL_WAIT_MS = 1200;

/** Resolves once the tile's still has decoded (or failed to), or after STILL_WAIT_MS. */
function stillDecoded({ media, poster }: ModalSource) {
  let decoding: Promise<void>;
  if (media instanceof HTMLImageElement) decoding = media.decode();
  else if (poster) {
    const image = new Image();
    image.src = poster;
    decoding = image.decode();
  } else return Promise.resolve();
  return Promise.race([decoding.catch(() => undefined), new Promise<void>((resolve) => window.setTimeout(resolve, STILL_WAIT_MS))]);
}

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
  const [openedFrom, setOpenedFrom] = useState<ModalSource | null>(null);
  // Where the dialog hands focus back on close, for a dialog the page opened itself (see showProject).
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null);
  // Counts the opens, so each mounts a dialog of its own. A project opened
  // again as its last dialog finishes leaving (a press or a step queued behind
  // it, see onDialogGone) would otherwise come back under the same key, and
  // AnimatePresence would keep that dialog, already closed and hidden, rather
  // than mount a new one.
  const [opens, setOpens] = useState(0);
  // The dialog is up, open or still leaving: from the press until its exit has
  // finished and it has unlocked the page.
  const [dialogPresent, setDialogPresent] = useState(false);
  // The same two, current between renders, for the history handlers below.
  const selected = useRef<Project | null>(null);
  const present = useRef(false);
  const modal = useRef<ProjectModalHandle>(null);
  // Each tile, by project id: what it would open the dialog from, measured now.
  const tiles = useRef(new Map<string, () => TileOpening | null>());
  // Close has stepped back off the project's entry and that step hasn't landed yet.
  const backPending = useRef(false);
  // A step onto a project's entry (showWhenGone), or a tile pressed (openProject), while a dialog is still up or leaving: it opens once that one has gone.
  const queuedOpen = useRef<Project | null>(null);
  // A tile pressed while a lift is still bringing the page in: the wait for it to land (openProject), to give up on.
  const landingPress = useRef<(() => void) | null>(null);
  // The state of the last entry of this page seen (Next's state and the scroll key in it), for an entry that comes without one.
  const lastState = useRef<unknown>(null);
  const reduceMotion = useReducedMotion();
  // False once the page is leaving: the copy a page transition keeps on screen
  // as it goes leaves history to the page that replaces it.
  const isPresent = useIsPresent();
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

  // The dialog's "Visit project" rim asks hasFastWebGL2() as it mounts, and
  // the first ask creates a WebGL 2 context to read the renderer: some 25 ms
  // on a phone, inside the tap that opens the first project. Asked once the
  // page has settled and gone idle instead, the answer (kept for the page's
  // life) is ready by then; not during a lift, which a long task would cost
  // frames. Reduced motion never runs the shader, so it never asks. A page a
  // newer transition is already taking away again never asks either.
  useEffect(() => {
    const container = gallery.current;
    if (prefersReducedMotion() || !container) return;
    let cancel = () => {};
    const stop = whenSettled(container, () => {
      const warm = () => void hasFastWebGL2();
      if ("requestIdleCallback" in window) {
        const idle = window.requestIdleCallback(warm, { timeout: 2000 });
        cancel = () => window.cancelIdleCallback(idle);
        return;
      }
      // Safari has no idle callback: after the next frame rather than inside it.
      let timer = 0;
      const frame = requestAnimationFrame(() => {
        timer = window.setTimeout(warm, 0);
      });
      cancel = () => {
        cancelAnimationFrame(frame);
        window.clearTimeout(timer);
      };
    });
    return () => {
      stop();
      cancel();
    };
  }, []);

  const registerTile = useCallback((id: string, describe: () => TileOpening | null) => {
    tiles.current.set(id, describe);
    return () => {
      if (tiles.current.get(id) === describe) tiles.current.delete(id);
    };
  }, []);

  // `returnTo`: a dialog the page opens itself (a link, a reload, a history
  // step, a #id followed in) was invoked by nothing on the page, so it names
  // the tile for the dialog to hand focus back to on close, where the visitor
  // is left; focus as it opens is only on the page, on the <main> a page
  // transition focuses, or wherever an earlier close left it. A tile's own
  // press names none: the dialog goes back to what had focus (the tile).
  const showProject = (project: Project, time: number, source: ModalSource | null, returnTo: HTMLElement | null = null) => {
    selected.current = project;
    present.current = true;
    setSelectedProject(project);
    setPreviewTime(time);
    setOpenedFrom(source);
    setReturnFocus(returnTo);
    setDialogPresent(true);
    setOpens((count) => count + 1);
  };

  // A tap, a click or a key on a tile. A dialog closed from outside (a back
  // swipe the browser animated itself) is hidden at once and has let the page
  // go, but it is still mounted for its exit: a tile pressed meanwhile opens
  // once that one has gone (onDialogGone), from the tile as it stands then, so
  // two never overlap. Its entry goes on now, so the address already names
  // it; a second press before it opens takes the first one's place, entry and
  // all.
  //
  // A lift still bringing the page in takes presses too (the arriving sheet
  // is live as it moves). Opened then, the dialog locked the page at the top,
  // where the sheet is framed in flight, rather than at the offset it lands
  // at, so closing it left the visitor at the top of the gallery, its frame
  // flying home to a tile now off screen. The press opens once the lift has
  // landed (whenSettled) instead, from the tile as it stands then, handing
  // focus back to it (the landing may have focused the page's <main>). Its
  // entry waits too, so a Back before then still goes back the way the lift
  // came. A later press takes its place; with the drawer opened meanwhile, or
  // the page leaving again, it never opens.
  const openProject = (project: Project, time: number, source: ModalSource, returnTo: HTMLElement | null = null) => {
    landingPress.current?.();
    landingPress.current = null;
    if (present.current) {
      const queued = queuedOpen.current;
      queuedOpen.current = project;
      const top = projectIdOf(window.history.state);
      if (backPending.current || top === project.id) return;
      if (queued && top === queued.id) window.history.replaceState({ ...window.history.state, [PROJECT_STATE_KEY]: project.id }, "", `#${project.id}`);
      else pushProjectEntry(project);
      return;
    }
    const container = gallery.current;
    const t = getTransition();
    if (container && isInFlight(t) && t.to === layerPathOf(container)) {
      landingPress.current = whenSettled(container, () => {
        landingPress.current = null;
        const opening = tiles.current.get(project.id)?.();
        if (opening && !present.current && !isDrawerOpen()) openProject(project, opening.time, opening.source, opening.source.tile);
      });
      return;
    }
    showProject(project, time, source, returnTo);
    playOpen();
    // Not while Close's step back off the last project's entry is still on
    // its way: that step would take this entry off again. The popstate it
    // lands with pushes it instead.
    if (!backPending.current && projectIdOf(window.history.state) !== project.id) pushProjectEntry(project);
  };

  // Close, Escape, the backdrop, or a history step that has already left the
  // entry. With the project's own entry still on top (the first three), step
  // back off it, so the next Back leaves Projects as it would have before the
  // dialog opened, and Forward opens the project again. Once, however many
  // closes are asked for on the way out. A Back, a page left through history,
  // or a step onto another project's entry (a #id followed in, Back or
  // Forward onto one) has already moved off it: nothing to undo.
  const closeProject = () => {
    const closing = selected.current;
    selected.current = null;
    setSelectedProject(null);
    if (backPending.current || window.location.pathname !== PROJECTS_PATH || !closing || projectIdOf(window.history.state) !== closing.id) return;
    backPending.current = true;
    window.history.back();
  };

  // A history step has already left the open dialog's entry: it goes, and
  // closeProject finds nothing to step back off. An iPhone's edge swipe (or
  // any back gesture the browser animated itself) has already shown the
  // gallery coming back: the dialog goes at once, as it does when such a
  // swipe leaves the page. Otherwise it closes as Close would, its frame
  // going home to the tile.
  const dismissProject = (event: PopStateEvent) => {
    if ((event as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition) dismissModalDialogs();
    else if (modal.current) modal.current.close();
    else closeProject();
  };

  // A step onto a project's entry (or a #id followed in) while a dialog is
  // up: the project opens once that dialog has gone (onDialogGone), so two
  // never overlap. One still open is another project's, on an entry history
  // has just left: it closes now, so the dialog on screen is always the one
  // the address names, and Back always closes what is shown.
  const showWhenGone = (project: Project, event: PopStateEvent) => {
    queuedOpen.current = project;
    if (selected.current) dismissProject(event);
  };

  // Forward onto a project's entry: it opens again, from its tile if that is
  // on screen (where Back left it), else in place.
  const reopenProject = (project: Project) => {
    const opening = tiles.current.get(project.id)?.() ?? null;
    showProject(project, opening?.time ?? 0, opening?.source ?? null, opening?.source.tile ?? null);
    playOpen();
  };

  // A link to a project (/projects#settlex), a reload of one, or a history
  // step back onto one from another page (a page still leaving that is
  // brought back included): it opens once the page has landed. A tile
  // off-screen is brought to the middle of the view first, so the dialog
  // grows from it and closes back into it (there the visitor stays, by the
  // project they came for). A link from elsewhere also puts the bare
  // /projects under the project's entry, so Back (or Close) lands on the
  // gallery rather than leaving the site; a reload or a step back onto the
  // project's own entry already has it. `isCancelled` is asked before any of
  // that and again once the still has decoded.
  const openLinkedProject = useEffectEvent(async (project: Project, isCancelled: () => boolean) => {
    const describe = tiles.current.get(project.id);
    const first = describe?.();
    if (!describe || !first || present.current || isCancelled()) return;
    if (!first.source.onScreen) first.source.tile.scrollIntoView({ block: "center", behavior: "instant" });
    await stillDecoded(first.source);
    const opening = describe();
    if (isCancelled() || present.current || !opening) return;
    const ownEntry = projectIdOf(window.history.state) === project.id;
    if (!ownEntry) {
      window.history.replaceState(withoutProject(window.history.state), "", window.location.pathname + window.location.search);
      pushProjectEntry(project);
    }
    showProject(project, opening.time, opening.source, opening.source.tile);
  });

  // Back and Forward between /projects and a project's entry (the page
  // transitions see the same path and do nothing). Leaving for another page
  // is theirs: they close the dialog on the way (dismissModalDialogs), and
  // closeProject then finds the entry already left.
  const onHistoryStep = useEffectEvent((event: PopStateEvent) => {
    const ownStep = backPending.current;
    backPending.current = false;
    if (!isPresent || window.location.pathname !== PROJECTS_PATH) return;
    const open = selected.current;
    const project = projectById(projectIdOf(window.history.state));
    if (ownStep) {
      // Close's step back landed. A project opened in the meantime gets its entry now.
      if (open) {
        if (open.id !== project?.id) pushProjectEntry(open);
      } else if (project) {
        // It landed on another project's entry: one a #id followed in while
        // a dialog was open left underneath. Close goes on back to the
        // gallery, so the address never names a project that isn't open, and
        // Forward still opens them again in turn.
        backPending.current = true;
        window.history.back();
      }
      return;
    }
    if (window.history.state !== null) lastState.current = window.history.state;
    // A #id followed within the page (an edited address, an in-page link):
    // the browser has added an entry with no state at all, so it is made the
    // project's own entry here, with the state of the entry it was followed
    // from, and opens as a link does.
    const followed = window.history.state === null ? projectNamed(window.location.hash) : null;
    if (followed && lastState.current !== null) {
      window.history.replaceState({ ...withoutProject(lastState.current), [PROJECT_STATE_KEY]: followed.id }, "", `#${followed.id}`);
      if (open?.id === followed.id) return;
      if (present.current) showWhenGone(followed, event);
      else void openLinkedProject(followed, () => projectIdOf(window.history.state) !== followed.id);
      return;
    }
    if (!project) {
      queuedOpen.current = null;
      if (open) dismissProject(event);
      return;
    }
    if (open?.id === project.id) return;
    if (present.current) showWhenGone(project, event);
    else reopenProject(project);
  });

  useEffect(() => {
    const listener = (event: PopStateEvent) => onHistoryStep(event);
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }, []);

  // A press still waiting for a lift to land goes with the page.
  useEffect(() => () => landingPress.current?.(), []);

  useEffect(() => {
    if (isPresent && window.history.state !== null) lastState.current = window.history.state;
    const project = isPresent ? projectNamed(window.location.hash) : null;
    const container = gallery.current;
    if (!project || !container) return;
    let cancelled = false;
    // Also given up once history has moved off the project's entry: a Back
    // pressed while a lift is still bringing the page in lands on the bare
    // /projects before this runs, and opening then would put the entry back
    // and undo that Back.
    const stop = whenSettled(container, () => void openLinkedProject(project, () => cancelled || projectNamed(window.location.hash)?.id !== project.id));
    return () => {
      cancelled = true;
      stop();
    };
  }, [isPresent]);

  // The dialog's leave has finished. A step or a press that came while it was
  // up or leaving opens its project now, a frame on, once this one is gone.
  // The page is live while it waits, so the visitor may have asked for
  // something else since. The navigation drawer opened meanwhile was asked
  // for last: it stays on top and alone, and the project's entry, put on for
  // it, is stepped back off, so the address never names a project that isn't
  // open. A page transition under way is taking the page away (a link
  // followed meanwhile): nothing opens over it, and history has moved on, or
  // is about to, with the transition.
  const onDialogGone = () => {
    present.current = false;
    setDialogPresent(false);
    const queued = queuedOpen.current;
    queuedOpen.current = null;
    if (!queued) return;
    window.requestAnimationFrame(() => {
      if (present.current || projectIdOf(window.history.state) !== queued.id || isInFlight(getTransition())) return;
      if (!isDrawerOpen()) {
        reopenProject(queued);
        return;
      }
      if (backPending.current) return;
      backPending.current = true;
      window.history.back();
    });
  };

  // While a project is open the tab (and the history menu's entry) names it.
  // Next puts the page's own <title> back once after hydration (a new
  // element), which a link's dialog opens before: whatever the page's title
  // becomes while the project is open is the one to put back, and the
  // project's goes on top again. Put back on close only if it is still the
  // project's: a page left with the dialog open has its own title by then.
  useEffect(() => {
    if (!selectedProject) return;
    const title = `${selectedProject.name} | Projects | ${siteName}`;
    let previous = document.title;
    document.title = title;
    const keep = new MutationObserver(() => {
      if (!document.title || document.title === title) return;
      previous = document.title;
      document.title = title;
    });
    keep.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      keep.disconnect();
      if (document.title === title) document.title = previous;
    };
  }, [selectedProject]);

  return (
    <main className="nav-gap min-h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#07090d] text-white">
      <div className="mx-auto max-w-[1500px] px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-20 sm:px-10 sm:pb-24 sm:pt-14 lg:px-14 lg:pt-16">
        <header className="max-w-3xl">
          <LiftHeading className={`text-display leading-[0.95] tracking-[-0.045em] ${spaceBoards.className}`}>
            Projects
          </LiftHeading>
          <p className={`mt-5 max-w-xl text-body leading-[1.6] text-white/65 ${tasaOrbiter.className}`}>
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
                  eager={index < 2}
                  reduceMotion={Boolean(reduceMotion)}
                  mountEntrance={!arrivingByTransition}
                  scrollY={scrollY}
                  holdDepth={dialogPresent}
                  register={registerTile}
                  onOpen={(time, source) => openProject(project, time, source)}
                  onHoverStart={playTick}
                  onHoverEnd={stopTick}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence onExitComplete={onDialogGone}>
        {selectedProject && (
          <ProjectModal
            ref={modal}
            key={`${("id" in selectedProject && selectedProject.id) || selectedProject.name}:${opens}`}
            project={selectedProject}
            startAt={previewTime}
            source={openedFrom}
            returnFocus={returnFocus}
            handleClose={closeProject}
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

/** Touch screens: the device's tilt turns the cards on screen as a pointer would (lib/tilt.ts). */
const TOUCH_TILT_QUERY = "(hover: none) and (pointer: coarse) and (prefers-reduced-motion: no-preference)";
/** The light under a phone's tilt: dimmer than a pointer's, as nothing is pointing at it. */
const TOUCH_SHEEN_OPACITY = 0.75;
/** Tilt change a card answers (0.12deg of its 3deg): finer, a phone merely held would keep its springs running. */
const TOUCH_TILT_STEP = 0.04;

/**
 * Fine-pointer hover: the card tilts toward the pointer (up to 3deg) and a
 * faint light follows it. On touch screens the device's tilt does the same for
 * the cards in view. Springs on transform and opacity; nothing under reduced motion.
 * `held` (the project dialog is up) freezes a phone's tilt where it is: the
 * cards stay put under the dialog's blur (which would otherwise repaint with
 * every turn), and the closing dialog lands back on the tile as it left it.
 */
function useCardTilt(reduceMotion: boolean, tileRef: RefObject<HTMLElement | null>, held: boolean) {
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

  // Kept in a layout effect, as useMediaDepth's: set before the dialog's own effects run.
  const heldRef = useRef(held);
  // Catches up on whether the card is in view, once the dialog has gone.
  const syncTouchTilt = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    heldRef.current = held;
    if (!held) syncTouchTilt.current?.();
  }, [held]);

  // Touch: only while the card is on screen, so off-screen cards keep `transform: none`.
  useEffect(() => {
    const tile = tileRef.current;
    const query = window.matchMedia(TOUCH_TILT_QUERY);
    if (!tile || reduceMotion || !query.matches) return;
    let stop: (() => void) | null = null;
    let visible = false;
    const settle = () => {
      stop?.();
      stop = null;
      rotateX.set(0);
      rotateY.set(0);
      sheenOpacity.set(0);
      if (rotateX.get() === 0 && rotateY.get() === 0) perspective.set(0);
    };
    // Under the dialog the page is pinned and cards scroll out of view: they hold until it has gone.
    const sync = () => {
      if (heldRef.current) return;
      if (!visible) return settle();
      if (stop) return;
      stop = subscribeDeviceTilt(({ x, y }) => {
        if (bounds.current || heldRef.current) return;
        const width = tile.offsetWidth;
        const height = tile.offsetHeight;
        perspective.set(TILT_PERSPECTIVE_PX);
        rotateY.set(x * TILT_MAX_DEG);
        rotateX.set(-y * TILT_MAX_DEG);
        sheenX.set(((x + 1) / 2) * width);
        sheenY.set(((y + 1) / 2) * height);
        sheenOpacity.set(Math.min(1, Math.hypot(x, y) * 1.6) * TOUCH_SHEEN_OPACITY);
      }, TOUCH_TILT_STEP);
    };
    syncTouchTilt.current = sync;
    const viewer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    viewer.observe(tile);
    return () => {
      syncTouchTilt.current = null;
      viewer.disconnect();
      settle();
    };
  }, [reduceMotion, tileRef, perspective, rotateX, rotateY, sheenX, sheenY, sheenOpacity]);

  return { rotateX, rotateY, perspective, sheenX, sheenY, sheenOpacity, onPointerMove, onPointerLeave };
}

// Media depth: the media shifts against the tilt (a fine pointer's, or a phone's)
// and drifts inside its frame as the page scrolls, so it reads as sitting behind
// the tile's glass. The frame, title, chips and brief panel never move.
const DEPTH_QUERY = "(prefers-reduced-motion: no-preference)";
// The room that needs, under the same query: 8px either side for the tilt shift,
// and 6px plus the drift's reach above and below (.project-tile is a size container,
// so 6cqh is 6% of the tile). Contained thumbnails need none: their edges are soft.
const MEDIA_OVERSCAN =
  "motion-safe:-inset-x-[8px] motion-safe:inset-y-[calc(-6px_-_min(6cqh,24px))]";
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
 * only, with will-change just while they move; reduced motion leaves the media
 * where it is. The tile's layout is read once it is
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
  eager,
  reduceMotion,
  mountEntrance,
  scrollY,
  holdDepth,
  register,
  onOpen,
  onHoverStart,
  onHoverEnd,
}: {
  project: Project;
  /**
   * One of the first two tiles, in view on every layout as the page opens (the
   * first is its LCP): its pictures load at once. The rest wait until they near
   * the view, and decode off the main thread. Video posters can't wait: a
   * <video> fetches its poster at once.
   */
  eager: boolean;
  reduceMotion: boolean;
  /** Direct load: the short entrance on mount. A lift brings the cards in itself. */
  mountEntrance: boolean;
  scrollY: MotionValue<number>;
  /** The project dialog is up: the media's drift holds where it is. */
  holdDepth: boolean;
  /** Lets the page open the dialog from this tile itself (a project's link, Forward); returns the cleanup. */
  register: (id: string, describe: () => TileOpening | null) => () => void;
  /** Gets where the hover preview had got to (0 if it never played) and the tile with its still. */
  onOpen: (previewTime: number, source: ModalSource) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const tileRef = useRef<HTMLButtonElement>(null);
  const previewVideo = useRef<HTMLVideoElement>(null);
  const stillImage = useRef<HTMLImageElement>(null);
  const tilt = useCardTilt(reduceMotion, tileRef, holdDepth);
  const depth = useMediaDepth(tileRef, tilt, scrollY, holdDepth);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const hasDedicatedPreview = project.gif !== "video-to-be-added.webm";
  const youtubeId = getYouTubeId(project.video);
  const hasVideoThumbnail = Boolean(youtubeId && youtubeId !== placeholderDemoId && !thumbnailFailed);
  const thumbnail = "thumbnail" in project ? project.thumbnail : undefined;
  const showsThumbnail = Boolean(thumbnail && !thumbnailFailed);
  const videoPoster = `/images/project-assets/${project.gif.replace(/\.webm$/, ".poster.webp")}`;
  const youtubeStill = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  // The still the tile shows, already decoded: the dialog's preview starts on it.
  const still = showsThumbnail ? thumbnail : hasDedicatedPreview ? videoPoster : hasVideoThumbnail ? youtubeStill : undefined;
  const lazy = eager ? {} : ({ loading: "lazy", decoding: "async" } as const);
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

  // Keyboard focus previews the tile silently; the tick is for pointer hover.
  // Pointer focus (a click, or focus handed back by a closed modal) leaves it to hover.
  const startFocusPreview = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.matches(":focus-visible")) playPreview();
  };

  const stopFocusPreview = () => {
    previewVideo.current?.pause();
  };

  // The tile and its still as they stand now, for the dialog's preview frame to start from.
  const describe = (): TileOpening | null => {
    const tile = tileRef.current;
    if (!tile) return null;
    const media = hasDedicatedPreview && !showsThumbnail ? previewVideo.current : stillImage.current;
    return {
      // An unplayed preview has no src, so its currentTime reads 0.
      time: previewVideo.current?.currentTime ?? 0,
      source: {
        tile,
        media,
        poster: still ?? null,
        strength: media ? parseFloat(getComputedStyle(media).opacity) : 1,
        onScreen: isOnScreen(tile.getBoundingClientRect()),
      },
    };
  };
  // Every commit, so the page always asks with what the tile shows now.
  useLayoutEffect(() => register(project.id, describe));

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
      onClick={() => {
        // Now, as it is pressed (a click, a key or a tap): before the dialog locks the page.
        const opening = describe();
        if (opening) onOpen(opening.time, opening.source);
      }}
      onHoverStart={startPreview}
      onHoverEnd={stopPreview}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      onFocus={startFocusPreview}
      onBlur={stopFocusPreview}
    >
      {thumbnail && !thumbnailFailed ? (
        <div className={`relative z-0 h-full w-full overflow-hidden ${THUMBNAIL_MOUNT_CLASS}`}>
          {/* Let the thumbnail's colours soften into the tile behind its crisp, uncropped copy. */}
          {/* Own compositing layer: WebKit otherwise re-renders the 40px blur in software on every
              repaint of the page, which cost ~100ms frames as a lift mounted /projects and as it settled. */}
          {/* Depth layers (useMediaDepth): the backdrop sits furthest back, the crisp copy moves at the full rate. */}
          <motion.div className="absolute inset-0" style={depth.back}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={THUMBNAIL_BACKDROP_CLASS} src={thumbnail} alt="" aria-hidden="true" data-thumbnail-backdrop {...lazy} />
          </motion.div>
          <div className={THUMBNAIL_VEIL_CLASS} />
          <motion.div className="absolute inset-0 z-10" style={depth.front}>
            {/* Sized and centred like object-contain, so the mask fades the drawn image's own edges. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={stillImage}
              className="absolute inset-0 m-auto max-h-full max-w-full opacity-95 transition duration-500 ease-out group-hover:scale-[1.015] group-hover:opacity-100 motion-reduce:transition-none"
              src={thumbnail}
              alt=""
              {...lazy}
              onError={() => setThumbnailFailed(true)}
              style={THUMBNAIL_EDGE_STYLE}
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
            {...lazy}
            onError={() => setThumbnailFailed(true)}
          />
        </motion.div>
      ) : (
        <ProjectArchivePreview project={project} />
      )}
      {/* Soft light that follows the pointer (fine-pointer hover) or a phone's tilt, above the media and below the title. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-[5] -ml-56 -mt-56 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.09),transparent_62%)]"
        style={{ x: tilt.sheenX, y: tilt.sheenY, opacity: tilt.sheenOpacity }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#07090d] via-[#07090d]/80 to-transparent px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
        {/* Smaller tiles (see .tile-title-lift in globals.css): the title lifts and one compact row fades in under it. */}
        {/* A span, not a heading: a button may hold only phrasing content. Hidden from
            assistive tech because the button's aria-label already reads "Open <name>". */}
        <span aria-hidden="true" className="tile-title-lift block max-w-[22ch] text-lead font-semibold leading-tight tracking-[-0.025em] text-white">
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
