import Head from "next/head";
import SplineObj from "../components/SplineObj";
const About = () => {
  return (
    <>
      <Head>
        <title>About Me</title>
      </Head>
      <div className="h-screen">
        <SplineObj scene={"./spline/sceneROG.splinecode"} />
        {/* <SplineObj
          scene={"https://prod.spline.design/Mk-LZd5LpzlOllLb/scene.splinecode"}
        /> */}
      </div>
      <div className="h-screen w-full lg:w-1/2 xl:w-1/3 absolute left-32 top-10 z-100 text-white">
        <div className="text-3xl md:text-4xl xl:text-5xl animated-heading bold mb-2 md:mb-10">
          About Me
        </div>
        <p className="w-full h-5"></p>
        <p>
          Imma Full Stack Web3.0 Developer based in India. I&apos;m currently
          pursuing the final year of my B.Tech in Computer Science &amp;
          Engineering at UCSTA, University of Calcutta.
        </p>
        <br />
        <p>
          Well-organised person, collaborative, innovative and team-player.
          Problem-solver, Conscientious and active, perfectionist with a keen
          attention to detail. Loves to learn contemporary technology stacks
          &amp; concoct fresh utilitarian website/software with dynamic,
          intuitive user experience.
        </p>
        <br />
        <p>
          Interested in working on ambitious projects with dedicated &amp;
          driven team. Have an idea?
        </p>
        <br />
        <p>Awesome! Let&apos;s BUIDL the next big thing...</p>
      </div>
    </>
  );
};

export default About;
