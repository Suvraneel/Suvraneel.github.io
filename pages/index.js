import { useTheme } from "next-themes";
import Head from "next/head";
import SplineObj from "../components/SplineObj";
import "../styles/Home.module.css";
export default function Home() {
  const { theme } = useTheme();
  return (
    <>
      <Head>
        <title>Portfolio</title>
        <meta name="google-site-verification" content="J9uDTeg3iujyef0pzqJ7s7xDlmizshJEn0767--L3nA" />
      </Head>
      <div className="h-screen">
          <SplineObj scene={'https://prod.spline.design/eBcxlYl5eV3WlaMm/scene.splinecode'}/>
          {/* <SplineObj scene={'./spline/sceneHOME.splinecode'}/> */}
      </div>
    </>
  );
}
