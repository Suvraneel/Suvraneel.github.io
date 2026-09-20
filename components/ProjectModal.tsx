"use client";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faArrowUpRightFromSquare, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
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

export default function ProjectModal({ handleClose, project }: { handleClose: () => void; project: Project }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const hasProjectDemo = !project.video.includes("EKGJ-pzSEns");
  const demoUrl = `${project.video}${project.video.includes("?") ? "&" : "?"}rel=0&iv_load_policy=3&showinfo=0&origin=https://suvraneel.github.io`;

  useEffect(() => {
    stateLogger("Project modal", true);
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      stateLogger("Project modal", false);
    };
  }, [handleClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#07090d]/80 p-4 backdrop-blur-md sm:p-8"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={handleClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        className="relative grid h-[calc(100dvh-2rem)] w-full max-w-7xl overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#10141c] shadow-[0_28px_90px_rgba(1,5,10,0.7)] lg:h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1.55fr)_minmax(25rem,0.7fr)]"
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="min-h-0 bg-[#090d13] p-3 sm:p-5 lg:flex lg:flex-col lg:justify-center">
          <div className="w-full overflow-hidden rounded-[0.85rem] border border-white/10 bg-[#11161f] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
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

        <div className="flex min-h-0 flex-col overflow-y-auto p-6 sm:p-8">
          <button
            ref={closeButton}
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/35 hover:bg-white/[0.04] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]"
            type="button"
            aria-label="Close project details"
            onClick={handleClose}
          >
            <FontAwesomeIcon icon={faClose} />
          </button>

          <div className="mt-5">
            <h2 id="project-dialog-title" className="text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-4xl">
              {project.name}
            </h2>

            <div className="mt-6 flex flex-wrap gap-2">
              {project.tech_stk.map((tech) => (
                <span key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-[#b8d6da]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <h3 className="text-sm font-semibold text-white/90">Overview</h3>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
              {project.details.split("|").map((detail) => (
                <li key={detail} className="pl-4 before:relative before:-left-4 before:text-[#83d3dd] before:content-['-']">
                  {detail.trim()}
                </li>
              ))}
              </ul>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            {project.github !== "#" && (
              <a className="inline-flex items-center gap-2 rounded-full bg-[#83d3dd] px-4 py-2.5 text-sm font-semibold text-[#071014] transition hover:bg-[#b8e4e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]" href={project.github} target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faGithub} />
                View source
              </a>
            )}
            {project.url !== "#" && (
              <a className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]" href={project.url} target="_blank" rel="noreferrer">
                Visit project
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
              </a>
            )}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
