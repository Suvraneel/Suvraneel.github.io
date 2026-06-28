import { MagneticButton } from "@/components/portfolio/magnetic-button";
import { Reveal } from "@/components/portfolio/reveal";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="mx-auto min-h-[100svh] w-full max-w-6xl snap-start snap-always px-6 pb-24 pt-16 md:px-10"
      aria-labelledby="contact-title"
    >
      <Reveal className="surface-card contact-panel rounded-[2rem] border border-white/15 bg-gradient-to-br from-fuchsia-500/20 via-zinc-950 to-cyan-500/10 p-8 sm:p-12">
        <p className="section-kicker text-xs uppercase tracking-[0.24em] text-cyan-100/80">Contact</p>
        <h2 id="contact-title" className="section-heading mt-4 max-w-2xl text-3xl font-semibold text-zinc-100 sm:text-5xl">
          Have an idea? Let&apos;s build the next big thing.
        </h2>
        <p className="section-body mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
          Interested in working on ambitious projects with a dedicated and driven team.
          Reach out directly or connect with me on LinkedIn and GitHub.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticButton href="mailto:bsuvraneel@gmail.com" label="bsuvraneel@gmail.com" />
          <MagneticButton
            href="https://www.linkedin.com/in/suvraneel-bhuin/"
            label="LinkedIn"
            variant="ghost"
            ariaLabel="Open Suvraneel LinkedIn profile"
          />
          <MagneticButton
            href="https://github.com/Suvraneel"
            label="GitHub"
            variant="ghost"
            ariaLabel="Open Suvraneel GitHub profile"
          />
        </div>
      </Reveal>
    </section>
  );
}

