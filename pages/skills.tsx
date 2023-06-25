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
        className="h-fit flex flex-col justify-evenly items-center w-11/12 md:w-1/2 gap-2 sm:gap-5 text-white mt-2 sm:mt-6"
      >
        <div className="ml-10 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold mb-5 md:mb-10 mt-2 sm:mt-0">
          Skills
        </div>
        <p>
          As a full stack Web (3.0) developer, I possess a diverse range of skills and a passion for creating beautiful and responsive web applications. I am a self-taught developer who constantly seeks opportunities to learn and improve my abilities.
        </p>
        <p>
          Throughout my undergraduate years, I worked on various projects, ranging from small single-page applications to large-scale production-grade web applications. I have had the privilege of collaborating with talented and dedicated student developers in numerous hackathons. Additionally, I have mentored over 10000+ open-source contributors across India and have also provided freelance services to startups remotely.
        </p>
        <p>
          My expertise lies in front-end development, where I have a strong command over HTML, CSS, JavaScript, TypeScript, React, Next.js, and Tailwind CSS. I am equally adept at working with back-end technologies such as Node.js, Express, MongoDB, SQL, PHP, IPFS, among others.
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
