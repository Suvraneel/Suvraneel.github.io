"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { PlayIcon } from "@components/animate-ui/icons/play";
import { VolumeIcon } from "@components/animate-ui/icons/volume";
import { stopMusic } from "@hooks/useMusic";

/** Self-hosted teasers: `{id}.teaser.webm` / `.mp4`, and `{id}.teaser.webp`, their opening frame. */
export const TEASERS = "/images/project-assets/teasers";

type NetworkInformation = { saveData?: boolean };

/** Teasers may fade out over their last few frames (StakeOverflow's runs 0.3 s): it rests this far before the end. */
const REST_BEFORE_END_S = 0.4;

/** A round glass control in the frame's corner: 36px on phones, where the frame is small, 44px above. */
const ROUND =
  "grid size-9 place-items-center sm:size-11 rounded-full bg-black/45 text-white/85 ring-1 ring-white/15 backdrop-blur-md transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/60 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

/**
 * Plays `video` with sound, or muted where the browser refuses sound
 * (NotAllowedError: no gesture it accepts, as on a dialog opened from a link or
 * history). Any other rejection (a pause or close cutting the start short, a
 * missing file) is left alone, and so is a teaser no longer wanted by the time
 * the refusal arrives. The element's own volumechange keeps the sound button true.
 */
async function playTeaser(video: HTMLVideoElement, withSound: boolean, wanted: () => boolean) {
  video.muted = !withSound;
  try {
    await video.play();
  } catch (error) {
    const refused = error instanceof DOMException && error.name === "NotAllowedError";
    if (!withSound || !refused || !video.isConnected || !wanted()) return;
    video.muted = true;
    await video.play().catch(() => undefined);
  }
  if (!video.muted) stopMusic();
}

/**
 * The project's teaser, the dialog's first picture: it plays once in full, with
 * its soundtrack, once the frame has landed (`active`), then rests on its
 * closing card, where the play button turns into Replay. Pause and sound
 * sit in the corner (a narrated walkthrough, where there is one, is offered
 * among the dialog's actions). Reduced motion and Save-Data leave it on its
 * opening frame, fetching nothing, until played.
 */
export default function ModalTeaser({
  id,
  name,
  active,
  onFrame,
}: Readonly<{
  id: string;
  name: string;
  /** The frame has landed and the dialog is staying. */
  active: boolean;
  /** The teaser has a frame to show (its poster, or its own first frame): the tile's still can go. */
  onFrame?: () => void;
}>) {
  const video = useRef<HTMLVideoElement>(null);
  const started = useRef(false);
  // Playing is still wanted: the dialog is staying and the viewer hasn't paused it.
  const wanted = useRef(false);
  const reported = useRef(false);
  const [playing, setPlaying] = useState(false);
  // It has played to its closing card, and rests there until replayed.
  const [ended, setEnded] = useState(false);
  const [sound, setSound] = useState(false);
  const reduceMotion = useReducedMotion();
  const [lean] = useState(
    () => typeof navigator !== "undefined" && (navigator as Navigator & { connection?: NetworkInformation }).connection?.saveData === true
  );
  const autoplays = !reduceMotion && !lean;

  const frameShown = () => {
    if (reported.current) return;
    reported.current = true;
    onFrame?.();
  };

  // Mounted inside the click (or tap) that opened the dialog: a play that click
  // starts, paused at once, is what WebKit needs to let the teaser's sound play
  // later, once the frame has landed. Other browsers carry the click's leave
  // over by themselves. Muted until then, so the button and the element agree.
  useLayoutEffect(() => {
    const element = video.current;
    if (!element) return;
    element.muted = true;
    if (!autoplays || navigator.userActivation?.isActive !== true) return;
    element.muted = false;
    element.play().catch(() => undefined);
    element.pause();
    element.muted = true;
    // Once, as it mounts: the click is over by any later run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The poster is the teaser's first frame: once it has decoded, the tile's still can dissolve into it.
  useEffect(() => {
    let live = true;
    const image = new Image();
    image.src = `${TEASERS}/${id}.teaser.webp`;
    image.decode().then(
      () => live && frameShown(),
      () => undefined
    );
    return () => {
      live = false;
    };
    // frameShown reports once, whatever closure calls it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Starts once, with sound, as the frame lands. Paused as the dialog goes.
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (!active) {
      wanted.current = false;
      element.pause();
      return;
    }
    if (!autoplays || started.current) return;
    started.current = true;
    wanted.current = true;
    playTeaser(element, true, () => wanted.current);
  }, [active, autoplays]);

  const togglePlay = () => {
    const element = video.current;
    if (!element) return;
    if (!element.paused) {
      wanted.current = false;
      element.pause();
      return;
    }
    // From its closing card, Replay starts it over.
    if (ended) element.currentTime = 0;
    // A first play (reduced motion, Save-Data) brings the sound; later ones keep the viewer's choice.
    const first = !started.current;
    started.current = true;
    wanted.current = true;
    playTeaser(element, first || !element.muted, () => wanted.current);
  };

  const toggleSound = () => {
    const element = video.current;
    if (!element) return;
    if (sound) {
      element.muted = true;
      return;
    }
    element.muted = false;
    stopMusic();
    // Paused midway, sound on carries on playing; resting on its closing card, it stays there.
    if (element.paused && !ended) {
      started.current = true;
      wanted.current = true;
      playTeaser(element, true, () => wanted.current);
    }
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={video}
        className="h-full w-full object-cover"
        poster={`${TEASERS}/${id}.teaser.webp`}
        preload={autoplays ? "metadata" : "none"}
        playsInline
        onLoadedData={frameShown}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
        }}
        onPause={() => setPlaying(false)}
        onEnded={(event) => {
          wanted.current = false;
          setEnded(true);
          // Rests on the closing card itself, not a fade-out's last dark frame.
          const element = event.currentTarget;
          element.currentTime = Math.max(0, element.duration - REST_BEFORE_END_S);
        }}
        onVolumeChange={(event) => setSound(!event.currentTarget.muted)}
        aria-label={`${name} teaser`}
      >
        <source src={`${TEASERS}/${id}.teaser.webm`} type="video/webm" />
        <source src={`${TEASERS}/${id}.teaser.mp4`} type="video/mp4" />
      </video>
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute bottom-2.5 right-2.5 flex gap-1.5 sm:bottom-5 sm:right-5 sm:gap-2">
        <button
          type="button"
          className={ROUND}
          aria-label={ended ? "Replay the teaser" : playing ? "Pause the teaser" : "Play the teaser"}
          onClick={togglePlay}
        >
          {ended ? (
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.75 8a5.25 5.25 0 1 0 1.6-3.78" />
              <path d="M2.5 2.5v2.75h2.75" />
            </svg>
          ) : playing ? (
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="3" y="2" width="2.6" height="10" rx="0.8" />
              <rect x="8.4" y="2" width="2.6" height="10" rx="0.8" />
            </svg>
          ) : (
            <PlayIcon aria-hidden="true" size={16} />
          )}
        </button>
        <button type="button" className={ROUND} aria-label={sound ? "Mute the teaser" : "Unmute the teaser"} onClick={toggleSound}>
          <VolumeIcon aria-hidden="true" size={17} muted={!sound} />
        </button>
      </div>
    </div>
  );
}
