"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { spaceBoards, tasaOrbiter } from "@font";

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

export default function SkillsPage() {
  const [activeId, setActiveId] = useState(capabilityAreas[0].id);
  const reduceMotion = useReducedMotion();
  const activeArea = capabilityAreas.find((area) => area.id === activeId) ?? capabilityAreas[0];

  return (
    <main className="nav-gap min-h-[100dvh] overflow-x-hidden bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-20 sm:px-10 sm:pb-28 sm:pt-24 lg:px-14 xl:px-20">
        <header className="max-w-4xl">
          <h1 className={`animated-heading text-4xl font-bold leading-none tracking-[-0.04em] sm:text-6xl ${spaceBoards.className}`}>
            Skills
          </h1>
          <p className={`mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl ${tasaOrbiter.className}`}>
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
                      onClick={() => setActiveId(area.id)}
                      className={`group flex min-h-[4.75rem] w-full items-center gap-2 border-b border-white/10 py-3 text-left transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#83d3dd] lg:gap-4 ${active ? "text-white" : "text-white/50 hover:text-white/85"}`}
                    >
                      <span
                        className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs tabular-nums transition-[color,border-color,background-color] duration-300 lg:size-9 ${active ? "border-[#83d3dd] bg-[#83d3dd] text-[#05080c]" : "border-white/25 bg-black text-white/55 group-hover:border-white/50"}`}
                      >
                        {area.index}
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
                    Technologies
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2" aria-label={`${activeArea.label} technologies`}>
                    {activeArea.technologies.map((technology, index) => (
                      <li key={technology} className="flex items-center gap-3 font-mono text-sm text-white/75">
                        <span>{technology}</span>
                        {index < activeArea.technologies.length - 1 && (
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

        <section className="mt-14 border-t border-white/15 pt-9 sm:mt-16 sm:pt-11" aria-labelledby="practice-heading">
          <div className="grid gap-7 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
            <h2
              id="practice-heading"
              className={`max-w-sm pt-0 text-2xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-3xl lg:pt-5 ${tasaOrbiter.className}`}
            >
              How I build
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
