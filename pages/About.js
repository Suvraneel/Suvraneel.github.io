// import Script from "next/script";
import React, { useEffect } from "react";
import { SkillSphere } from "../components/skillSphere";

const About = () => {
    const rgb = [0, 255, 255];
    const props = {
        rgb: rgb,
        width: 500,
        height: 500,
        radius: 150,
        fontSize: 16,
    }
    // Skill Sphere Script
    useEffect(() => {
        SkillSphere(rgb);
    }, []);

  return (
    <div className="w-full h-full flex flex-row justify-evenly">
      <div className="h-full flex flex-col justify-center">
        {/* <Script src="./scripts/skillSphere.js" strategy="afterInteractive" /> */}
        <canvas id="canvas"></canvas>
      </div>
      <div
        id="About Me"
        className="h-full flex flex-col justify-center w-5/12 text-xl"
      >
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
          turpis molestie, dictum est a, mattis tellus.{" "}
        </p>
        <p>
          Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin
          lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum
          velit, sit amet feugiat lectus.
        </p>
        <p>
          Class aptent taciti sociosqu ad litora torquent per conubia nostra,
          per inceptos himenaeos. Praesent auctor purus luctus enim egestas, ac
          scelerisque ante pulvinar. Donec ut rhoncus ex.{" "}
        </p>
      </div>
    </div>
  );
};

export default About;
