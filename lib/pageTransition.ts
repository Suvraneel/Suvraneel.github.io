// Shared vocabulary for the route-to-route "parallax lift" transitions.
// Single home of the page order and the dialog guard so every navigation
// surface (wheel, touch, keys, rail, drawer, browser history) agrees.

export const pageOrder = ["/", "/about", "/work", "/projects", "/skills", "/contact"] as const;
export type PagePath = (typeof pageOrder)[number];

export const isPagePath = (path: string | null | undefined): path is PagePath =>
  typeof path === "string" && (pageOrder as readonly string[]).includes(path);

// Native <dialog> elements (ProjectModal) expose their role implicitly, so match
// open dialogs as well as explicit ARIA modals (the mobile drawer sheet).
export const isDialogOpen = () =>
  typeof document !== "undefined" &&
  Boolean(document.querySelector("dialog[open], [role='dialog'][aria-modal='true']"));

/**
 * Browser history (or a page link) leaving a page with a modal <dialog> open:
 * the dialog goes at once, as it would if its page unmounted, instead of
 * covering the whole transition from the top layer. Its owner is told through
 * the dialog's own `close` (page lock released synchronously, so the exiting
 * page is snapshotted at its real scroll offset) and `cancel` (React state)
 * events.
 */
export const dismissModalDialogs = () => {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach((dialog) => {
    dialog.style.display = "none";
    dialog.close();
    dialog.dispatchEvent(new Event("close"));
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
  });
};

export const isDrawerOpen = () =>
  typeof document !== "undefined" && Boolean(document.querySelector("[data-drawer-open]"));

// ---------------------------------------------------------------------------
// Motion tokens. One ease and one duration for every layer of a lift, so the
// sheet, its content and the page underneath stay in lockstep: a weighted
// lift for desktop, a shorter decelerating throw for lifts a finger starts
// (touch pulls, and every phone-layout lift).
// ---------------------------------------------------------------------------

/**
 * Eases in briefly, then decelerates: visible motion within ~150 ms of the
 * click or key (10% of the travel by 200 ms) and a long settle, either way.
 * A heavy symmetric in-out ([0.76, 0, 0.24, 1]) left the sheet all but still
 * for the first 300 ms, so input read as lag.
 */
export const EASE_LIFT = [0.4, 0, 0.2, 1] as const;
export const LIFT_MS = 1100;
/** Touch and phone lifts leave at speed, like a released sheet, and decelerate into place. */
export const EASE_THROW = [0.22, 1, 0.36, 1] as const;
export const THROW_MS = 750;
/** The page underneath starts this far down (fraction of the viewport): ~0.2x the sheet. */
export const UNDER_OFFSET = 0.2;
/** Foreground content inside the sheet travels this much further than the sheet. */
export const CONTENT_LEAD = 0.12;
/** Dim on the page underneath while it is covered. */
export const SCRIM_MAX = 0.25;
/** Soft leading edge under the lifting sheet (in flight only). */
export const SHEET_SHADOW = "0 40px 80px rgba(0, 0, 0, 0.55)";
/**
 * Phones (plain lift): a hairline just past the sheet's bottom edge, the edge
 * that moves across the screen either way, so a black page over a black page
 * still reads as a sheet. In flight only.
 */
export const SHEET_EDGE = "0 1px 0 rgba(255, 255, 255, 0.08)";

export const FLIP_MS = 1000;
/** The lift's curve, so the dashboard starts turning as promptly as the sheet lifts. */
export const EASE_FLIP = EASE_LIFT;
// The 3D flip leads; Home starts lifting away while the dashboard is mid-turn.
export const FLIP_LEAD_MS = 200;
/**
 * Over this share of the flip (EASE_FLIP across it) the blob behind the
 * dashboard is pulled in, so the lifting sheet's edge never cuts it and the
 * card's back face never turns over it. The return flip plays it backwards
 * over the same share at its end, so Home lands exactly as it rests.
 */
export const BLOB_PULL_SPAN = 0.45;

export const FADE_MS = 200;
export const EASE_FADE = [0.32, 0.72, 0, 1] as const;

// Post-arrival momentum absorber (trackpad tails).
export const GESTURE_GAP_MS = 120;
export const GESTURE_CAP_MS = 800;
/** Upper bound of a swallowed momentum tail (long macOS flings run ~3s). */
export const MOMENTUM_MAX_MS = 3000;
/** Past the cap, a tail event above level * factor + slack is a new gesture. */
export const TAIL_RISE_FACTOR = 1.5;
export const TAIL_RISE_SLACK_PX = 4;
/**
 * Wheel input whose rate over the last SUSTAIN_WINDOW_MS is no lower than over
 * the same span SUSTAIN_LOOKBACK_MS earlier is live scrolling, not momentum
 * (which only decays), and is never swallowed.
 */
export const SUSTAIN_WINDOW_MS = 250;
export const SUSTAIN_LOOKBACK_MS = 500;
/** Below this many px per window a tail is too quantised to tell decay from a plateau. */
export const SUSTAIN_MIN_PX = 16;
/**
 * Event counts per window jitter by one (a 50ms wheel cadence puts events on
 * the window edges), so the summed rate may dip this far and still be steady.
 */
export const SUSTAIN_SUM_RATIO = 0.85;
/**
 * Momentum decays event by event; a wheel kept spinning keeps its notch size.
 * The recent window's median |deltaY| must hold this share of the earlier one.
 */
