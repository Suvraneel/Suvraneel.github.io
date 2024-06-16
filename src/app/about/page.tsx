import { type Metadata, NextPage } from "next";
import Canvas from "@components/Particle";
import { spaceBoards, tasaOrbiter } from "@font";
import DownloadResumeBtn from "./DownloadResumeBtn";
import { Glow, GlowCapture } from "@codaworks/react-glow";

export const metadata: Metadata = {
  title: "About | Official Portfolio | Suvraneel",
  description:
    "About | Official Portfolio Website | Suvraneel Bhuin | Full Stack Web3.0 Developer | NextJS/TypeScript/React/Spring Boot/NodeJS",
};

const About: NextPage = () => {
  return (
    <>
      <div className="h-fit w-full lg:w-3/5 xl:w-1/2 absolute left-2 sm:left-32 top-2 sm:top-10 z-100 text-white flex flex-col px-5 sm:px-0">
        <div
          className={`ml-16 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold md:mb-5 ${spaceBoards.className}`}
        >
          About Me
        </div>
        <GlowCapture
          className={`w-full relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 justify-between py-5 ${tasaOrbiter.className}`}
        >
          <Glow color={"#B338FF"} className="bg-black/80 w-full rounded-lg">
            <div className="bg-glow/15 border border-neutral-500 glow:border-glow rounded-lg p-4 md:p-10 flex flex-col justify-evenly gap-3">
              <span className="text-2xl md:text-5xl font-semibold">100+</span>
              <span className="text-sm md:text-md text-nowrap">
                Projects Completed
              </span>
            </div>
          </Glow>
          <Glow color={"#B338FF"} className="bg-black/80 w-full rounded-lg">
            <div className="bg-glow/15 border border-neutral-500 glow:border-glow rounded-lg p-4 md:p-10 flex flex-col justify-evenly gap-3">
              <span className="text-2xl md:text-5xl font-semibold">20+</span>
              <span className="text-sm md:text-md text-nowrap">
                Hackathons 🏆
              </span>
            </div>
          </Glow>
          <Glow color={"#B338FF"} className="bg-black/80 w-full rounded-lg">
            <div className="bg-glow/15 border border-neutral-500 glow:border-glow rounded-lg p-4 md:p-10 flex flex-col justify-evenly gap-3">
              <span className="text-2xl md:text-5xl font-semibold">
                2<span className={"text-sm"}>YEARS</span>
              </span>
              <span className="text-sm md:text-md text-nowrap">Experience</span>
            </div>
          </Glow>
          <div className="w-full rounded-lg col-span-3">
            <Glow color={"#B338FF"} className="bg-black/80 w-full rounded-lg">
              <div className="w-full bg-glow/15 border border-neutral-500 glow:border-glow rounded-lg p-10 flex flex-col justify-evenly gap-3">
                <span className="text-2xl md:text-2xl font-semibold uppercase">
                  Clean Code &nbsp; &gt;/&lt; &nbsp; Future-Proof Design
                </span>
                <ul className="text-sm md:text-md list-inside list-[square]">
                  <li>
                    Craft responsive, accessible, and performant web apps.
                  </li>
                  <li>Design scalable, maintainable, and secure codebases.</li>
                  <li>
                    Push the boundaries of what&apos;s possible. 3D ? Web3 ?
                    Bring it on!
                  </li>
                </ul>
              </div>
            </Glow>
          </div>
        </GlowCapture>
        {/*<p className={tasaOrbiter.className}>
          I am a Full Stack Web3.0 Developer based in India. I recently
          graduated with a B.Tech in Computer Science & Engineering from UCSTA,
          University of Calcutta.
        </p>
        <p className={tasaOrbiter.className}>
          As a well-organized &amp; collaborative individual, I thrive in team
          environments and enjoy bringing innovative solutions to the table. I
          have a passion for problem-solving &amp; take pride in my
          conscientious &amp; active approach to projects. With a keen attention
          to detail, I strive for perfection &amp; aim to create dynamic &amp;
          intuitive user experiences through the utilization of contemporary
          technology stacks.
        </p>
        <p className={tasaOrbiter.className}>
          Interested in working on ambitious projects with dedicated &amp;
          driven team.
          <br />
          Have an idea?
        </p>
        <p className={tasaOrbiter.className}>
          Awesome! Let&apos;s BUIDL the next big thing...
        </p>*/}
        <p className="w-full h-5 hidden sm:block"></p>
        <a href="./docs/Suvraneel_Bhuin_Resume.pdf" target="_blank">
          <DownloadResumeBtn />
        </a>
      </div>
      <div className="hidden h-screen w-1/2 lg:flex flex-grow flex-col flex-end absolute right-0 bottom-0 pointer-events-none">
        <Canvas />
      </div>
    </>
  );
};

export default About;
