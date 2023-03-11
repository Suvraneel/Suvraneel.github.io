import {
  faChartPie,
  faCode,
  faCubes,
  faHouseChimney,
  faPenFancy,
  faSignature,
} from "@fortawesome/free-solid-svg-icons";
import { motion, useCycle } from "framer-motion";
import Link from "next/link";
import MenuToggle from "./DrawerToggler";
import { FontAwesomeObj } from "./FontAwesomeObj";
import Socials from "./Socials";

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 40px 40px)`,
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: "circle(30px at 40px 40px)",
    transition: {
      delay: 0.5,
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};
const variantsItem = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};
const variantsNav = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const Hamburger = () => {
  const [isOpen, toggleOpen] = useCycle(false, true);
  const menu = [
    { name: "Home", href: "/about", icon: faHouseChimney },
    { name: "About", href: "/about", icon: faSignature },
    { name: "Skills", href: "/skills", icon: faCode },
    { name: "Work", href: "/work", icon: faChartPie },
    { name: "Projects", href: "/projects", icon: faCubes },
    { name: "Contact", href: "/contact", icon: faPenFancy },
  ];
  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      custom="100%"
      className="z-[2001] hamburger text-white"
    >
      <motion.div
        className="h-4/5 w-1/2 bg-black absolute top-0 left-0"
        variants={sidebar}
      />
      <motion.ul
        variants={variantsNav}
        className="hamburger-menu w-fit h-fit flex flex-col gap-3 fixed top-16 left-5"
      >
        {menu.map((item) => {
          return (
            <motion.li
              variants={variantsItem}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              key={item.name}
              className="sidebar-item flex justify-start"
              onClick={() => toggleOpen()}
            >
              <Link
                href={item.href}
                className="text-white flex flex-row gap-5 hover:text-cyan-300">

                <div className="flex justify-start">
                  <FontAwesomeObj
                    icon={item.icon}
                    brandColor="cyan"
                    title={item.name}
                    titleClassName="sidebar-title pl-2 text-xl"
                    size="xs"
                    className="sidebar-icon"
                  />
                </div>

              </Link>
            </motion.li>
          );
        })}
        <motion.li
          variants={variantsItem}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="mt-2"
        >
          <Socials />
        </motion.li>
      </motion.ul>
      <MenuToggle toggle={() => toggleOpen()} />
    </motion.nav>
  );
}

export default Hamburger;
