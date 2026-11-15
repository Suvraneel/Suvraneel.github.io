"use client";

import { useIsPresent } from "motion/react";
import { useId, useLayoutEffect, useRef, type CSSProperties } from "react";
import { prefersReducedMotion } from "@lib/pageTransition";
import { SIGN_AGAIN_EVENT } from "@lib/signature";
import { REVEAL_DISTANCE_PX, REVEAL_EASE, REVEAL_MS } from "@hooks/useReveal";
import { SIGNATURE_DOT, SIGNATURE_PIECES, SIGNATURE_RATIO, SIGNATURE_STROKES, SIGNATURE_VIEWBOX } from "@data/signature";

/** How much of the signature must be on screen before the pen starts. */
const START_AT_VISIBLE = 0.4;
/** Signing again: the finished signature lifts off this fast before the pen starts over. */
const LIFT_OFF_MS = 240;
/** A hand's pace within one stroke: a quick start that settles as the line runs out. */
const PEN_EASE: [number, number, number, number] = [0.42, 0, 0.18, 1];
/** Keyframes per piece: enough that the eased pace reads as one smooth motion. */
const PEN_SAMPLES = 12;
/** Wet ink: how long a stretch stays in the accent after the pen leaves it, then how long it takes to dry. */
const WET_HOLD_MS = 600;
const WET_DRY_MS = 500;

/** Progress at time t for a CSS cubic-bezier(x1, y1, x2, y2), both 0 to 1. */
function cubicBezier([x1, y1, x2, y2]: [number, number, number, number]) {
  const at = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  return (t: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < t) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}

/** The time (0 to 1) at which an increasing ease reaches `progress`. */
function timeFor(ease: (t: number) => number, progress: number) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < progress) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Hand-signed sign-off. No JS and reduced motion show it finished. Otherwise
 * it is hidden from the first paint (data-pen-pending, under the html.js rule
 * in globals.css, so a direct load never flashes the finished signature before
 * hydration) and, the first time it scrolls into view, rises in with the
 * site's reveal while the pen writes it: each mask follows the pen's own path,
 * eased per stroke, so loops cross the way they do on paper. The ink goes down
 * wet, in the accent, and dries to the signature's own colour a moment after
 * the pen leaves each stretch, so the colour trails the pen and the finished
 * signature is plain. A page on its way out never starts writing. Asked to
 * sign again (signAgain, @lib/signature), a finished signature lifts off and
 * is written afresh once in view; mid-write, hidden or not yet written, the
 * ask is let go.
 */
