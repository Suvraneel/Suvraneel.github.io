import { type Metadata, NextPage } from "next";
import { spaceBoards, tasaOrbiter } from "@font";
import SkillSphereRenderer from "./SkillSphereRenderer";

export const metadata: Metadata = {
  title: "Skills | Official Portfolio | Suvraneel",
  description:
    "Skills | Official Portfolio Website | Suvraneel Bhuin | Full Stack Web3.0 Developer | NextJS/TypeScript/React/Spring Boot/NodeJS",
};

const Skills: NextPage = () => {
  return (
    <div className="w-11/12 h-full flex flex-row justify-start mx-10">
      {/*      <div className="h-screen z-0">
        <SplineObj
          // scene={"https://prod.spline.design/WmbvQs0Ze0BaJKW2/scene.splinecode"}
          scene={"./spline/sceneCOLORSTREAM.splinecode"}
        />
      </div>*/}
      <div
        id="Skills"
        className="h-fit flex flex-col justify-evenly items-start w-11/12 md:w-2/3 gap-2 sm:gap-4 text-white ml-2 my-4 md:ml-12 md:my-10 md:px-10 md:py-5 rounded-lg shadow-xl shadow-purple-500/20 bg-black/20 backdrop-blur-sm z-10 font-secondary"
      >
        <div
          className={`ml-10 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold mb-5 md:mb-10 mt-2 sm:mt-0 ${spaceBoards.className}`}
        >
          SKILLS
        </div>
        <>
          <p className={tasaOrbiter.className}>
            As a <b className="font-semibold">full stack Web (3.0) developer</b>
            , I possess a diverse range of skills and a passion for creating
            beautiful and responsive web applications. I&apos;m a self-taught
            developer who constantly seeks opportunities to learn and improve my
            abilities.
          </p>
          <p className={tasaOrbiter.className}>
            During my time as an undergraduate, I took on a range of projects,
            from small single-page applications to{" "}
            <b className="font-semibold">
              large-scale, production-ready web applications.
            </b>{" "}
            One of the most rewarding experiences was{" "}
            <b className="font-semibold">
              collaborating with talented student dev peers in numerous
              hackathons
            </b>
            , where we brought innovative ideas to life. I&apos;e also had the
            privilege of{" "}
            <b className="font-semibold">
              mentoring over 10,000 open-source contributors
            </b>{" "}
            across India and offering freelance services to remote startups.
          </p>
          <p className={tasaOrbiter.className}>
            My expertise lies in{" "}
            <b className="font-semibold">front-end development</b>, where
            I&apos;ve a strong command over{" "}
            <b className="font-semibold">
              JavaScript, TypeScript, React, Next &amp; Tailwind
            </b>
            . I&apos;m equally adept at working with{" "}
            <b className="font-semibold">back-end technologies</b> such as{" "}
            <b className="font-semibold">
              NodeJS, Express, MongoDB, mySQL, PHP
            </b>
            , and <b className="font-semibold">decentralized technologies</b>{" "}
            such as{" "}
            <b className="font-semibold">
              IPFS, Filecoin, EtherJS, Pinata, various wallet SDKs, among
              others.
            </b>
          </p>
          <p className={tasaOrbiter.className}>
            <b className="font-semibold">
              I&apos;m currently toying with 3D UI Designs within
              NextJS-TailwindCSS based applications &amp; venturing into the
              exciting realm of Web3 DApps
            </b>
            . My journey as a full stack Web 3.0 developer is defined by my
            passion for learning, diverse skill set, and dedication to pushing
            the boundaries of what&apos;s possible.{" "}
            <b className="font-semibold">
              I&apos;m excited to see where this path leads me next.
            </b>
          </p>
        </>
      </div>
      <SkillSphereRenderer />
    </div>
  );
};

export default Skills;
