"use client";

import { AnimatePresence, motion, useIsPresent, useReducedMotion, type Variants } from "motion/react";
import { useRef, useState, type Ref } from "react";
import { spaceBoards, tasaOrbiter } from "@font";
import { useReveal } from "@hooks/useReveal";
import LiftHeading from "@components/LiftHeading";

const capabilityAreas = [
  {
    id: "systems",
    index: "01",
    label: "Backend & Systems",
    title: "Systems that hold up beyond the happy path.",
    description:
      "I build services, APIs, data flows, and integrations that need to stay reliable as requirements and dependencies change.",
    technologies: ["Java", "Spring Boot", "Node.js", "FastAPI", "REST/SOAP APIs", "SQL", "PostgreSQL", "Redis", "Elasticsearch"],
    proof: "Backend engineering is my forte: dependable services, reliable integrations, and clear system boundaries.",
  },
  {
    id: "product",
    index: "02",
    label: "Product interfaces",
    title: "Turning complex systems into simple experiences.",
    description:
      "I build responsive interfaces and frontend architecture that make complex products easier to use, from the overall structure to the details people interact with.",
    technologies: ["TypeScript", "JavaScript", "React", "Next.js", "Tailwind CSS", "HTML", "CSS", "React Native"],
    proof: "I connect interface decisions to the systems and data behind them.",
  },
  {
    id: "agentic",
    index: "03",
    label: "Agentic Engineering",
    title: "Agentic workflows with controls built in.",
    description:
      "I connect language models to company data and external tools through workflows designed for controlled, reliable execution.",
    technologies: ["Agentic AI", "LLMs", "MCP", "Tool Calling", "RAG", "PostgreSQL/pgvector", "Redis", "FastAPI", "Celery"],
    proof: "My work includes 18+ permission-aware MCP tools, tenant-scoped access, approval gates, audit trails, and cross-tool workflows.",
  },
  {
    id: "protocols",
    index: "04",
    label: "Web3 & Protocols",
    title: "Building across chains, wallets, and decentralized infrastructure.",
    description:
      "My Web3 work has included smart contracts, cross-chain protocols, wallets, and decentralized infrastructure, from product interfaces to protocol integrations.",
    technologies: ["Solidity", "Ethers.js", "Viem", "Wagmi", "Axelar", "IPFS", "WalletConnect"],
    proof: "My Web3 projects have covered interfaces and decentralized systems across multiple protocols.",
  },
];

const practices = [
  ["01", "Understand the problem", "Translate business goals into functional and non-functional requirements, separating must-haves from good-to-haves."],
  ["02", "Keep complexity intentional", "Clarify the problem and solve it with the simplest design that meets the requirements; avoid abstraction without a clear need."],
  ["03", "Ship, observe, improve", "Ship for production, learn from real usage, and iterate to keep systems reliable as they grow."],
];

type CapabilityArea = (typeof capabilityAreas)[number];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
// Overdamped, so the disc lands on the next numeral without bouncing past it.
const DISC_SPRING = { type: "spring", stiffness: 520, damping: 42, mass: 0.6 } as const;

// The incoming panel mounts at once beside the outgoing one (popLayout), so the
// column is never empty: the old copy fades in 120ms while the new one cascades
// in four steps 35ms apart, the last settling by 445ms.
const panelMotion: Variants = {
  hidden: {},
  shown: { opacity: 1, transition: { duration: 0.12, staggerChildren: 0.035 } },
  gone: { opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } },
};
// Each step rises from the side the selection moved towards: from below for a
// later area, from above for an earlier one (custom: 1 or -1).
const panelStep: Variants = {
  hidden: (direction: number = 1) => ({ opacity: 0, y: 10 * direction }),
  shown: { opacity: 1, y: 0, transition: { duration: 0.34, ease: EASE_OUT } },
};
// Reduced motion keeps the steps still: the same settled frame as panelStep, so
// the server HTML (rendered before the preference is known) hydrates unchanged.
const panelStill: Variants = {
  hidden: { opacity: 1, y: 0 },
  shown: { opacity: 1, y: 0 },
};
// Reduced motion: a plain 120ms crossfade, no offset, no cascade.
const panelFade: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.12, ease: "linear" } },
  gone: { opacity: 0, transition: { duration: 0.12, ease: "linear" } },
};

