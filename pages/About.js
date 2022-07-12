import React from "react";
import { useTheme } from "next-themes";
import Head from "next/head";
import SplineObj from "../components/SplineObj";
const About = () => {
  return (
    <>
    <Head>
      <title>About Me</title>
    </Head>
    <div className="h-screen">
      <SplineObj scene={'./spline/sceneROG.splinecode'}/>
    </div>
  </>
  )
}

export default About
