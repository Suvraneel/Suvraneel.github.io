"use client";

import { useCallback, useEffect, useRef } from "react";

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

let howls: Record<Sfx, Howl> | null = null;
let loading: Promise<Record<Sfx, Howl> | null> | null = null;
let waitingForPointer = false;

/** howler and one Howl per sound, created once and shared by every component. */
function loadSfx() {
  loading ??= import("howler")
    .then((mod: HowlerModule & { default?: HowlerModule }) => {
      const Howl = mod.Howl ?? mod.default.Howl;
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

/** Sounds load on the visitor's first pointer move or press, not with the page. */
function loadOnFirstPointer() {
  if (loading || waitingForPointer) return;
  waitingForPointer = true;
  const start = () => {
    window.removeEventListener("pointermove", start, true);
    window.removeEventListener("pointerdown", start, true);
    void loadSfx();
  };
  window.addEventListener("pointermove", start, { capture: true, passive: true });
  window.addEventListener("pointerdown", start, { capture: true, passive: true });
}

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
    const at = generation.current;
    const start = (sfx: Record<Sfx, Howl>) => {
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
