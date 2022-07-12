import React, { Suspense } from "react";
import { useTheme } from "next-themes";
import Head from "next/head";
import dynamic from "next/dynamic";
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

const About = () => {
  return (
    <>
    <Head>
      <title>Portfolio</title>
    </Head>
    <div>
      {/* <h1 className="namebar text-7xl relative top-32 left-32 font-medium">
        Hey there,<br/>I&apos;m <span>Suvraneel</span>
      </h1> */}
      <Suspense fallback={<div>Loading...</div>}>
        <Spline scene="https://prod.spline.design/wbrlJPmBt5QCDLI8/scene.splinecode" />
      </Suspense>
    </div>
  </>
  )
}

export default About
