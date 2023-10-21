import { stateLogger } from "@root/stateLogger";
import { motion } from "framer-motion";
import { ReactNode, useEffect } from "react";

type BackdropProps = {
  children: ReactNode;
  onClick: () => void;
};

const Backdrop = ({ children, onClick }: BackdropProps) => {
  // Log state
  useEffect(() => {
    stateLogger("Backdrop", true);
    return () => stateLogger("Backdrop", false);
  }, []);

  return (
    <motion.div
      className="backdrop"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};

export default Backdrop;
