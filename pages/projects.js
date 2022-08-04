import Link from "next/link";
import fetch from "isomorphic-unfetch";
import { motion } from "framer-motion";

// Our custom easing
let easing = [0.6, -0.05, 0.01, 0.99];

// animate: defines animation
// initial: defines initial state of animation or stating point.
// exit: defines animation when component exits

// Custom variant
const fadeInUp = {
  initial: {
    y: 60,
    opacity: 0,
    transition: { duration: 0.6, ease: easing },
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: easing,
    },
  },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const Projects = (props) => (
  <div className="flex-1 w-full h-full justify-center items-center m-10">
    <motion.div initial="initial" animate="animate" exit={{ opacity: 0 }}>
      <div className="">
        <motion.div
          variants={stagger}
          style={{display: 'flex', flexDirection: 'row', justifyContent: 'evenly', alignItems: 'center'}}>
          {props.projects.map((project) => (
            <Link
              key={project.id}
              href="/projects/[id]"
              as={`/projects/${project.id}`}
            >
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="category">Protein</span>
                <motion.img
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  key={project.image}
                  src={project.image}
                  width={350}
                />
                <div className="project-info">
                  <h4>{project.name}</h4>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </motion.div>
  </div>
);

Projects.getInitialProps = async function () {
  const res = await fetch(
    "https://my-json-server.typicode.com/Suvraneel/Suvraneel.github.io/projects"
  );
  const data = await res.json();
  return {
    projects: data,
  };
};

export default Projects;
