"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import ChronoCard from "@components/ChronoCard";
import TimelineDate from "@components/TimelineDate";
import { communityLeadershipData, educationData, workData } from "@data/workData";
import SplineObj from "@components/SplineObject";
import { spaceBoards, tasaOrbiter } from "@font";
import { getTransition } from "@components/transition/transitionStore";
import { stepSplineScroll } from "@lib/splineScroll";

// The plant's Spline Scroll event (scene-PLANT.splinecode, object "plant") has 40 steps.
const PLANT_STEPS = 40;

const Work = () => {
  const plantAside = useRef<HTMLElement>(null);
  const plantObserver = useRef<IntersectionObserver | null>(null);

  useEffect(() => () => plantObserver.current?.disconnect(), []);

  // The plant always loads as the full plant. When Work is reached from below
  // (a backward lift lands at its bottom) or restored part way down, step it
  // to match, once its canvas is in view so the Spline runtime counts the steps.
  const syncPlantToScroll = useCallback(() => {
    const aside = plantAside.current;
    const main = aside?.closest("main");
    const canvas = aside?.querySelector("canvas");
    if (!aside || !main || !canvas) return;

    const t = getTransition();
    const range = main.scrollHeight - main.clientHeight;
    const progress =
      t && !t.settled && t.to === "/work"
        ? t.direction < 0 ? 1 : 0
        : range > 0 ? main.scrollTop / range : 0;
    const steps = Math.round(progress * PLANT_STEPS);
    if (!steps) return;

    plantObserver.current?.disconnect();
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      // One frame later, so Spline's own in-view observer has flipped too.
      requestAnimationFrame(() => stepSplineScroll(steps));
    });
    plantObserver.current = observer;
    observer.observe(canvas);
  }, []);

  return (
      <main className="relative h-[100dvh] overflow-y-auto overflow-x-hidden text-gray-50">
        <div className="min-h-screen grid md:grid-cols-[20rem_minmax(0,1fr)] lg:grid-cols-[24rem_minmax(0,1fr)] xl:grid-cols-[28rem_minmax(0,1fr)] gap-0">
          <aside ref={plantAside} aria-label="Growing plant illustration" className="sticky top-0 hidden h-screen self-start overflow-hidden border-r border-white/10 md:block">
            {/*<SplineObj scene={"https://prod.spline.design/ZqRCvFgqp5-tcTea/scene.splinecode"} />*/}
            <SplineObj scene={"/spline/scene-PLANT.splinecode"} onLoad={syncPlantToScroll} />
          </aside>
          <div className="min-w-0">
            <div className="max-w-6xl px-5 pb-20 pt-20 sm:px-10 sm:pb-28 sm:pt-14 lg:px-14">
          <header className="max-w-4xl">
            <h1 className={`animated-heading text-4xl font-bold leading-none tracking-[-0.045em] sm:text-6xl ${spaceBoards.className}`}>
              Work &amp; experience
            </h1>
            <p className={`mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg ${tasaOrbiter.className}`}>
              Enterprise engineering, open-source leadership, and the communities that shaped how I build.
            </p>
           </header>

           <div>
           <section className="mt-10 sm:mt-12" aria-labelledby="professional-work">
            <h2 id="professional-work" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Professional experience
            </h2>
            <div className="mt-2">
              {workData.map((curElem) => (
                <ChronoCard key={`${curElem.company}-${curElem.duration}`} curElem={curElem} />
              ))}
            </div>
          </section>

          <section className="mt-16 sm:mt-20" aria-labelledby="community-leadership">
            <div className="max-w-2xl">
              <h2 id="community-leadership" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                Community &amp; leadership
              </h2>
            </div>
            <div className="mt-2">
              {communityLeadershipData.map((curElem) => (
                <ChronoCard key={`${curElem.company}-${curElem.duration}`} curElem={curElem} variant="community" />
              ))}
             </div>
           </section>

           <section className="mt-16 sm:mt-20" aria-labelledby="education">
            <h2 id="education" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Education
            </h2>
            <article className="relative mt-2 grid gap-4 py-8 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-6 sm:py-7">
              <div className="flex items-start gap-3 sm:flex-col sm:items-start sm:gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] p-1">
                  <Image
                    src={`/images/work-assets/${educationData.image}`}
                    alt="University College of Science, Technology & Agriculture emblem"
                    width={56}
                    height={56}
                    className="h-full w-full object-contain invert"
                  />
                </div>
                <div className="pt-2 sm:hidden">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/40">
                    {educationData.duration}
                  </p>
                  <p className={`mt-1 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-accent/70 ${tasaOrbiter.className}`}>
                    {educationData.institution}
                  </p>
                </div>
                <TimelineDate duration={educationData.duration} />
              </div>
              <div className="relative grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-8 sm:pl-5">
                <div aria-hidden="true" className="absolute left-0 top-1 hidden h-2 w-2 rounded-full bg-white/50 sm:block" />
                <div>
                  <p className={`hidden text-[0.68rem] font-medium uppercase tracking-[0.2em] text-accent/70 sm:block ${tasaOrbiter.className}`}>
                    {educationData.institution}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-2xl">
                    {educationData.degree}
                  </h3>
                  <p className={`mt-1 text-sm leading-6 text-white/55 ${tasaOrbiter.className}`}>{educationData.campus}</p>
                </div>
                <p className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-1 sm:text-right">
                  <span className={`text-3xl font-semibold leading-none tracking-[-0.03em] text-white tabular-nums sm:text-4xl ${tasaOrbiter.className}`}>
                    {educationData.score.split(" ")[0]}
                  </span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-accent/70">
                    {educationData.score.split(" ").slice(1).join(" ")}
                  </span>
                </p>
              </div>
             </article>
           </section>
           </div>

            </div>
          </div>
        </div>
      </main>
  );
};

export default Work;
