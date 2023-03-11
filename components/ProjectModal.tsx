import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faClose, faLink } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { stateLogger } from "../stateLogger";
import Backdrop from "./Backdrop";
import { FontAwesomeObj } from "./FontAwesomeObj";

const flip = {
  hidden: {
    transform: "scale(0) rotateX(-360deg)",
    opacity: 0,
    transition: {
      delay: 0.3,
    },
  },
  visible: {
    transform: " scale(1) rotateX(0deg)",
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    transform: "scale(0) rotateX(360deg)",
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const ProjectModal = (props: { handleClose: any; project: any; }) => {
  const { handleClose, project } = props;
  // Log state
  useEffect(() => {
    stateLogger("Modal", true);
    return () => stateLogger("Modal", false);
  }, []);

  return (
    <Backdrop onClick={handleClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-fit mx-0 p-10 sm:p-14 bg-black rounded absolute top-0 left-0 flex flex-col-reverse sm:flex-row justify-evenly gap-10"
        variants={flip}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="w-full sm:w-9/12 h-fit sm:h-full flex-col gap-3 overflow-y-scroll overflow-x-hidden scroll-smooth">
          <ModalVideo video={project.video} />
          <motion.video
            src={"./images/project-assets/" + project.gif}
            preload="auto"
            autoPlay
          />
        </div>
        <div className="w-full flex flex-col">
          <ModalText project={project} />
          <ModalButton onClick={handleClose} />
        </div>
      </motion.div>
    </Backdrop>
  );
};

const ModalText = ({ project }) => (
  <div className="flex flex-col gap-5">
    <div className="text-3xl text-white mt-4 sm:mt-0">{project.name}</div>
    <div className="text-lg text-cyan-500 flex flex-col">
      <a
        href={project.github}
        title="GitHub Repo Link"
        target="_blank"
        rel="noreferrer"
      >
        <FontAwesomeObj
          icon={faGithub}
          brandColor="cyan"
          title="GitHub Repository"
          titleClassName="text-lg text-white"
        />
      </a>
      <a
        href={project.url}
        title="Deployment Link"
        target="_blank"
        rel="noreferrer"
      >
        <FontAwesomeObj
          icon={faLink}
          brandColor="cyan"
          title="Deployment URL"
          titleClassName="text-lg text-white"
        />
      </a>
    </div>
    <div className="flex flex-row gap-2 flex-wrap">
      {project.tech_stk.map((tech:string) => (
        <div
          key={tech}
          className="bg-slate-100 dark:hover:bg-slate-700 dark:bg-stone-800 rounded-2xl w-fit px-3 py-1 text-orange-600 drop-shadow-md font-semibold flex justify-center items-center"
        >
          <h4 className="text-sm sm:text-md font-semibold text-cyan-500">
            {tech}
          </h4>
        </div>
      ))}
    </div>
    <div className="text-lg">
      <ul className="list-disc">
        {project.details.split("|").map((details:string) => (
          <li key={details}>{details}</li>
        ))}
      </ul>
    </div>
  </div>
);

export const ModalVideo = ({ video }) => (
  <div className="modal-video h-fit sm:h-full iframe-container">
    <iframe
      src={video + '?rel=0&iv_load_policy=3&showinfo=0&origin=https://suvraneel.github.io'}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  </div>
);

const ModalButton = ({ onClick }) => (
  <motion.button
    className="absolute top-0 right-0 p-5"
    type="button"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
  >
    <FontAwesomeObj icon={faClose} brandColor="#fff" size="2x" />
  </motion.button>
);

export default ProjectModal;
