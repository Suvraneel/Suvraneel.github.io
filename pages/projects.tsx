import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { useState } from "react";
import useSound from "use-sound";
import ProjectModal from "@components/ProjectModal";
import { framerLogger } from "../stateLogger";
import projectsData from "./api/projectsDat";
import { NextPage } from "next";

const Projects: NextPage = () => {
  const [projIndex, setProjIndex] = useState<any>(projectsData[0]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const close = () => setModalOpen(false);
  const open = () => setModalOpen(true);
  const snapSfx = "./sounds/snap.wav";
  const popSfx = "./sounds/pop.wav";
  const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.5 });
  const [playPop] = useSound(popSfx, { volume: 0.5 });
  return (
    <>
      <Head>
        <title>Projects | Portfolio - Suvraneel</title>
        <meta
          name="description"
          content="Projects | Official Portfolio Website | Suvraneel Bhuin"
        />
      </Head>
      <div className="h-screen flex flex-col items-center nav-gap">
        {!modalOpen && (
          <motion.main>
            <div className="grid grid-cols-1 sm:grid-cols-2	 lg:grid-cols-3 col-auto justify-center">
              {projectsData.map((project) => {
                return (
                  <div
                    key={project.id}
                    className="w-full relative z-5 hover:z-10"
                    onClick={() => {
                      setProjIndex(project);
                      open();
                      playPop();
                    }}
                    onMouseEnter={() => {
                      playSnap();
                    }}
                    onMouseLeave={() => {
                      stopSnap();
                    }}
                  >
                    <div className="w-full h-full absolute z-0 bottom-0 left-0 bg-gradient-to-t from-black via-black/20 to-transparent text-white text-xl flex flex-col justify-end items-start p-3">
                      {project.name}
                    </div>
                    <motion.video
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="save-button z-5"
                      onClick={open}
                      id="my-video"
                      preload="auto"
                      width="640"
                      height="264"
                      data-setup="{}"
                      autoPlay
                      loop
                      muted
                      playsInline
                      src={"./images/project-assets/" + project.gif}
                    ></motion.video>
                  </div>
                );
              })}
            </div>
          </motion.main>
        )}

        <ModalContainer>
          {modalOpen && (
            <ProjectModal handleClose={close} project={projIndex} />
          )}
        </ModalContainer>
      </div>
    </>
  );
};

const ModalContainer = ({ children, label = "Modal Container" }) => (
  <AnimatePresence
    initial={false}
    mode="wait"
    onExitComplete={() => framerLogger(label)}
  >
    {children}
  </AnimatePresence>
);

export default Projects;
