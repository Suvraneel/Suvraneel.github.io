"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

const cardLayout = [
  "md:col-span-7 md:row-span-2",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-6 xl:col-span-4",
  "md:col-span-6 xl:col-span-4",
  "md:col-span-6 xl:col-span-4",
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
    <main className="nav-gap h-screen overflow-y-auto overflow-x-hidden bg-[#07090d] text-white">
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
          <div className="grid auto-rows-[15rem] gap-3 sm:auto-rows-[18rem] sm:gap-4 md:grid-cols-12 lg:auto-rows-[20rem]">
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
  const overview = project.details.split("|")[0]?.trim();

  const startPreview = () => {
    previewVideo.current?.play().catch(() => undefined);
    onHoverStart();
  };

  const stopPreview = () => {
    previewVideo.current?.pause();
    onHoverEnd();
  };

  return (
    <motion.button
      type="button"
      aria-haspopup="dialog"
      aria-label={`Open ${project.name}`}
      className={`group relative min-h-0 overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#10141c] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd] ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      onHoverStart={startPreview}
      onHoverEnd={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
    >
      {hasDedicatedPreview ? (
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07090d] via-[#07090d]/80 to-transparent px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
        <h2 className="max-w-[22ch] text-xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-2xl">
          {project.name}
        </h2>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] translate-x-4 flex-col border-l border-white/10 bg-[#0a0f16]/90 p-5 opacity-0 backdrop-blur-md transition duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none md:flex sm:p-6">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[#83d3dd]">Project brief</span>
        <h3 className="mt-3 text-lg font-semibold leading-tight tracking-[-0.025em] text-white lg:text-xl">{project.name}</h3>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/65">{overview}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {project.tech_stk.slice(0, 3).map((tech) => (
            <span key={tech} className="rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] font-medium text-white/70">
              {tech}
            </span>
          ))}
        </div>
        <span className="mt-4 text-xs font-semibold text-[#b8e4e8]">Open case notes ↗</span>
      </div>
    </motion.button>
  );
}

function ProjectArchivePreview({ project }: { project: Project }) {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#0c1420] p-6 sm:p-8">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(131,211,221,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(131,211,221,0.09)_1px,transparent_1px)] [background-size:2rem_2rem]" />
      <div className="relative flex w-full flex-col justify-between border border-[#83d3dd]/20 p-4 sm:p-5">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[#83d3dd]">Project archive</span>
        <div>
          <span className="block text-4xl font-semibold tracking-[-0.08em] text-white/15">{project.name.slice(0, 2).toUpperCase()}</span>
          <span className="mt-3 block max-w-[18ch] text-sm font-medium leading-6 text-white/75">Interactive walkthrough coming soon.</span>
        </div>
      </div>
    </div>
  );
}
