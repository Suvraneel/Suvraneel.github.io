"use client";

import { motion, useReducedMotion } from "motion/react";
import { spaceBoards } from "@font";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";

const STAIR_COUNT = 6;
const EASE = [0.76, 0, 0.24, 1] as const;
const NAME = "Suvraneel";
/** Shown progress never completes faster than this, so the fill always reads as a fill. */
const MIN_FILL_MS = 1200;
/** Fastest climb of the shown progress, per second (a cached load still fills, never jumps). */
const MAX_RATE = 1.4;
/** Once the scene is ready the fill finishes faster, so the hold shows the complete name. */
const READY_RATE = 2.6;
/** Before any bytes arrive, the fill creeps (per second, up to a cap) so the start never looks stalled. */
const CREEP_RATE = 0.05;
const CREEP_CAP = 0.12;
/** Shown progress waits here until the scene has rendered its first frames. */
const UNTIL_READY = 0.9;
/** The no-JS failsafe hides the server-rendered cover after this (keep in step with globals.css). */
export const PRELOADER_FAILSAFE_MS = 8000;

export type PreloaderStatus = "loading" | "ready" | "slow" | "failed";

type Props = {
  /** Weighted load progress, 0..1 (download, then scene start, then first frames). */
  progress: number;
  status: PreloaderStatus;
  /** Milliseconds from navigation start to the scene's first rendered frames. */
  readyAt: number | null;
  /** Ends the hold early (a click or Escape once the name is complete). */
  onSkip?: () => void;
};

const noSubscribe = () => () => undefined;

function readout(status: PreloaderStatus, shown: number, readyAt: number | null) {
  if (status === "failed") return "3D scene unavailable";
  if (status === "slow") return "still loading · opening anyway";
  if (status === "ready" && shown >= 1) return readyAt === null ? "ready" : `ready · ${(readyAt / 1000).toFixed(2)} s`;
  return `${String(Math.round(shown * 100)).padStart(3, "0")} / 100`;
}

/** The name as a stroked ghost, with the heading texture filling it from the bottom by --p. */
function Composition({ drift, label }: { drift: boolean; label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className={`preloader-name relative leading-none ${spaceBoards.className}`}>
        <span className="preloader-ghost block">{NAME}</span>
        <span className="preloader-fill absolute inset-0 overflow-hidden">
          <span className={`preloader-texture block ${drift ? "preloader-drift" : ""}`}>{NAME}</span>
        </span>
      </div>
      <p className="absolute bottom-8 right-8 font-mono text-xs tabular-nums tracking-[0.3em] text-white/50">{label}</p>
    </div>
  );
}

/**
 * First-visit Home cover while the 3D dashboard loads: the name fills with the
 * heading texture as the scene loads (weighted, smoothed, forward-only), holds
 * complete while the texture drifts, then leaves on six lifting columns, each
 * carrying its slice of the name. Its first frame is in the server HTML, so a
 * direct load never starts blank.
 */
