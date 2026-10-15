"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { spaceBoards, tasaOrbiter } from "@font";
import LiquidMetalButton from "@components/LiquidMetalButton";
import LiteYouTube from "@components/LiteYouTube";
import PillButton from "@components/PillButton";
import { AnimateIcon } from "@components/animate-ui/icons/icon";
import { SquareArrowOutUpRightIcon } from "@components/animate-ui/icons/square-arrow-out-up-right";
import { XIcon } from "@components/animate-ui/icons/x";
import { stateLogger } from "../stateLogger";

/** A case note's text, with markdown-style `[label](https://…)` links as real links. */
const NOTE_LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
function noteContent(note: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of note.matchAll(NOTE_LINK)) {
    parts.push(note.slice(last, match.index));
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noreferrer"
        className="text-white/85 underline decoration-white/30 underline-offset-[3px] transition-colors duration-200 hover:text-accent hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {match[1]}
      </a>
    );
    last = match.index + match[0].length;
  }
  parts.push(note.slice(last));
  return parts;
}

type Project = {
  name: string;
  details: string;
  github: string;
  url: string;
  gif: string;
  video: string;
  tech_stk: string[];
};

export default function ProjectModal({ handleClose, project }: Readonly<{ handleClose: () => void; project: Project }>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [visitHovered, setVisitHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const hasProjectDemo = !project.video.includes("EKGJ-pzSEns");
  const notes = project.details.split("|").map((detail) => detail.trim());
  const hasActions = project.url !== "#" || project.github !== "#";
  const stack =
    project.tech_stk.length > 0 ? (
      <section aria-label="Technology stack">
        <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/40">Stack</p>
        <div className="flex flex-wrap gap-2">
          {project.tech_stk.map((tech) => (
            <span key={tech} className="rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-[0.7rem] font-medium text-white/70">
              {tech}
            </span>
          ))}
        </div>
      </section>
    ) : null;

  useEffect(() => {
    const currentDialog = dialog.current;
    if (!currentDialog) return;

    // The tile that opened the dialog, to hand focus back to on close.
    const trigger = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    const scrollPosition = window.scrollY;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollPosition}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    // Released once: on unmount, or as soon as the dialog is closed from
    // outside (browser Back closes it before the page transition snapshots
    // the scroll offset, so the page must be unlocked by then).
    let released = false;
    const releasePage = () => {
      if (released) return;
      released = true;
      root.style.overflow = previousRootOverflow;
      Object.assign(body.style, previousBodyStyles);
      window.scrollTo(0, scrollPosition);
      stateLogger("Project modal", false);
    };

    // A queued close event from an earlier close() (Strict Mode re-runs this
    // effect) arrives after showModal() has reopened the dialog: ignore it.
    const onClose = () => {
      if (!currentDialog.open) releasePage();
    };

    stateLogger("Project modal", true);
    currentDialog.showModal();
    closeButton.current?.focus();
    currentDialog.addEventListener("close", onClose);
    return () => {
      currentDialog.removeEventListener("close", onClose);
      if (currentDialog.open) currentDialog.close();
      releasePage();
      // By now the dialog has left the DOM after its exit animation, so the
      // browser's own focus restore never ran. Only when focus was dropped:
      // a page transition that closed the dialog keeps its own focus.
      const focusDropped = document.activeElement === null || document.activeElement === document.body;
      if (trigger?.isConnected && focusDropped) trigger.focus({ preventScroll: true });
    };
  }, []);

  return (
    <motion.dialog
      ref={dialog}
      aria-modal="true"
      aria-labelledby="project-dialog-title"
      className="fixed inset-0 z-[5000] m-0 flex h-dvh w-full max-w-none items-center justify-center overflow-hidden border-0 bg-transparent p-2 backdrop:bg-[#030609]/85 backdrop:backdrop-blur-xl sm:p-5"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      {/*
        Two layouts from one tree. Wide (>=1200px): a grid with the preview,
        stack and actions in the left column and the title + notes scrolling
        in the right, so the actions sit under the preview, above the fold.
        Narrower: one scrolling column with a sticky close bar on top and the
        actions in a sticky bar at the bottom (no nested scroll box).
      */}
      {/* Wide layout: the preview column is as wide as its 16:9 video can be at this
          height (the modal's height less 18.72rem of chrome, plus 5.61rem of side padding),
          capped at the old 1.5fr:0.78fr share, so short screens give the notes the room. */}
      <motion.section
        className="relative flex h-full w-full max-w-[1480px] flex-col overflow-y-auto overscroll-contain rounded-[1.5rem] border border-white/10 bg-[#0b0f15] shadow-[0_32px_100px_rgba(0,0,0,0.55)] sm:h-[min(92dvh,920px)] min-[1200px]:grid min-[1200px]:grid-cols-[min(65.8%,calc((min(92dvh,920px)_-_18.72rem)*16/9_+_5.61rem))_minmax(24rem,1fr)] min-[1200px]:grid-rows-[auto_minmax(0,1fr)_auto_auto] min-[1200px]:overflow-hidden"
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left column backdrop (wide layout only). */}
        <div
          aria-hidden="true"
          className="pointer-events-none hidden bg-[radial-gradient(ellipse_at_18%_0%,rgb(var(--accent)/0.14),transparent_42%),linear-gradient(145deg,#070a0e_0%,#0a1117_100%)] min-[1200px]:block min-[1200px]:[grid-area:1/1/5/2]"
        />

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.08] bg-[#0b0f15]/90 px-5 py-3 backdrop-blur-md sm:px-7 sm:py-4 min-[1200px]:static min-[1200px]:bg-[#0b0f15] min-[1200px]:py-5 min-[1200px]:backdrop-blur-none min-[1200px]:[grid-area:1/2/2/3]">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-accent/80">Project case notes</p>
          <AnimateIcon animateOnHover asChild>
          <button
            ref={closeButton}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-2.5 text-white/70 transition-[background-color,border-color,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/20 hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            type="button"
            aria-label="Close project details"
            onClick={handleClose}
          >
            {/* A keyboard hint only where there is a keyboard-and-pointer setup. */}
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-white/40 [@media(hover:none)]:hidden">Esc</span>
            <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.07] text-base">
              <XIcon size={14} />
            </span>
          </button>
          </AnimateIcon>
        </header>

        <div className="relative z-10 bg-[#070a0e] p-3 sm:p-6 min-[1200px]:flex min-[1200px]:min-h-0 min-[1200px]:flex-col min-[1200px]:justify-center min-[1200px]:bg-transparent min-[1200px]:px-9 min-[1200px]:pb-2 min-[1200px]:pt-9 min-[1200px]:[container-type:size] min-[1200px]:[grid-area:1/1/3/2]">
          {/* Wide layout: as wide as the column allows, but never taller than the space above the stack (16:9 + label + bezel). */}
          <div className="min-[1200px]:w-[min(100cqw,calc((100cqh-3.5rem)*16/9))]">
          <span className="mb-4 hidden items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/55 min-[1200px]:inline-flex">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>Project preview</span>
          </span>
          <div className="w-full rounded-[1.5rem] bg-white/[0.04] p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] ring-1 ring-white/10 sm:mx-auto sm:max-w-[40rem] sm:p-2 min-[1200px]:max-w-none">
            <div className="aspect-video overflow-hidden rounded-[1.1rem] border border-white/[0.07] bg-black">
              {hasProjectDemo ? (
                <LiteYouTube src={project.video} title={`${project.name} demo`} />
              ) : (
                // Reduced motion: the demo stays paused on its first frame.
                <video
                  className="h-full w-full object-cover"
                  src={`/images/project-assets/${project.gif}`}
                  autoPlay={!reduceMotion}
                  muted
                  loop
                  playsInline
                />
              )}
            </div>
          </div>
          </div>
        </div>

        {stack && <div className="relative z-10 hidden px-9 pt-6 min-[1200px]:block min-[1200px]:[grid-area:3/1/4/2]">{stack}</div>}

        <div className="px-5 pb-8 pt-6 sm:px-7 sm:pt-8 min-[1200px]:min-h-0 min-[1200px]:overflow-y-auto min-[1200px]:px-8 min-[1200px]:[grid-area:2/2/5/3]">
          <h2 id="project-dialog-title" className={`text-balance text-[1.9rem] leading-[1.02] text-white sm:text-[2.2rem] ${spaceBoards.className}`}>
            {project.name}
          </h2>

          {stack && <div className="mt-6 min-[1200px]:hidden">{stack}</div>}

          <section className="mt-7 border-t border-white/[0.08] pt-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/90">Overview</h3>
              <span className="font-mono text-[0.62rem] text-white/35">{String(notes.length).padStart(2, "0")} NOTES</span>
            </div>
            <ol className="space-y-4">
              {notes.map((detail, index) => (
                <li key={detail} className="grid grid-cols-[2rem_1fr] gap-3">
                  <span className="pt-0.5 font-mono text-[0.65rem] text-accent/70">{String(index + 1).padStart(2, "0")}</span>
                  <p className={`text-sm leading-[1.6] text-white/65 ${tasaOrbiter.className}`}>{noteContent(detail)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {hasActions && (
          <footer className="sticky bottom-0 z-30 mt-auto flex flex-wrap gap-3 border-t border-white/[0.08] bg-[#0b0f15]/90 px-5 py-3 backdrop-blur-md sm:px-7 min-[1200px]:relative min-[1200px]:z-10 min-[1200px]:mt-0 min-[1200px]:border-0 min-[1200px]:bg-transparent min-[1200px]:px-9 min-[1200px]:pb-9 min-[1200px]:pt-5 min-[1200px]:backdrop-blur-none min-[1200px]:[grid-area:4/1/5/2]">
            {project.url !== "#" && (
              <LiquidMetalButton
                href={project.url}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => setVisitHovered(true)}
                onMouseLeave={() => setVisitHovered(false)}
              >
                <span>Visit project</span>
                <SquareArrowOutUpRightIcon aria-hidden="true" size={16} animate={visitHovered} />
              </LiquidMetalButton>
            )}
            {project.github !== "#" && (
              <PillButton href={project.github} target="_blank" rel="noreferrer">
                View source
              </PillButton>
            )}
          </footer>
        )}
      </motion.section>
    </motion.dialog>
  );
}
