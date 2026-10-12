import { useSyncExternalStore } from "react";
import {
  GESTURE_CAP_MS,
  GESTURE_GAP_MS,
  LANDING_MS,
  MOMENTUM_MAX_MS,
  SUSTAIN_LOOKBACK_MS,
  SUSTAIN_MEDIAN_RATIO,
  SUSTAIN_MIN_PX,
  SUSTAIN_SUM_RATIO,
  SUSTAIN_WINDOW_MS,
  TAIL_RISE_FACTOR,
  TAIL_RISE_SLACK_PX,
  type PageTransition,
} from "@lib/pageTransition";

// ---------------------------------------------------------------------------
// Transition state: a tiny module store so layers, the scene and the page
// handlers (including the exiting copies, which keep live listeners) all read
// the same in-flight transition without prop drilling or context churn.
// ---------------------------------------------------------------------------

let current: PageTransition | null = null;
const listeners = new Set<() => void>();

export const getTransition = () => current;

export const subscribeTransition = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setTransition = (next: PageTransition | null) => {
  current = next;
  listeners.forEach((listener) => listener());
};

const getServerSnapshot = () => null;

export const useTransitionState = () =>
  useSyncExternalStore(subscribeTransition, getTransition, getServerSnapshot);

export const isInFlight = (t: PageTransition | null): t is PageTransition => Boolean(t && !t.settled);

// ---------------------------------------------------------------------------
// Navigation lock. Held from navigate() until settle().
// ---------------------------------------------------------------------------

let locked = false;
let lastSettleAt = Number.NEGATIVE_INFINITY;
let lastStartAt = Number.NEGATIVE_INFINITY;

export const isTransitionLocked = () => locked;
export const setTransitionLocked = (value: boolean) => {
  locked = value;
};
export const getLastSettleAt = () => lastSettleAt;
export const markSettled = (at: number) => {
  lastSettleAt = at;
};
/** performance.now() of the latest navigate() that started a transition. */
export const getLastStartAt = () => lastStartAt;
export const markStarted = (at: number) => {
  lastStartAt = at;
};

// ---------------------------------------------------------------------------
// Layer registry: each PageLayer registers its DOM nodes and (while exiting)
// its AnimatePresence release callback, so one coordinator can start every
// animation of a transition in the same frame.
// ---------------------------------------------------------------------------

export type LayerHandle = {
  el: HTMLDivElement | null;
  scrim: HTMLDivElement | null;
  freeze: HTMLDivElement | null;
  isPresent: boolean;
  safeToRemove: (() => void) | null;
};

export const layerRegistry = new Map<string, LayerHandle>();

// ---------------------------------------------------------------------------
// Gesture gate: after a transition settles, the tail of the same trackpad
// gesture (events closer than GESTURE_GAP_MS, same direction) is swallowed so
// it cannot scroll or re-trigger the newly arrived page. A gap or a direction
// change ends it at once. Momentum only ever decays, so input that is as fast
// as it was SUSTAIN_LOOKBACK_MS earlier (a mouse wheel kept spinning, a finger
// still dragging) is live scrolling: it flows on once LANDING_MS has shown the
// arrived page's top. Past GESTURE_CAP_MS an event clearly stronger than the
// tail's level is a fresh gesture too. MOMENTUM_MAX_MS bounds the whole tail.
// ---------------------------------------------------------------------------

type WheelSample = { at: number; magnitude: number };

let gateArmedAt: number | null = null;
/** Smallest |deltaY| of the gated tail so far (null until its first event). */
let tailLevel: number | null = null;
/** Recent events of the current gesture (no gap, one direction), oldest first. */
let samples: WheelSample[] = [];
let gestureStartAt = Number.NEGATIVE_INFINITY;
let lastWheelAt = Number.NEGATIVE_INFINITY;
let lastWheelSign = 0;
let lastEvent: WheelEvent | null = null;
let lastVerdict = false;

const now = () => window.performance.now();

const disarm = () => {
  gateArmedAt = null;
  tailLevel = null;
};

