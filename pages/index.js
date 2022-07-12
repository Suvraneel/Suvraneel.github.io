import React from "react";
import { useTheme } from "next-themes";
import Head from "next/head";
import utilStyles from "../styles/utils.module.css";
import { Navbar } from "../components/Navbar";
import "../styles/Home.module.css";
import SplineObj from "../components/SplineObj";
export default function Home() {
  const { theme } = useTheme();
  return (
    <>
      <Head>
        <title>Portfolio</title>
      </Head>
      <div className="h-screen">
          <SplineObj scene={'./spline/sceneHOME.splinecode'}/>
      </div>
    </>
  );
}
