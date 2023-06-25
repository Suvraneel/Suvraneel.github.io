import Head from "next/head";
import SplineObj from "../components/SplineObject";
import useSound from "use-sound";
import { NextPage } from 'next';
import Canvas from '../components/Particle'

const About: NextPage = () => {
  const snapSfx = "./sounds/snap.wav";
  const confirmSfx = "./sounds/confirm.wav";
  const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.25 });
  const [playConfirm] = useSound(confirmSfx, { volume: 0.25 });
  return (
    <>
      <Head>
        <title>About | Portfolio - Suvraneel</title>
        <meta name="description" content="About | Official Portfolio Website | Suvraneel Bhuin" />
      </Head>
      <div className="h-screen">
        {/* <SplineObj scene={"./spline/sceneROG.splinecode"} /> */}
        {/* <SplineObj
          scene={"https://prod.spline.design/Mk-LZd5LpzlOllLb/scene.splinecode"}
        /> */}
      </div>
      <div className="h-fit w-full lg:w-3/5 xl:w-1/2 absolute left-2 sm:left-32 top-2 sm:top-10 z-100 text-white flex flex-col gap-5 sm:gap-6 px-5 sm:px-0">
        <div className="ml-16 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold md:mb-10">
          About Me
        </div>
        <p>
          I am a Full Stack Web3.0 Developer based in India. I recently graduated with a B.Tech in Computer Science & Engineering from UCSTA, University of Calcutta.
        </p>
        <p>
          As a well-organized &amp; collaborative individual, I thrive in team environments and enjoy bringing innovative solutions to the table. I have a passion for problem-solving &amp; take pride in my conscientious &amp; active approach to projects. With a keen attention to detail, I strive for perfection &amp; aim to create dynamic &amp; intuitive user experiences through the utilization of contemporary technology stacks.
        </p>
        <p>
          Interested in working on ambitious projects with dedicated &amp;
          driven team.<br/>Have an idea?
        </p>
        <p>Awesome! Let&apos;s BUIDL the next big thing...</p>
        <p className="w-full h-5 hidden sm:block"></p>
        <a href="./docs/Suvraneel_Bhuin_Resume.pdf" target="_blank">
          <button
            className="resume-button h-fit w-fit px-5 py-2 text-lg font-semibold mb-3"
            role="button"
            onMouseEnter={() => playSnap()}
            onMouseLeave={() => stopSnap()}
            onClick={() => playConfirm()}
          >
            Download Resume
          </button>
        </a>
      </div>
      <div className="h-screen w-1/2 flex flex-grow flex-col flex-end absolute right-0 bottom-0">
        <Canvas />
      </div>
    </>
  );
};

export default About;
