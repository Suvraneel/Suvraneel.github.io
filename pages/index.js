import React, { Suspense } from "react";
import { useTheme } from "next-themes";
import Head from "next/head";
import utilStyles from "../styles/utils.module.css";
import "../styles/Home.module.css";
import dynamic from "next/dynamic";
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});
export default function Home() {
  const { theme } = useTheme();
  return (
    <>
      <Head>
        <title>Portfolio</title>
      </Head>
      <div>
        {/* <Suspense fallback={<div>Loading...</div>}> */}
        <Spline scene="https://prod.spline.design/eBcxlYl5eV3WlaMm/scene.splinecode" />
          {/* <Spline scene="./spline/scene.splinecode" /> */}
        {/* </Suspense> */}
      </div>
    </>
  );
}
