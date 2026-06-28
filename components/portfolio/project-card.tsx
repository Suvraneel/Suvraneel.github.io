"use client";

import { useState } from "react";

import type { Project } from "@/components/portfolio/data";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");

  return (
    <article
      className="project-card rounded-3xl border border-white/15 bg-white/[0.03] p-7 backdrop-blur-md transition duration-300 hover:border-cyan-200/40"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;

        const rotateX = (0.5 - y) * 10;
        const rotateY = (x - 0.5) * 14;

        setTransform(
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
        );
      }}
      onPointerLeave={() =>
        setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)")
      }
      style={{ transform }}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="section-heading text-xl font-semibold tracking-tight text-zinc-100">{project.title}</h3>
        <span className="surface-pill rounded-full border border-fuchsia-200/25 px-3 py-1 text-xs uppercase tracking-[0.2em] text-fuchsia-200/85">
          Case Study
        </span>
      </div>
      <p className="section-body text-sm leading-relaxed text-zinc-300">{project.summary}</p>
      <p className="section-kicker mt-4 text-sm text-cyan-200">{project.impact}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {project.stack.map((item) => (
          <li
            key={item}
            className="surface-pill rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300"
          >
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-4">
        <a
          href={project.href}
          target="_blank"
          rel="noreferrer"
          className="section-heading inline-flex items-center gap-2 text-sm font-semibold text-zinc-100 transition hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          aria-label={`Open live project for ${project.title}`}
        >
          Live project
          <span aria-hidden="true">{"->"}</span>
        </a>
        {project.repo ? (
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            className="section-body inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-fuchsia-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
            aria-label={`Open source code for ${project.title}`}
          >
            Source code
            <span aria-hidden="true">{"->"}</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

