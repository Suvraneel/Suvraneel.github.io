"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { getTransition, isInFlight, subscribeTransition } from "@components/transition/transitionStore";

/**
 * The site's sounds, one meaning each:
 * - tick: the pointer comes onto something clickable (mouse only)
 * - press: a click that goes somewhere or does something (a page, a link, a download, the music)
 * - open, close: a dialog opens or closes, a whoosh that moves with its panel
 *   (rising as it opens, falling as it closes)
 * - confirm: something finished (email copied, message sent, sounds back on)
 */
export type Sfx = "tick" | "press" | "open" | "close" | "confirm";

/** The few Howl methods used here; howler ships no types. */
type Howl = {
  play: (sprite?: string) => number | null;
  stop: (id: number) => void;
  state: () => "unloaded" | "loading" | "loaded";
  once: (event: "load" | "loaderror", listener: () => void) => void;
  unload: () => void;
};

type HowlOptions = {
  src: string[];
  volume: number;
  sprite?: Record<string, [number, number]>;
  onloaderror?: () => void;
};

type HowlerGlobal = { state: string; ctx?: AudioContext; _autoResume?: () => void; _autoSuspend?: () => void };

type HowlerModule = { Howl: new (options: HowlOptions) => Howl; Howler?: HowlerGlobal };

// Each file plays at one level, set so the clicks and whooshes land within
// about 2 LU of each other as heard and the rarer confirm sits above them.
const VOLUME: Record<Sfx, number> = { tick: 0.83, press: 0.7, open: 0.112, close: 0.141, confirm: 0.25 };

/**
 * Takes of one gesture, as [start, length] in ms within the file, so a run of
 * ticks or presses never repeats the same sample back to back. Each slot runs
 * 50 ms past its take: a decoder that ignores the AAC priming starts it later
 * but never cuts its tail or plays into the next one.
 */
const TAKES: Partial<Record<Sfx, [number, number][]>> = {
  tick: [[50, 95.3], [175.3, 92.4], [297.7, 83.5], [411.1, 81.8], [523, 78]],
  press: [[50, 103], [182, 146], [356, 156], [542, 203], [774, 143]],
};

/**
 * How late a sound may still start once its file has loaded. A press or
 * whoosh that would land after the motion it belongs to is dropped (a late
 * sound is worse than none); a completion is still worth hearing a moment later.
 */
const MAX_LATE_MS: Record<Sfx, number> = { tick: 0, press: 150, open: 150, close: 150, confirm: 1500 };

/** Hover ticks closer together than this (a fast sweep) skip, so a sweep isn't a buzz. */
const TICK_GAP_MS = 90;
/** A wheel or scroll moves things under a still pointer: no hover tick this soon after one. */
const AFTER_SCROLL_MS = 150;
/** Wait after the first pointer or key before loading, so the load stays out of that interaction's frames. */
const LOAD_AFTER_INPUT_MS = 1000;

/** Set while the visitor has sounds off; absent (the default) means on. */
const MUTED_KEY = "sfx:muted";

let howls: Record<Sfx, Howl> | null = null;
let howler: HowlerGlobal | null = null;
let loading: Promise<Record<Sfx, Howl> | null> | null = null;
let waitingForInput = false;
let waitingForSettle = false;
/** The latest pointer's type: a tap fires pointer events with "touch" before its mouse events. */
let lastPointerType = "mouse";
/** Where the last pointermove left the pointer. */
let lastMove: { x: number; y: number } | null = null;
/**
 * The latest pointerout or pointerover came with the pointer exactly where it
 * already was: the page moved under a still hand (a scroll, a dialog closing,
 * a page arriving), so the hover it starts gets no tick. A real move shows a
 * new position, because boundary events fire before the pointermove that
 * causes them. Both are watched: React starts onMouseEnter from the old
 * target's mouseout, which WebKit fires before the new target's pointerover.
 */
let pointerStill = true;
let lastScrollAt = -Infinity;
let lastTickAt = -Infinity;
const lastTake: Partial<Record<Sfx, number>> = {};

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

