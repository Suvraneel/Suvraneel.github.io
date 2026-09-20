"use client";

import { LayoutDashboardIcon, SendIcon, TerminalIcon } from "@animateicons/react/lucide";
import { FingerprintIcon } from "@components/animate-ui/icons/fingerprint";
import { LightbulbIcon } from "@components/animate-ui/icons/lightbulb";
import { PickaxeIcon } from "@components/animate-ui/icons/pickaxe";
import { motion, useCycle, type Variants } from "framer-motion";
import Link from "next/link";
import MenuToggle from "./DrawerToggler";
import Socials from "./Socials";

const sidebar: Variants = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 40px 40px)`,
    transition: {
      type: "spring" as const,
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: "circle(30px at 40px 40px)",
    transition: {
      delay: 0.5,
      type: "spring" as const,
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
    { name: "Home", href: "/", icon: LayoutDashboardIcon },
    { name: "About", href: "/about", icon: FingerprintIcon, animateWithState: true },
    { name: "Work", href: "/work", icon: PickaxeIcon, animateWithState: true },
    { name: "Projects", href: "/projects", icon: LightbulbIcon, animateWithState: true },
    { name: "Skills", href: "/skills", icon: TerminalIcon },
    { name: "Contact", href: "/contact", icon: SendIcon },
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
        {menu.map(({ name, href, icon: Icon, animateWithState }) => {
          return (
            <motion.li
              variants={variantsItem}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              key={name}
              className="sidebar-item flex justify-start"
              onClick={() => toggleOpen()}
            >
              <Link
                href={href}
                className="flex flex-row items-center gap-4 text-white transition hover:text-cyan-200">
                {animateWithState ? (
                  <Icon aria-hidden="true" size={21} animateOnHover />
                ) : (
                  <Icon aria-hidden="true" size={21} duration={0.7} />
                )}
                <span className="text-xl font-medium">{name}</span>
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
