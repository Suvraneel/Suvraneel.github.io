"use client";

import type { RefObject } from "react";
import { monomaDisplay, monomaText, settlexFallback, sheetahText } from "./heroFonts";
import { useLoopPlayback } from "./useLoopPlayback";

export type HeroBrand = "monoma" | "settlex" | "sheetah";

const FOOTAGE = "/images/project-assets/hero";

/**
 * The flagship tiles break the poster template: their teaser's footage (for
 * Sheetah, the app itself writing SQL from a click) fills the tile, and
 * the copy sits on it in each brand's own type, palette and headline
 * treatment, as on usemonoma.com, settlex.fi and sheetah.vercel.app. Styles: .project-hero in globals.css.
 * The tile's own name row, logo and hover sit over the bottom band as on every
 * tile. The words are decorative here: the tile carries them as text for
 * assistive tech (its posterText).
 */
export default function ProjectHero({
  brand,
  tileRef,
  paused,
}: {
  brand: HeroBrand;
  tileRef: RefObject<HTMLElement | null>;
  paused: boolean;
}) {
  const { video } = useLoopPlayback(tileRef, paused);
  const fonts =
    brand === "monoma"
      ? `${monomaDisplay.variable} ${monomaText.variable}`
      : brand === "settlex"
        ? settlexFallback.variable
        : sheetahText.variable;

  return (
    <div aria-hidden="true" className={`project-hero project-hero--${brand} ${fonts}`}>
      <video
        ref={video}
        className="project-hero-footage"
        poster={`${FOOTAGE}/${brand}.poster.webp`}
        preload="none"
        muted
        loop
        playsInline
        disablePictureInPicture
      >
        <source src={`${FOOTAGE}/${brand}.loop.webm`} type="video/webm" />
        <source src={`${FOOTAGE}/${brand}.loop.mp4`} type="video/mp4" />
      </video>
      <div className="project-hero-scrim" />
      {brand === "monoma" ? (
        <div className="project-hero-copy">
          <span className="project-hero-headline">
            Company brain <span>that evolves with every action</span>
          </span>
          <span className="project-hero-sub">
            Scoped to your permissions. <span>Approval-gated before every write.</span>
          </span>
        </div>
      ) : brand === "sheetah" ? (
        <div className="project-hero-copy">
          <span className="project-hero-headline">
            Sheets{" "}
            <span>
              <i>×</i> <b>SQL</b>
            </span>
          </span>
          <span className="project-hero-sub">
            <span>
              <b>10M-row</b> grid
            </span>
            <span>
              <b>60 fps</b> scroll
            </span>
            <span>
              <b>Zero</b> uploads
            </span>
          </span>
        </div>
      ) : (
        <div className="project-hero-copy">
          <span className="project-hero-eyebrow">
            <i />
            Multi-chain testnets
          </span>
          <span className="project-hero-headline">
            The Clearing Layer <span>for Crypto</span>
          </span>
          <span className="project-hero-sub">Settles only the net delta, cutting bridging costs by up to 90%.</span>
        </div>
      )}
    </div>
  );
}