const spriteOf = (name: Sfx) => {
  const takes = TAKES[name];
  return takes && Object.fromEntries(takes.map((take, index) => [`take${index}`, take]));
};

/** A take other than the last one played, or undefined for a single-sound file. */
const nextTake = (name: Sfx) => {
  const takes = TAKES[name];
  if (!takes) return undefined;
  const last = lastTake[name];
  let index = Math.floor(Math.random() * (last === undefined ? takes.length : takes.length - 1));
  if (last !== undefined && index >= last) index += 1;
  lastTake[name] = index;
  return `take${index}`;
};

/** howler and one Howl per sound, created once and shared by every component. */
function loadSfx() {
  loading ??= import("howler")
    .then((mod: HowlerModule & { default?: HowlerModule }) => {
      const lib = mod.Howl ? mod : mod.default;
      if (!lib?.Howl) throw new Error("howler has no Howl export");
      const { Howl } = lib;
      howler = lib.Howler ?? null;
      // AAC is a fraction of the size; the WAV plays where AAC can't. A file
      // that fails to load (a 404, a bad decode) retries once as the WAV.
      const howl = (name: Sfx, src = [`/sounds/${name}.m4a`, `/sounds/${name}.wav`]): Howl =>
        new Howl({
          src,
          volume: VOLUME[name],
          sprite: spriteOf(name),
          onloaderror: () => {
            if (!howls || src.length < 2) return;
            howls[name].unload();
            howls[name] = howl(name, src.slice(1));
          },
        });
      howls = {
        tick: howl("tick"),
        press: howl("press"),
        open: howl("open"),
        close: howl("close"),
        confirm: howl("confirm"),
      };
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
 * Loads the sounds now, in idle time: for a moment that will play one soon
 * without a pointer having moved first (a keyboard-filled form), so the load
 * doesn't land on the animation that sound accompanies.
 */
export function warmSfx() {
  if (loading || muted) return;
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
    if (loading || waitingForSettle || muted) return;
    if (!isInFlight(getTransition())) {
      void loadSfx();
      return;
    }
    waitingForSettle = true;
    const unsubscribe = subscribeTransition(() => {
      if (isInFlight(getTransition())) return;
      unsubscribe();
      waitingForSettle = false;
      // Sounds turned off meanwhile: an un-mute loads them on demand.
      if (!muted) void loadSfx();
    });
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 1000 });
  // Safari has no idle callback: after the next frame rather than inside it.
  else requestAnimationFrame(() => setTimeout(load, 0));
}

/**
 * Sounds load after the visitor's first pointer move, press or key, not with
 * the page, and not inside that input's response either: compiling howler and
 * creating the audio context is a long task on a phone, which would stall the
 * very animation the tap started. Visitors with sounds off load nothing.
 */
function loadOnFirstInput() {
  if (loading || waitingForInput || muted) return;
  waitingForInput = true;
  const events = ["pointermove", "pointerdown", "keydown"] as const;
  const start = () => {
    events.forEach((type) => window.removeEventListener(type, start, true));
    window.setTimeout(loadInIdleTime, LOAD_AFTER_INPUT_MS);
  };
  events.forEach((type) => window.addEventListener(type, start, { capture: true, passive: true }));
}

/**
 * howler suspends the audio context after 30 s of quiet, and the next sound
 * then waits for it to resume, landing after the render its click caused.
 * Resuming on the press or key that comes before the click wins that time
 * back, and the 30 s count restarts, in case no sound follows. A running
 * context is left alone: poking it would cancel the suspend.
 */
const resumeAudio = () => {
  if (!howler || (howler.state === "running" && howler.ctx?.state !== "interrupted")) return;
  howler._autoResume?.();
  howler._autoSuspend?.();
};

function watchInput() {
  const options = { capture: true, passive: true } as const;
  window.addEventListener("pointermove", (event) => {
    lastMove = { x: event.clientX, y: event.clientY };
  }, options);
  // Layout-driven boundary events repeat the last position exactly; a slow
  // real move can shift it by less than a pixel.
  const classify = (event: PointerEvent) => {
    lastPointerType = event.pointerType;
    pointerStill = !lastMove || (event.clientX === lastMove.x && event.clientY === lastMove.y);
    // Moves inside an iframe (the scheduler) never reach this page, so the
    // position is unknown until the next move here.
    if (event.type === "pointerover" && event.target instanceof HTMLIFrameElement) lastMove = null;
  };
  window.addEventListener("pointerout", classify, options);
  window.addEventListener("pointerover", classify, options);
  window.addEventListener("pointerdown", (event) => {
    lastPointerType = event.pointerType;
    resumeAudio();
  }, options);
  window.addEventListener("keydown", resumeAudio, options);
  const noteScroll = () => {
    lastScrollAt = performance.now();
  };
  window.addEventListener("wheel", noteScroll, options);
  window.addEventListener("scroll", noteScroll, options);
}
if (typeof window !== "undefined") watchInput();

/**
 * Before the visitor's first press or key, the browser keeps audio suspended,
 * and howler queues every play until it resumes: the queue would then sound
 * all at once on that first click. Such plays are dropped instead.
 */
const canSoundYet = () =>
  typeof navigator === "undefined" || !navigator.userActivation || navigator.userActivation.hasBeenActive;

/** A hover tick needs a hovering mouse that moved onto the target, not a sweep's next row. */
const tickWanted = (now: number) =>
  lastPointerType !== "touch" &&
  !pointerStill &&
  now - lastScrollAt >= AFTER_SCROLL_MS &&
  now - lastTickAt >= TICK_GAP_MS;

/**
 * A UI sound effect as `[play, { stop }]`, like use-sound, but every component
 * shares one Howl per sound. `stop` ends this component's latest play.
 */
export function useSfx(name: Sfx) {
  const latest = useRef<number | null>(null);
  // Bumped by stop, so a play still waiting for its file is dropped.
  const generation = useRef(0);

  useEffect(() => loadOnFirstInput(), []);

  const play = useCallback(() => {
    if (muted || !canSoundYet()) return;
    const cuedAt = performance.now();
    if (name === "tick") {
      if (!tickWanted(cuedAt)) return;
      // A hover never waits for a load: it starts one, and a later hover sounds.
      if (howls?.tick.state() !== "loaded") {
        loadInIdleTime();
        return;
      }
      lastTickAt = cuedAt;
    }
    const at = generation.current;
    const sound = () => {
      // Sounds turned off, or this play stopped, while its file was loading.
      if (muted || at !== generation.current) return;
      const id = howls?.[name].play(nextTake(name)) ?? null;
      if (id !== null) latest.current = id;
    };
    const soundIfOnTime = () => {
      if (performance.now() - cuedAt <= MAX_LATE_MS[name]) sound();
    };
    const start = (sfx: Record<Sfx, Howl>) => {
      const howl = sfx[name];
      if (howl.state() === "loaded") {
        soundIfOnTime();
        return;
      }
      howl.once("load", soundIfOnTime);
      // Its file failed: wait on the WAV that replaces it, within the same
      // deadline. howler calls this before the swap in onloaderror, so look
      // once that has run.
      howl.once("loaderror", () => {
        window.setTimeout(() => {
          if (sfx[name] !== howl) start(sfx);
        }, 0);
      });
    };
    // Loaded: start in this tick, so a click sound isn't held behind the render it triggers.
    if (howls?.[name].state() === "loaded") {
      sound();
      return;
    }
    if (howls) {
      start(howls);
      return;
    }
    void loadSfx().then((sfx) => {
      if (sfx) start(sfx);
    });
  }, [name]);

  const stop = useCallback(() => {
    generation.current += 1;
    if (latest.current !== null) howls?.[name].stop(latest.current);
    latest.current = null;
  }, [name]);

  return [play, { stop }] as const;
}
