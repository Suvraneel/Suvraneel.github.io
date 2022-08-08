import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";
import { framerLogger } from "../stateLogger";
import { projectsData } from "./api/projectsDat";
const ProjectModal = dynamic(() => import("../components/ProjectModal"), {
  loading: () => <p>Loading...</p>,
});
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
                onClick={() => setProjIndex(project)}
              >
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="save-button"
                  onClick={open}
                  src={"./images/project-assets/" + project.gif}
                />
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
