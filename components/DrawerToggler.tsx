import { motion } from "motion/react";
import type { ComponentProps } from "react";
import { useScrollAway } from "@hooks/useScrollAway";

const Path = (props: ComponentProps<typeof motion.path>) => (
  <motion.path
    fill="#fff"
    strokeWidth="3"
    stroke="hsl(0, 0%, 100%)"
    strokeLinecap="round"
    {...props}
  />
);

/** It slides up and out with the page's scroll, a little past its own top inset. */
const AWAY = { y: "-150%", opacity: 0 };
const HERE = { y: "0%", opacity: 1 };

const MenuToggle = ({ toggle, isOpen }: { toggle: () => void; isOpen: boolean }) => {
  // Steps aside while the visitor reads down, back on the first scroll up (never while open).
  const { away, show } = useScrollAway(isOpen);
  return (
    <motion.button
      type="button"
      title={isOpen ? "Close navigation" : "Open navigation"}
      onClick={toggle}
      onFocus={show}
      initial={false}
      animate={away ? AWAY : HERE}
      // Reduced motion (MotionConfig "user") drops the slide and keeps the fade.
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      style={{ pointerEvents: away ? "none" : undefined }}
      className="hamburger hamburger--collapse pointer-events-auto fixed right-4 top-[calc(env(safe-area-inset-top)+0.75rem)] z-menu-toggle rounded-full border border-white/10 bg-black/85 p-3 text-white backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
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
};

export default MenuToggle;