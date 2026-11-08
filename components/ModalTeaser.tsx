"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import LiquidMetalButton from "@components/LiquidMetalButton";
import { PlayIcon } from "@components/animate-ui/icons/play";
import { VolumeIcon } from "@components/animate-ui/icons/volume";
import { stopMusic } from "@hooks/useMusic";

/** Self-hosted teasers: `{id}.teaser.webm` / `.mp4`, and `{id}.teaser.webp`, their opening frame. */
export const TEASERS = "/images/project-assets/teasers";

type NetworkInformation = { saveData?: boolean };

/** A round glass control in the frame's corner, 44px for touch. */
const ROUND =
  "grid size-11 place-items-center rounded-full bg-black/45 text-white/85 ring-1 ring-white/15 backdrop-blur-md transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/60 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

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
 * The project's teaser, the dialog's first picture: it plays in full, with its
 * soundtrack, once the frame has landed (`active`), and loops. Pause and sound
 * sit in the corner; where there is a narrated walkthrough on YouTube, a button
 * hands the frame over to it. Reduced motion and Save-Data leave it on its
 * opening frame, fetching nothing, until played.
 */
export default function ModalTeaser({
  id,
  name,
  active,
  onFrame,
  onWalkthrough,
}: Readonly<{
  id: string;
  name: string;
  /** The frame has landed and the dialog is staying. */
  active: boolean;
  /** The teaser has a frame to show (its poster, or its own first frame): the tile's still can go. */
  onFrame?: () => void;
  /** Hands the frame over to the narrated walkthrough. */
  onWalkthrough?: () => void;
}>) {
  const video = useRef<HTMLVideoElement>(null);
  const started = useRef(false);
  // Playing is still wanted: the dialog is staying and the viewer hasn't paused it.
  const wanted = useRef(false);
  const reported = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const [walkthroughHovered, setWalkthroughHovered] = useState(false);
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
    if (element.paused) {
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
        loop
        playsInline
        onLoadedData={frameShown}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onVolumeChange={(event) => setSound(!event.currentTarget.muted)}
        aria-label={`${name} teaser`}
      >
        <source src={`${TEASERS}/${id}.teaser.webm`} type="video/webm" />
        <source src={`${TEASERS}/${id}.teaser.mp4`} type="video/mp4" />
      </video>
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
      {onWalkthrough && (
        <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5">
          <LiquidMetalButton
            ariaLabel={`Watch walkthrough: ${name}, narrated`}
            onClick={() => {
              wanted.current = false;
              video.current?.pause();
              onWalkthrough();
            }}
            onMouseEnter={() => setWalkthroughHovered(true)}
            onMouseLeave={() => setWalkthroughHovered(false)}
          >
            <PlayIcon aria-hidden="true" size={16} animate={walkthroughHovered} />
            <span className="sm:hidden">Walkthrough</span>
            <span className="max-sm:hidden">Watch walkthrough</span>
          </LiquidMetalButton>
        </div>
      )}
      <div className="absolute bottom-4 right-4 flex gap-2 sm:bottom-5 sm:right-5">
        <button type="button" className={ROUND} aria-label={playing ? "Pause the teaser" : "Play the teaser"} onClick={togglePlay}>
          {playing ? (
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
