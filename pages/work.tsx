import Head from "next/head";
import { useCallback, useRef } from "react";
import ChronoCard from "@components/ChronoCard";
import { workData } from "./api/workData";
import { NextPage } from "next";
import SplineObj from "@components/SplineObject";
import { spaceBoards } from "@font";

const Work: NextPage = () => {
  const splineApp = useRef<any>(null);
  const scrollPanel = useRef<HTMLDivElement>(null);

  const syncPlantToScroll = useCallback(() => {
    const panel = scrollPanel.current;
    const app = splineApp.current;

    if (!panel || !app) return;

    // The physical scroll range naturally includes every rendered experience
    // and its real height. A new/longer experience extends the growth range
    // instead of making a fixed number of wheel steps finish too early.
    const maximumScroll = Math.max(panel.scrollHeight - panel.clientHeight, 1);
    const scrollProgress = Math.min(Math.max(panel.scrollTop / maximumScroll, 0), 1);
    const reverseChronologicalGrowth = 1 - scrollProgress;
    const plant = app.findObjectByName("plant");

    if (plant) {
      const plantScale = 0.18 + reverseChronologicalGrowth * 2.2;
      plant.scale.x = plantScale;
      plant.scale.y = plantScale;
      plant.scale.z = plantScale;
    }

    ["Leaf Instance", "Leaf Instance 2", "Leaf Instance 3"].forEach((name) => {
      const leaf = app.findObjectByName(name);
      if (!leaf) return;

      const leafScale = 0.05 + reverseChronologicalGrowth * 2.45;
      leaf.scale.x = leafScale;
      leaf.scale.y = leafScale;
      leaf.scale.z = leafScale;
    });
  }, []);

  return (
    <>
      <Head>
        <title>Work | Portfolio - Suvraneel</title>
        <meta
          name="description"
          content="Work | Official Portfolio Website | Suvraneel Bhuin"
        />
      </Head>
      <div className="h-full w-80 xl:w-96 fixed left-0 bottom-0 z-50 hidden md:block">
        <SplineObj
          scene={"https://prod.spline.design/ZqRCvFgqp5-tcTea/scene.splinecode"}
          onLoad={(app) => {
            splineApp.current = app;
            window.requestAnimationFrame(syncPlantToScroll);
          }}
        />
      </div>
      <div
        ref={scrollPanel}
        onScroll={syncPlantToScroll}
        className="h-screen w-full flex flex-col items-center p-5 sm:p-0 overflow-auto"
      >
        <div
          className={`ml-8 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold my-2 md:my-10 ${spaceBoards.className}`}
        >
          Work &amp; Experience
        </div>
        <div className="w-full h-full flex flex-col md:grid grid-cols-12 text-gray-50 z-0">
          {workData.map((curElem) => {
            return <ChronoCard key={curElem.duration} curElem={curElem} />;
          })}
        </div>
      </div>
    </>
  );
};

export default Work;
