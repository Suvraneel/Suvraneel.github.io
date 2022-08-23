import { useEffect } from "react";
import { SkillSphere } from "../components/SkillSphere";

const Skills = () => {
  const rgb = [0, 255, 255];
  const props = {
    rgb: rgb,
    width: 500,
    height: 500,
    radius: 150,
    fontSize: 16,
  };
  // Skill Sphere Script
  useEffect(() => {
    SkillSphere(rgb);
  }, []);

  return (
    <div className="w-full h-full flex flex-row justify-evenly">
      <div className="h-full flex flex-col justify-center">
        {/* <Script src="./scripts/skillSphere.js" strategy="afterInteractive" /> */}
        <canvas id="canvas"></canvas>
      </div>
      <div
        id="About Me"
        className="h-full flex flex-col justify-center w-5/12 text-md gap-5 text-white"
      >
        <div className="text-3xl md:text-4xl xl:text-5xl animated-heading bold mb-2 md:mb-10">Skills</div>
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
          I&apos;m currently toying with 3D UI Designs in Next.js-TailwindCSS based applications &amp; building Web3 Dapps.
        </p>
      </div>
    </div>
  );
};

export default Skills;