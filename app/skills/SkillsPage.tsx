"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { spaceBoards, tasaOrbiter } from "@font";
import { useReveal } from "@hooks/useReveal";
import LiftHeading from "@components/LiftHeading";
import { layoutTop, whenPlaced } from "@components/transition/arrival";
import { isDialogOpen } from "@lib/pageTransition";
import { subscribeTransition } from "@components/transition/transitionStore";

const capabilityAreas = [
  {
    id: "systems",
    index: "01",
    label: "Backend & Systems",
    title: "Systems that hold up beyond the happy path.",
    description:
      "I build services, APIs, data flows, and integrations that need to stay reliable as requirements and dependencies change.",
    technologies: ["Java", "Spring Boot", "Node.js", "FastAPI", "REST/SOAP APIs", "SQL", "PostgreSQL", "Redis", "Elasticsearch"],
    proof: "Backend engineering is my forte: dependable services, reliable integrations, and clear system boundaries.",
  },
  {
    id: "product",
    index: "02",
    label: "Product interfaces",
    title: "Turning complex systems into simple experiences.",
    description:
      "I build responsive interfaces and frontend architecture that make complex products easier to use, from the overall structure to the details people interact with.",
    technologies: ["TypeScript", "JavaScript", "React", "Next.js", "Tailwind CSS", "HTML", "CSS", "React Native"],
    proof: "I connect interface decisions to the systems and data behind them.",
  },
  {
    id: "agentic",
    index: "03",
    label: "Agentic Engineering",
    title: "Agentic workflows with controls built in.",
    description:
      "I connect language models to company data and external tools through workflows designed for controlled, reliable execution.",
    technologies: ["Agentic AI", "LLMs", "MCP", "Tool Calling", "RAG", "PostgreSQL/pgvector", "Redis", "FastAPI", "Celery"],
    proof: "My work includes 18+ permission-aware MCP tools, tenant-scoped access, approval gates, audit trails, and cross-tool workflows.",
  },
  {
    id: "protocols",
    index: "04",
    label: "Web3 & Protocols",
    title: "Building across chains, wallets, and decentralized infrastructure.",
    description:
      "My Web3 work has included smart contracts, cross-chain protocols, wallets, and decentralized infrastructure, from product interfaces to protocol integrations.",
    technologies: ["Solidity", "Ethers.js", "Viem", "Wagmi", "Axelar", "IPFS", "WalletConnect"],
    proof: "My Web3 projects have covered interfaces and decentralized systems across multiple protocols.",
  },
];

const practices = [
  ["01", "Understand the problem", "Translate business goals into functional and non-functional requirements, separating must-haves from good-to-haves."],
  ["02", "Keep complexity intentional", "Clarify the problem and solve it with the simplest design that meets the requirements; avoid abstraction without a clear need."],
  ["03", "Ship, observe, improve", "Ship for production, learn from real usage, and iterate to keep systems reliable as they grow."],
];

type CapabilityArea = (typeof capabilityAreas)[number];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
// Overdamped, so the disc lands on the next numeral without bouncing past it.
const DISC_SPRING = { type: "spring", stiffness: 520, damping: 42, mass: 0.6 } as const;

