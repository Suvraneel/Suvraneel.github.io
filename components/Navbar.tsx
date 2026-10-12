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
import type { PageTransition } from "@lib/pageTransition";
import { getTransition, isInFlight, onArrival, subscribeTransition } from "./transition/transitionStore";
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
  const snapAudioRef = useRef<HTMLAudioElement | null>(null);
  const progress = useRailProgress(reduceMotion);

  const playEffect = (source: string) => {
    const audio = new Audio(source);
    audio.volume = 0.25;
    void audio.play().catch(() => undefined);
    return audio;
  };

  const playSnap = () => {
    snapAudioRef.current?.pause();
    snapAudioRef.current = playEffect("/sounds/snap.wav");
  };

  const stopSnap = () => {
    snapAudioRef.current?.pause();
    snapAudioRef.current = null;
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
        onClick={() => {
          playEffect("/sounds/confirm.wav");
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
        {railItems.map((item) => (
          <RailLink
            key={item.name}
            item={item}
            active={pathname === item.href}
            progress={progress}
            reduceMotion={reduceMotion}
            onSnap={playSnap}
            onStopSnap={stopSnap}
            onConfirm={() => playEffect("/sounds/confirm.wav")}
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

function RailLink({
  item,
  active,
  progress,
  reduceMotion,
  onSnap,
  onStopSnap,
  onConfirm,
}: {
  item: RailItem;
  active: boolean;
  /** Scroll progress of the live page; drawn as the active item's left edge. */
  progress: MotionValue<number>;
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
      {active && (
        <span className="rail-progress" aria-hidden="true">
          <motion.span className="rail-progress-bar" style={{ scaleY: progress }} />
        </span>
      )}
      <span className="rail-icon transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105">
        <Icon aria-hidden="true" size={24} animate={isHovered && !reduceMotion} />
      </span>
      <span className="rail-label">{item.name}</span>
    </Link>
  );
}
