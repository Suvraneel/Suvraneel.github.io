"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import useSound from "use-sound";
import ProjectModal from "@components/ProjectModal";
import projectsData from "@data/projectsDat";
import { spaceBoards, tasaOrbiter } from "@font";

type Project = (typeof projectsData)[number];

const placeholderDemoId = "EKGJ-pzSEns";

function getYouTubeId(url: string) {
  const match = url.match(/embed\/([^?&#/]+)/);
  return match?.[1] ?? null;
}

// Bento rhythm, in gallery order. Rows alternate which side gets the wide card and
// step down in height toward the end; at lg the last six cards move into two
// narrower 3-up rows so the final projects are the smallest. Each row sums to 12
// columns at md and lg. Literal class names keep Tailwind's scanner happy.
const cardLayout = [
  // lg rows: 7/5 · 8/4 · 4/8 · 5/7 · 4/5/3 · 5/3/4
  // md rows: 7/5 · 8/4 · 4/8 · 5/7 · 7/5 · 4/8 · 7/5
  "md:col-span-7 lg:col-span-7",
  "md:col-span-5 lg:col-span-5",
  "md:col-span-8 lg:col-span-8",
  "md:col-span-4 lg:col-span-4",
  "md:col-span-4 lg:col-span-4",
  "md:col-span-8 lg:col-span-8",
  "md:col-span-5 lg:col-span-5",
  "md:col-span-7 lg:col-span-7",
  "md:col-span-7 lg:col-span-4",
  "md:col-span-5 lg:col-span-5",
  "md:col-span-4 lg:col-span-3",
  "md:col-span-8 lg:col-span-5",
  "md:col-span-7 lg:col-span-3",
  "md:col-span-5 lg:col-span-4",
];

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const reduceMotion = useReducedMotion();
  const [playSnap, { stop: stopSnap }] = useSound("/sounds/snap.wav", { volume: 0.35 });
  const [playPop] = useSound("/sounds/pop.wav", { volume: 0.45 });

  const openProject = (project: Project) => {
    setSelectedProject(project);
    playPop();
  };

  return (
    <main className="nav-gap min-h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#07090d] text-white">
      <div className="mx-auto max-w-[1500px] px-5 pb-24 pt-14 sm:px-10 lg:px-14 lg:pt-16">
        <header className="max-w-3xl">
          <h1 className={`animated-heading text-4xl leading-[0.95] tracking-[-0.045em] sm:text-6xl ${spaceBoards.className}`}>
            Projects
          </h1>
          <p className={`mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg ${tasaOrbiter.className}`}>
            A selection of web products, open-source tools, and experiments across engineering, community, and Web3.
          </p>
        </header>

        <section className="mt-10 sm:mt-14" aria-label="Project gallery">
          <div className="grid grid-cols-1 auto-rows-[15rem] gap-3 sm:auto-rows-[18rem] sm:gap-4 md:grid-cols-12 md:grid-rows-[24rem_20rem_18rem_17rem_16rem_14rem_13rem] lg:grid-rows-[24rem_21rem_19rem_17.5rem_16rem_12.5rem]">
            {projectsData.map((project, index) => (
              <ProjectTile
                key={("id" in project && project.id) || project.name}
                project={project}
                className={cardLayout[index] ?? "md:col-span-6 xl:col-span-4"}
                reduceMotion={Boolean(reduceMotion)}
                onOpen={() => openProject(project)}
                onHoverStart={playSnap}
                onHoverEnd={stopSnap}
              />
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            key={("id" in selectedProject && selectedProject.id) || selectedProject.name}
            project={selectedProject}
            handleClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function ProjectTile({
  project,
  className,
  reduceMotion,
  onOpen,
  onHoverStart,
  onHoverEnd,
}: {
  project: Project;
  className: string;
  reduceMotion: boolean;
  onOpen: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const previewVideo = useRef<HTMLVideoElement>(null);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const hasDedicatedPreview = project.gif !== "video-to-be-added.webm";
  const youtubeId = getYouTubeId(project.video);
  const hasVideoThumbnail = Boolean(youtubeId && youtubeId !== placeholderDemoId && !thumbnailFailed);
  const thumbnail = "thumbnail" in project ? project.thumbnail : undefined;
  const overview = project.details.split("|")[0]?.trim();

  const startPreview = () => {
    previewVideo.current?.play().catch(() => undefined);
    onHoverStart();
  };

  const stopPreview = () => {
    previewVideo.current?.pause();
    onHoverEnd();
  };

  // Keyboard focus previews the tile silently; the snap sound is for pointer hover.
  const startFocusPreview = () => {
    previewVideo.current?.play().catch(() => undefined);
  };

  const stopFocusPreview = () => {
    previewVideo.current?.pause();
  };

  return (
    <motion.button
      type="button"
      aria-haspopup="dialog"
      aria-label={`Open ${project.name}`}
      className={`group relative min-h-0 overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#10141c] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      onHoverStart={startPreview}
      onHoverEnd={stopPreview}
      onFocus={startFocusPreview}
      onBlur={stopFocusPreview}
    >
      {thumbnail && !thumbnailFailed ? (
        <div className="relative z-0 h-full w-full overflow-hidden bg-[#060606]">
          {/* Let the thumbnail's colours soften into the tile behind its crisp, uncropped copy. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
            src={thumbnail}
            alt=""
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0 bg-[#060606]/35" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="relative z-10 h-full w-full object-contain opacity-95 transition duration-500 ease-out group-hover:scale-[1.015] group-hover:opacity-100 motion-reduce:transition-none"
            src={thumbnail}
            alt=""
            onError={() => setThumbnailFailed(true)}
            style={{
              maskImage: "radial-gradient(ellipse at center, #000 82%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, #000 82%, transparent 100%)",
            }}
          />
        </div>
      ) : hasDedicatedPreview ? (
        <video
          ref={previewVideo}
          className="h-full w-full object-cover opacity-75 transition duration-500 ease-out group-hover:scale-[1.035] group-hover:opacity-100 motion-reduce:transition-none"
          preload="metadata"
          muted
          loop
          playsInline
          src={`/images/project-assets/${project.gif}`}
        />
      ) : hasVideoThumbnail ? (
        // YouTube provides a project-specific still until a real walkthrough is available.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="h-full w-full object-cover opacity-80 transition duration-500 ease-out group-hover:scale-[1.035] group-hover:opacity-100 motion-reduce:transition-none"
          src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
          alt=""
          onError={() => setThumbnailFailed(true)}
        />
      ) : (
        <ProjectArchivePreview project={project} />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#07090d] via-[#07090d]/80 to-transparent px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
        <h2 className="max-w-[22ch] text-xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-2xl">
          {project.name}
        </h2>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-[52%] translate-x-4 flex-col border-l border-white/10 bg-[#0a0f16]/90 p-5 opacity-0 backdrop-blur-md transition duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none md:flex sm:p-6">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-accent">Project brief</span>
        <h3 className="mt-3 text-lg font-semibold leading-tight tracking-[-0.025em] text-white lg:text-xl">{project.name}</h3>
        <p className={`mt-3 line-clamp-4 text-sm leading-6 text-white/65 ${tasaOrbiter.className}`}>{overview}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {project.tech_stk.slice(0, 3).map((tech) => (
            <span key={tech} className="rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] font-medium text-white/70">
              {tech}
            </span>
          ))}
        </div>
        <span className="mt-4 text-xs font-semibold text-white">Open case notes ↗</span>
      </div>
    </motion.button>
  );
}

function ProjectArchivePreview({ project }: { project: Project }) {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#0c1420] p-6 sm:p-8">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgb(var(--accent)/0.09)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--accent)/0.09)_1px,transparent_1px)] [background-size:2rem_2rem]" />
      <div className="relative flex w-full flex-col justify-between border border-accent/20 p-4 sm:p-5">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-accent">Project archive</span>
        <div>
          <span className="block text-4xl font-semibold tracking-[-0.08em] text-white/15">{project.name.slice(0, 2).toUpperCase()}</span>
          <span className="mt-3 block max-w-[18ch] text-sm font-medium leading-6 text-white/75">Interactive walkthrough coming soon.</span>
        </div>
      </div>
    </div>
  );
}
