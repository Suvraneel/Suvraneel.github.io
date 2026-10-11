import { motion } from "framer-motion";

const Path = props => (
  <motion.path
    fill="#fff"
    strokeWidth="3"
    stroke="hsl(0, 0%, 100%)"
    strokeLinecap="round"
    {...props}
  />
);

const MenuToggle = ({ toggle, isOpen }: { toggle: () => void; isOpen: boolean }) => (
  <motion.button
    type="button"
    title={isOpen ? "Close navigation" : "Open navigation"}
    onClick={toggle}
    className="hamburger hamburger--collapse pointer-events-auto fixed right-4 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[2003] rounded-full border border-white/10 bg-black/70 p-3 text-white backdrop-blur-md"
    whileTap={{ scale: 0.96 }}
    aria-expanded={isOpen}
    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
  >
    <motion.svg width="23" height="23" viewBox="0 0 23 23" animate={isOpen ? "open" : "closed"} initial={false}>
      <Path
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: { d: "M 3 16.5 L 17 2.5" },
        }}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 },
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: { d: "M 3 2.5 L 17 16.346" },
        }}
      />
    </motion.svg>
  </motion.button>
);

export default MenuToggle;