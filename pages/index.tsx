import Head from "next/head";
import SplineObj from "../components/SplineObject";
import "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import HamsterLoader from '../components/HamsterLoader/index';
import { NextPage } from "next";

const Home: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    window.innerWidth < 550 && router.replace("https://suvraneel.bio.link/");
  }, [router]);

  return (
    <>
      <Head>
        <title>Home | Portfolio - Suvraneel</title>
        <meta name="google-site-verification" content="J9uDTeg3iujyef0pzqJ7s7xDlmizshJEn0767--L3nA" />
        <meta name="description" content="Home | Official Portfolio Website | Suvraneel Bhuin" />
      </Head>
      <div className="h-screen">
        <div className='fixed h-full w-full flex flex-row justify-center items-center z-0'>
          <HamsterLoader loaderTitle='Loading 3D scene...'/>
        </div>
        {/* <SplineObj scene={'https://draft.spline.design/K1kBXIwzikeebkVI/scene.splinecode'} /> */}
        <SplineObj scene={'./spline/sceneDACCORD.splinecode'}/>
      </div>
    </>
  );
}

export default Home;
