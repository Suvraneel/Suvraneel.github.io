import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { useState } from "react";
import useSound from "use-sound";
import ProjectModal from "../components/ProjectModal";
import { framerLogger } from "../stateLogger";
import { projectsData } from "./api/projectsDat";
export default function Work() {
  const [projIndex, setProjIndex] = useState(projectsData[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const close = () => setModalOpen(false);
  const open = () => setModalOpen(true);
  const snapSfx = "./sounds/snap.wav";
  const popSfx = "./sounds/pop.wav";
  const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.50 });
  const [playPop] = useSound(popSfx, { volume: 0.50 });
  return (
    <>
      <Head>
        <title>Projects | Portfolio - Suvraneel</title>
      </Head>
      <div className="h-screen flex flex-col items-center nav-gap">
        {!modalOpen && <motion.main>
          <div className="grid grid-cols-1 sm:grid-cols-2	 lg:grid-cols-3 col-auto justify-center">
            {projectsData.map((project, i) => {
              return (
                <div
                  key={i}
                  className="w-full"
                  onClick={() => {
                    setProjIndex(project);
                    open;
                    playPop();
                  }}
                  onMouseEnter={() => {
                    playSnap();
                  }}
                  onMouseLeave={() => {
                    stopSnap();
                  }}
                >
                  <motion.video
                    whileHover={{ scale: 1.1 }}
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
                    // onLoadedData={() =>
                    //   setIsLoading((isLoading) => [...isLoading, i])
                    // }
                    src={"./images/project-assets/" + project.gif}
                  >
                    {/* <source src="MY_VIDEO.mp4" type="video/mp4" /> */}
                    {/* <source
                        src={"./images/project-assets/" + project.gif}
                        type="video/webm"
                      />
                      <p className="vjs-no-js">
                      To view this video please enable JavaScript, and
                      consider upgrading to a web browser that
                      <a
                      href="https://videojs.com/html5-video-support/"
                      target="_blank"
                      rel="noreferrer"
                        >
                          supports HTML5 video
                        </a>
                      </p> */}
                  </motion.video>
                </div>
              );
            })}
          </div>
        </motion.main>}

        <ModalContainer>
          {modalOpen &&
            <ProjectModal
              modalOpen={modalOpen}
              text="Project Modal"
              handleClose={close}
              project={projIndex}
            />}
        </ModalContainer>
      </div>
    </>
  );
}

const ModalContainer = ({ children, label = "Modal Container" }) => (
  <AnimatePresence
    initial={false}
    mode="wait"
    onExitComplete={() => framerLogger(label)}
  >
    {children}
  </AnimatePresence>
);
