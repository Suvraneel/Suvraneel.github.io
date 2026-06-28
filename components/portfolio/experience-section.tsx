import { experience } from "@/components/portfolio/data";
import { Reveal } from "@/components/portfolio/reveal";

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="mx-auto min-h-[100svh] w-full max-w-6xl snap-start snap-always px-6 py-16 md:px-10"
      aria-labelledby="experience-title"
    >
      <Reveal>
        <p className="section-kicker text-xs uppercase tracking-[0.24em] text-cyan-200/75">Experience</p>
        <h2
          id="experience-title"
          className="section-heading mt-4 text-3xl font-semibold text-zinc-100 sm:text-4xl"
        >
          Work and leadership experience.
        </h2>
      </Reveal>

      <div className="mt-10 space-y-5">
        {experience.map((item, index) => (
          <Reveal
            key={`${item.company}-${item.year}`}
            delayMs={index * 70}
            className="surface-card rounded-3xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="section-kicker text-xs uppercase tracking-[0.24em] text-fuchsia-200/70">{item.year}</p>
                <h3 className="section-heading mt-2 text-xl font-semibold text-zinc-100">
                  {item.title} <span className="section-muted text-zinc-400">at {item.company}</span>
                </h3>
              </div>
              <span className="surface-pill inline-flex h-8 w-fit items-center rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 text-xs text-cyan-100">
                Leadership Track
              </span>
            </div>
            <p className="section-body mt-4 text-sm leading-relaxed text-zinc-300">{item.summary}</p>
            <ul className="section-body mt-4 space-y-2 text-sm text-zinc-200">
              {item.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

