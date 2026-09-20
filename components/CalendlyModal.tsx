"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InlineWidget } from "react-calendly";
import { useEffect, useRef } from "react";

export default function CalendlyModal({ onClose, closeIcon }: { onClose: () => void; closeIcon: IconDefinition }) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#07090d]/85 p-4 backdrop-blur-md sm:p-8" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Schedule a conversation"
        className="relative flex h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0d141c] shadow-[0_24px_90px_rgba(3,18,24,0.7)] sm:h-[calc(100dvh-4rem)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#83d3dd]">Schedule</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">Find a time that works</h2>
          </div>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close scheduler"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white/35 hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]"
          >
            <FontAwesomeIcon icon={closeIcon} />
          </button>
        </div>
        <div className="min-h-0 flex-1 bg-white">
          <InlineWidget url="https://calendly.com/suvraneel/meet" styles={{ height: "100%", width: "100%" }} />
        </div>
      </section>
    </div>
  );
}