// A switch never shows two panels' copy at once: the outgoing panel clears in
// 120ms, and only then does the incoming one cascade in, four steps 35ms
// apart, the last settling by 565ms.
const PANEL_CLEAR_S = 0.12;
const panelMotion: Variants = {
  // The incoming panel stands at once; its steps wait, hidden, for the outgoing one to clear.
  hidden: { opacity: 1, visibility: "visible" },
  shown: {
    opacity: 1,
    visibility: "visible",
    transition: { duration: 0, delayChildren: PANEL_CLEAR_S, staggerChildren: 0.035 },
  },
  // Hidden once clear, so the panels stacked under the active one never take a click.
  // custom: true when the area is placed as the page arrives, before anyone sees it.
  gone: (placed: boolean = false) => ({
    opacity: 0,
    transition: { duration: placed ? 0 : PANEL_CLEAR_S, ease: EASE_OUT },
    transitionEnd: { visibility: "hidden" },
  }),
};
// Each step rises from the side the selection moved towards: from below for a
// later area, from above for an earlier one (custom: 1 or -1).
const panelStep: Variants = {
  hidden: (direction: number = 1) => ({ opacity: 0, y: 10 * direction }),
  shown: { opacity: 1, y: 0, transition: { duration: 0.34, ease: EASE_OUT } },
};
// Reduced motion keeps the steps still: the same settled frame as panelStep, so
// the server HTML (rendered before the preference is known) hydrates unchanged.
const panelStill: Variants = {
  hidden: { opacity: 1, y: 0 },
  shown: { opacity: 1, y: 0 },
};
// Reduced motion: a plain 120ms fade, no offset, no cascade. The outgoing
// panel clears over its first half and the incoming one fades in over the
// second, so the two never show at once.
const PANEL_FADE_S = 0.06;
const panelFade: Variants = {
  hidden: { opacity: 0 },
  shown: (placed: boolean = false) => ({
    opacity: 1,
    visibility: "visible",
    transition: { duration: placed ? 0 : PANEL_FADE_S, delay: placed ? 0 : PANEL_FADE_S, ease: "linear" },
  }),
  gone: (placed: boolean = false) => ({
    opacity: 0,
    transition: { duration: placed ? 0 : PANEL_FADE_S, ease: "linear" },
    transitionEnd: { visibility: "hidden" },
  }),
};

// An area's copy, the same in the switcher's panel (lg) and stacked below lg.
const AREA_LABEL_CLASS = "flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em]";
const AREA_TITLE_CLASS = "mt-7 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl/[1.08] lg:text-5xl/[1.08]";
const AREA_DESCRIPTION_CLASS = "mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8";

/** Window scroll that holds each area while the switcher is pinned, as a share of the viewport's height. */
const STEP_VH = 55;
/**
 * Where the window's scroll can drive the switcher: lg and up, where it sits
 * beside its panel. It steps only where it also fits the window (fitsWindow);
 * elsewhere it stays click-driven and scrolls with the page.
 */
