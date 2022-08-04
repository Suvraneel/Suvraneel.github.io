import fetch from "isomorphic-unfetch";
import { motion } from "framer-motion";
import Link from "next/link";

let easing = [0.6, -0.05, 0.01, 0.99];

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const fadeInUp = {
  initial: {
    y: 60,
    opacity: 0,
    transition: { duration: 0.6, ease: easing }
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: easing
    }
  }
};

const project = props => (
  <motion.div initial='initial' animate='animate' exit={{ opacity: 0 }}>
    <div className='fullscreen'>
      <div className='project'>
        <motion.div
          className='img'
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}>
          <motion.img
            key={props.project.image}
            src={props.project.image}
            animate={{ x: 0, opacity: 1 }}
            initial={{ x: 200, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
          />
        </motion.div>
        <div className='project-details'>
          <motion.div variants={stagger} className='inner'>
            <Link href='/'>
              <motion.div variants={fadeInUp}>
                <a className='go-back'>Back to projects</a>
              </motion.div>
            </Link>
            <motion.div variants={fadeInUp}>
              <span className='category'>Project</span>
            </motion.div>
            <motion.h1 variants={fadeInUp}>{props.project.name}</motion.h1>
            <motion.p variants={fadeInUp}>{props.project.details}</motion.p>
            <motion.div variants={fadeInUp} className='qty-price'>
              <span className='price'>{props.project.price}</span>
            </motion.div>
            <motion.div variants={fadeInUp} className='btn-row'>
              <button className='add-to-cart'> Add to cart</button>
              <button className='subscribe'> Subscribe</button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  </motion.div>
);

project.getInitialProps = async function(context) {
  const { id } = context.query;
  const res = await fetch(
    `https://my-json-server.typicode.com/Suvraneel/Suvraneel.github.io/projects/${id}`
  );
  const project = await res.json();
  return { project };
};

export default project;