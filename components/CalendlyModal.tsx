"use client";

import { AnimateIcon } from "@components/animate-ui/icons/icon";
import { SquareArrowOutUpRightIcon } from "@components/animate-ui/icons/square-arrow-out-up-right";
import { XIcon } from "@components/animate-ui/icons/x";
import {
  MODAL_BACKDROP_CLASS,
  MODAL_BACKDROP_EXIT_MOTION,
  MODAL_BACKDROP_MOTION,
  MODAL_PANEL_MOTION,
  MODAL_REDUCED_MOTION,
  anchorToOrigin,
  type ModalOrigin,
} from "@lib/modalMotion";
import { motion, useReducedMotion } from "motion/react";
import { InlineWidget } from "react-calendly";
import { useEffect, useRef } from "react";

const SCHEDULER_URL = "https://calendly.com/suvraneel/meet";

/**
 * The scheduler, as a modal dialog with the case study's motion: it grows from
 * the button that opened it (origin) over the same dimmed, blurred page, and
 * shrinks back toward it (the parent's AnimatePresence plays the exit).
 */
export default function CalendlyModal({
  onClose,
  onClosed,
  origin = null,
}: Readonly<{
  onClose: () => void;
  /** Called once the dialog has closed (after its exit), when focus can go back to the page. Keep it stable. */
  onClosed?: () => void;
  origin?: ModalOrigin | null;
}>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const currentDialog = dialog.current;
    currentDialog?.showModal();
    closeButton.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      if (currentDialog?.open) currentDialog.close();
      // Only now is the page no longer inert, so focus can go back to it.
      onClosed?.();
    };
  }, [onClose, onClosed]);

  useEffect(() => {
    const currentDialog = dialog.current;
    const section = panel.current;
    if (!origin || !currentDialog || !section || reduceMotion) return;
    anchorToOrigin(currentDialog, section, origin);
  }, [origin, reduceMotion]);

  return (
      <dialog
        ref={dialog}
        aria-modal="true"
        aria-label="Schedule a conversation"
        className="fixed inset-0 m-0 flex h-dvh max-h-none w-full max-w-none items-center justify-center overflow-hidden border-0 bg-transparent p-3 backdrop:bg-transparent sm:p-6"
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        {/* The dimmed, blurred page; a click on it closes the scheduler. */}
        <motion.button
          type="button"
          tabIndex={-1}
          aria-label="Close scheduler"
          onClick={onClose}
          className={`${MODAL_BACKDROP_CLASS} z-0 cursor-default`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: reduceMotion ? MODAL_REDUCED_MOTION : MODAL_BACKDROP_EXIT_MOTION }}
          transition={reduceMotion ? MODAL_REDUCED_MOTION : MODAL_BACKDROP_MOTION}
        />
        <motion.section
          ref={panel}
          className="relative flex h-[min(calc(100dvh-1.5rem),42rem)] w-full max-w-[58rem] flex-col overflow-hidden rounded-[1.5rem] border border-white/15 bg-black sm:h-[min(calc(100dvh-3rem),42rem)]"
          aria-labelledby="scheduler-title"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "scale(0.94)" }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transform: "scale(1)" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "scale(0.96)" }}
          transition={reduceMotion ? MODAL_REDUCED_MOTION : MODAL_PANEL_MOTION}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/15 px-5 py-4 sm:px-6">
            <h2 id="scheduler-title" className="min-w-0 text-balance text-lg font-semibold leading-tight tracking-[-0.02em] text-white sm:text-xl">Find a time that works</h2>
            <div className="flex shrink-0 items-center gap-2">
            {/* The same scheduler in a tab of its own: a way through while the embed
                is slow to load, or when a content blocker keeps it blank. Phones get
                the icon alone, a round button like Close, so the title keeps its row. */}
            <AnimateIcon animateOnHover asChild>
            <a
              href={SCHEDULER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-white/20 text-sm text-white/75 transition-[color,border-color] duration-300 hover:border-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-auto sm:px-4"
            >
              <span className="max-sm:sr-only">Open in Calendly</span>
              <SquareArrowOutUpRightIcon aria-hidden="true" size={16} />
            </a>
            </AnimateIcon>
            <AnimateIcon animateOnHover asChild>
            <button
              ref={closeButton}
              type="button"
              aria-label="Close scheduler"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/75 transition-[color,border-color] duration-300 hover:border-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <XIcon aria-hidden="true" size={18} />
            </button>
            </AnimateIcon>
            </div>
          </div>
          <div className="min-h-0 flex-1 bg-black">
            <InlineWidget url={SCHEDULER_URL} styles={{ height: "100%", width: "100%" }} pageSettings={{ hideGdprBanner: true }} />
          </div>
        </motion.section>
      </dialog>
  );
}
