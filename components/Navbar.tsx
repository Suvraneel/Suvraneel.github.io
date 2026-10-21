"use client";

import { Disc3Icon } from "@components/animate-ui/icons/disc-3";
import { FingerprintIcon } from "@components/animate-ui/icons/fingerprint";
import { LayoutDashboardIcon } from "@components/animate-ui/icons/layout-dashboard";
import { LightbulbIcon } from "@components/animate-ui/icons/lightbulb";
import { MessageCircleMoreIcon } from "@components/animate-ui/icons/message-circle-more";
import { PickaxeIcon } from "@components/animate-ui/icons/pickaxe";
import { TerminalIcon } from "@components/animate-ui/icons/terminal";
import { motion, scrollInfo, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ElementType } from "react";
import { useSfx } from "@hooks/useSfx";
import { cssEase, type PageTransition } from "@lib/pageTransition";
import {
  getTransition,
  isInFlight,
  onArrival,
  subscribeTransition,
  useTransitionState,
} from "./transition/transitionStore";
import Socials from "./Socials";

type RailItem = {
  name: string;
  href: string;
  icon: ElementType;
};

const railItems: RailItem[] = [
  { name: "Home", href: "/", icon: LayoutDashboardIcon },
  { name: "About", href: "/about", icon: FingerprintIcon },
  { name: "Work", href: "/work", icon: PickaxeIcon },
  { name: "Projects", href: "/projects", icon: LightbulbIcon },
  { name: "Skills", href: "/skills", icon: TerminalIcon },
  { name: "Contact", href: "/contact", icon: MessageCircleMoreIcon },
];

const currentYear = new Date().getFullYear();

/** Rail rows are a fixed grid (.rail-link min-height), so item i sits at i * RAIL_ROW_PX. */
const RAIL_ROW_PX = 42;

/** The indicator's transform on a route's item, or null for a route the rail does not list. */
const railOffset = (path: string | null) => {
  const index = railItems.findIndex((item) => item.href === path);
  return index < 0 ? null : `translate3d(0px, ${index * RAIL_ROW_PX}px, 0px)`;
};

const pageScroller = (path: string) =>
  path === "/work" ? document.querySelector<HTMLElement>(`[data-page="/work"] main`) : null;

/** Scroll progress a page arrives at: 0 at its top, 1 at its bottom (or when it does not scroll). */
const arrivalProgress = (t: PageTransition) => {
  if (t.to === "/") return 1;
  const scroller = pageScroller(t.to);
  if (scroller) {
    const range = scroller.scrollHeight - scroller.clientHeight;
    return range > 0 ? Math.min(1, scroller.scrollTop / range) : 1;
  }
  // A backward lift frames the arriving sheet at its offset; the window gets there on settle.
  const page = document.querySelector<HTMLElement>(`[data-page="${t.to}"] [data-freeze]`);
  const range = Math.max(page?.offsetHeight ?? 0, window.innerHeight) - window.innerHeight;
  const y = t.arrivalScrollY ?? window.scrollY;
  return range > 0 ? Math.min(1, y / range) : 1;
};

/**
 * The live page's scroll progress, for the active rail item's edge: the
 * window, or Work's own <main>. Home (no scroll) reads full. In flight it
 * holds still; the arriving page starts at its arrival progress (0 forward,
 * 1 backward, or a history entry's offset) and is tracked live once the lift
 * settles, so the edge never jumps. Motion values only; nothing re-renders.
 */
