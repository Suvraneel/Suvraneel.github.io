"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { spaceBoards, tasaOrbiter } from "@font";

const capabilityAreas = [
  {
    id: "product",
    index: "01",
    label: "Product interfaces",
    title: "Interfaces that make complex work feel clear.",
    description:
      "I translate product requirements into maintainable frontend systems: considered states, responsive behavior, and interfaces that help people complete real work without fighting the software.",
    tools: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Figma"],
    proof: "Useful when a product needs both visual judgement and reliable implementation.",
  },
  {
    id: "systems",
    index: "02",
    label: "Services & integrations",
    title: "System boundaries that hold up in production.",
    description:
      "My core professional work is backend engineering: services, APIs, data flows, and integrations that need to remain understandable as teams, requirements, and dependencies change.",
    tools: ["TypeScript", "Node.js", "REST APIs", "SQL", "Docker"],
    proof: "Useful when the important work happens behind the interface: reliability, ownership, and maintainability.",
  },
  {
    id: "protocols",
    index: "03",
    label: "Protocols & communities",
    title: "Technical systems people can participate in.",
    description:
      "Open-source programmes and Web3 work taught me how product, documentation, incentives, and developer communities fit together. I bring that systems view to collaboration—not just code.",
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
    <main className="nav-gap relative h-screen overflow-x-hidden overflow-y-auto bg-[#07090d] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-32 top-16 h-[32rem] w-[32rem] rounded-full bg-[#183c53]/20 blur-[140px]" />
        <div className="absolute -bottom-48 left-[20%] h-[30rem] w-[30rem] rounded-full bg-[#0b727a]/10 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(184,214,218,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(184,214,218,0.8)_1px,transparent_1px)] [background-size:3rem_3rem]" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 pb-24 pt-28 sm:px-10 lg:px-14 lg:pb-32 lg:pt-20 xl:px-20">
        <header className="grid gap-7 border-b border-white/10 pb-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.6fr)] lg:items-end lg:pb-16">
          <div>
            <p className={`text-xs font-medium uppercase tracking-[0.22em] text-[#9bb7c0] ${tasaOrbiter.className}`}>Capability map</p>
            <h1 className={`animated-heading mt-5 text-5xl font-bold leading-[0.9] tracking-[-0.055em] sm:text-6xl xl:text-7xl ${spaceBoards.className}`}>Skills</h1>
          </div>
          <p className={`max-w-xl text-lg leading-8 text-white/70 sm:text-xl ${tasaOrbiter.className}`}>
            Skills matter only when they help a team ship, operate, and improve a real system.
          </p>
        </header>

        <section className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(14rem,0.42fr)_minmax(0,1fr)] lg:gap-16" aria-labelledby="capability-heading">
          <aside className="lg:sticky lg:top-14 lg:h-fit">
            <p id="capability-heading" className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">Areas of practice</p>
            <div className="mt-5 grid gap-2 lg:block lg:space-y-2">
              {capabilityAreas.map((area) => {
                const active = area.id === activeId;
                return (
                  <button
                    key={area.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveId(area.id)}
                    className={`group flex w-full items-center gap-3 rounded-[0.85rem] px-3 py-3 text-left transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd] ${active ? "bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "text-white/50 hover:bg-white/[0.035] hover:text-white/85"}`}
                  >
                    <span className={`font-mono text-xs tabular-nums ${active ? "text-[#83d3dd]" : "text-white/30"}`}>{area.index}</span>
                    <span className="text-sm font-medium">{area.label}</span>
                    <span className={`ml-auto text-sm transition duration-300 ${active ? "translate-x-0 text-[#83d3dd]" : "-translate-x-1 text-white/20 group-hover:translate-x-0"}`}>↗</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={activeArea.id}
                initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0d141c]/90 p-6 shadow-[0_24px_80px_rgba(3,18,24,0.38),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-9 lg:p-11"
              >
                <div className="pointer-events-none absolute -right-4 -top-3 font-mono text-[14rem] font-semibold leading-none tracking-[-0.12em] text-white/[0.025]" aria-hidden="true">{activeArea.index}</div>
                <div className="relative max-w-3xl">
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#83d3dd]">{activeArea.label}</p>
                  <h2 className={`mt-5 max-w-2xl text-3xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl ${tasaOrbiter.className}`}>{activeArea.title}</h2>
                  <p className={`mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8 ${tasaOrbiter.className}`}>{activeArea.description}</p>
                  <div className="mt-9 flex flex-wrap gap-2" aria-label={`${activeArea.label} tools`}>
                    {activeArea.tools.map((tool) => (
                      <span key={tool} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-[#c9e5e8]">{tool}</span>
                    ))}
                  </div>
                  <p className={`mt-10 border-l-2 border-[#83d3dd]/60 pl-4 text-sm leading-6 text-white/55 sm:text-base ${tasaOrbiter.className}`}>{activeArea.proof}</p>
                </div>
              </motion.article>
            </AnimatePresence>

            <section className="mt-8 border-t border-white/10 pt-8 sm:mt-10 sm:pt-10" aria-labelledby="practice-heading">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9bb7c0]">Working principles</p>
                  <h2 id="practice-heading" className={`mt-3 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl ${tasaOrbiter.className}`}>How I approach the work.</h2>
                </div>
              </div>
              <div className="mt-7 grid gap-px overflow-hidden rounded-[1rem] border border-white/10 bg-white/10 sm:grid-cols-3">
                {practices.map(([index, title, description]) => (
                  <article key={index} className="min-h-[11rem] bg-[#0a1017] p-5 sm:p-6">
                    <p className="font-mono text-xs tabular-nums text-[#83d3dd]">{index}</p>
                    <h3 className={`mt-5 text-lg font-semibold tracking-[-0.025em] text-white ${tasaOrbiter.className}`}>{title}</h3>
                    <p className={`mt-3 text-sm leading-6 text-white/55 ${tasaOrbiter.className}`}>{description}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
