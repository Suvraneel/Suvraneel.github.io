import Head from "next/head";
import SplineObj from "../components/SplineObj";
import useSound from "use-sound";
const About = () => {
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
        <SplineObj
          scene={"https://prod.spline.design/Mk-LZd5LpzlOllLb/scene.splinecode"}
        />
      </div>
      <div className="h-fit w-full lg:w-1/2 xl:w-1/3 absolute left-2 sm:left-32 top-2 sm:top-10 z-100 text-white flex flex-col gap-5 sm:gap-6 px-5 sm:px-0">
        <div className="ml-16 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold md:mb-10">
          About Me
        </div>
        <p>
          Imma Full Stack Web3.0 Developer based in India. I&apos;m currently
          pursuing the final year of my B.Tech in Computer Science &amp;
          Engineering at UCSTA, University of Calcutta.
        </p>
        <p>
          Well-organised person, collaborative, innovative and team-player.
          Problem-solver, Conscientious and active, perfectionist with a keen
          attention to detail. Loves to learn contemporary technology stacks
          &amp; concoct fresh utilitarian website/software with dynamic,
          intuitive user experience.
        </p>
        <p>
          Interested in working on ambitious projects with dedicated &amp;
          driven team. Have an idea?
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
    </>
  );
};

export default About;
