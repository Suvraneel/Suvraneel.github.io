import { Reveal } from "@/components/portfolio/reveal";

export function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto grid min-h-[100svh] w-full max-w-6xl snap-start snap-always content-center gap-10 px-6 py-16 md:grid-cols-[0.85fr_1.15fr] md:px-10"
      aria-labelledby="about-title"
    >
      <Reveal>
        <p className="section-kicker text-xs uppercase tracking-[0.24em] text-fuchsia-200/80">About</p>
        <h2 id="about-title" className="section-heading mt-4 text-3xl font-semibold text-zinc-100 sm:text-4xl">
          Full stack Web3 builder with a product-first mindset.
        </h2>
      </Reveal>

      <Reveal className="surface-card rounded-3xl border border-white/12 bg-white/[0.025] p-7 text-zinc-300 backdrop-blur-sm" delayMs={100}>
        <p className="section-body text-base leading-relaxed sm:text-lg">
          I am a Full Stack Web 3.0 Developer based in India, recently graduated in
          Computer Science and Engineering from UCSTA, University of Calcutta. I enjoy
          shaping ambitious ideas into production-ready products with clean architecture.
        </p>
        <p className="section-body mt-5 text-base leading-relaxed sm:text-lg">
          My journey spans open-source mentorship, national hackathons, technical program
          leadership, and full stack product execution. I am currently exploring advanced 3D
          UI patterns in Next.js and TailwindCSS applications while deepening my Web3 craft.
        </p>
      </Reveal>
    </section>
  );
}

