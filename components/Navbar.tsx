"use client";

import {
  LayoutDashboardIcon,
  SendIcon,
  TerminalIcon,
} from "@animateicons/react/lucide";
import { Disc3Icon } from "@components/animate-ui/icons/disc-3";
import { FingerprintIcon } from "@components/animate-ui/icons/fingerprint";
import { LightbulbIcon } from "@components/animate-ui/icons/lightbulb";
import { PickaxeIcon } from "@components/animate-ui/icons/pickaxe";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ElementType } from "react";
import Socials from "./Socials";

type RailItem = {
  name: string;
  href: string;
  icon: ElementType;
  animateWithState?: boolean;
};

type AnimatedIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

const railItems: RailItem[] = [
  { name: "Home", href: "/", icon: LayoutDashboardIcon },
  { name: "About", href: "/about", icon: FingerprintIcon, animateWithState: true },
  { name: "Work", href: "/work", icon: PickaxeIcon, animateWithState: true },
  { name: "Projects", href: "/projects", icon: LightbulbIcon, animateWithState: true },
  { name: "Skills", href: "/skills", icon: TerminalIcon },
  { name: "Contact", href: "/contact", icon: SendIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement>(null);

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
      <button type="button" onClick={toggleMusic} className="rail-music" aria-label={isPlaying ? "Stop music" : "Play music"}>
        <Disc3Icon aria-hidden="true" size={24} animate={isPlaying && !reduceMotion} />
        <span className="rail-label">{isPlaying ? "Stop music" : "Play music"}</span>
      </button>

      <div className="rail-divider" aria-hidden="true" />
      <div className="rail-links">
        {railItems.map((item) => <RailLink key={item.name} item={item} active={pathname === item.href} reduceMotion={reduceMotion} />)}
      </div>

      <div className="rail-footer">
        <div className="rail-socials"><Socials /></div>
        <span className="rail-year">© 2026</span>
      </div>
    </nav>
  );
}

function RailLink({ item, active, reduceMotion }: { item: RailItem; active: boolean; reduceMotion: boolean | null }) {
  const iconRef = useRef<AnimatedIconHandle>(null);
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`rail-link group ${active ? "rail-link-active" : ""}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (!item.animateWithState && !reduceMotion) iconRef.current?.startAnimation();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!item.animateWithState && !reduceMotion) iconRef.current?.stopAnimation();
      }}
      onFocus={() => {
        setIsHovered(true);
        if (!item.animateWithState && !reduceMotion) iconRef.current?.startAnimation();
      }}
      onBlur={() => {
        setIsHovered(false);
        if (!item.animateWithState && !reduceMotion) iconRef.current?.stopAnimation();
      }}
    >
      <span className="rail-icon transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105">
        {item.animateWithState ? (
          <Icon aria-hidden="true" size={24} animate={isHovered && !reduceMotion} />
        ) : (
          <Icon ref={iconRef} aria-hidden="true" size={24} duration={0.7} isAnimated={false} />
        )}
      </span>
      <span className="rail-label">{item.name}</span>
    </Link>
  );
}