export default function StairsPreloader({ progress, status, readyAt, onSkip }: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState(() => readout(status, 0, readyAt));
  // The name has filled completely with the scene ready: the hold has begun.
  const [complete, setComplete] = useState(false);
  // False in the server HTML and while hydrating, true after: the live region starts
  // empty and then gets its text, so screen readers announce it.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);

  const target = status === "ready" ? 1 : status === "loading" ? Math.min(progress, UNTIL_READY) : 0;
  const latest = useRef({ target, status, readyAt, reduceMotion: Boolean(reduceMotion) });
  const loop = useRef<{ start: () => void } | null>(null);

  // One fill loop for the cover's lifetime, timed from its first paint. It
  // chases the latest target (forward only, rate-capped, never done before
  // MIN_FILL_MS, creeping before bytes arrive) and writes --p, so nothing re-renders.
  useEffect(() => {
    const startedAt = performance.now();
    let shown = 0;
    let frame = 0;
    let last = startedAt;
    let labelText = "";

    const tick = (now: number) => {
      const { target, status, readyAt, reduceMotion } = latest.current;
      // A long frame (the scene compiling) is caught up on, so the fill keeps real pace.
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      const elapsed = (now - startedAt) / 1000;
      const creep = status === "loading" ? Math.min(CREEP_CAP, elapsed * CREEP_RATE) : 0;
      const goal = Math.min(Math.max(target, creep), (elapsed * 1000) / MIN_FILL_MS, 1);
      if (goal > shown) {
        const rate = status === "ready" ? READY_RATE : MAX_RATE;
        const eased = Math.min((goal - shown) * Math.min(1, dt * 10), rate * dt);
        shown = Math.min(1, shown + (reduceMotion || goal - shown < 0.004 ? goal - shown : Math.max(eased, 0.0005)));
        rootRef.current?.style.setProperty("--p", shown.toFixed(4));
      }
      const next = readout(status, shown, readyAt);
      if (next !== labelText) {
        labelText = next;
        setLabel(next);
      }
      if (shown >= 1 && status === "ready") {
        frame = 0;
        setComplete(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    loop.current = {
      start: () => {
        if (frame === 0) {
          last = performance.now();
          frame = requestAnimationFrame(tick);
        }
      },
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      loop.current = null;
    };
  }, []);

  // The loop reads the latest props; a change after it has stopped wakes it.
  useEffect(() => {
    latest.current = { target, status, readyAt, reduceMotion: Boolean(reduceMotion) };
    loop.current?.start();
  }, [target, status, readyAt, reduceMotion]);

  useEffect(() => {
    // Hydrated in time: the no-JS failsafe (globals.css) stands down. Later than
    // that, the failsafe has already hidden the cover, and it must not come back.
    if (performance.now() < PRELOADER_FAILSAFE_MS) rootRef.current?.setAttribute("data-live", "");
  }, []);

  const announce = !hydrated
    ? ""
    : status === "failed"
      ? "The 3D scene could not load; opening the page"
      : status === "slow"
        ? "Still loading the 3D scene; opening the page"
        : complete
          ? "Ready"
          : "Loading 3D scene";

  // Once the name is complete, a click or Escape ends the hold early.
  const canSkip = complete && Boolean(onSkip);
  useEffect(() => {
    if (!canSkip) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSkip?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canSkip, onSkip]);

  return (
    <motion.div
      ref={rootRef}
      className="preloader fixed inset-0 z-[500] flex max-[550px]:hidden"
      style={{ "--p": "0" } as CSSProperties}
      // Reduced motion fades the whole cover at once (no column seams); otherwise the columns carry the exit.
      exit={reduceMotion ? { opacity: 0, pointerEvents: "none" } : { pointerEvents: "none" }}
      transition={{ duration: 0.3 }}
      onClick={canSkip ? onSkip : undefined}
    >
      {Array.from({ length: STAIR_COUNT }).map((_, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="relative h-full flex-1 overflow-hidden bg-[#05080c] -ml-px first:ml-0"
          initial={false}
          exit={reduceMotion ? undefined : { y: "-100%" }}
          transition={{ duration: 0.6, ease: EASE, delay: i * 0.07 }}
        >
          {/* Each column holds the whole composition, offset to its own slice, so the name leaves on the
              stairs. Columns overlap by 1px (no seams), so a column starts at i * (100% - 1px). */}
          <div
            className="absolute inset-y-0"
            style={{ left: `calc(${-i} * (100% - 1px))`, width: `calc(${STAIR_COUNT} * 100% - ${STAIR_COUNT - 1}px)` }}
          >
            <Composition drift={complete && !reduceMotion} label={label} />
          </div>
        </motion.div>
      ))}
      <span className="sr-only" role="status">
        {announce}
      </span>
    </motion.div>
  );
}
