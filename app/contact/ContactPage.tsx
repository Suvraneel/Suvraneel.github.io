"use client";

import { faArrowUpRightFromSquare, faCalendarDays, faEnvelope, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SyntheticEvent, useRef, useState } from "react";
import useSound from "use-sound";
import { spaceBoards, tasaOrbiter } from "@font";
import LiquidMetalButton from "@components/LiquidMetalButton";

const CalendlyModal = dynamic(() => import("@components/CalendlyModal"), { ssr: false });

type SubmissionState = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const form = useRef<HTMLFormElement>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [playSnap, { stop: stopSnap }] = useSound("/sounds/snap.wav", { volume: 0.25 });
  const [playConfirm] = useSound("/sounds/confirm.wav", { volume: 0.25 });

  const sendEmail = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.current || submissionState === "sending") return;

    setSubmissionState("sending");

    try {
      // Keep the EmailJS client out of the initial Contact route bundle.
      const emailjs = (await import("@emailjs/browser")).default;
      await emailjs.sendForm("service_7t4fz0c", "template_dzdjrce", form.current, "LD8juHpdDTXSbZCSv");
      form.current.reset();
      setSubmissionState("success");
      playConfirm();
    } catch {
      setSubmissionState("error");
    }
  };

  return (
    <main className="nav-gap min-h-[100dvh] overflow-x-hidden bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-28 sm:px-10 sm:pb-28 sm:pt-24 lg:px-14 xl:px-20">
        <header className="max-w-4xl">
          <h1 className={`animated-heading text-4xl font-bold leading-none tracking-[-0.04em] sm:text-6xl ${spaceBoards.className}`}>
            Contact
          </h1>
          <p className={`mt-6 max-w-3xl text-lg leading-8 text-white/70 sm:text-xl ${tasaOrbiter.className}`}>
            Let&apos;s make something useful. I&apos;m open to thoughtful product work, dependable engineering problems, and collaborations with people who care about the details.
          </p>
        </header>

        <div className="mt-12 grid gap-12 border-t border-white/15 pt-8 sm:mt-14 sm:pt-10 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
          <section className="min-w-0" aria-label="Direct contact options">
            <a
              href="mailto:bsuvraneel@gmail.com"
              className="group flex min-h-16 items-center gap-4 border-b border-white/20 py-4 text-white transition-[color,border-color] duration-300 hover:border-[#83d3dd]/70 hover:text-[#d9f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]"
            >
              <FontAwesomeIcon icon={faEnvelope} aria-hidden="true" className="shrink-0 text-[#83d3dd]" />
              <span className="min-w-0 break-all text-lg font-medium sm:text-xl">bsuvraneel@gmail.com</span>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" className="ml-auto shrink-0 text-xs text-white/45 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#83d3dd]" />
            </a>
            <Link
              href="https://suvraneel.bio.link"
              target="_blank"
              rel="noreferrer"
              className="group flex min-h-14 items-center justify-between gap-4 border-b border-white/10 py-3 text-sm text-white/60 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]"
            >
              <span>More ways to connect</span>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" className="text-xs transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            <button
              type="button"
              onClick={() => {
                setShowScheduler(true);
                playConfirm();
              }}
              onMouseEnter={() => playSnap()}
              onMouseLeave={() => stopSnap()}
              className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-[linear-gradient(180deg,#1b1c1d_0%,#090909_100%)] px-4 text-sm font-medium text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.25)] transition-[color,border-color,transform,box-shadow] duration-300 hover:border-white/40 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd] active:translate-y-px motion-reduce:transition-none sm:w-auto"
            >
              <FontAwesomeIcon icon={faCalendarDays} aria-hidden="true" className="text-white/55" />
              <span>Book a conversation</span>
              <span className="text-xs font-normal text-white/45">via Calendly</span>
            </button>
          </section>

          <section className="min-w-0 lg:border-l lg:border-white/15 lg:pl-12" aria-labelledby="message-heading">
            <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-5">
              <div>
                <h2 id="message-heading" className={`text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl ${tasaOrbiter.className}`}>
                  Start with the context.
                </h2>
              </div>
              <span className="hidden pt-2 text-sm text-white/50 sm:block">Replies by email</span>
            </div>

            <form ref={form} onSubmit={sendEmail} className={`mt-7 space-y-6 ${tasaOrbiter.className}`} aria-label="Send a message">
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
                <Field label="Your name" name="user_name" autoComplete="name" />
                <Field label="Email address" name="user_email" type="email" autoComplete="email" />
              </div>
              <Field label="What are you working on?" name="message" textarea />

              <div className="flex flex-col gap-4 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <LiquidMetalButton
                  type="submit"
                  disabled={submissionState === "sending"}
                  onMouseEnter={() => playSnap()}
                  onMouseLeave={() => stopSnap()}
                  className="min-w-[11rem] w-full sm:w-auto"
                >
                  {submissionState === "sending" && <span aria-hidden="true" className="block h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />}
                  {submissionState === "sending" ? "Sending" : "Send message"}
                </LiquidMetalButton>
                <p className={`max-w-xs text-sm leading-5 text-white/60 ${tasaOrbiter.className}`}>A short note is enough. I&apos;ll reply by email.</p>
              </div>

              {submissionState === "success" && <output className="block border-l border-[#83d3dd] pl-3 text-sm leading-6 text-[#c9eaed]" aria-live="polite">Message sent. I&apos;ll get back to you soon.</output>}
              {submissionState === "error" && <p className={`border-l border-[#d58d8d] pl-3 text-sm leading-6 text-[#f0b6b6] ${tasaOrbiter.className}`} role="alert">Your message could not be sent. Please email me directly instead.</p>}
            </form>
          </section>
        </div>
      </div>

      {showScheduler && <CalendlyModal onClose={() => setShowScheduler(false)} closeIcon={faXmark} />}
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  textarea = false,
}: Readonly<{
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  textarea?: boolean;
}>) {
  const className = "mt-2 w-full border-0 border-b border-white/25 bg-transparent px-0 py-3 text-base text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-white/50 hover:border-white/50 focus-visible:border-[#83d3dd] focus-visible:ring-1 focus-visible:ring-[#83d3dd]/50";

  return (
    <label className="block text-sm font-medium text-white/75">
      {label}
      {textarea ? (
        <textarea name={name} required rows={4} className={`${className} resize-y`} placeholder="A few lines about the problem, scope, or idea…" />
      ) : (
        <input name={name} type={type} required autoComplete={autoComplete} className={className} />
      )}
    </label>
  );
}