/** A tail event this much stronger than the tail's level starts a new gesture. */
const isRise = (magnitude: number) =>
  tailLevel !== null && magnitude > tailLevel * TAIL_RISE_FACTOR + TAIL_RISE_SLACK_PX;

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/**
 * True when the gesture is moving at least as fast now as it was
 * SUSTAIN_LOOKBACK_MS ago. Rates are summed over equal half-open windows, so
 * wheel events the browser coalesced while busy (one event carrying several
 * deltas) do not read as a speed-up; the sum may dip by about one event of
 * window-edge jitter. A momentum tail also shrinks event by event, so the
 * typical (median) event must keep its size too; a mouse wheel kept spinning
 * or a finger still dragging does, a tail never does.
 */
const isSustained = (stamp: number) => {
  const recentFrom = stamp - SUSTAIN_WINDOW_MS;
  const earlierTo = stamp - SUSTAIN_LOOKBACK_MS;
  const earlierFrom = earlierTo - SUSTAIN_WINDOW_MS;
  // Both windows must lie inside this gesture.
  if (gestureStartAt > earlierFrom) return false;
  const recent: number[] = [];
  const earlier: number[] = [];
  for (const sample of samples) {
    if (sample.at > recentFrom) recent.push(sample.magnitude);
    else if (sample.at >= earlierFrom && sample.at < earlierTo) earlier.push(sample.magnitude);
  }
  if (recent.length === 0 || earlier.length === 0) return false;
  const recentSum = recent.reduce((sum, value) => sum + value, 0);
  const earlierSum = earlier.reduce((sum, value) => sum + value, 0);
  return (
    recentSum >= SUSTAIN_MIN_PX &&
    recentSum >= earlierSum * SUSTAIN_SUM_RATIO &&
    median(recent) >= median(earlier) * SUSTAIN_MEDIAN_RATIO
  );
};

export const gestureGate = {
  arm(at: number) {
    gateArmedAt = at;
    tailLevel = null;
  },
  /** Records the wheel event and returns true when it belongs to a gated gesture tail. */
  swallow(event: WheelEvent): boolean {
    if (event === lastEvent) return lastVerdict;
    const at = now();
    const sign = Math.sign(event.deltaY);
    const magnitude = Math.abs(event.deltaY);
    const gap = at - lastWheelAt;
    const sameGesture = gap < GESTURE_GAP_MS && sign === lastWheelSign;
    let verdict = false;

    // Rates use the time each event was generated, not when a busy main
    // thread got round to it, so a delayed burst does not read as a speed-up.
    const stamp = Number.isFinite(event.timeStamp) && event.timeStamp > 0 ? event.timeStamp : at;
    if (!sameGesture) {
      samples = [];
      gestureStartAt = stamp;
    }
    samples.push({ at: stamp, magnitude });
    while (samples.length > 0 && stamp - samples[0].at > SUSTAIN_LOOKBACK_MS + SUSTAIN_WINDOW_MS) {
      samples.shift();
    }

    if (gateArmedAt !== null) {
      const age = at - gateArmedAt;
      if (
        !sameGesture ||
        age > MOMENTUM_MAX_MS ||
        (age >= LANDING_MS && isSustained(stamp)) ||
        (age > GESTURE_CAP_MS && isRise(magnitude))
      ) {
        disarm();
      } else {
        verdict = true;
        tailLevel = tailLevel === null ? magnitude : Math.min(tailLevel, magnitude);
      }
    }

    lastWheelAt = at;
    lastWheelSign = sign;
    lastEvent = event;
    lastVerdict = verdict;
    return verdict;
  },
  canStart(): boolean {
    if (gateArmedAt === null) return true;
    const at = now();
    if (at - gateArmedAt > MOMENTUM_MAX_MS || at - lastWheelAt >= GESTURE_GAP_MS) {
      disarm();
      return true;
    }
    // Still inside a gated tail: a fresh gesture has already disarmed the gate
    // through swallow(), so whatever is asking now belongs to the old one.
    return false;
  },
};
