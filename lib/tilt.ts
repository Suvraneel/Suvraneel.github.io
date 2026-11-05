// ---------------------------------------------------------------------------
// Device tilt (DeviceOrientationEvent) for the phone portrait's relief.
//
// Android browsers send orientation events to any listener. iOS Safari (13+)
// sends none until the page asks with DeviceOrientationEvent.requestPermission(),
// and only from inside a user gesture: a tap on the portrait's "Tilt" chip.
// Recent Chromium exposes requestPermission as well, yet may send events
// without it: the chip is offered only until events are seen to arrive.
// Once granted, events reach the listeners already added, but listeners are
// told anyway (subscribeTilt), so one added before the grant starts afresh.
// ---------------------------------------------------------------------------

type PermissionState = "granted" | "denied" | "default";
type OrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

/** Degrees of tilt off the resting angle that turn the portrait as far as the pointer at a screen edge. */
export const TILT_RANGE_DEG = 18;
/** Seconds over which the resting angle follows the hand, so a held tilt slowly settles back to centre. */
export const TILT_RECENTRE_S = 2.5;
/** A change this large between the reading and the resting angle is a sensor flip, not a hand. */
const TILT_JUMP_DEG = 60;

let granted = false;
/** Orientation events with angles have arrived: tilt already works, nothing to ask. */
let live = false;
const listeners = new Set<() => void>();
const stateListeners = new Set<() => void>();
const notifyState = () => stateListeners.forEach((listener) => listener());

const watchForEvents = (event: DeviceOrientationEvent) => {
  if (event.beta == null || event.gamma == null) return;
  live = true;
  window.removeEventListener("deviceorientation", watchForEvents);
  notifyState();
};

/**
 * True where orientation events wait for a permission only a tap can ask for (iOS Safari), and none
 * have arrived. Read through useSyncExternalStore with subscribeTiltState: it turns false on its own.
 */
export function needsTiltPermission(): boolean {
  if (granted || live || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return false;
  return typeof (window.DeviceOrientationEvent as OrientationWithPermission).requestPermission === "function";
}

/** Calls `listener` when needsTiltPermission() may have changed. Watches for events while anyone listens. */
export function subscribeTiltState(listener: () => void): () => void {
  if (stateListeners.size === 0 && !live) window.addEventListener("deviceorientation", watchForEvents);
  stateListeners.add(listener);
  return () => {
    stateListeners.delete(listener);
    if (stateListeners.size === 0) window.removeEventListener("deviceorientation", watchForEvents);
  };
}

/** Asks for orientation events. Call from a tap: iOS refuses (and shows nothing) outside a user gesture. */
export async function requestTilt(): Promise<boolean> {
  const request = (window.DeviceOrientationEvent as OrientationWithPermission | undefined)?.requestPermission;
  if (typeof request !== "function") return true;
  try {
    granted = (await request.call(window.DeviceOrientationEvent)) === "granted";
  } catch {
    granted = false;
  }
  if (granted) listeners.forEach((listener) => listener());
  notifyState();
  return granted;
}

/** Calls `listener` when orientation events are granted (iOS), so it can listen afresh. */
export function subscribeTilt(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The device's tilt in the screen's own axes (degrees): x positive with the
 * screen's right edge tipped down, y positive with its top edge tipped away.
 * Null while the device reports no angles (no sensor).
 */
export function screenTilt(event: DeviceOrientationEvent, angle: number): { x: number; y: number } | null {
  const { beta, gamma } = event;
  if (beta == null || gamma == null) return null;
  switch (((angle % 360) + 360) % 360) {
    case 90:
      return { x: beta, y: -gamma };
    case 180:
      return { x: -gamma, y: -beta };
    case 270:
      return { x: -beta, y: gamma };
    default:
      return { x: gamma, y: beta };
  }
}

/**
 * Follows the device's tilt as a turn target in [-1, 1] on each axis, off a
 * resting angle that eases after the hand (TILT_RECENTRE_S). The first reading
 * is the rest, so the portrait starts flat however the phone is held.
 */
export function createTiltTracker() {
  let rest: { x: number; y: number } | null = null;
  let last = 0;
  const clamp = (value: number) => Math.min(Math.max(value, -1), 1);
  return (tilt: { x: number; y: number }, now: number) => {
    // gamma swings through ±90 as a phone passes upright: a jump that large starts from rest again.
    if (!rest || Math.abs(tilt.x - rest.x) > TILT_JUMP_DEG || Math.abs(tilt.y - rest.y) > TILT_JUMP_DEG) {
      rest = { ...tilt };
      last = now;
    }
    const follow = 1 - Math.exp(-Math.min(now - last, 1000) / 1000 / TILT_RECENTRE_S);
    last = now;
    rest.x += (tilt.x - rest.x) * follow;
    rest.y += (tilt.y - rest.y) * follow;
    return { x: clamp((tilt.x - rest.x) / TILT_RANGE_DEG), y: clamp((tilt.y - rest.y) / TILT_RANGE_DEG) };
  };
}
