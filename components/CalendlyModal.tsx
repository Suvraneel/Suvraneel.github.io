"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InlineWidget } from "react-calendly";
import { useEffect, useRef } from "react";

export default function CalendlyModal({ onClose, closeIcon }: Readonly<{ onClose: () => void; closeIcon: IconDefinition }>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

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
    };
  }, [onClose]);

  return (
      <dialog
        ref={dialog}
        aria-modal="true"
        aria-label="Schedule a conversation"
        className="fixed inset-0 m-0 flex h-dvh w-full max-w-none items-center justify-center overflow-hidden border-0 bg-transparent p-3 backdrop:bg-black/90 sm:p-6"
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close scheduler"
          onClick={onClose}
          className="absolute inset-0 z-0 cursor-default bg-transparent"
        />
        <section className="relative flex h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden border border-white/15 bg-black sm:h-[calc(100dvh-3rem)]" aria-labelledby="scheduler-title">
          <div className="flex items-center justify-between border-b border-white/15 px-5 py-4 sm:px-6">
            <h2 id="scheduler-title" className="text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">Find a time that works</h2>
            <button
              ref={closeButton}
              type="button"
              aria-label="Close scheduler"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/75 transition-[color,border-color] duration-300 hover:border-[#83d3dd] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]"
            >
              <FontAwesomeIcon icon={closeIcon} aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1 bg-white">
            <InlineWidget url="https://calendly.com/suvraneel/meet" styles={{ height: "100%", width: "100%" }} />
          </div>
        </section>
      </dialog>
  );
}
