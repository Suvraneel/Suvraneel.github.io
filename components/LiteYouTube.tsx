"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import LiquidMetalButton from "@components/LiquidMetalButton";
import { PlayIcon } from "@components/animate-ui/icons/play";
import { SquareArrowOutUpRightIcon } from "@components/animate-ui/icons/square-arrow-out-up-right";
import { EASE_FADE, FADE_MS, cssEase } from "@lib/pageTransition";

const videoIdOf = (src: string) => src.match(/(?:embed\/|v=|youtu\.be\/)([\w-]{11})/)?.[1] ?? null;

const PLAYER_ORIGIN = "https://www.youtube-nocookie.com";
/** Unstarted or cued this long after ready: autoplay was refused (iOS, a browser setting), so YouTube's own play button is needed. */
const AUTOPLAY_REFUSED_GRACE_MS = 400;
/** A frame that has loaded but never answers is an error page (an ad blocker, a firewall, offline). */
const SILENT_AFTER_LOAD_MS = 1500;
/** Still on its initial about:blank this long after Play: the request failed or hangs (WebKit fires no load for a failed frame). */
const NEVER_NAVIGATED_MS = 8000;
/** A loaded player that has answered but still isn't playing (a slow first segment) is shown anyway after this... */
const PLAYER_START_TIMEOUT_MS = 4000;
/** ...and only this long after it loaded and answered, so a late-arriving player gets its own chance to start. */
const PLAYER_SETTLE_MS = 1500;
/**
 * While loading the frame sits at 1%, not 0: Chrome doesn't draw a fully
 * transparent iframe, so YouTube's thumbnail would only paint mid-fade, over
 * the player's black. 1% over our poster is invisible.
 */
const LOADING_OPACITY = 0.01;
const PLAYER_FADE = `opacity ${FADE_MS}ms ${cssEase(EASE_FADE)}`;

/**
 * poster: ours, with the play button. loading: the player is starting under
 * the poster, still invisible. shown: it fades in over the poster. player: the
 * poster is gone. failed: the player never answered; the poster offers YouTube.
 */
type Stage = "poster" | "loading" | "shown" | "player" | "failed";

type PlayerMessage = { event?: string; info?: { playerState?: number; currentTime?: number } | number | null };

/** The frame has left its initial about:blank (ours, readable) for another origin. */
const hasNavigated = (frame: Window) => {
  try {
    void frame.location.href;
    return false;
  } catch {
    return true;
  }
};

/**
 * A YouTube demo that shows only our own poster and play button until it is
 * clicked: no YouTube chrome, and no player JS or cookies on page load. The
 * real player (privacy-enhanced domain) then starts under the poster, which
 * stays, with the button reading "Loading", until the player reports playback
 * (YouTube's iframe message protocol), and crossfades into the playing video
 * instead of cutting to black. That report trails the first audio by ~0.1 s.
 * Focus stays in the page, so Escape still closes the dialog around it.
 */
