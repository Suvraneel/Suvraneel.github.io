"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { getTransition, isInFlight, subscribeTransition } from "@components/transition/transitionStore";

export type Sfx = "snap" | "pop" | "confirm";

/** The few Howl methods used here; howler ships no types. */
type Howl = {
  play: () => number | null;
  stop: (id: number) => void;
  volume: (volume: number, id: number) => void;
};

type HowlerModule = { Howl: new (options: { src: string[]; volume: number }) => Howl };

// Each Howl starts at the volume its sound usually plays at: a play that waits
// for the audio context to resume only gets its own volume a moment after it starts.
const BASE_VOLUME: Record<Sfx, number> = { snap: 0.25, pop: 0.45, confirm: 0.25 };
/** "snap" is the hover sound: it answers a hovering pointer, never a tap's compatibility mouseenter. */
const HOVER_SFX: Record<Sfx, boolean> = { snap: true, pop: false, confirm: false };
/** Wait after the first pointer before loading, so the load stays out of that interaction's frames. */
const LOAD_AFTER_POINTER_MS = 1000;

/** Set while the visitor has sounds off; absent (the default) means on. */
const MUTED_KEY = "sfx:muted";

let howls: Record<Sfx, Howl> | null = null;
let loading: Promise<Record<Sfx, Howl> | null> | null = null;
let waitingForPointer = false;
let waitingForSettle = false;
/** The latest pointer's type: a tap fires pointer events with "touch" before its mouse events. */
let lastPointerType = "mouse";

// Sounds on or off for the whole site: every play checks it, every toggle
// (rail and drawer) reads and flips the same flag, and it is remembered for
// the next visit.
const readMuted = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    // Storage unavailable: sounds start on, as they always have.
    return false;
  }
};

let muted = readMuted();
const mutedListeners = new Set<() => void>();

export const isSfxMuted = () => muted;

export const subscribeSfxMuted = (listener: () => void) => {
  mutedListeners.add(listener);
  return () => {
    mutedListeners.delete(listener);
  };
};

export const toggleSfxMuted = () => {
  muted = !muted;
  try {
    if (muted) window.localStorage.setItem(MUTED_KEY, "1");
    else window.localStorage.removeItem(MUTED_KEY);
  } catch {
    // Storage unavailable: the choice still holds for this visit.
  }
  mutedListeners.forEach((listener) => listener());
};

/** Whether sounds are off. The static HTML (and hydration) render them on; a stored "off" follows straight after. */
export const useSfxMuted = () => useSyncExternalStore(subscribeSfxMuted, isSfxMuted, () => false);

/** howler and one Howl per sound, created once and shared by every component. */
function loadSfx() {
  loading ??= import("howler")
    .then((mod: HowlerModule & { default?: HowlerModule }) => {
      const Howl = mod.Howl ?? mod.default?.Howl;
      if (!Howl) throw new Error("howler has no Howl export");
      // AAC is a tenth of the size; the WAV plays where AAC can't.
      const howl = (name: Sfx) =>
        new Howl({ src: [`/sounds/${name}.m4a`, `/sounds/${name}.wav`], volume: BASE_VOLUME[name] });
      howls = { snap: howl("snap"), pop: howl("pop"), confirm: howl("confirm") };
      return howls;
    })
    .catch(() => {
      // A flourish, never an error: stay silent and retry on the next play.
      loading = null;
      return null;
    });
  return loading;
}

/**
 * Sounds load after the visitor's first pointer move or press, not with the
 * page, and not inside that press's response either: compiling howler and
 * creating the audio context is a long task on a phone, which would stall the
 * very animation the tap started. A sound asked for sooner loads on demand.
 */
/**
 * Loads the sounds now, in idle time: for a moment that will play one soon
 * without a pointer having moved first (a keyboard-filled form), so the load
 * doesn't land on the animation that sound accompanies.
 */
export function warmSfx() {
  if (loading) return;
  loadInIdleTime();
}

/**
 * Idle time is not enough on its own: idle callbacks still fire while a page
 * lift plays on the compositor, and evaluating howler is a 100+ ms long task
 * that would stall it. A load that comes due while a transition is in flight
 * waits for it to settle and starts right after.
 */
function loadInIdleTime() {
  const load = () => {
    if (loading || waitingForSettle) return;
    if (!isInFlight(getTransition())) {
      void loadSfx();
      return;
    }
    waitingForSettle = true;
    const unsubscribe = subscribeTransition(() => {
      if (isInFlight(getTransition())) return;
      unsubscribe();
      waitingForSettle = false;
      void loadSfx();
    });
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 1000 });
  else load();
}

function loadOnFirstPointer() {
  if (loading || waitingForPointer) return;
  waitingForPointer = true;
  const start = () => {
    window.removeEventListener("pointermove", start, true);
    window.removeEventListener("pointerdown", start, true);
    window.setTimeout(loadInIdleTime, LOAD_AFTER_POINTER_MS);
  };
  window.addEventListener("pointermove", start, { capture: true, passive: true });
  window.addEventListener("pointerdown", start, { capture: true, passive: true });
}

function trackPointerType() {
  const note = (event: PointerEvent) => {
    lastPointerType = event.pointerType;
  };
  window.addEventListener("pointerover", note, { capture: true, passive: true });
  window.addEventListener("pointerdown", note, { capture: true, passive: true });
}
if (typeof window !== "undefined") trackPointerType();

/**
 * Before the visitor's first press or key, the browser keeps audio suspended,
 * and howler queues every play until it resumes: the queue would then sound
 * all at once on that first click. Such plays are dropped instead.
 */
const canSoundYet = () =>
  typeof navigator === "undefined" || !navigator.userActivation || navigator.userActivation.hasBeenActive;

/**
 * A UI sound effect as `[play, { stop }]`, like use-sound, but every component
 * shares one Howl per sound. `stop` ends this component's latest play.
 */
export function useSfx(name: Sfx, { volume }: { volume: number }) {
  const latest = useRef<number | null>(null);
  // Bumped by stop, so a play still waiting for howler is dropped.
  const generation = useRef(0);

  useEffect(() => loadOnFirstPointer(), []);

  const play = useCallback(() => {
    if (muted || !canSoundYet() || (HOVER_SFX[name] && lastPointerType === "touch")) return;
    const at = generation.current;
    const start = (sfx: Record<Sfx, Howl>) => {
      // Sounds turned off while howler was still loading.
      if (muted) return;
      const id = sfx[name].play();
      if (id === null) return;
      sfx[name].volume(volume, id);
      latest.current = id;
    };
    // Loaded: start in this tick, so a click sound isn't held behind the render it triggers.
    if (howls) {
      start(howls);
      return;
    }
    void loadSfx().then((sfx) => {
      if (sfx && at === generation.current) start(sfx);
    });
  }, [name, volume]);

  const stop = useCallback(() => {
    generation.current += 1;
    if (latest.current !== null) howls?.[name].stop(latest.current);
    latest.current = null;
  }, [name]);

  return [play, { stop }] as const;
}