export const SUSTAIN_MEDIAN_RATIO = 0.9;
/**
 * After a transition settles, input that is still part of the gesture that
 * carried the visitor here (a wheel still spinning, a finger still down, a key
 * still auto-repeating) is held this long, so every arrival shows its top
 * before it scrolls on. A pause of GESTURE_GAP_MS ends the gesture at once.
 */
export const LANDING_MS = 400;

export const COMMIT_WATCHDOG_MS = 8000;

/** Phones and touch-first screens get the plain lift (no depth layers). */
export const PLAIN_LIFT_QUERY = "(max-width: 550px), (pointer: coarse)";

/**
 * Foreground content that pulls ahead of each page's sheet. Every selector
 * targets content only, never the element that paints the page background, so
 * no band of another colour can open at the bottom of the lifting sheet.
 * Home is skipped: on desktop its visual is the 3D scene (one surface), and
 * phones always get the plain lift.
 */
export const DEPTH_SELECTORS: Record<PagePath, string | null> = {
  "/": null,
  // Text column only; the black root and the portrait's frame stay with the
  // sheet (the photo inside it trails instead: LAG_SELECTOR).
  "/about": "section > div",
  // Text column inside the <main> scroller; the sticky plant aside stays.
  "/work": "main > div > div:last-child",
  // <main> paints the background on these pages; its inner wrapper is content.
  "/projects": "main > div:first-child",
  "/skills": "main > div:first-child",
  "/contact": "main > div:first-child",
};

/**
 * Decorative layers (About's portrait) that trail the page holding them, a
 * third plane behind its content. Each sits overscanned inside a frame that
 * clips it, and travels PHOTO_LAG of the viewport less than its page, never
 * more than its overscan, so no edge of it can show.
 */
export const LAG_SELECTOR = "[data-depth='photo']";
export const PHOTO_LAG = 0.06;
/** A page arriving underneath (forward) settles its lag layers from here into place. */
export const PHOTO_SETTLE_FROM = "translate3d(0px, 3%, 0px) scale(1.04)";

export const cssEase = (ease: readonly number[]) => `cubic-bezier(${ease.join(",")})`;

/**
 * lift   — the earlier page is a sheet over the later one (forward: it lifts
 *          away; backward: it comes back down).
 * flip   — Home → About with the dashboard turning first.
 * unflip — About → Home with the dashboard turning back as Home lands.
 * fade   — reduced motion: the outgoing page fades over the arrived one.
 * instant — the browser already animated a history swipe.
 */
export type TransitionKind = "lift" | "flip" | "unflip" | "fade" | "instant";
export type TransitionSource = "sequence" | "key" | "link" | "pop";
/** Where the arriving page is scrolled: its top, its bottom, or a remembered offset (history). */
export type Arrival = "top" | "bottom" | { y: number; main: number };

export type PageTransition = {
  id: number;
  from: PagePath;
  to: PagePath;
  kind: TransitionKind;
  direction: 1 | -1;
  arrival: Arrival;
  source: TransitionSource;
  /** Phones / touch: no depth layers, the page underneath only un-dims. */
  plain: boolean;
  /** Which route is the moving sheet: forward lifts `from`, backward lowers `to`. */
  sheet: PagePath;
  startedAt: number;
  /** document.timeline time the lift begins (flip leads it by FLIP_LEAD_MS). */
  liftStartAt: number;
  /** performance.now() of the React commit that mounted the next route. Mutated in place. */
  commitAt: number | null;
  /** Lift/fade length in ms (already time-scaled). */
  duration: number;
  /** Cubic-bezier of every lift track: EASE_LIFT, or EASE_THROW for touch and phone lifts. */
  ease: readonly number[];
  /** Dashboard flip length in ms (already time-scaled). */
  flipDuration: number;
  /** Home's desktop visual is the fixed 3D scene, so it rides on Home's sheet. */
  homeVisualIsScene: boolean;
  /** Scroll offset captured at popstate, before the router swaps the page. */
  popScrollY?: number;
  /** Window scroll the arriving sheet is framed at; applied once it settles. */
  arrivalScrollY?: number;
  settled: boolean;
};

export type KindContext = {
  sceneViewport: boolean;
  sceneReady: boolean;
  rigFound: boolean;
  reduced: boolean;
  uaTransition: boolean;
};

export function deriveKind(from: PagePath, to: PagePath, ctx: KindContext): TransitionKind {
  if (ctx.uaTransition) return "instant";
  if (ctx.reduced) return "fade";
  const sceneFlip = ctx.sceneViewport && ctx.sceneReady && ctx.rigFound;
  if (from === "/" && to === "/about" && sceneFlip) return "flip";
  if (from === "/about" && to === "/" && sceneFlip) return "unflip";
  return "lift";
}

export const directionOf = (from: PagePath, to: PagePath): 1 | -1 =>
  pageOrder.indexOf(to) - pageOrder.indexOf(from) < 0 ? -1 : 1;

const isDev = process.env.NODE_ENV !== "production";

/**
 * Development-only slow motion for inspecting transitions frame by frame:
 * `window.__pageTransitionTimeScale = 5`. Production builds fold this to 1.
 */
export const timeScale = (): number => {
  if (!isDev || typeof window === "undefined") return 1;
  const scale = Number((window as unknown as { __pageTransitionTimeScale?: number }).__pageTransitionTimeScale);
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const prefersPlainLift = () =>
  typeof window !== "undefined" && window.matchMedia(PLAIN_LIFT_QUERY).matches;
