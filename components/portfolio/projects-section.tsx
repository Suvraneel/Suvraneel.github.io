import { projects } from "@/components/portfolio/data";
import { ProjectCard } from "@/components/portfolio/project-card";
import { Reveal } from "@/components/portfolio/reveal";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="mx-auto min-h-[100svh] w-full max-w-6xl snap-start snap-always px-6 py-16 md:px-10"
      aria-labelledby="projects-title"
    >
      <Reveal>
        <p className="section-kicker text-xs uppercase tracking-[0.24em] text-cyan-200/75">Projects</p>
        <h2 id="projects-title" className="section-heading mt-4 text-3xl font-semibold text-zinc-100 sm:text-4xl">
          Projects across open source, Web3, AI, and product engineering.
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, index) => (
          <Reveal key={project.title} delayMs={index * 80}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

