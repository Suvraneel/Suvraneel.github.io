import LandingMotion from "@components/LandingMotion";

export default function Home() {
  return (
    <main className="h-[100vh] flex min-h-screen flex-col items-center justify-between">
      {/*<SplineObj*/}
      {/*  scene={"https://draft.spline.design/K1kBXIwzikeebkVI/scene.splinecode"}*/}
      {/*/>*/}
      {/*  <SplineObj scene={"./spline/sceneDaccord.splinecode"}/>*/}

      <LandingMotion />
    </main>
  );
}