const STEPS_QUERY = "(min-width: 1024px)";
/** Room left under the pinned switcher, so its tallest panel never runs to the window's bottom edge. */
const PIN_SPARE_PX = 32;
/** How long a row click's scroll may take before the window's own steps take over again. */
const ROW_SCROLL_MS = 1600;
/** Keys a browser scrolls the window with. Space joins them in scrollsWindow, away from a control it would press. */
const WINDOW_SCROLL_KEYS = new Set(["PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

/**
 * Whether a key press scrolls the window, so it takes over from a row click's
 * scroll. Tab, Shift and the rest leave that scroll to finish: they do not
 * move the window, and dropping the scroll for them would let the areas it
 * passes on the way switch in after all.
 */
const scrollsWindow = (event: KeyboardEvent) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  // In a field the keys move its caret or change its value, not the window.
  if (target && (target.isContentEditable || target.closest("input, textarea, select"))) return false;
  // Space presses a focused button (a row included) rather than scroll.
  if (event.key === " ") return !target?.closest("button, summary, [role='button']");
  return WINDOW_SCROLL_KEYS.has(event.key);
};

/**
 * Which way a key pages the window: PageDown and Space down, PageUp and
 * Shift+Space up. Null for every other key, and for a page key held with a
 * modifier, which the browser takes for something else.
 */
const pageDirection = (event: KeyboardEvent): 1 | -1 | null => {
  if (event.altKey || event.ctrlKey || event.metaKey) return null;
  if (event.key === "PageDown" || (event.key === " " && !event.shiftKey)) return 1;
  if (event.key === "PageUp" || (event.key === " " && event.shiftKey)) return -1;
  return null;
};

type Selection = {
  index: number;
  /** 1 when the latest switch moved to a later area, -1 to an earlier one. */
  direction: 1 | -1;
  /**
   * Switches to each area. They key its panel, so every switch mounts a fresh
   * copy that cascades in from its first step, and a re-selected area never
   * revives a copy that is still clearing.
   */
  entries: number[];
  /** Placed where the page arrives, before it is seen: the disc does not travel and nothing fades or cascades. */
  placed: boolean;
};

/** Set once development has been told why the switcher cannot pin, so the console says it only once. */
let unpinnedWarned = false;

/**
 * Sticky pins against the window only when no wrapper around the page is a
 * scroll container: overflow hidden makes one, even on one axis; clip does
 * not. Where one is, the switcher stays click-driven, since its scroll track
 * would pass by without the switcher ever pinning.
 */
const pinsToWindow = () => {
  const root = document.documentElement;
  const rootStyle = getComputedStyle(root);
  const rootOverflows = rootStyle.overflowX !== "visible" || rootStyle.overflowY !== "visible";
  const clipsOnly = (overflow: string) => overflow === "visible" || overflow === "clip";
  const scrollers: string[] = [];
  for (
    let element: HTMLElement | null = document.querySelector("[data-stage]")?.parentElement ?? document.body;
    element && element !== root;
    element = element.parentElement
  ) {
    // <body>'s overflow is the viewport's while <html> keeps its own visible.
    if (element === document.body && !rootOverflows) continue;
    const { overflowX, overflowY } = getComputedStyle(element);
    if (clipsOnly(overflowX) && clipsOnly(overflowY)) continue;
    const name = `<${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}>`;
    scrollers.push(`${name} (overflow-x: ${overflowX}; overflow-y: ${overflowY})`);
  }
  if (scrollers.length === 0) return true;
  // Nothing on the page shows that the window's scroll no longer steps the
  // switcher, so an overflow change elsewhere would turn it off unnoticed.
  // Every wrapper in the way is named at once, since each must change.
  if (process.env.NODE_ENV !== "production" && !unpinnedWarned) {
    unpinnedWarned = true;
    console.warn(
      `[SkillsPage] The capability switcher cannot pin to the window, so it stays click-driven: ${scrollers.join(", ")} ${scrollers.length > 1 ? "are scroll containers" : "is a scroll container"}. Use overflow: clip there instead of hidden.`
    );
  }
  return false;
};

/** The classic scrollbar's width at the zoom it was probed at, which scales it. */
let scrollbarProbe: { ratio: number; width: number } | null = null;

/**
 * The width a classic scrollbar takes from the page: 0 where scrollbars float
 * over it (macOS by default, phones). Probed on a scroller of its own, since
 * the window's own scrollbar is hidden whenever this is needed.
 */
const classicScrollbarWidth = () => {
  if (scrollbarProbe?.ratio !== window.devicePixelRatio) {
    const probe = document.createElement("div");
    probe.style.cssText = "position: absolute; top: 0; left: 0; width: 100px; height: 100px; overflow: scroll; visibility: hidden";
    document.body.append(probe);
    scrollbarProbe = { ratio: window.devicePixelRatio, width: probe.offsetWidth - probe.clientWidth };
    probe.remove();
  }
  return scrollbarProbe.width;
};

/**
 * The switcher's height as the live page lays it out. At lg the live page is
 * taller than the window in either mode, so a classic scrollbar always takes
 * its width there; a lift that stops the window scrolling hides it, and the
 * page widens by that much. Near a wrap that reads the switcher shorter, which would switch the
 * steps on for the lift alone, so while the scrollbar is hidden the page is
 * narrowed by it for the reading and put back before anything is painted.
 * The page, not the switcher, is narrowed, so the column's 1440px cap still
 * decides how much of that width the switcher gives up.
 */
function liveHeight(switcher: HTMLElement, main: HTMLElement | null) {
  const hidden = window.innerWidth > document.documentElement.clientWidth ? 0 : classicScrollbarWidth();
  if (!hidden || !main) return switcher.offsetHeight;
  // .nav-gap sets <main>'s width as important, so the narrower one must be too.
  main.style.setProperty("width", `${Number.parseFloat(getComputedStyle(main).width) - hidden}px`, "important");
  const height = switcher.offsetHeight;
  main.style.removeProperty("width");
  return height;
}

/**
 * Whether the switcher, `height` tall and pinned `pinTop` below the window's
 * top, fits the window down to its tallest panel with PIN_SPARE_PX to spare.
 * Its height is measured, not looked up by width, so copy or a font that wraps
 * it taller turns the steps off wherever it no longer fits. That height is the
 * same in either mode (pinning moves the switcher, never resizes it), so the
 * check never flips the mode it decides back and forth.
 */
const fitsWindow = (height: number, pinTop: number) => pinTop + height + PIN_SPARE_PX <= window.innerHeight;

/**
 * The switcher's track in window scroll: where the switcher pins (its top
 * meeting its sticky offset), the scroll that holds each area, and how far it
 * can travel down its section. Layout offsets only, which no lift or depth
 * transform touches, measured from the top of the page.
 */
function measureTrack(section: HTMLElement, switcher: HTMLElement) {
  const freeze = section.closest<HTMLElement>("[data-freeze]");
  const style = getComputedStyle(section);
  const paddingTop = Number.parseFloat(style.paddingTop);
  const contentTop = layoutTop(section) - (freeze ? layoutTop(freeze) : 0) + section.clientTop + paddingTop;
  return {
    pinAt: contentTop - Number.parseFloat(getComputedStyle(switcher).top),
    step: (window.innerHeight * STEP_VH) / 100,
    travel: section.clientHeight - paddingTop - Number.parseFloat(style.paddingBottom) - switcher.offsetHeight,
  };
}

/** The area the window shows at `scrollY`: the first until the switcher has held it for a step, the last after. */
const areaAt = (track: ReturnType<typeof measureTrack>, scrollY: number) =>
  Math.min(capabilityAreas.length - 1, Math.max(0, Math.floor((scrollY - track.pinAt) / track.step)));

export default function SkillsPage() {
  const [selection, setSelection] = useState<Selection>({
    index: 0,
    direction: 1,
    entries: capabilityAreas.map(() => 0),
    placed: false,
  });
  const reduceMotion = useReducedMotion();
  // lg+ windows the pinned switcher fits: their scroll steps it through every
  // area. The server renders the click-driven switcher; the client measures
  // and steps it up once it is laid out.
  const [stepped, setStepped] = useState(false);
  const activeArea = capabilityAreas[selection.index];
  // Empty until the first switch, so it never reads out on load, nor for an area placed on arrival.
  const announcement = selection.placed || selection.entries[selection.index] === 0 ? "" : activeArea.label;
  const practiceSteps = useRef<HTMLOListElement>(null);
  const stackedAreas = useRef<HTMLDivElement>(null);
  const capabilities = useRef<HTMLElement>(null);
  const switcher = useRef<HTMLDivElement>(null);
  /** The area a row click is scrolling to: the window's own steps wait until it gets there. */
  const scrollingTo = useRef<{ index: number; until: number } | null>(null);

  useReveal(stackedAreas);
  useReveal(practiceSteps);

  const select = useCallback((index: number, placed = false) => {
    setSelection((current) =>
      current.index === index
        ? current
        : {
            index,
            direction: index > current.index ? 1 : -1,
            entries: placed ? current.entries : current.entries.map((count, each) => (each === index ? count + 1 : count)),
            placed,
          }
    );
  }, []);

  // Whether the switcher steps, measured again whenever the window or the
  // switcher changes size (a resize, crossing lg, or a late font that rewraps
  // it) and once a lift that framed the page has settled.
  useLayoutEffect(() => {
    const section = capabilities.current;
    const pinned = switcher.current;
    if (!section || !pinned) return;
    const layer = section.closest<HTMLElement>("[data-page]");
    const main = section.closest("main");

    const lg = window.matchMedia(STEPS_QUERY);
    let pinTop = 0;
    let decided = false;
    const measure = () => {
      // A page a lift is framing (leaving, or arriving as the sheet or under
      // it) keeps the mode it was decided with until it is live again: a
      // switch mid-lift would open or close the track under the visitor's
      // eyes. A page that mounts in a lift still decides it at once.
      if (decided && layer && layer.dataset.layerRole !== "live") return;
      decided = true;
      // top-16 stays on in both modes, ignored while the switcher is static. A
      // lift holds it at a top of its own, so the class's is kept from before.
      if (!pinned.style.top) pinTop = Number.parseFloat(getComputedStyle(pinned).top);
      const next = lg.matches && fitsWindow(liveHeight(pinned, main), pinTop) && pinsToWindow();
      // The mode goes onto the section at once, not through a render: the
      // commit that mounts the page also places it for a lift, framing its
      // bottom on the way back from Contact or restoring a history entry's
      // offset, and the track must already be there to be measured. The
      // state follows a render later, for the listeners that step it.
      section.toggleAttribute("data-stepped", next);
      setStepped(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pinned);
    // React writes the layer's role in the commit that settles the lift, so
    // the live page is checked again, at its live layout, before it is painted.
    const settled = new MutationObserver(measure);
    if (layer) settled.observe(layer, { attributes: true, attributeFilter: ["data-layer-role"] });
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      settled.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // The area for the scroll the page arrives at (its top, its bottom on the way
  // back from Contact, or a history entry's offset) is chosen before it is seen.
  useLayoutEffect(() => {
    const section = capabilities.current;
    const pinned = switcher.current;
    if (!stepped || !section || !pinned) return;
    return whenPlaced(section, (t) => select(areaAt(measureTrack(section, pinned), t?.arrivalScrollY ?? window.scrollY), true));
  }, [stepped, select]);

  // A lift clips the page in its layer and frames it at an offset (leaving, or
  // arriving as the sheet), so sticky would measure against the layer instead
  // of the window and drop the switcher back to the top of its track. While
  // the layer clips, the switcher is held where the window had it pinned.
  useLayoutEffect(() => {
    const section = capabilities.current;
    const pinned = switcher.current;
    const layer = section?.closest<HTMLElement>("[data-page]");
    const freeze = section?.closest<HTMLElement>("[data-freeze]");
    if (!stepped || !section || !pinned || !layer || !freeze) return;

    const release = () => {
      pinned.style.position = "";
      pinned.style.top = "";
    };
    const hold = () => {
      release();
      if (getComputedStyle(layer).overflowY === "visible") return;
      const framedAt = freeze.style.transform ? -new DOMMatrixReadOnly(freeze.style.transform).m42 : 0;
      const track = measureTrack(section, pinned);
      pinned.style.position = "relative";
      pinned.style.top = `${Math.min(track.travel, Math.max(0, framedAt - track.pinAt))}px`;
    };

    // Mutations are delivered before the frame is painted, so the held switcher never shows a frame out of place.
    const observer = new MutationObserver(hold);
    observer.observe(layer, { attributes: true, attributeFilter: ["class", "style"] });
    observer.observe(freeze, { attributes: true, attributeFilter: ["style"] });
    hold();
    return () => {
      observer.disconnect();
      release();
    };
  }, [stepped]);

  // The window's scroll steps the switcher through the areas, one step each.
  useEffect(() => {
    const section = capabilities.current;
    const pinned = switcher.current;
    const layer = section?.closest<HTMLElement>("[data-page]");
    if (!stepped || !section || !pinned || !layer) return;

    let frame = 0;
    /** The area a page key is scrolling to, until the window reaches it. */
    let paging: { index: number; until: number } | null = null;
    const follow = () => {
      frame = 0;
      // In a lift the page is framed, not scrolled: it keeps the area it is seen with.
      if (layer.dataset.layerRole !== "live") return;
      // A resize that turns the steps off takes the track away before the state
      // drops this listener. The scroll it clamps on the way is not a step, so
      // the area the visitor had stays.
      if (!section.hasAttribute("data-stepped")) return;
      const index = areaAt(measureTrack(section, pinned), window.scrollY);
      if (paging?.index === index) paging = null;
      const target = scrollingTo.current;
      if (target && index !== target.index && window.performance.now() < target.until) return;
      scrollingTo.current = null;
      select(index);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(follow);
    };
    // Scrolling by hand takes over from a row click's scroll and stops it where
    // it is. Left running, the smooth scroll would carry the window on through
    // the areas between with the guard gone, each one switching in behind the
    // disc; stopped, the window and the area agree at once.
    const takeOver = () => {
      const target = scrollingTo.current;
      if (!target) return;
      scrollingTo.current = null;
      if (window.performance.now() < target.until) {
        // An instant scroll to where the window already is stops a smooth one in
        // Chromium and Safari, but Firefox skips it as a no-op and lets the smooth
        // scroll run on. A pixel's step away and back is a real scroll in every
        // engine, and both land before the next frame is painted.
        const y = window.scrollY;
        window.scrollTo({ top: y >= 1 ? y - 1 : y + 1, left: 0, behavior: "instant" });
        window.scrollTo({ top: y, left: 0, behavior: "instant" });
      }
      // A stop that leaves the window where it was fires no scroll event, so the area is read here.
      schedule();
    };
    const takeOverByKey = (event: KeyboardEvent) => {
      if (scrollsWindow(event)) takeOver();
    };
    // A page of scroll (about 95% of the window) is nearly two areas' steps, so
    // paging as the browser does would skip every other area. While the
    // switcher is pinned, a page key goes to the middle of the next or previous
    // area's step instead; before the first area and past the last it pages as
    // usual. A key pressed again before the window gets there goes on from the
    // area it is heading for, so holding PageDown steps through them all.
    const pageByArea = (event: KeyboardEvent) => {
      const direction = pageDirection(event);
      if (!direction || event.defaultPrevented || !scrollsWindow(event)) return;
      if (layer.dataset.layerRole !== "live" || isDialogOpen()) return;
      const track = measureTrack(section, pinned);
      const y = window.scrollY;
      if (y < track.pinAt || y >= track.pinAt + capabilityAreas.length * track.step) return;
      const now = window.performance.now();
      const index = (paging && now < paging.until ? paging.index : areaAt(track, y)) + direction;
      if (index < 0 || index >= capabilityAreas.length) return;
      event.preventDefault();
      paging = { index, until: now + ROW_SCROLL_MS };
      const bottom = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: Math.min(bottom, track.pinAt + (index + 0.5) * track.step),
        left: 0,
        behavior: reduceMotion ? "instant" : "smooth",
      });
    };
    // The wheel or a finger moves the window on from wherever it is.
    const dropPaging = () => {
      paging = null;
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("wheel", takeOver, { passive: true });
    window.addEventListener("touchstart", takeOver, { passive: true });
    window.addEventListener("wheel", dropPaging, { passive: true });
    window.addEventListener("touchstart", dropPaging, { passive: true });
    window.addEventListener("keydown", takeOverByKey);
    window.addEventListener("keydown", pageByArea);
    // A settled lift hands the page back to the window, at its arrival offset.
    const stopWatching = subscribeTransition(schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("wheel", takeOver);
      window.removeEventListener("touchstart", takeOver);
      window.removeEventListener("wheel", dropPaging);
      window.removeEventListener("touchstart", dropPaging);
      window.removeEventListener("keydown", takeOverByKey);
      window.removeEventListener("keydown", pageByArea);
      stopWatching();
    };
  }, [stepped, select, reduceMotion]);

  const choose = (index: number) => {
    if (index === selection.index) return;
    select(index);
    const section = capabilities.current;
    const pinned = switcher.current;
    if (!stepped || !section || !pinned) return;
    // Clicks and the scroll share one state: the window goes to the middle of
    // the area's step, where its scroll already reads as that area, and the
    // areas it passes on the way never switch in.
    const track = measureTrack(section, pinned);
    const bottom = document.documentElement.scrollHeight - window.innerHeight;
    scrollingTo.current = { index, until: window.performance.now() + ROW_SCROLL_MS };
    window.scrollTo({
      top: Math.min(bottom, track.pinAt + (index + 0.5) * track.step),
      left: 0,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  };

  return (
    <main className="nav-gap min-h-[100dvh] overflow-x-clip bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-20 sm:px-10 sm:pb-28 sm:pt-14 lg:px-14 lg:pt-16 xl:px-20">
        <header className="max-w-4xl">
          <LiftHeading className={`text-4xl leading-none tracking-[-0.04em] sm:text-6xl ${spaceBoards.className}`}>
            Skills
          </LiftHeading>
          <p className={`mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg/7 ${tasaOrbiter.className}`}>
            Skills matter only when they help a team ship, operate, and improve a real system.
          </p>
        </header>

        {/* Below lg, where a switcher could only sit above its panel, every area shows in full. */}
        <section className="mt-10 border-t border-white/15 pt-8 sm:mt-12 sm:pt-10 lg:hidden" aria-label="Engineering capabilities">
          <h2 className={`text-xl font-semibold text-white sm:text-2xl ${tasaOrbiter.className}`}>
            Areas of practice
          </h2>
          <div ref={stackedAreas} className="mt-2 divide-y divide-white/10">
            {capabilityAreas.map((area) => (
              <article key={area.id} data-reveal aria-labelledby={`${area.id}-title`} className="py-8 last:pb-0 sm:py-10">
                <div className={AREA_LABEL_CLASS}>
                  <AreaLabel area={area} />
                </div>
                <h3 id={`${area.id}-title`} className={`${AREA_TITLE_CLASS} ${tasaOrbiter.className}`}>
                  {area.title}
                </h3>
                <p className={`${AREA_DESCRIPTION_CLASS} ${tasaOrbiter.className}`}>{area.description}</p>
                <AreaEvidence area={area} Heading="h4" />
              </article>
            ))}
          </div>
        </section>

        {/* The step measure writes data-stepped here, never a render: it pins the switcher and opens its track. */}
        <section
          ref={capabilities}
          className="group/capabilities mt-12 hidden border-t border-white/15 pt-10 lg:block"
          aria-label="Engineering capabilities"
        >
          {/* Stepped, it pins under the page's top padding while the track below it scrolls by. */}
          <div
            ref={switcher}
            className="top-16 grid grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] gap-16 group-data-[stepped]/capabilities:sticky"
          >
            <aside className="min-w-0" aria-label="Capability areas">
              <h2 className={`text-2xl font-semibold text-white ${tasaOrbiter.className}`}>
                Areas of practice
              </h2>
              <div className="relative mt-6">
                <span
                  aria-hidden="true"
                  className="absolute bottom-8 left-[1.125rem] top-8 w-px bg-white/15"
                />
                <div className="relative grid">
                  {capabilityAreas.map((area, index) => {
                    const active = index === selection.index;
                    return (
                      <button
                        key={area.id}
                        type="button"
                        aria-pressed={active}
                        aria-controls="capability-detail"
                        onClick={() => choose(index)}
                        className={`group flex min-h-[4.75rem] w-full items-center gap-4 border-b border-white/10 py-3 text-left transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${active ? "text-white" : "text-white/50 hover:text-white/85"}`}
                      >
                        {/* No stacking context per row, so the travelling disc passes over
                            every ring on the spine and under every numeral, in either direction. */}
                        <span className="relative grid size-9 shrink-0 place-items-center font-mono text-xs tabular-nums">
                          {/* The disc carries the fill; the ring under it stays a ring. */}
                          <span
                            aria-hidden="true"
                            className={`absolute inset-0 rounded-full border border-white/25 bg-black transition-[border-color] duration-300 ${active ? "" : "group-hover:border-white/50"}`}
                          />
                          {active && (
                            <motion.span
                              aria-hidden="true"
                              layoutId="skills-active"
                              transition={reduceMotion || selection.placed ? { duration: 0 } : DISC_SPRING}
                              className="absolute inset-0 z-[1] rounded-full bg-accent"
                            />
                          )}
                          <span className={`relative z-[2] transition-colors duration-300 ${active ? "text-[#05080c]" : "text-white/55"}`}>
                            {area.index}
                          </span>
                        </span>
                        <span className="min-w-0 text-lg font-medium">{area.label}</span>
                        <span
                          className={`ml-auto inline-flex shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-opacity duration-300 ${active ? "opacity-70" : "opacity-0 group-hover:opacity-45"}`}
                        >
                          {active ? "Selected" : "View"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="relative min-w-0 border-l border-white/15 pl-12">
              {/* Mounted from the start: a panel remounts on every switch, and a
                  live region that arrives with its text is skipped by screen readers. */}
              <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
              {/* Every panel stacks in this one cell, so it is always as tall as the
                  tallest and nothing below moves when the area changes. */}
              <div className="grid min-h-[27rem]">
                <AnimatePresence initial={false}>
                  {capabilityAreas.map((area, index) => (
                    <CapabilityPanel
                      key={`${area.id}-${selection.entries[index]}`}
                      area={area}
                      active={index === selection.index}
                      direction={selection.direction}
                      placed={selection.placed}
                      reduceMotion={Boolean(reduceMotion)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
          {/* The track: one step of window scroll per area, passed under the pinned switcher. */}
          <div
            aria-hidden="true"
            className="hidden group-data-[stepped]/capabilities:block"
            style={{ height: `${capabilityAreas.length * STEP_VH}vh` }}
          />
        </section>

        <section className="mt-14 border-t border-white/15 pt-9 sm:mt-16 sm:pt-11" aria-labelledby="practice-heading">
          <div className="grid gap-7 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
            <h2
              id="practice-heading"
              className={`max-w-sm pt-0 text-2xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-3xl/tight lg:pt-5 ${tasaOrbiter.className}`}
            >
              How I build
            </h2>
            <ol ref={practiceSteps} className="divide-y divide-white/10">
              {practices.map(([index, title, description]) => (
                <li
                  key={index}
                  data-reveal
                  className="grid gap-x-5 gap-y-2 py-5 sm:grid-cols-[3rem_minmax(11rem,0.7fr)_minmax(0,1.3fr)] sm:items-baseline sm:gap-y-0"
                >
                  <span className="font-mono text-xs tabular-nums text-accent">{index}</span>
                  <h3 className={`text-base font-semibold text-white sm:text-lg ${tasaOrbiter.className}`}>
                    {title}
                  </h3>
                  <p className={`text-sm leading-6 text-white/55 sm:text-base/6 ${tasaOrbiter.className}`}>
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}

function CapabilityPanel({
  area,
  active,
  direction,
  placed,
  reduceMotion,
}: Readonly<{ area: CapabilityArea; active: boolean; direction: 1 | -1; placed: boolean; reduceMotion: boolean }>) {
  const step = reduceMotion ? panelStill : panelStep;

  // Only the active panel keeps the ids, the accessibility tree and the pointer;
  // the others stay stacked under it, invisible, for its height alone.
  return (
    <motion.article
      id={active ? "capability-detail" : undefined}
      aria-labelledby={active ? "capability-detail-title" : undefined}
      aria-hidden={active ? undefined : true}
      inert={!active}
      custom={placed}
      variants={reduceMotion ? panelFade : panelMotion}
      initial="hidden"
      animate={active ? "shown" : "gone"}
      exit="gone"
      className="[grid-area:1/1]"
    >
      <motion.div variants={step} custom={direction} className={AREA_LABEL_CLASS}>
        <AreaLabel area={area} />
      </motion.div>
      <motion.h2
        variants={step} custom={direction}
        id={active ? "capability-detail-title" : undefined}
        className={`${AREA_TITLE_CLASS} ${tasaOrbiter.className}`}
      >
        {area.title}
      </motion.h2>
      <motion.p variants={step} custom={direction} className={`${AREA_DESCRIPTION_CLASS} ${tasaOrbiter.className}`}>
        {area.description}
      </motion.p>

      {/* Proof and technologies enter as one step, keeping the cascade to four. */}
      <motion.div variants={step} custom={direction}>
        <AreaEvidence area={area} Heading="h3" />
      </motion.div>
    </motion.article>
  );
}

function AreaLabel({ area }: Readonly<{ area: CapabilityArea }>) {
  return (
    <>
      <span className="tabular-nums text-accent">{area.index}</span>
      <span aria-hidden="true" className="h-px w-8 bg-white/25" />
      <span className="text-white/55">{area.label}</span>
    </>
  );
}

/** The proof, then the technologies: the evidence reads before the inventory. */
function AreaEvidence({ area, Heading }: Readonly<{ area: CapabilityArea; Heading: "h3" | "h4" }>) {
  return (
    <>
      <p className={`mt-5 max-w-2xl text-sm leading-6 text-white/70 sm:text-base/6 ${tasaOrbiter.className}`}>
        {area.proof}
      </p>
      <div className="mt-9 border-t border-white/10 pt-5">
        <Heading className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">
          Technologies
        </Heading>
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2" aria-label={`${area.label} technologies`}>
          {area.technologies.map((technology) => (
            // The dot leads each item after the first and never wraps away from
            // it, so a line can start on a dot but never end on one.
            <li
              key={technology}
              className="flex items-center gap-3 whitespace-nowrap font-mono text-sm text-white/75 [li+&]:before:h-1 [li+&]:before:w-1 [li+&]:before:shrink-0 [li+&]:before:rounded-full [li+&]:before:bg-white/25 [li+&]:before:content-['']"
            >
              <span>{technology}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
