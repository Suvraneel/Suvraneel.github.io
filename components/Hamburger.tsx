"use client";

import { Disc3Icon } from "@components/animate-ui/icons/disc-3";
import { FingerprintIcon } from "@components/animate-ui/icons/fingerprint";
import { LayoutDashboardIcon } from "@components/animate-ui/icons/layout-dashboard";
import { LightbulbIcon } from "@components/animate-ui/icons/lightbulb";
import { MessageCircleMoreIcon } from "@components/animate-ui/icons/message-circle-more";
import { PickaxeIcon } from "@components/animate-ui/icons/pickaxe";
import { SquareArrowOutUpRightIcon } from "@components/animate-ui/icons/square-arrow-out-up-right";
import { TerminalIcon } from "@components/animate-ui/icons/terminal";
import { VolumeIcon } from "@components/animate-ui/icons/volume";
import { stopMusic, useMusicPlaying } from "@hooks/useMusic";
import { toggleSfxMuted, useSfx, useSfxMuted } from "@hooks/useSfx";
import * as gtag from "@lib/gtag";
import { EASE_FADE, prefersReducedMotion } from "@lib/pageTransition";
import { AnimatePresence, motion, stagger, useIsPresent, type Variants } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import MenuToggle from "./DrawerToggler";
import Socials from "./Socials";
import { getTransition, isInFlight, wasClickDropped } from "./transition/transitionStore";

// Opens like a released sheet (no bounce). Closes faster, on the fade ease, so
// the exit a drawer link starts overlaps the opening of the page lift.
const sheet: Variants = {
  open: {
    x: 0,
    transition: { type: "spring", visualDuration: 0.42, bounce: 0 },
  },
  closed: {
    x: "100%",
    transition: { type: "tween", duration: 0.24, ease: EASE_FADE },
  },
};
// Reduced motion: the sheet fades in place, like the backdrop; its links hold still.
const sheetReduced: Variants = {
  open: { opacity: 1, transition: { duration: 0.15 } },
  closed: { opacity: 0, transition: { duration: 0.15 } },
};
const backdrop: Variants = {
  open: { opacity: 1, transition: { duration: 0.15 } },
  closed: { opacity: 0, transition: { duration: 0.2, ease: EASE_FADE } },
};
// Links rise the site's reveal distance on open; on close they ride the sheet out.
const variantsItem: Variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 16,
    opacity: 0,
  },
};
const variantsNav: Variants = {
  open: {
    transition: { delayChildren: stagger(0.04, { startDelay: 0.08 }) },
  },
};

// Read live, unlike motion's useReducedMotion (fixed at mount): the drawer
// stays mounted across routes, so it must follow a setting changed mid-visit.
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useLiveReducedMotion = () =>
  useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);

/**
 * The sheet stops being a modal as soon as its exit starts, so isDialogOpen()
 * does not hold page navigation while it slides away.
 */
function DrawerSheet({
  reduceMotion,
  onClose,
  children,
}: {
  reduceMotion: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const isPresent = useIsPresent();
  const sheetRef = useRef<HTMLElement>(null);

  return (
    <motion.aside
      ref={sheetRef}
      role="dialog"
      aria-modal={isPresent ? "true" : undefined}
      aria-label="Navigation"
      // Windows shorter than the sheet's ~570px of content (landscape phones, short
      // desktop windows): it scrolls instead of cutting off its last links.
      className="pointer-events-auto absolute inset-y-0 right-0 flex h-full w-[min(86vw,22rem)] flex-col [@media(max-height:640px)]:overflow-y-auto [@media(max-height:640px)]:overscroll-contain border-l border-white/10 bg-black/95 shadow-[-24px_0_48px_rgba(0,0,0,0.35)]"
      variants={reduceMotion ? sheetReduced : sheet}
      initial="closed"
      animate="open"
      exit="closed"
      // Swiped back the way it came: it follows the finger to the right (and
      // resists to the left), and a throw or a pull past a third of its width
      // lets it go; anything less springs it back. Vertical scrolling is kept.
      drag={isPresent ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.04, right: 1 }}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        const width = sheetRef.current?.offsetWidth ?? 320;
        if (info.offset.x > width / 3 || info.velocity.x > 500) onClose();
      }}
    >
      {children}
    </motion.aside>
  );
}