export default function LiteYouTube({ src, title }: Readonly<{ src: string; title: string }>) {
  const id = videoIdOf(src);
  const [stage, setStage] = useState<Stage>("poster");
  // The player has answered: its frame has painted, so the poster can go once it is shown.
  const [heard, setHeard] = useState(false);
  const [poster, setPoster] = useState(id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : "");
  const [playHovered, setPlayHovered] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLIFrameElement>(null);
  const loadedAt = useRef<number | null>(null);
  // The Loading button had focus when the stage turned 'failed': the Watch link takes it over.
  const focusFallback = useRef(false);

  // Loading: ask the player to report its state, and show it once it plays.
  useEffect(() => {
    if (stage !== "loading") return;
    const startedAt = performance.now();
    const reveal = () => setStage((current) => (current === "loading" ? "shown" : current));
    const fail = () => {
      focusFallback.current = Boolean(controls.current?.contains(document.activeElement));
      setStage((current) => (current === "loading" ? "failed" : current));
    };
    let answered = false;
    let answeredAt = 0;
    let refusedTimer = 0;

    const onMessage = (event: MessageEvent) => {
      const frame = player.current?.contentWindow;
      if (event.origin !== PLAYER_ORIGIN || !frame || event.source !== frame) return;
      let data: PlayerMessage;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!answered) answeredAt = performance.now();
      answered = true;
      setHeard(true);
      const info = data?.info;
      const state = typeof info === "number" ? info : info?.playerState;
      const time = typeof info === "object" ? info?.currentTime : undefined;
      if (state === 1 || (typeof time === "number" && time > 0)) reveal();
      // Unstarted (-1) or cued (5) once ready: autoplay was refused. Buffering (3) means it is on its way.
      else if (!refusedTimer && (state === -1 || state === 5)) refusedTimer = window.setTimeout(reveal, AUTOPLAY_REFUSED_GRACE_MS);
    };

    // One watch while loading. The player only reports once told someone is listening and may
    // not be up yet, so keep saying so once the frame has navigated off its initial about:blank
    // (in every measured run it answered before its load event, so posting stops soon after).
    const listening = JSON.stringify({ event: "listening", id: 1, channel: "widget" });
    const watch = window.setInterval(() => {
      const now = performance.now();
      const loaded = loadedAt.current;
      const frame = player.current?.contentWindow;
      if (answered) {
        // Loaded (painted), answered, and still not playing a while later: show YouTube's own buffering.
        if (loaded !== null && now - startedAt >= PLAYER_START_TIMEOUT_MS && now - Math.max(loaded, answeredAt) >= PLAYER_SETTLE_MS) {
          reveal();
        }
        return;
      }
      const navigated = Boolean(frame && hasNavigated(frame));
      if (frame && navigated && (loaded === null || now - loaded < 300)) frame.postMessage(listening, PLAYER_ORIGIN);
      // Loaded and silent (an error page), or never left about:blank: offer YouTube instead.
      if ((loaded !== null && now - loaded > SILENT_AFTER_LOAD_MS) || (!navigated && now - startedAt > NEVER_NAVIGATED_MS)) fail();
    }, 250);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(watch);
      window.clearTimeout(refusedTimer);
    };
  }, [stage]);

  // Failed: the Watch link takes over the Loading button's focus, if it had it.
  useEffect(() => {
    if (stage !== "failed" || !focusFallback.current) return;
    focusFallback.current = false;
    controls.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
  }, [stage]);

  // Shown: keep focus in the page as the controls go (Escape still reaches the
  // dialog; the next Tab enters the player), and drop the poster after the fade.
  useEffect(() => {
    if (stage !== "shown") return;
    if (controls.current?.contains(document.activeElement)) root.current?.focus({ preventScroll: true });
    if (!heard) return;
    const timer = window.setTimeout(() => setStage("player"), FADE_MS + 50);
    return () => window.clearTimeout(timer);
  }, [stage, heard]);

  if (!id) return null;
  const play = () => {
    if (stage === "poster") setStage("loading");
  };
  const started = stage === "loading" || stage === "shown" || stage === "player";
  const revealed = stage === "shown" || stage === "player";
  const failed = stage === "failed";
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return (
    // The whole poster plays, as on any video embed; the button stays its one
    // keyboard control (this is a pointer and touch shortcut, not a second button).
    // Once the player is up, clicks are its own (they never reach this element).
    <div
      ref={root}
      tabIndex={-1}
      className={`group relative h-full w-full outline-none ${stage === "poster" ? "cursor-pointer" : ""}`}
      onClick={play}
      onMouseEnter={() => setPlayHovered(true)}
      onMouseLeave={() => setPlayHovered(false)}
    >
      {/* Always rendered, so screen readers announce its changes (the visible label is hidden on phones). */}
      <span className="sr-only" aria-live="polite">
        {stage === "loading" ? "Loading the demo" : failed ? "The player couldn't load. Watch it on YouTube instead." : ""}
      </span>
      {stage !== "player" && (
      <>
      <img
        src={poster}
        alt=""
        className={`h-full w-full object-cover transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${started ? "opacity-100" : "opacity-90 group-hover:opacity-100"}`}
        // Older uploads have no maxres frame; YouTube then serves a 120px placeholder.
        onLoad={(event) => {
          if (event.currentTarget.naturalWidth <= 120 && poster.includes("maxres")) setPoster(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
        }}
        onError={() => {
          if (poster.includes("maxres")) setPoster(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
        style={{ opacity: revealed ? 0 : 1, transition: PLAYER_FADE }}
      />
      {/* Bottom-left, on the gradient: YouTube posters usually carry a centred
          title, which a centred button would cover. Inset >= the focus ring's
          6px reach so the poster's overflow-hidden never clips the ring. */}
      {/* Phones get a 44px round icon button in the corner, so the poster's own
          text stays clear; sm and up keep the labelled pill. Pressed, it shows a
          spinner (and "Loading…") until the player takes over, then fades with the poster. */}
      <div
        ref={controls}
        className={`absolute bottom-4 left-4 sm:bottom-5 sm:left-5 ${revealed ? "pointer-events-none" : ""}`}
        style={{ opacity: revealed ? 0 : 1, transition: PLAYER_FADE }}
        inert={revealed || undefined}
      >
        {failed ? (
          <LiquidMetalButton
            // Keyed apart from the Play button, so it mounts its own rim and magnet.
            key="watch"
            href={`https://www.youtube.com/watch?v=${id}`}
            target="_blank"
            rel="noreferrer"
            ariaLabel={`Watch on YouTube: ${title}`}
            circleBelowSm
          >
            <SquareArrowOutUpRightIcon aria-hidden="true" size={16} />
            <span className="max-sm:hidden">Watch on YouTube</span>
          </LiquidMetalButton>
        ) : (
          <LiquidMetalButton
            key="play"
            ariaLabel={started ? `Loading demo: ${title}` : `Play demo: ${title}`}
            circleBelowSm
            onClick={play}
          >
            {started ? (
              <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white motion-reduce:animate-none" />
            ) : (
              <PlayIcon aria-hidden="true" size={16} animate={playHovered} />
            )}
            <span className="max-sm:hidden">{started ? "Loading…" : "Play demo"}</span>
          </LiquidMetalButton>
        )}
      </div>
      </>
      )}
      {started && (
        <iframe
          ref={player}
          className="absolute inset-0 h-full w-full"
          // Invisible and out of reach until shown: taps still land on the Loading button.
          style={{ opacity: revealed ? 1 : LOADING_OPACITY, transition: PLAYER_FADE, pointerEvents: revealed ? undefined : "none" }}
          tabIndex={revealed ? undefined : -1}
          aria-hidden={revealed ? undefined : true}
          src={`${PLAYER_ORIGIN}/embed/${id}?autoplay=1&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => {
            loadedAt.current = performance.now();
          }}
        />
      )}
    </div>
  );
}
