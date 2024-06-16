"use client";
import React from "react";
import { spaceBoards } from "@font";
import Bento from "./Bento";
import { motion } from "framer-motion";

const Projects = () => {
  return (
    <main className="h-[100vh] px-32 py-10 flex min-h-screen flex-col items-start justify-start">
      <div
        className={`ml-16 sm:ml-0 text-3xl md:text-4xl xl:text-5xl animated-heading bold md:mb-5 ${spaceBoards.className}`}
      >
        Projects
      </div>
      <motion.main>
        <div className="w-full h-full grid grid-cols-8 gap-6 max-w-7xl rounded-md mt-5 grid-flow-dense">
          <Bento
            className="col-span-3 row-span-2"
            url={"gssoc-website.webm"}
          ></Bento>
          <Bento
            className="col-span-2 row-span-1"
            url={"gssoc-website.webm"}
          ></Bento>
          <Bento
            className="col-span-1 row-span-1"
            url={"gssoc-website.webm"}
          ></Bento>
          <Bento
            className="col-span-3 row-span-3"
            url={"gssoc-website.webm"}
          ></Bento>
          <Bento
            className="col-span-2 row-span-3"
            url={"gssoc-website.webm"}
          ></Bento>
          <Bento
            className="col-span-3 row-span-2"
            url={"gssoc-website.webm"}
          ></Bento>
          <Bento
            className="col-span-2 row-span-1"
            url={"gssoc-website.webm"}
          ></Bento>
        </div>
      </motion.main>
    </main>
  );
};

export default Projects;
