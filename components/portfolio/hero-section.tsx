import { HeroScene } from "@/components/portfolio/hero-scene";
import { MagneticButton } from "@/components/portfolio/magnetic-button";
import { Reveal } from "@/components/portfolio/reveal";

type HeroSectionProps = {
  scrollProgress: number;
};

export function HeroSection({ scrollProgress }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative h-[100svh] min-h-[46rem] w-full snap-start snap-always overflow-hidden"
      aria-labelledby="hero-title"
    >
      <HeroScene scrollProgress={scrollProgress} />
      <div className="hero-overlay absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/55 to-zinc-950/18" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid h-full w-full max-w-6xl items-center gap-10 px-6 pb-10 pt-28 md:px-10">
        <Reveal className="flex flex-col justify-center">
          <p className="section-kicker hero-pill mb-6 inline-flex w-fit rounded-full border border-cyan-200/20 bg-cyan-300/10 px-4 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100">
            Full Stack Web 3.0 Developer
          </p>
          <h1
            id="hero-title"
            className="section-heading max-w-3xl text-4xl font-semibold leading-tight text-zinc-100 sm:text-5xl lg:text-6xl"
          >
            Building immersive digital experiences at the intersection of product, code, and Web3.
          </h1>
          <p className="section-body mt-6 max-w-xl text-base leading-relaxed text-zinc-200 sm:text-lg">
            India-based developer focused on ambitious products, production-ready systems,
            and memorable interfaces that pair motion design with practical engineering.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <MagneticButton href="#projects" label="Explore Projects" />
            <MagneticButton
              href="#contact"
              label="Let's Build"
              variant="ghost"
              ariaLabel="Jump to contact section"
            />
          </div>
        </Reveal>
      </div>

      <p className="sr-only">
        Full-width animated 3D translucent interface frame that subtly straightens on hover and responds to pointer movement.
      </p>
    </section>
  );
}

