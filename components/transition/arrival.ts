import { CONTENT_LEAD, UNDER_OFFSET, type PageTransition } from "@lib/pageTransition";
import { getTransition, isInFlight, onArrival, type ArrivalTrack } from "./transitionStore";

// ---------------------------------------------------------------------------
// Where a page will be seen when it arrives. In-page motion (scroll reveals,
// the Work timeline, the Projects entrance, the rail's progress) must decide
// what the visitor sees at the moment the lift settles, while the page is
// still mounting underneath or framed as a sheet. These helpers wait for the
// coordinator to place the arriving page and measure it with layout offsets,
// which no lift or depth transform touches.
// ---------------------------------------------------------------------------

/**
 * The route of the page layer an element belongs to. Not usePathname: an
 * exiting page keeps rendering after the URL has moved on.
 */
export const layerPathOf = (element: Element) =>
  element.closest<HTMLElement>("[data-page]")?.dataset.page ?? null;

/**
 * Runs `place` once the page holding `element` stands where the visitor will
 * see it: at once for a page that is already live, or, for a page a
 * transition is mounting, from the coordinator's arrival hook in the same
 * commit (before paint), once it is at its arrival offset. `t` is the arriving
 * transition while it is still in flight, else null; `track` is set only on
 * the first call for a lift. Returns a cleanup.
 */
export function whenPlaced(
  element: Element,
  place: (t: PageTransition | null, track: ArrivalTrack | null) => void
) {
  const path = layerPathOf(element);
  const t = getTransition();
  if (isInFlight(t) && t.to === path && t.commitAt === null) {
    const stop = onArrival((arrived, track) => {
      if (arrived.id !== t.id) return;
      stop();
      place(arrived, track);
    });
    return stop;
  }
  place(isInFlight(t) && t.to === path ? t : null, null);
  return () => undefined;
}

/** Document (or offset-parent chain) top of an element, ignoring every transform. */
export const layoutTop = (element: HTMLElement) => {
  let top = 0;
  let node: HTMLElement | null = element;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
};

/** Not rendered (display: none, or inside it): never hidden or measured. */
export const isUnrendered = (element: HTMLElement) =>
  element.offsetParent === null && getComputedStyle(element).position !== "fixed";

const isLift = (t: PageTransition) => t.kind === "lift" || t.kind === "flip" || t.kind === "unflip";

/**
 * The view a page arrives at (or is already showing): the window, or a page
 * that scrolls inside its own `root` (Work's <main>). While a lift is in
 * flight the view grows by the travel of the lift's depth layers, so content
 * the moving sheet briefly shows past its arrival edges also counts as seen.
 */
export function arrivalView(root: HTMLElement | null, t: PageTransition | null) {
  const viewportHeight = window.innerHeight;
  const margin = t && isLift(t) && !t.plain ? Math.max(UNDER_OFFSET, CONTENT_LEAD) * viewportHeight : 0;
  const origin = root ? layoutTop(root) + root.clientTop : 0;
  // A backward lift frames the arriving sheet at its offset; the window only
  // scrolls there once it settles.
  const top = root ? root.scrollTop : (t?.arrivalScrollY ?? window.scrollY);
  const height = root ? root.clientHeight : viewportHeight;

  return {
    /** -1 wholly above the view, 1 wholly below it, 0 at least partly inside it. */
    side(element: HTMLElement): -1 | 0 | 1 {
      if (isUnrendered(element)) return 0;
      const y = layoutTop(element) - origin;
      if (y + element.offsetHeight < top - margin) return -1;
      if (y > top + height + margin) return 1;
      return 0;
    },
  };
}
