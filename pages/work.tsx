import Head from "next/head";
import { useState } from "react";
import ChronoCard from "../components/ChronoCard";
import { workData } from "./api/workData";
import { NextPage } from "next";
const Work: NextPage = () => {
  return (
    <>
      <Head>
        <title>Work | Portfolio - Suvraneel</title>
        <meta name="description" content="Work | Official Portfolio Website | Suvraneel Bhuin" />
      </Head>
      <div className="h-screen w-full flex flex-col items-center p-5 sm:p-0">
        <div
          className="ml-8 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold mb-2 md:mb-10
          "
        >
          Work &amp; Experience
        </div>
        <div className="flex flex-col md:grid grid-cols-12 text-gray-50 cursor-default w-full">
          {workData.map((curElem) => {
            return <ChronoCard key={curElem.duration} curElem={curElem} />;
          })}
        </div>
      </div>
    </>
  );
}

export default Work;