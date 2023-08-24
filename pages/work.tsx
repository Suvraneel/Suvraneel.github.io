import Head from "next/head";
import { useState } from "react";
import ChronoCard from "../components/ChronoCard";
import { workData } from "./api/workData";
import { NextPage } from "next";
import SplineObj from "../components/SplineObject";
import { spaceBoards } from "@/fonts";

const Work: NextPage = () => {
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
          scene={"https://prod.spline.design/2s42dKJz8AJDZ1HK/scene.splinecode"}
        />
      </div>
      <div className="h-screen w-full flex flex-col items-center p-5 sm:p-0 overflow-auto">
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
}

export default Work;
