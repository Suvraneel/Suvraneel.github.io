"use client";

import { faArrowUpRightFromSquare, faCalendarDays, faEnvelope, faPaperPlane, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import useSound from "use-sound";
import SplineObj from "@components/SplineObject";
import { spaceBoards, tasaOrbiter } from "@font";

const CalendlyModal = dynamic(() => import("@components/CalendlyModal"), { ssr: false });

type SubmissionState = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const form = useRef<HTMLFormElement>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [playSnap, { stop: stopSnap }] = useSound("/sounds/snap.wav", { volume: 0.25 });
  const [playConfirm] = useSound("/sounds/confirm.wav", { volume: 0.25 });

  const sendEmail = async (event: FormEvent<HTMLFormElement>) => {
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
    <main className="nav-gap relative min-h-[100dvh] overflow-x-hidden bg-[#07090d] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 top-12 h-[30rem] w-[30rem] rounded-full bg-[#1c5261]/15 blur-[120px]" />
        <div className="absolute bottom-[-16rem] right-[14%] h-[34rem] w-[34rem] rounded-full bg-[#0c8588]/10 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(184,214,218,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(184,214,218,0.8)_1px,transparent_1px)] [background-size:3rem_3rem]" />
      </div>

      {/*<div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] opacity-40 lg:block" aria-hidden="true">*/}
      {/*  <SplineObj scene="./spline/sceneCONTACT.splinecode" />*/}
      {/*</div>*/}

      <div className="relative z-10 mx-auto grid min-h-[100dvh] max-w-[1440px] items-center gap-12 px-5 pb-16 pt-28 sm:px-10 lg:grid-cols-[minmax(18rem,0.78fr)_minmax(28rem,1.05fr)] lg:gap-20 lg:px-14 lg:py-20 xl:px-20">
        <section className="max-w-xl">
          <p className={`text-xs font-medium uppercase tracking-[0.22em] text-[#9bb7c0] ${tasaOrbiter.className}`}>Reach out</p>
          <h1 className={`animated-heading mt-5 whitespace-nowrap text-[clamp(3.25rem,5vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.055em] ${spaceBoards.className}`}>
            Contact
          </h1>
          <p className={`mt-7 max-w-[36rem] text-lg leading-8 text-white/70 sm:text-xl ${tasaOrbiter.className}`}>
            Let&apos;s make something useful. I&apos;m open to thoughtful product work, dependable engineering problems, and collaborations with people who care about the details.
          </p>

          <div className="mt-10 border-y border-white/10 py-5">
            <a
              href="mailto:bsuvraneel@gmail.com"
              className="group flex items-center justify-between gap-4 py-2 text-base text-white transition hover:text-[#b8e4e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd] sm:text-lg"
            >
              <span className="flex items-center gap-3"><FontAwesomeIcon icon={faEnvelope} className="text-[#83d3dd]" />bsuvraneel@gmail.com</span>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs text-white/45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#b8e4e8]" />
            </a>
            <Link
              href="https://suvraneel.bio.link"
              target="_blank"
              rel="noreferrer"
              className="group mt-3 flex items-center justify-between gap-4 py-2 text-sm text-white/55 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd]"
            >
              <span>More ways to connect</span>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowScheduler(true);
              playConfirm();
            }}
            onMouseEnter={() => playSnap()}
            onMouseLeave={() => stopSnap()}
            className="mt-8 inline-flex items-center gap-3 border-b border-[#83d3dd] pb-2 text-sm font-semibold tracking-[0.04em] text-[#b8e4e8] transition hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd] active:translate-y-px"
          >
            <FontAwesomeIcon icon={faCalendarDays} />
            Book a conversation
          </button>
        </section>

        <section className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0d141c]/90 p-5 shadow-[0_24px_80px_rgba(3,18,24,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-32 w-32 bg-[#83d3dd]/[0.06] blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#83d3dd]">Message</p>
                <h2 className={`mt-2 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl ${tasaOrbiter.className}`}>Start with the context.</h2>
              </div>
              <span className="mt-1 hidden font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/35 sm:block">Replies by email</span>
            </div>

            <form ref={form} onSubmit={sendEmail} className={`mt-8 space-y-6 ${tasaOrbiter.className}`}>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Your name" name="user_name" autoComplete="name" />
                <Field label="Email address" name="user_email" type="email" autoComplete="email" />
              </div>
              <Field label="What are you working on?" name="message" textarea />

              <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={submissionState === "sending"}
                  onMouseEnter={() => playSnap()}
                  onMouseLeave={() => stopSnap()}
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#83d3dd] px-5 text-sm font-semibold text-[#071014] transition hover:bg-[#b8e4e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83d3dd] disabled:cursor-wait disabled:opacity-70 active:translate-y-px"
                >
                  {submissionState === "sending" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#071014]/25 border-t-[#071014]" aria-hidden="true" /> : <FontAwesomeIcon icon={faPaperPlane} />}
                  {submissionState === "sending" ? "Sending" : "Send message"}
                </button>
                <p className="max-w-xs text-sm leading-5 text-white/45">A short note is enough. I&apos;ll reply by email.</p>
              </div>

              {submissionState === "success" && <p className="border-l-2 border-[#83d3dd] pl-3 text-sm leading-6 text-[#c9eaed]" role="status">Message sent. I&apos;ll get back to you soon.</p>}
              {submissionState === "error" && <p className="border-l-2 border-[#d58d8d] pl-3 text-sm leading-6 text-[#f0b6b6]" role="alert">Your message could not be sent. Please email me directly instead.</p>}
            </form>
          </div>
        </section>
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
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  textarea?: boolean;
}) {
  const className = "mt-2 w-full rounded-[0.6rem] border border-white/10 bg-white/[0.035] px-4 py-3 text-base text-white outline-none transition placeholder:text-white/25 hover:border-white/20 focus:border-[#83d3dd]/80 focus:bg-[#83d3dd]/[0.04] focus:ring-1 focus:ring-[#83d3dd]/30";

  return (
    <label className="block text-sm font-medium text-white/75">
      {label}
      {textarea ? (
        <textarea name={name} required rows={5} className={`${className} resize-y`} placeholder="A few lines about the problem, scope, or idea." />
      ) : (
        <input name={name} type={type} required autoComplete={autoComplete} className={className} />
      )}
    </label>
  );
}
