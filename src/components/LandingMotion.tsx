"use client";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Marquee from "react-fast-marquee";

import React, { useEffect, useRef } from "react";
import SplineObj from "@components/SplineObject";
import { useRouter } from "next/navigation";
import { spaceBoards } from "@font";
import Image from "next/image";

const LandingMotion = () => {
  const ref = useRef(null);
  const router = useRouter();
  const target_ref = useRef(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    target: target_ref,
    offset: ["start end", "end end"],
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
      className="w-full overflow-auto scoll-smooth snap-y snap-mandatory relative"
      style={{
        background: "radial-gradient(50% 80% at 50% 50%,#333 0,#000 100%)",
      }}
    >
      <motion.div
        className="fixed h-0.5 bg-white top-0 bottom-0 left-0 right-0 origin-left z-[1000]"
        style={{ scaleX }}
      />
      <div className="h-[10vh]" />
      <div className={"h-full w-full flex snap-center relative"}>
        <Image
          src={"/images/Avatar.png"}
          alt={"hero"}
          fill={true}
          objectFit={"contain"}
          className={"h-full w-auto m-auto z-[1000] fixed pointer-events-none"}
        />
        <Marquee
          play={true}
          speed={50}
          autoFill={true}
          className={`w-full text-3xl md:text-5xl xl:text-9xl text-white bold ${spaceBoards.className}`}
        >
          Suvraneel Bhuin &nbsp;
        </Marquee>
      </div>
      <motion.div
        className="bg-black h-[100vh] relative snap-center"
        style={{ clipPath }}
        ref={target_ref}
      >
        <SplineObj
          scene={
            "https://draft.spline.design/K1kBXIwzikeebkVI/scene.splinecode"
          }
          className={"bottom-0 z-[5000]"}
        />
      </motion.div>
      <div className="h-[10vh]" />
    </motion.div>
  );
};

export default LandingMotion;
