"use client";
import { useEffect } from "react";
import { SkillSphere } from "@components/SkillSphere";

const SkillSphereRenderer = () => {
  useEffect(() => {
    SkillSphere();
  }, []);

  return (
    <div className="h-full hidden sm:flex flex-col justify-center items-start z-10">
      {/* <Script src="./scripts/skillSphere.js" strategy="afterInteractive" /> */}
      <canvas id="canvas"></canvas>
    </div>
  );
};

export default SkillSphereRenderer;
