"use client";

import { AnimatePresence, usePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  Component,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { SCRIM_MAX, SHEET_SHADOW, type PageTransition } from "@lib/pageTransition";
import FrozenRouter from "./FrozenRouter";
import { usePageTransition } from "./PageTransitionProvider";
import { getTransition, isInFlight, layerRegistry, useTransitionState } from "./transitionStore";

/**
 * live  — no transition, or the transition has settled.
 * sheet — the moving page on top (forward: the page lifting away; backward:
 *         the earlier page coming back down; reduced motion: the page fading).
 * under — the page waiting underneath, rising slightly and un-dimming.
 */
type Role = "live" | "sheet" | "under";

const isLiftKind = (t: PageTransition) => t.kind === "lift" || t.kind === "flip" || t.kind === "unflip";

/**
 * Holds an exiting page at the scroll offset it had when it stopped being the
 * live route. The layer turns `position: fixed` as it exits, which would
 * otherwise snap its content back to the top; the wrapper re-applies the
 * offset as a transform in the same commit, before the next paint.
 *
 * The wrapper is also the element PageSequenceScroll nudges for its edge
 * spring on window-scrolled pages, and the element an arriving sheet is
 * framed with (its arrival offset) until it settles.
 */
class ScrollFreeze extends Component<{
  isPresent: boolean;
  freezeRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}> {
  getSnapshotBeforeUpdate(previous: { isPresent: boolean }) {
    if (previous.isPresent && !this.props.isPresent) {
      return getTransition()?.popScrollY ?? window.scrollY;
    }
    return null;
  }

  componentDidUpdate(previous: { isPresent: boolean }, _state: unknown, snapshot: number | null) {
    const wrapper = this.props.freezeRef.current;
    if (!wrapper) return;

    if (typeof snapshot === "number") {
      // An edge spring still running here would override the frozen offset.
      wrapper.getAnimations().forEach((animation) => animation.cancel());
      wrapper.style.transform = snapshot ? `translate3d(0px, ${-snapshot}px, 0px)` : "";
      return;
    }

    if (!previous.isPresent && this.props.isPresent) wrapper.style.transform = "";
  }

  render() {
    return (
      <div ref={this.props.freezeRef} data-freeze="">
        {this.props.children}
      </div>
    );
  }
}

function PageLayer({ path, children }: { path: string; children: ReactNode }) {
  const [isPresent, safeToRemove] = usePresence();
  const transition = useTransitionState();
  const flight = isInFlight(transition) ? transition : null;
  const layerRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const freezeRef = useRef<HTMLDivElement | null>(null);

  const role: Role = !flight ? "live" : path === flight.sheet ? "sheet" : "under";

  // Register DOM handles every commit; the coordinator in PageTransitionProvider
  // runs its layout effect after this one and starts every animation together.
  useLayoutEffect(() => {
    layerRegistry.set(path, {
      el: layerRef.current,
      scrim: scrimRef.current,
      freeze: freezeRef.current,
      isPresent,
      safeToRemove: safeToRemove ?? null,
    });
  });

  useLayoutEffect(() => {
    const layer = layerRef.current;
    return () => {
      if (layerRegistry.get(path)?.el === layer) layerRegistry.delete(path);
    };
  }, [path]);

  // Exits nobody is choreographing (no transition, or one that has already
  // settled) are released immediately.
  useLayoutEffect(() => {
    if (isPresent || !safeToRemove) return;
    const current = getTransition();
    if (!isInFlight(current) || current.from !== path) safeToRemove();
  }, [isPresent, safeToRemove, transition, path]);

  // The Home layer is the transparent window onto the fixed 3D scene on
  // desktop; every other layer is as black as the body behind it.
  const background = path === "/" ? "bg-black min-[551px]:bg-transparent" : "bg-black";
  let className = `min-h-full w-full ${background}`;
  let style: CSSProperties | undefined;

  if (!isPresent) {
    className = transition
      ? `fixed inset-0 overflow-hidden pointer-events-none ${background}`
      : "hidden";
  } else if (flight) {
    className = `relative min-h-full w-full ${background}`;
  }

  if (flight) {
    const lift = isLiftKind(flight);
    style = { zIndex: role === "sheet" ? 2 : 1 };
    // An arriving sheet is exactly one viewport tall (framed at its arrival
    // offset by the coordinator), so its bottom edge is the edge that moves.
    if (lift && role === "sheet" && isPresent && path === flight.to) {
      style.height = "100dvh";
      style.overflow = "hidden";
    }
    // The leading edge. Home's desktop sheet is the 3D scene, which carries
    // its own shadow.
    if (lift && role === "sheet" && !(path === "/" && flight.homeVisualIsScene)) {
      style.boxShadow = SHEET_SHADOW;
    }
  }

  const showScrim = Boolean(flight) && role === "under" && flight !== null && isLiftKind(flight);
  // A page that arrives underneath starts dimmed and brightens as the sheet
  // above it lifts; a page that is covered starts clear.
  const scrimStart = showScrim && path === flight?.to ? SCRIM_MAX : 0;

  return (
    <div
      ref={layerRef}
      data-page={path}
      data-layer-role={!isPresent && transition ? `exiting-${role}` : role}
      inert={!isPresent || undefined}
      className={className}
      style={style}
    >
      <ScrollFreeze isPresent={isPresent} freezeRef={freezeRef}>
        {children}
      </ScrollFreeze>
      {showScrim && (
        <div
          ref={scrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: scrimStart, zIndex: 9999 }}
        />
      )}
    </div>
  );
}

/**
 * The route stage. AnimatePresence keeps the exiting App Router segment
 * mounted (frozen on its own segment) while the lift plays.
 */
export default function PageStage({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const transition = useTransitionState();
  const { settle } = usePageTransition();

  return (
    <div
      data-stage=""
      className="min-h-full w-full"
      // Clip the lowered page underneath so it never extends the document.
      style={isInFlight(transition) ? { overflow: "clip" } : undefined}
    >
      <AnimatePresence mode="sync" initial={false} onExitComplete={settle}>
        <PageLayer key={pathname} path={pathname}>
          <FrozenRouter>{children}</FrozenRouter>
        </PageLayer>
      </AnimatePresence>
    </div>
  );
}
