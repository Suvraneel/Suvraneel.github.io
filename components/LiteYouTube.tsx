"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import LiquidMetalButton from "@components/LiquidMetalButton";
import { PlayIcon } from "@components/animate-ui/icons/play";

const videoIdOf = (src: string) => src.match(/(?:embed\/|v=|youtu\.be\/)([\w-]{11})/)?.[1] ?? null;

/**
 * A YouTube demo that shows only our own poster and play button until it is
 * clicked: no YouTube chrome, and no player JS or cookies on page load. The
 * real player (privacy-enhanced domain) replaces the poster and starts playing.
 */
export default function LiteYouTube({ src, title }: Readonly<{ src: string; title: string }>) {
  const id = videoIdOf(src);
  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState(id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : "");
  const [playHovered, setPlayHovered] = useState(false);

  if (!id) return null;

  if (playing) {
    return (
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <div className="group relative h-full w-full">
      <img
        src={poster}
        alt=""
        className="h-full w-full object-cover opacity-90 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100"
        // Older uploads have no maxres frame; YouTube then serves a 120px placeholder.
        onLoad={(event) => {
          if (event.currentTarget.naturalWidth <= 120 && poster.includes("maxres")) setPoster(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
        }}
        onError={() => {
          if (poster.includes("maxres")) setPoster(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
        }}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      {/* Bottom-left, on the gradient: YouTube posters usually carry a centred
          title, which a centred button would cover. Inset >= the focus ring's
          6px reach so the poster's overflow-hidden never clips the ring. */}
      {/* Phones get a 44px round icon button in the corner, so the poster's own
          text stays clear; sm and up keep the labelled pill. */}
      <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5">
        <LiquidMetalButton
          ariaLabel={`Play demo: ${title}`}
          circleBelowSm
          onClick={() => setPlaying(true)}
          onMouseEnter={() => setPlayHovered(true)}
          onMouseLeave={() => setPlayHovered(false)}
        >
          <PlayIcon aria-hidden="true" size={16} animate={playHovered} />
          <span className="max-sm:hidden">Play demo</span>
        </LiquidMetalButton>
      </div>
    </div>
  );
}