export default function Signature({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const isPresent = useIsPresent();
  const presentRef = useRef(isPresent);

  useLayoutEffect(() => {
    presentRef.current = isPresent;
  }, [isPresent]);

  // Layout effect: the hand-over from the CSS hold to these inline styles lands before paint.
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined" || !("animate" in svg)) {
      svg.removeAttribute("data-pen-pending");
      return;
    }
    const pens = Array.from(svg.querySelectorAll<SVGPathElement>("[data-pen]"));
    for (const pen of pens) pen.style.strokeDashoffset = "1";
    svg.style.opacity = "0";
    svg.removeAttribute("data-pen-pending");
    const ease = cubicBezier(PEN_EASE);
    const inks = Array.from(svg.querySelectorAll<SVGPathElement>("[data-ink]"));
    let animations: Animation[] = [];

    const write = () => {
      const dry = getComputedStyle(svg).color;
      const wet = `rgb(${getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()})`;
      // Held wet until its stretch is written and a beat after, then dries; once done
      // the inherited colour shows through, the same colour it dried to.
      const dryAfter = (ink: SVGPathElement, paint: "fill" | "stroke", penDoneMs: number) =>
        ink.animate([{ [paint]: wet }, { [paint]: dry }], {
          delay: penDoneMs + WET_HOLD_MS,
          duration: WET_DRY_MS,
          easing: REVEAL_EASE,
          fill: "backwards",
        });
      animations = [
        svg.animate(
          [
            { opacity: 0, transform: `translateY(${REVEAL_DISTANCE_PX}px)` },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: REVEAL_MS, easing: REVEAL_EASE, fill: "both" },
        ),
        ...pens.flatMap((pen, index) => {
          const { stroke, from, to, at, dur } = pen.dataset;
          if (stroke === undefined) {
            // The dot is its own short stroke, and its own ink.
            const delay = Number(at) * 1000;
            const duration = Number(dur) * 1000;
            return [
              pen.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
                delay,
                duration,
                easing: `cubic-bezier(${PEN_EASE.join(",")})`,
                fill: "both",
              }),
              dryAfter(pen, "stroke", delay + duration),
            ];
          }
          // A piece is one stretch of a longer stroke: sample the stroke's eased
          // pace across it, so the pen keeps one speed through the joins.
          const timing = SIGNATURE_STROKES[Number(stroke)];
          const start = Number(from);
          const end = Number(to);
          const t0 = timeFor(ease, start);
          const t1 = timeFor(ease, end);
          const frames = Array.from({ length: PEN_SAMPLES + 1 }, (_, i) => {
            const t = t0 + ((t1 - t0) * i) / PEN_SAMPLES;
            return { offset: i / PEN_SAMPLES, strokeDashoffset: 1 - (ease(t) - start) / (end - start || 1) };
          });
          frames[0].strokeDashoffset = 1;
          frames[PEN_SAMPLES].strokeDashoffset = 0;
          const delay = (timing.at + t0 * timing.dur) * 1000;
          const duration = Math.max((t1 - t0) * timing.dur * 1000, 16);
          const written = pen.animate(frames, { delay, duration, fill: "both" });
          // Mask i reveals ink piece i.
          const ink = inks[index];
          return ink ? [written, dryAfter(ink, "fill", delay + duration)] : [written];
        }),
      ];
      // Marked once the ink has dried: only a finished signature can be signed again.
      svg.removeAttribute("data-signed");
      const written = animations;
      Promise.all(written.map((animation) => animation.finished)).then(
        () => {
          if (animations === written) svg.setAttribute("data-signed", "");
        },
        () => undefined,
      );
    };

    let observer: IntersectionObserver | null = null;
    /** Writes it the next time enough of it is on screen (at once if it already is). */
    const writeWhenSeen = () => {
      observer?.disconnect();
      const watching = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting || !presentRef.current) return;
          watching.disconnect();
          write();
        },
        { threshold: START_AT_VISIBLE },
      );
      observer = watching;
      watching.observe(svg);
    };
    writeWhenSeen();

    let liftOff: Animation | null = null;
    const signAgain = () => {
      if (!svg.hasAttribute("data-signed") || liftOff || !presentRef.current || getComputedStyle(svg).display === "none") return;
      const lifting = svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: LIFT_OFF_MS, easing: REVEAL_EASE, fill: "forwards" });
      liftOff = lifting;
      svg.removeAttribute("data-signed");
      lifting.finished.then(
        () => {
          // Back to blank: the pens' inline offsets and the svg's inline opacity hold it unwritten.
          for (const animation of animations) animation.cancel();
          animations = [];
          lifting.cancel();
          liftOff = null;
          writeWhenSeen();
        },
        () => undefined,
      );
    };
    window.addEventListener(SIGN_AGAIN_EVENT, signAgain);

    return () => {
      window.removeEventListener(SIGN_AGAIN_EVENT, signAgain);
      observer?.disconnect();
      liftOff?.cancel();
      for (const animation of animations) animation.cancel();
      for (const pen of pens) pen.style.strokeDashoffset = "";
      svg.style.opacity = "";
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={SIGNATURE_VIEWBOX}
      role="img"
      aria-label="Signature: Suvraneel Bhuin"
      data-signature=""
      data-pen-pending=""
      className={`block ${className}`}
      style={{ aspectRatio: SIGNATURE_RATIO, ...style }}
    >
      <defs>
        {SIGNATURE_PIECES.map((piece, index) => (
          // userSpaceOnUse with an explicit region: the default region would clip the tall S.
          <mask key={index} id={`${uid}-ink-${index}`} maskUnits="userSpaceOnUse" x="-100%" y="-100%" width="300%" height="300%">
            <path
              d={piece.pen}
              data-pen=""
              data-stroke={piece.stroke}
              data-from={piece.from}
              data-to={piece.to}
              pathLength={1}
              strokeDasharray={1}
              fill="none"
              stroke="#fff"
              strokeWidth={piece.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </mask>
        ))}
      </defs>
      <g fill="currentColor">
        {SIGNATURE_PIECES.map((piece, index) => (
          <path key={index} d={piece.d} data-ink="" mask={`url(#${uid}-ink-${index})`} />
        ))}
      </g>
      <path
        d={SIGNATURE_DOT.d}
        data-pen=""
        data-at={SIGNATURE_DOT.at}
        data-dur={SIGNATURE_DOT.dur}
        pathLength={1}
        strokeDasharray={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
