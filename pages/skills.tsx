import Head from "next/head";
import { useEffect } from "react";
import { SkillSphere } from "../components/SkillSphere";
import { NextPage } from "next";

const Skills: NextPage = () => {

  // Skill Sphere Script
  useEffect(() => {
    SkillSphere();
  }, []);

  return (
    <div className="w-full h-full flex flex-row justify-evenly">
      <Head>
        <title>Skills | Portfolio - Suvraneel</title>
        <meta name="description" content="Skills | Official Portfolio Website | Suvraneel Bhuin" />
      </Head>
      <div className="h-full hidden sm:flex flex-col justify-center">
        {/* <Script src="./scripts/skillSphere.js" strategy="afterInteractive" /> */}
        <canvas id="canvas"></canvas>
      </div>
      <div
        id="Skills"
        className="h-fit flex flex-col justify-evenly items-center w-11/12 md:w-5/12 gap-2 sm:gap-5 text-white mt-2 sm:mt-6"
      >
        <div className="ml-10 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold mb-5 md:mb-10 mt-2 sm:mt-0">
          Skills
        </div>
        <p>
          I am a full stack Web (3.0) developer with a passion for creating
          beautiful &amp; responsive web applications. I am a self-taught
          developer with a passion for learning new technologies and constantly
          looking to improve my skills.
        </p>
        <p>
          Over the past 3 years of pursuing my undergraduate I have worked on a
          wide range of projects, from small single page applications to large
          scale production-grade web applications. I have worked with awesome,
          talented and committed student developers in numerous hackathons,
          mentored over 8000+ opensource contributors pan-India and freelanced
          remotely for a few startups.
        </p>
        <p>
          I have a strong background in front-end development - HTML, CSS, JS,
          React, Next.js, TailwindCSS are my forte. I have also worked with
          back-end technologies - Node.js, Express, MongoDB, SQL, PHP, Web3.js,
          IPFS, Firebase and more.
        </p>
        <p>
          I&apos;m currently toying with 3D UI Designs in Next.js-TailwindCSS
          based applications &amp; building Web3 Dapps.
        </p>
      </div>
    </div>
  );
};

export default Skills;
