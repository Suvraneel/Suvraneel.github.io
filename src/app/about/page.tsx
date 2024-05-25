import { type Metadata, NextPage } from "next";
import Canvas from "@components/Particle";
import { spaceBoards, tasaOrbiter } from "@font";
import DownloadResumeBtn from "./DownloadResumeBtn";

export const metadata: Metadata = {
  title: "About | Official Portfolio | Suvraneel",
  description:
    "About | Official Portfolio Website | Suvraneel Bhuin | Full Stack Web3.0 Developer | NextJS/TypeScript/React/Spring Boot/NodeJS",
};

const About: NextPage = () => {
  return (
    <>
      <div className="h-fit w-full lg:w-3/5 xl:w-1/2 absolute left-2 sm:left-32 top-2 sm:top-10 z-100 text-white flex flex-col gap-5 sm:gap-6 px-5 sm:px-0">
        <div
          className={`ml-16 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold md:mb-10 ${spaceBoards.className}`}
        >
          About Me
        </div>
        <p className={tasaOrbiter.className}>
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
        </p>
        <p className="w-full h-5 hidden sm:block"></p>
        <a href="./docs/Suvraneel_Bhuin_Resume.pdf" target="_blank">
          <DownloadResumeBtn />
        </a>
      </div>
      <div className="hidden h-screen w-1/2 lg:flex flex-grow flex-col flex-end absolute right-0 bottom-0">
        <Canvas />
      </div>
    </>
  );
};

export default About;
