import { skillClusters } from "@/components/portfolio/data";
import { Reveal } from "@/components/portfolio/reveal";

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="mx-auto min-h-[100svh] w-full max-w-6xl snap-start snap-always px-6 py-16 md:px-10"
      aria-labelledby="skills-title"
    >
      <Reveal>
        <p className="section-kicker text-xs uppercase tracking-[0.24em] text-fuchsia-200/75">Skills</p>
        <h2 id="skills-title" className="section-heading mt-4 text-3xl font-semibold text-zinc-100 sm:text-4xl">
          Diverse engineering depth across Web2 and Web3.
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {skillClusters.map((cluster, index) => (
          <Reveal
            key={cluster.title}
            delayMs={index * 70}
            className="surface-card rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="section-heading text-xl font-semibold text-zinc-100">{cluster.title}</h3>
              <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_22px_2px_rgba(34,211,238,0.7)]" />
            </div>
            <p className="section-body text-sm text-zinc-300">{cluster.depth}</p>
            <ul className="section-body mt-5 space-y-2 text-sm text-zinc-200/95">
              {cluster.capabilities.map((capability) => (
                <li key={capability} className="surface-pill rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  {capability}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

