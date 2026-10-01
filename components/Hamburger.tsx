"use client";

import { LayoutDashboardIcon, SendIcon, TerminalIcon } from "@animateicons/react/lucide";
import { FingerprintIcon } from "@components/animate-ui/icons/fingerprint";
import { LightbulbIcon } from "@components/animate-ui/icons/lightbulb";
import { PickaxeIcon } from "@components/animate-ui/icons/pickaxe";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import MenuToggle from "./DrawerToggler";
import Socials from "./Socials";

const sheet: Variants = {
  open: {
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 20,
    },
  },
  closed: {
    x: "100%",
    transition: {
      type: "spring" as const,
      stiffness: 140,
      damping: 24,
    },
  },
};
const variantsItem: Variants = {
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
  const [isOpen, setIsOpen] = useState(false);
  const menu = [
    { name: "Home", href: "/", icon: LayoutDashboardIcon },
    { name: "About", href: "/about", icon: FingerprintIcon, animateWithState: true },
    { name: "Work", href: "/work", icon: PickaxeIcon, animateWithState: true },
    { name: "Projects", href: "/projects", icon: LightbulbIcon, animateWithState: true },
    { name: "Skills", href: "/skills", icon: TerminalIcon },
    { name: "Contact", href: "/contact", icon: SendIcon },
  ];

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);


  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation drawer"
            className="fixed inset-0 z-[2000] cursor-default bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>
      <motion.nav
        initial={false}
        animate="open"
        custom="100%"
        className="hamburger fixed inset-0 z-[2001] pointer-events-none text-white"
      >
        <MenuToggle toggle={isOpen ? closeDrawer : openDrawer} isOpen={isOpen} />
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.aside
              key="drawer-sheet"
              className="pointer-events-auto absolute inset-y-0 right-0 flex h-full w-[min(86vw,22rem)] flex-col border-l border-white/10 bg-black/95 shadow-[-24px_0_48px_rgba(0,0,0,0.35)]"
              variants={sheet}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <motion.ul
                key="drawer-menu"
                variants={variantsNav}
                initial="closed"
                animate="open"
                exit="closed"
                className="mt-20 flex flex-1 flex-col gap-2 px-5"
              >
                {menu.map(({ name, href, icon: Icon, animateWithState }) => (
                  <motion.li
                    key={name}
                    variants={variantsItem}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="sidebar-item flex justify-start"
                  >
                    <Link
                      href={href}
                      className="flex w-full items-center gap-4 rounded-2xl border border-white/8 px-4 py-3 text-white transition hover:border-white/16 hover:bg-white/[0.04] hover:text-cyan-200"
                      onClick={closeDrawer}
                    >
                      {animateWithState ? (
                        <Icon aria-hidden="true" size={21} animateOnHover />
                      ) : (
                        <Icon aria-hidden="true" size={21} duration={0.7} />
                      )}
                      <span className="text-lg font-medium">{name}</span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div variants={variantsItem} initial="closed" animate="open" exit="closed" className="border-t border-white/10 px-5 py-5">
                <Socials />
              </motion.div>
            </motion.aside>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

export default Hamburger;
