"use client";

import { useSyncExternalStore } from "react";
import { isSfxMuted, subscribeSfxMuted } from "./useSfx";

const SRC = "/sounds/RoadsideFlowers.mp3";
/** Stopping fades out over this long instead of cutting off mid-phrase. */
const FADE_MS = 450;

// The opt-in background track, shared by the rail's button, the phone
// drawer's stop button and the project demos. Its state comes from the audio
// element's own events, so a pause from outside the page (media keys,
// headphones taken out, a call) shows on every button.
let audio: HTMLAudioElement | null = null;
/** Whether element volume can be set: iOS keeps it at 1, so a fade there would only delay the stop. */
let canFade = true;
let fading = 0;
/** Ends a fade that rAF stopped running (the tab was hidden mid-fade). */
let fadeBackstop = 0;
/** Finishes the fade in progress at once. */
let finishFade: (() => void) | null = null;
let playing = false;
const listeners = new Set<() => void>();

const update = () => {
  const next = Boolean(audio && !audio.paused && !audio.error && !fading);
  if (next === playing) return;
  playing = next;
  listeners.forEach((listener) => listener());
};

const element = () => {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = "none";
  audio.src = SRC;
  audio.volume = 0.5;
  canFade = audio.volume === 0.5;
  audio.volume = 1;
  ["play", "pause", "ended", "emptied"].forEach((type) => audio?.addEventListener(type, update));
  audio.addEventListener("error", drop);
  return audio;
};

/**
 * A file that failed to load leaves the element unpaused and refusing every
 * later play: let it go, so the controls read stopped and the next press
 * builds a fresh one that tries the file again.
 */
const drop = () => {
  const music = audio;
  if (music?.error) {
    music.pause();
    audio = null;
  }
  update();
};

const endFade = () => {
  window.cancelAnimationFrame(fading);
  window.clearTimeout(fadeBackstop);
  fading = 0;
  finishFade = null;
};

const cancelFade = () => {
  if (!fading) return;
  endFade();
  if (audio) audio.volume = 1;
};

const halt = (music: HTMLAudioElement) => {
  music.pause();
  music.currentTime = 0;
  music.volume = 1;
};

export const isMusicPlaying = () => playing;

export const subscribeMusic = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useMusicPlaying = () => useSyncExternalStore(subscribeMusic, isMusicPlaying, () => false);

/** Stops the music with a short fade, and rewinds it for the next play. */
export function stopMusic() {
  const music = audio;
  if (!music || music.paused || fading) return;
  if (!canFade || document.hidden) {
    halt(music);
    return;
  }
  const from = music.volume;
  const startedAt = performance.now();
  const finish = () => {
    endFade();
    halt(music);
    update();
  };
  const step = (now: number) => {
    // The first frame's time can come before the press that started the fade.
    const progress = Math.min(Math.max((now - startedAt) / FADE_MS, 0), 1);
    // Squared, so it falls away quickly and lands softly.
    music.volume = from * (1 - progress) ** 2;
    if (progress < 1) fading = window.requestAnimationFrame(step);
    else finish();
  };
  fading = window.requestAnimationFrame(step);
  fadeBackstop = window.setTimeout(finish, FADE_MS + 100);
  finishFade = finish;
  update();
}

/** Plays the music, or stops it if it is playing. A press while it fades out brings it back. */
export function toggleMusic() {
  const music = element();
  if (!music.paused && !fading) {
    stopMusic();
    return;
  }
  cancelFade();
  // A stop before the play resolves rejects it, and the events tell the state;
  // a file that won't load drops the element.
  music.play().catch(drop);
  update();
}

// Turning sounds off (on the rail or in the phone drawer) stops the music too.
// Playing it stays its own choice: muted sounds don't block it.
if (typeof window !== "undefined") {
  subscribeSfxMuted(() => {
    if (isSfxMuted()) stopMusic();
  });
  // A hidden tab runs no frames and throttles timers: a fade caught by it ends now.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) finishFade?.();
  });
}