export default function SkillsPage() {
  const [activeId, setActiveId] = useState(capabilityAreas[0].id);
  // Empty until the first switch, so it never reads out on load.
  const [announcement, setAnnouncement] = useState("");
  // Every switch mounts a fresh panel. A re-selected area must not revive its own
  // still-exiting copy: the first panel's copy skips animations (initial={false})
  // and would stay at its exit opacity.
  const [switches, setSwitches] = useState(0);
  /** 1 when the latest switch moved to a later area, -1 to an earlier one. */
  const [direction, setDirection] = useState<1 | -1>(1);
  const reduceMotion = useReducedMotion();
  const activeArea = capabilityAreas.find((area) => area.id === activeId) ?? capabilityAreas[0];
  const practiceSteps = useRef<HTMLOListElement>(null);

  useReveal(practiceSteps);

  return (
    <main className="nav-gap min-h-[100dvh] overflow-x-hidden bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-20 sm:px-10 sm:pb-28 sm:pt-24 lg:px-14 xl:px-20">
        <header className="max-w-4xl">
          <LiftHeading className={`text-4xl leading-none tracking-[-0.04em] sm:text-6xl ${spaceBoards.className}`}>
            Skills
          </LiftHeading>
          <p className={`mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl/8 ${tasaOrbiter.className}`}>
            Skills matter only when they help a team ship, operate, and improve a real system.
          </p>
        </header>

        <section
          className="mt-10 grid gap-6 border-t border-white/15 pt-8 sm:mt-12 sm:pt-10 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16"
          aria-label="Engineering capabilities"
        >
          <aside className="min-w-0" aria-label="Capability areas">
            <h2 className={`text-xl font-semibold text-white sm:text-2xl ${tasaOrbiter.className}`}>
              Areas of practice
            </h2>
            <div className="relative mt-6">
              <span
                aria-hidden="true"
                className="absolute bottom-8 left-[1.125rem] top-8 hidden w-px bg-white/15 lg:block"
              />
              <div className="relative grid grid-cols-2 gap-x-3 lg:grid-cols-1 lg:gap-x-0">
                {capabilityAreas.map((area) => {
                  const active = area.id === activeId;
                  return (
                    <button
                      key={area.id}
                      type="button"
                      aria-pressed={active}
                      aria-controls="capability-detail"
                      onClick={() => {
                        if (active) return;
                        const indexOf = (id: string) => capabilityAreas.findIndex((each) => each.id === id);
                        setDirection(indexOf(area.id) > indexOf(activeId) ? 1 : -1);
                        setActiveId(area.id);
                        setAnnouncement(area.label);
                        setSwitches((count) => count + 1);
                      }}
                      className={`group flex min-h-[4.75rem] w-full items-center gap-2 border-b border-white/10 py-3 text-left transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:gap-4 ${active ? "text-white" : "text-white/50 hover:text-white/85"}`}
                    >
                      {/* No stacking context per row, so the travelling disc passes over
                          every ring on the spine and under every numeral, in either direction. */}
                      <span className="relative grid size-8 shrink-0 place-items-center font-mono text-xs tabular-nums lg:size-9">
                        {/* The 2x2 grid keeps the colour crossfade; on the spine (lg) the disc carries the fill. */}
                        <span
                          aria-hidden="true"
                          className={`absolute inset-0 rounded-full border transition-[border-color,background-color] duration-300 ${active ? "border-accent bg-accent lg:border-white/25 lg:bg-black" : "border-white/25 bg-black group-hover:border-white/50"}`}
                        />
                        {active && (
                          <motion.span
                            aria-hidden="true"
                            layoutId="skills-active"
                            transition={reduceMotion ? { duration: 0 } : DISC_SPRING}
                            className="absolute inset-0 z-[1] hidden rounded-full bg-accent lg:block"
                          />
                        )}
                        <span className={`relative z-[2] transition-colors duration-300 ${active ? "text-[#05080c]" : "text-white/55"}`}>
                          {area.index}
                        </span>
                      </span>
                      <span className="min-w-0 text-sm font-medium lg:text-lg">{area.label}</span>
                      <span
                        className={`ml-auto hidden shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-opacity duration-300 lg:inline-flex ${active ? "opacity-70" : "opacity-0 group-hover:opacity-45"}`}
                      >
                        {active ? "Selected" : "View"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Positioned: popLayout lifts the outgoing panel out to absolute, at its spot in here. */}
          <div className="relative min-w-0 lg:border-l lg:border-white/15 lg:pl-12">
            {/* Mounted from the start: the article below remounts on every switch, and a
                live region that arrives with its text is skipped by screen readers. */}
            <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
            <AnimatePresence mode="popLayout" initial={false}>
              <CapabilityPanel
                key={`${activeArea.id}-${switches}`}
                area={activeArea}
                direction={direction}
                reduceMotion={Boolean(reduceMotion)}
              />
            </AnimatePresence>
          </div>
        </section>

        <section className="mt-14 border-t border-white/15 pt-9 sm:mt-16 sm:pt-11" aria-labelledby="practice-heading">
          <div className="grid gap-7 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
            <h2
              id="practice-heading"
              className={`max-w-sm pt-0 text-2xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-3xl/tight lg:pt-5 ${tasaOrbiter.className}`}
            >
              How I build
            </h2>
            <ol ref={practiceSteps} className="divide-y divide-white/10">
              {practices.map(([index, title, description]) => (
                <li
                  key={index}
                  data-reveal
                  className="grid gap-x-5 gap-y-2 py-5 sm:grid-cols-[3rem_minmax(11rem,0.7fr)_minmax(0,1.3fr)] sm:items-baseline sm:gap-y-0"
                >
                  <span className="font-mono text-xs tabular-nums text-accent">{index}</span>
                  <h3 className={`text-base font-semibold text-white sm:text-lg ${tasaOrbiter.className}`}>
                    {title}
                  </h3>
                  <p className={`text-sm leading-6 text-white/55 sm:text-base/6 ${tasaOrbiter.className}`}>
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}

function CapabilityPanel({
  area,
  direction,
  reduceMotion,
  ref,
}: Readonly<{ area: CapabilityArea; direction: 1 | -1; reduceMotion: boolean; ref?: Ref<HTMLElement> }>) {
  // The outgoing panel lingers through its fade over the new one: only the
  // present one keeps the ids, the accessibility tree and the pointer.
  const present = useIsPresent();
  const step = reduceMotion ? panelStill : panelStep;

  return (
    <motion.article
      ref={ref}
      id={present ? "capability-detail" : undefined}
      aria-labelledby={present ? "capability-detail-title" : undefined}
      aria-hidden={present ? undefined : true}
      variants={reduceMotion ? panelFade : panelMotion}
      initial="hidden"
      animate="shown"
      exit="gone"
      className={`min-h-[27rem] border-t border-white/15 pt-8 sm:pt-10 lg:border-t-0 lg:pt-0 ${present ? "" : "pointer-events-none"}`}
    >
      <motion.div variants={step} custom={direction} className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em]">
        <span className="tabular-nums text-accent">{area.index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-white/25" />
        <span className="text-white/55">{area.label}</span>
      </motion.div>
      <motion.h2
        variants={step} custom={direction}
        id={present ? "capability-detail-title" : undefined}
        className={`mt-7 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl/[1.08] lg:text-5xl/[1.08] ${tasaOrbiter.className}`}
      >
        {area.title}
      </motion.h2>
      <motion.p variants={step} custom={direction} className={`mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
        {area.description}
      </motion.p>

      {/* Technologies and proof enter as one step, keeping the cascade to four. */}
      <motion.div variants={step} custom={direction}>
        <div className="mt-9 border-t border-white/10 pt-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">
            Technologies
          </h3>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2" aria-label={`${area.label} technologies`}>
            {area.technologies.map((technology, index) => (
              <li key={technology} className="flex items-center gap-3 font-mono text-sm text-white/75">
                <span>{technology}</span>
                {index < area.technologies.length - 1 && (
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/25" />
                )}
              </li>
            ))}
          </ul>
        </div>

        <p className={`mt-7 max-w-2xl text-sm leading-6 text-white/55 sm:text-base/6 ${tasaOrbiter.className}`}>
          {area.proof}
        </p>
      </motion.div>
    </motion.article>
  );
}
