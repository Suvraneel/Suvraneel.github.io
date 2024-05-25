"use client";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import React, { useEffect, useRef } from "react";
import SplineObj from "@components/SplineObject";
import { useRouter } from "next/navigation";

const LandingMotion = () => {
  const ref = useRef(null);
  const router = useRouter();
  const target_ref = useRef(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    target: target_ref,
    offset: ["center end", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 10,
    restDelta: 0.01,
  });
  // const clipPathPoints = useTransform(
  //   scaleX,
  //   [0, 1],
  // [
  //   "0px 50%, 100% 50%, 100% 50%, 0px 50%",
  //   "0% 0%, 100% 0%, 100% 100%, 0% 100%",
  // ]
  const y1 = useTransform(scaleX, [0.5, 1], [50, 0]);
  const y2 = useTransform(scaleX, [0.5, 1], [50, 0]);
  const y3 = useTransform(scaleX, [0.5, 1], [50, 100]);
  const y4 = useTransform(scaleX, [0.5, 1], [50, 100]);

  const clipPath = useMotionTemplate`polygon(0% ${y1}%, 100% ${y2}%, 100% ${y3}%, 0% ${y4}%)`;

  // Log the scrollYProgress value every time it changes
  useMotionValueEvent(scaleX, "change", (latest) => {
    console.log("scrollYProgress", latest);
    console.log("clipPath", clipPath.get());
    if (scaleX.get() === 1) router.push("/about");
  });
  return (
    <motion.div
      ref={ref}
      layoutScroll={true}
      className="w-full overflow-auto relative"
    >
      <motion.div className="progress-bar" style={{ scaleX }} />
      <h1 className="h-[50vh]">
        <code>useScroll</code> with spring smoothing
      </h1>
      <motion.div
        className="bg-red-400 h-[100vh] relative"
        style={{ clipPath }}
        ref={target_ref}
      >
        <SplineObj
          scene={
            "https://draft.spline.design/K1kBXIwzikeebkVI/scene.splinecode"
          }
          className={"bottom-0"}
        />
      </motion.div>
      <code className="block text-center">
        Scroll to the bottom to trigger a route change,
      </code>
    </motion.div>
  );
};

export default LandingMotion;
