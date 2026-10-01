"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const STAIR_COUNT = 6;
const EASE = [0.76, 0, 0.24, 1] as const;
const WORDS = ["Hello", "Bonjour", "Ciao", "Olà", "やあ", "Hallå", "Guten tag", "হ্যালো"];
const SEEN_KEY = "preloader-seen";

export default function StairsPreloader({ progress }: { progress: number | null }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const isRepeatVisit = useRef(false);

  useEffect(() => {
    isRepeatVisit.current = window.sessionStorage.getItem(SEEN_KEY) === "1";
    window.sessionStorage.setItem(SEEN_KEY, "1");
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    // Quick first sweep, then a calmer loop since load time is unknown.
    const firstHold = isRepeatVisit.current ? 150 : 1000;
    const delay = index === 0 ? firstHold : index < WORDS.length ? 150 : 900;
    const timeoutId = window.setTimeout(() => setIndex((i) => i + 1), delay);
    return () => window.clearTimeout(timeoutId);
  }, [index, reduceMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-[500] flex"
      role="status"
      exit={{ pointerEvents: "none" }}
    >
      <span className="sr-only">Loading</span>
      {Array.from({ length: STAIR_COUNT }).map((_, i) => (
        <motion.div
          key={i}
          className="h-full flex-1 bg-[#05080c] -ml-px first:ml-0"
          initial={reduceMotion ? { opacity: 1 } : { y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { y: "-100%" }}
          transition={
            reduceMotion ? { duration: 0.3 } : { duration: 0.6, ease: EASE, delay: i * 0.07 }
          }
        />
      ))}

      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.p
          className="flex items-center text-4xl font-medium text-white md:text-5xl lg:text-6xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ duration: reduceMotion ? 0.3 : 1, delay: 0.2 }}
          aria-hidden="true"
        >
          <span className="mr-2.5 block h-2.5 w-2.5 rounded-full bg-[#83d3dd] shadow-[0_0_12px_2px_rgba(131,211,221,0.6)]" />
          {WORDS[index % WORDS.length]}
        </motion.p>

        {progress !== null && (
          <p
            className="absolute bottom-8 right-8 font-mono text-xs tabular-nums tracking-[0.3em] text-white/50"
            aria-hidden="true"
          >
            {String(Math.round(progress * 100)).padStart(3, "0")} / 100
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
