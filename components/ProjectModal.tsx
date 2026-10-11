"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { spaceBoards, tasaOrbiter } from "@font";
import { stateLogger } from "../stateLogger";

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
  const reduceMotion = useReducedMotion();
  const hasProjectDemo = !project.video.includes("EKGJ-pzSEns");
  const demoUrl = `${project.video}${project.video.includes("?") ? "&" : "?"}rel=0&iv_load_policy=3&showinfo=0&origin=https://suvraneel.github.io`;

  useEffect(() => {
    const currentDialog = dialog.current;
    if (!currentDialog) return;

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

    stateLogger("Project modal", true);
    currentDialog.showModal();
    closeButton.current?.focus();
    return () => {
      if (currentDialog.open) currentDialog.close();
      root.style.overflow = previousRootOverflow;
      Object.assign(body.style, previousBodyStyles);
      window.scrollTo(0, scrollPosition);
      stateLogger("Project modal", false);
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
      <motion.section
        className="grid h-full w-full max-w-[1480px] grid-rows-[minmax(0,0.72fr)_minmax(0,1fr)] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0f15] shadow-[0_32px_100px_rgba(0,0,0,0.55)] sm:h-[min(92dvh,920px)] sm:grid-rows-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:grid-cols-[minmax(0,1.6fr)_minmax(23rem,0.72fr)] lg:grid-rows-1"
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative flex min-h-0 items-center justify-center overflow-hidden bg-[#070a0e] p-3 sm:p-6 lg:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(131,211,221,0.14),transparent_42%),linear-gradient(145deg,#070a0e_0%,#0a1117_100%)]" />
          <span className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/55 sm:left-8 sm:top-7">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#83d3dd]" />
            <span>Project preview</span>
          </span>
          <div className="relative z-10 w-full rounded-[1.5rem] bg-white/[0.04] p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] ring-1 ring-white/10 sm:p-2">
            <div className="overflow-hidden rounded-[1.1rem] border border-white/[0.07] bg-black">
            {hasProjectDemo ? (
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src={demoUrl}
                  title={`${project.name} demo`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                className="aspect-video w-full object-cover"
                src={`/images/project-assets/${project.gif}`}
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col overflow-y-auto bg-[#0b0f15]">
          <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-7 sm:py-5">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#83d3dd]/80">Project case notes</p>
            <button
              ref={closeButton}
              className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-2.5 text-white/70 transition-[background-color,border-color,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/20 hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]"
              type="button"
              aria-label="Close project details"
              onClick={handleClose}
            >
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-white/40">Esc</span>
              <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.07] text-base transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-90">×</span>
            </button>
          </header>

          <div className="flex flex-1 flex-col px-5 pb-6 pt-6 sm:px-7 sm:pb-8 sm:pt-8 lg:px-8">
            <h2 id="project-dialog-title" className={`text-balance text-4xl leading-[0.98] text-white sm:text-[2.75rem] ${spaceBoards.className}`}>
              {project.name}
            </h2>

            {project.tech_stk.length > 0 && (
              <section className="mt-6" aria-label="Technology stack">
                <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/40">Stack</p>
                <div className="flex flex-wrap gap-2">
              {project.tech_stk.map((tech) => (
                <span key={tech} className="rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-[0.7rem] font-medium text-white/70">
                  {tech}
                </span>
              ))}
                </div>
              </section>
            )}

            <section className="mt-7 border-t border-white/[0.08] pt-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/90">Overview</h3>
                <span className="font-mono text-[0.62rem] text-white/35">{String(project.details.split("|").length).padStart(2, "0")} NOTES</span>
              </div>
              <ol className="space-y-5">
                {project.details.split("|").map((detail, index) => (
                  <li key={detail} className="grid grid-cols-[2rem_1fr] gap-3">
                    <span className="pt-0.5 font-mono text-[0.65rem] text-[#83d3dd]/70">{String(index + 1).padStart(2, "0")}</span>
                    <p className={`text-sm leading-6 text-white/65 sm:text-[0.92rem] sm:leading-7 ${tasaOrbiter.className}`}>{detail.trim()}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <footer className="flex flex-wrap gap-3 border-t border-white/[0.08] px-5 py-4 sm:px-7 sm:py-5 lg:px-8">
            {project.github !== "#" && (
              <a className="inline-flex min-h-11 items-center rounded-full border border-white/[0.12] px-4 text-sm font-semibold text-white/80 transition-[background-color,border-color,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/25 hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]" href={project.github} target="_blank" rel="noreferrer">
                View source
              </a>
            )}
            {project.url !== "#" && (
              <a className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-[#83d3dd] py-1 pl-5 pr-1 text-sm font-semibold text-[#071014] transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-[#a6e0e5] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]" href={project.url} target="_blank" rel="noreferrer">
                <span>Visit project</span>
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-base transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
            )}
          </footer>
        </div>
      </motion.section>
    </motion.dialog>
  );
}
