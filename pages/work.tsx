import Head from "next/head";
import Image from "next/image";
import ChronoCard from "@components/ChronoCard";
import { communityLeadershipData, educationData, workData } from "./api/workData";
import { NextPage } from "next";
import SplineObj from "@components/SplineObject";
import { spaceBoards } from "@font";

const Work: NextPage = () => {
  return (
    <>
      <Head>
        <title>Work | Portfolio - Suvraneel</title>
        <meta
          name="description"
          content="Work | Official Portfolio Website | Suvraneel Bhuin"
        />
      </Head>
      <main className="h-screen overflow-y-auto overflow-x-hidden text-gray-50">
        <div className="min-h-full md:grid md:grid-cols-[20rem_minmax(0,1fr)] lg:grid-cols-[24rem_minmax(0,1fr)] xl:grid-cols-[28rem_minmax(0,1fr)]">
          <aside aria-label="Growing plant illustration" className="sticky top-0 hidden h-screen overflow-hidden border-r border-white/10 md:block">
            <SplineObj scene={"https://prod.spline.design/ZqRCvFgqp5-tcTea/scene.splinecode"} />
          </aside>
          <div className="min-w-0">
            <div className="max-w-6xl px-5 pb-20 pt-20 sm:px-10 sm:pb-28 sm:pt-14 lg:px-14">
          <header className="max-w-4xl">
            <h1 className={`animated-heading text-4xl font-bold leading-none tracking-[-0.045em] sm:text-6xl ${spaceBoards.className}`}>
              Work &amp; experience
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Enterprise engineering, open-source leadership, and the communities that shaped how I build.
            </p>
          </header>

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

          <section className="mt-16 border-t border-white/10 pt-10 sm:mt-20 sm:pt-12" aria-labelledby="education">
            <h2 id="education" className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Education
            </h2>
            <article className="mt-6 grid gap-5 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] p-2.5">
                <Image
                  src={`/images/work-assets/${educationData.image}`}
                  alt="University College of Science, Technology & Agriculture emblem"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain invert"
                />
              </div>
              <div>
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#9bb7c0] sm:text-xs">
                  {educationData.institution}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-white sm:text-2xl">
                  {educationData.degree}
                </h3>
                <p className="mt-1 text-sm leading-6 text-white/55">{educationData.campus}</p>
              </div>
              <dl className="flex gap-5 text-xs font-medium uppercase tracking-[0.16em] text-white/45 sm:block sm:text-right">
                <div>
                  <dt className="sr-only">Period</dt>
                  <dd>{educationData.duration}</dd>
                </div>
                <div className="sm:mt-2">
                  <dt className="sr-only">Grade</dt>
                  <dd className="text-[#9bb7c0]">{educationData.score}</dd>
                </div>
              </dl>
            </article>
          </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Work;