/**
 * The rail's sounds on/off, for phones: an icon at the end of the socials row,
 * which answers hover, focus and a click as those links do.
 */
function DrawerSoundToggle({ reduceMotion }: { reduceMotion: boolean }) {
  const muted = useSfxMuted();
  const [isHovered, setIsHovered] = useState(false);
  const [playTick, { stop: stopTick }] = useSfx("tick");
  const [playConfirm] = useSfx("confirm");

  return (
    <button
      type="button"
      // A toggle keeps one name; its state is the pressed state (on = sounds play) and the icon.
      aria-label="Sounds"
      aria-pressed={!muted}
      // As the socials: a click leaves no focus ring behind.
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={() => {
        setIsHovered(true);
        stopTick();
        playTick();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        stopTick();
      }}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      // Heard only when this turned sounds back on.
      onClick={() => {
        toggleSfxMuted();
        playConfirm();
      }}
      className={`grid h-6 w-6 place-items-center rounded-md transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${isHovered ? "text-accent" : "text-white"}`}
    >
      <VolumeIcon aria-hidden="true" size={24} muted={muted} animate={isHovered && !reduceMotion} />
    </button>
  );
}

/**
 * The rail's music button goes when the rail does (an iPad turned upright):
 * while the music plays, the drawer offers the stop, after the socials.
 */