function useRailProgress(reduceMotion: boolean | null) {
  const progress = useMotionValue(1);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (reduceMotion) {
      progress.set(1);
      return;
    }

    let detach: (() => void) | null = null;
    const hold = () => {
      detach?.();
      detach = null;
    };
    const track = (path: string) => {
      hold();
      if (path === "/") {
        progress.set(1);
        return;
      }
      const scroller = pageScroller(path);
      if (path === "/work" && !scroller) return;
      detach = scrollInfo((info) => progress.set(info.y.progress), scroller ? { container: scroller } : {});
    };

    const stopArrival = onArrival((t) => {
      hold();
      progress.set(arrivalProgress(t));
    });
    const stopTransition = subscribeTransition(() => {
      const t = getTransition();
      if (t && !t.settled) hold();
      else track(t ? t.to : pathnameRef.current);
    });

    if (!isInFlight(getTransition())) track(pathnameRef.current);

    return () => {
      hold();
      stopArrival();
      stopTransition();
    };
  }, [progress, reduceMotion]);

  return progress;
}

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement>(null);
  const progress = useRailProgress(reduceMotion);
  const [playSnapSfx, { stop: stopSnap }] = useSfx("snap", { volume: 0.25 });
  const [playConfirm] = useSfx("confirm", { volume: 0.25 });

  const playSnap = () => {
    stopSnap();
    playSnapSfx();
  };

  const toggleMusic = async () => {
    const music = musicRef.current;
    if (!music) return;

    if (isPlaying) {
      music.pause();
      music.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    try {
      await music.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <nav className="sidebar-container portfolio-rail" aria-label="Primary navigation">
      <audio ref={musicRef} preload="none" src="/sounds/RoadsideFlowers.mp3" onEnded={() => setIsPlaying(false)} />
      <button
        type="button"
        // A mouse press leaves no focus here: a later scroll key would turn it
        // into keyboard focus and hold the rail open over the page.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          playConfirm();
          void toggleMusic();
        }}
        onMouseEnter={playSnap}
        onMouseLeave={stopSnap}
        className="rail-music"
        aria-label={isPlaying ? "Stop music" : "Play music"}
      >
        <Disc3Icon aria-hidden="true" size={24} animate={isPlaying && !reduceMotion} />
        <span className="rail-label">{isPlaying ? "Stop music" : "Play music"}</span>
      </button>

      <div className="rail-divider" aria-hidden="true" />
      <div className="rail-links">
        <RailIndicator progress={progress} />
        {railItems.map((item) => (
          <RailLink
            key={item.name}
            item={item}
            active={pathname === item.href}
            reduceMotion={reduceMotion}
            onSnap={playSnap}
            onStopSnap={stopSnap}
            onConfirm={playConfirm}
          />
        ))}
      </div>

      <div className="rail-footer">
        <div className="rail-socials"><Socials /></div>
        <small className="rail-copyright">
          <span className="rail-label rail-copyright-text">
            <span>Suvraneel Bhuin</span>
            {/* Static build year can differ from the visitor's clock. */}
            <span suppressHydrationWarning>
              <span className="rail-copyright-symbol">&copy;</span> {currentYear}
            </span>
          </span>
        </small>
      </div>
    </nav>
  );
}

/**
 * The active item's glow and progress edge: one indicator for the whole rail.
 * A lift carries it from the page being left to the arriving one on the lift's
 * own timeline (same start, duration and ease), so it moves in step with the
 * page and seeks, resumes and history fast-forwards land it with the page.
 * Reduced motion fades pages in place: it holds on the page being left and
 * jumps once the fade settles.
 */
function RailIndicator({ progress }: { progress: MotionValue<number> }) {
  const pathname = usePathname();
  const transition = useTransitionState();
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const fading = isInFlight(transition) && transition.kind === "fade";
  const offset = railOffset(fading ? transition.from : pathname);

  useEffect(
    () =>
      onArrival((t, track) => {
        const indicator = indicatorRef.current;
        const from = railOffset(t.from);
        const to = railOffset(t.to);
        // Fades and browser history swipes have no lift to ride.
        if (!indicator || !track || !from || !to) return;
        // The style already holds the arriving item; the track is dropped on settle.
        track.add(
          indicator.animate([{ transform: from }, { transform: to }], {
            duration: t.duration,
            easing: cssEase(t.ease),
            fill: "both",
          })
        );
      }),
    []
  );

  if (!offset) return null;
  return (
    <span ref={indicatorRef} className="rail-indicator" aria-hidden="true" style={{ transform: offset }}>
      <span className="rail-progress">
        <motion.span className="rail-progress-bar" style={{ scaleY: progress }} />
      </span>
    </span>
  );
}

function RailLink({
  item,
  active,
  reduceMotion,
  onSnap,
  onStopSnap,
  onConfirm,
}: {
  item: RailItem;
  active: boolean;
  reduceMotion: boolean | null;
  onSnap: () => void;
  onStopSnap: () => void;
  onConfirm: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`rail-link group ${active ? "rail-link-active" : ""}`}
      // As the music button: a click leaves no focus to reopen the rail later.
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={() => {
        setIsHovered(true);
        onSnap();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onStopSnap();
      }}
      onFocus={() => {
        // Keyboard focus animates the icon but stays silent.
        setIsHovered(true);
      }}
      onBlur={() => {
        setIsHovered(false);
      }}
      onClick={onConfirm}
    >
      <span className="rail-icon transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105">
        <Icon aria-hidden="true" size={24} animate={isHovered && !reduceMotion} />
      </span>
      <span className="rail-label">{item.name}</span>
    </Link>
  );
}
