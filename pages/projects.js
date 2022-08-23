import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";
import { framerLogger } from "../stateLogger";
import { projectsData } from "./api/projectsDat";
import ProjectModal from "../components/ProjectModal";
export default function Work() {
  // Modal type
  const [modalType] = useState("flip");
  const [projIndex, setProjIndex] = useState(projectsData[0]);
  const [modalOpen, setModalOpen] = useState(false);

  const close = () => setModalOpen(false);
  const open = () => setModalOpen(true);
  return (
    <>
      <Head>
        <title>Projects</title>
      </Head>
      <div className="h-screen flex flex-col items-center nav-gap">
        <motion.main>
          <div className="grid grid-cols-1 sm:grid-cols-2	 lg:grid-cols-3 col-auto justify-center">
            {projectsData.map((project) => (
              <div
                key={project.id}
                className="w-full"
                onClick={() => {
                  setProjIndex(project);
                  open;
                }}
              >
                {/* <motion.img
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="save-button"
                  onClick={open}
                  src={"./images/project-assets/" + project.gif}
                /> */}
                <motion.video
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="save-button"
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
                >
                  {/* <source src="MY_VIDEO.mp4" type="video/mp4" /> */}
                  <source
                    src={"./images/project-assets/" + project.gif}
                    type="video/webm"
                  />
                  <p className="vjs-no-js">
                    To view this video please enable JavaScript, and consider
                    upgrading to a web browser that
                    <a
                      href="https://videojs.com/html5-video-support/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      supports HTML5 video
                    </a>
                  </p>
                </motion.video>
              </div>
            ))}
          </div>
        </motion.main>

        <ModalContainer>
          {modalOpen ? (
            <ProjectModal
              modalOpen={modalOpen}
              text="Bleh"
              handleClose={close}
              project={projIndex}
            />
          ) : (
            <></>
          )}
        </ModalContainer>
      </div>
    </>
  );
}

const ModalContainer = ({ children, label = "Bleh" }) => (
  <AnimatePresence
    initial={false}
    exitBeforeEnter={true}
    onExitComplete={() => framerLogger(label)}
  >
    {children}
  </AnimatePresence>
);