function DrawerMusicStop({ reduceMotion }: { reduceMotion: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [playTick, { stop: stopTick }] = useSfx("tick");
  const [playPress] = useSfx("press");

  return (
    <button
      type="button"
      aria-label="Stop music"
      // As the socials: a click leaves no focus ring behind.
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={() => {
        setIsHovered(true);
        stopTick();
        playTick();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        stopTick();
      }}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={(event) => {
        // This button goes as the music stops: a keyboard press hands its
        // focus to the Sounds toggle beside it rather than dropping it.
        if (document.activeElement === event.currentTarget) {
          event.currentTarget.parentElement?.querySelector<HTMLElement>('[aria-label="Sounds"]')?.focus();
        }
        playPress();
        stopMusic();
      }}
      className={`grid h-6 w-6 place-items-center rounded-md transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${isHovered ? "text-accent" : "text-white"}`}
    >
      <Disc3Icon aria-hidden="true" size={24} animate={!reduceMotion} />
    </button>
  );
}

const Hamburger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useLiveReducedMotion();
  // Closes in the commit that changes the route (a drawer link, browser
  // history), so AnimatePresence plays the exit alongside the page transition.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setIsOpen(false);
  }
  const menu = [
    { name: "Home", href: "/", icon: LayoutDashboardIcon },
    // Phones skip About (lib/pageTransition's stepFrom): its resume is the drawer's last row.
    { name: "About", href: "/about", icon: FingerprintIcon, hideOnPhone: true },
    { name: "Work", href: "/work", icon: PickaxeIcon },
    { name: "Projects", href: "/projects", icon: LightbulbIcon },
    { name: "Skills", href: "/skills", icon: TerminalIcon },
    { name: "Contact", href: "/contact", icon: MessageCircleMoreIcon },
  ];

  const navRef = useRef<HTMLElement>(null);
  const musicPlaying = useMusicPlaying();
  const [playTick, { stop: stopTick }] = useSfx("tick");
  const [playPress] = useSfx("press");
  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  // A link that starts a page transition leaves the sheet up until the route
  // commits (above), so its exit starts with the lift, not before it.
  const onLinkClick = (href: string) => {
    const t = getTransition();
    if (isInFlight(t) && t.to === href && t.commitAt === null) return;
    closeDrawer();
  };

  // Keyboard support while the drawer is open: Escape closes it and returns
  // focus to the toggle, and Tab cycles within the toggle + drawer.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const nav = navRef.current;
      if (!nav) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        nav.querySelector<HTMLElement>("button")?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        nav.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !nav.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !nav.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);


  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation drawer"
            className="fixed inset-0 z-drawer-backdrop cursor-default bg-black/50 backdrop-blur-[2px]"
            variants={backdrop}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>
      <motion.nav
        ref={navRef}
        data-drawer-open={isOpen ? "" : undefined}
        initial={false}
        animate="open"
        custom="100%"
        className="hamburger fixed inset-0 z-drawer pointer-events-none text-white"
      >
        <MenuToggle toggle={isOpen ? closeDrawer : openDrawer} isOpen={isOpen} />
        <AnimatePresence initial={false}>
          {isOpen && (
            <DrawerSheet key="drawer-sheet" reduceMotion={reduceMotion} onClose={closeDrawer}>
              <motion.ul
                key="drawer-menu"
                variants={variantsNav}
                initial="closed"
                animate="open"
                className="mt-20 flex flex-1 flex-col gap-2 px-5"
              >
                {menu.map(({ name, href, icon: Icon, hideOnPhone }) => (
                  <motion.li
                    key={name}
                    variants={reduceMotion ? undefined : variantsItem}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    // Motion makes whileTap elements focusable; the link inside is the one tab stop.
                    tabIndex={-1}
                    className={`sidebar-item flex justify-start ${hideOnPhone ? "max-[550px]:hidden" : ""}`}
                  >
                    <Link
                      href={href}
                      // The current page carries the accent, as on the desktop rail.
                      aria-current={pathname === href ? "page" : undefined}
                      className={`flex w-full items-center gap-4 rounded-2xl border border-white/10 px-4 py-3 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-accent focus-visible:border-white/15 focus-visible:bg-white/[0.04] focus-visible:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${pathname === href ? "text-accent" : "text-white"}`}
                      onMouseEnter={() => {
                        stopTick();
                        playTick();
                      }}
                      onMouseLeave={stopTick}
                      // As on the rail: silent for the current page or a click the transition turns away.
                      onClick={(event) => {
                        if (pathname !== href && !wasClickDropped(event.nativeEvent)) playPress();
                        onLinkClick(href);
                      }}
                    >
                      <Icon aria-hidden="true" size={21} animateOnHover />
                      <span className="text-lg font-medium">{name}</span>
                    </Link>
                  </motion.li>
                ))}
                {/* The resume, one tap from any page: a file in a new tab, not a page of the sequence. */}
                <motion.li
                  variants={reduceMotion ? undefined : variantsItem}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  tabIndex={-1}
                  className="sidebar-item flex justify-start"
                >
                  <a
                    href="/docs/Suvraneel_Bhuin_Resume.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center gap-4 rounded-2xl border border-white/10 px-4 py-3 text-white transition hover:border-white/15 hover:bg-white/[0.04] hover:text-accent focus-visible:border-white/15 focus-visible:bg-white/[0.04] focus-visible:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    onMouseEnter={() => {
                      stopTick();
                      playTick();
                    }}
                    onMouseLeave={stopTick}
                    onClick={() => {
                      gtag.event({ action: "resume_download_opened", category: "portfolio_engagement", label: "drawer", value: 1 });
                      playPress();
                      closeDrawer();
                    }}
                  >
                    <SquareArrowOutUpRightIcon aria-hidden="true" size={21} animateOnHover />
                    <span className="text-lg font-medium">Resume</span>
                  </a>
                </motion.li>
              </motion.ul>
              <motion.div variants={reduceMotion ? undefined : variantsItem} initial="closed" animate="open" className="border-t border-white/10 px-5 py-5">
                <Socials>
                  {musicPlaying && <DrawerMusicStop reduceMotion={reduceMotion} />}
                  <DrawerSoundToggle reduceMotion={reduceMotion} />
                </Socials>
              </motion.div>
            </DrawerSheet>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

export default Hamburger;
