"use client";

import { ThemeProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { AnimatePresence } from "framer-motion";
import { SoundEffectsProvider } from "@components/SoundEffectsContext";
import NextNProgress from "@components/NextNProgress/NextNProgress";

const Providers = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <ThemeProvider {...props}>
      <AnimatePresence mode="wait" initial={false}>
        <SoundEffectsProvider>
          {/*<NextNProgress />*/}
          {children}
        </SoundEffectsProvider>
      </AnimatePresence>
    </ThemeProvider>
  );
};

export default Providers;
