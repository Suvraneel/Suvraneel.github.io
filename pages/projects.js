import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";
import { framerLogger } from "../stateLogger";
import { projectsData } from "./api/projectsDat";
const ProjectModal = dynamic(() => import("../components/ProjectModal"), {
  loading: () => <p>Loading...</p>
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
        {/* <div
          className="text-3xl md:text-4xl xl:text-7xl animated-heading bold mb-2 md:mb-10.
      "
        >
          Work
        </div> */}
        <motion.main>
          {/* <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', margin:'0 5%', justifyContent: 'space-evenly', alignItems: 'center', gap: 5, flexWrap: 'wrap', flexShrink: 1, flexGrow: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', paddingBottom: '10px'}}> */}
          <div className="grid grid-cols-1 sm:grid-cols-2	 lg:grid-cols-3 col-auto justify-center">
            {projectsData.map((project) => (
              <div key={project.id} className="w-full" onClick={() => setProjIndex(project)}>
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="save-button"
                  onClick={open}
                  src={'./images/project-assets/'+project.gif}
                />
              </div>
            ))}
          </div>
        </motion.main>

        <ModalContainer>
          {modalOpen ? (
            <ProjectModal modalOpen={modalOpen} text="Bleh" handleClose={close} project={projIndex} />
          ) : (
            <></>
          )}
        </ModalContainer>
      </div>
    </>
  );
}

const ModalContainer = ({ children, label = "Bleh" }) => (
  // Enables the animation of components that have been removed from the tree
  <AnimatePresence
    // Disable any initial animations on children that
    // are present when the component is first rendered
    initial={false}
    // Only render one component at a time.
    // The exiting component will finish its exit
    // animation before entering component is rendered
    exitBeforeEnter={true}
    // Fires when all exiting nodes have completed animating out
    onExitComplete={() => framerLogger(label)}
  >
    {children}
  </AnimatePresence>
);
