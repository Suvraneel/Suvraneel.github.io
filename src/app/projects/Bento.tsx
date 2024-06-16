import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface BentoProps {
  className?: string;
  url: string;
}

const Bento = (props: BentoProps) => {
  const { className, url } = props;
  return (
    <>
      <motion.div
        className={`rounded - md border relative min-h-36 grid-flow-dense bg-purple-500 ${className}`}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background:
            "radial-gradient(100% 100% at 0% -20%,#2E2D3A 0,#0B0B0C 100%)",
        }}
      >
        <Image src={url} alt={"V"} fill={true} layout={"fill"} />
        {/*        <motion.video
          // onClick={open}
          id="my-video"
          preload="auto"
          width="640"
          height="264"
          data-setup="{}"
          autoPlay
          loop
          muted
          playsInline
          src={"./images/project-assets/" + url}
        ></motion.video>*/}
      </motion.div>
    </>
  );
};

export default Bento;
