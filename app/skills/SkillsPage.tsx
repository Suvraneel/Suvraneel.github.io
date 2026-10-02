"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { spaceBoards, tasaOrbiter } from "@font";

const capabilityAreas = [
  {
    id: "systems",
    index: "01",
    label: "Services & integrations",
    title: "System boundaries that hold up in production.",
    description:
      "My core professional work is backend engineering: services, APIs, data flows, and integrations that need to remain understandable as teams, requirements, and dependencies change.",
    tools: ["TypeScript", "Node.js", "REST APIs", "SQL", "Docker"],
    proof: "Useful when the important work happens behind the interface: reliability, ownership, and maintainability.",
  },
  {
    id: "product",
    index: "02",
    label: "Product interfaces",
    title: "Interfaces that make complex work feel clear.",
    description:
      "I translate product requirements into maintainable frontend systems: considered states, responsive behavior, and interfaces that help people complete real work without fighting the software.",
    tools: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Figma"],
    proof: "Useful when a product needs both visual judgement and reliable implementation.",
  },
  {
    id: "protocols",
    index: "03",
    label: "Protocols & communities",
    title: "Technical systems people can participate in.",
    description:
      "Open-source programmes and Web3 work taught me how product, documentation, incentives, and developer communities fit together. I bring that systems view to collaboration, not just code.",
    tools: ["Solidity", "IPFS", "Filecoin", "Ethers.js", "Git"],
    proof: "Useful when adoption, developer experience, and technical foundations need to move together.",
  },
];

const practices = [
  ["01", "Clarify the boundary", "Make responsibilities, inputs, and failure cases visible early."],
  ["02", "Keep it supportable", "Prefer decisions that a future teammate can understand and operate."],
  ["03", "Document the useful parts", "Turn context into something teams and communities can act on."],
];

export default function SkillsPage() {
  const [activeId, setActiveId] = useState(capabilityAreas[0].id);
  const reduceMotion = useReducedMotion();
  const activeArea = capabilityAreas.find((area) => area.id === activeId) ?? capabilityAreas[0];

  return (
    <main className="nav-gap min-h-[100dvh] overflow-x-hidden bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-28 sm:px-10 sm:pb-28 sm:pt-24 lg:px-14 xl:px-20">
        <header className="max-w-4xl">
          <h1 className={`animated-heading text-4xl font-bold leading-none tracking-[-0.04em] sm:text-6xl ${spaceBoards.className}`}>
            Skills
          </h1>
          <p className={`mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl ${tasaOrbiter.className}`}>
            Skills matter only when they help a team ship, operate, and improve a real system.
          </p>
        </header>

        <section
          className="mt-14 grid gap-8 border-t border-white/15 pt-8 sm:mt-16 sm:pt-10 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16"
          aria-label="Engineering capabilities"
        >
          <aside className="min-w-0" aria-label="Capability areas">
            <h2 className={`text-xl font-semibold text-white sm:text-2xl ${tasaOrbiter.className}`}>
              Areas of practice
            </h2>
            <div className="relative mt-6">
              <span
                aria-hidden="true"
                className="absolute bottom-8 left-[1.125rem] top-8 w-px bg-white/15"
              />
              <div className="relative grid">
                {capabilityAreas.map((area) => {
                  const active = area.id === activeId;
                  return (
                    <button
                      key={area.id}
                      type="button"
                      aria-pressed={active}
                      aria-controls="capability-detail"
                      onClick={() => setActiveId(area.id)}
                      className={`group flex min-h-[4.75rem] w-full items-center gap-4 border-b border-white/10 py-3 text-left transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#83d3dd] ${active ? "text-white" : "text-white/50 hover:text-white/85"}`}
                    >
                      <span
                        className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border font-mono text-xs tabular-nums transition-[color,border-color,background-color] duration-300 ${active ? "border-[#83d3dd] bg-[#83d3dd] text-[#05080c]" : "border-white/25 bg-black text-white/55 group-hover:border-white/50"}`}
                      >
                        {area.index}
                      </span>
                      <span className="min-w-0 text-base font-medium sm:text-lg">{area.label}</span>
                      <span
                        className={`ml-auto shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-opacity duration-300 ${active ? "opacity-70" : "opacity-0 group-hover:opacity-45"}`}
                      >
                        {active ? "Selected" : "View"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="min-w-0 lg:border-l lg:border-white/15 lg:pl-12">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                id="capability-detail"
                key={activeArea.id}
                aria-labelledby="capability-detail-title"
                aria-live="polite"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-[27rem] border-t border-white/15 pt-8 sm:pt-10 lg:border-t-0 lg:pt-0"
              >
                <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em]">
                  <span className="tabular-nums text-[#83d3dd]">{activeArea.index}</span>
                  <span aria-hidden="true" className="h-px w-8 bg-white/25" />
                  <span className="text-white/45">{activeArea.label}</span>
                </div>
                <h2
                  id="capability-detail-title"
                  className={`mt-7 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl ${tasaOrbiter.className}`}
                >
                  {activeArea.title}
                </h2>
                <p className={`mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>
                  {activeArea.description}
                </p>

                <div className="mt-9 border-t border-white/10 pt-5">
                  <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                    Tools
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2" aria-label={`${activeArea.label} tools`}>
                    {activeArea.tools.map((tool, index) => (
                      <li key={tool} className="flex items-center gap-3 font-mono text-sm text-white/75">
                        <span>{tool}</span>
                        {index < activeArea.tools.length - 1 && (
                          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/25" />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className={`mt-7 max-w-2xl text-sm leading-6 text-white/55 sm:text-base ${tasaOrbiter.className}`}>
                  {activeArea.proof}
                </p>
              </motion.article>
            </AnimatePresence>
          </div>
        </section>

        <section className="mt-20 border-t border-white/15 pt-9 sm:mt-24 sm:pt-11" aria-labelledby="practice-heading">
          <div className="grid gap-7 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
            <h2
              id="practice-heading"
              className={`max-w-sm text-2xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-3xl ${tasaOrbiter.className}`}
            >
              How I approach the work.
            </h2>
            <ol className="divide-y divide-white/10">
              {practices.map(([index, title, description]) => (
                <li
                  key={index}
                  className="grid gap-x-5 gap-y-2 py-5 sm:grid-cols-[3rem_minmax(11rem,0.7fr)_minmax(0,1.3fr)] sm:items-baseline sm:gap-y-0"
                >
                  <span className="font-mono text-xs tabular-nums text-[#83d3dd]">{index}</span>
                  <h3 className={`text-base font-semibold text-white sm:text-lg ${tasaOrbiter.className}`}>
                    {title}
                  </h3>
                  <p className={`text-sm leading-6 text-white/55 sm:text-base ${tasaOrbiter.className}`}>
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
