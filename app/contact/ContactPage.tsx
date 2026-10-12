"use client";

import { faArrowUpRightFromSquare, faCalendarDays, faEnvelope, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import { spaceBoards, tasaOrbiter } from "@font";
import LiquidMetalButton from "@components/LiquidMetalButton";
import PillButton from "@components/PillButton";

const CalendlyModal = dynamic(() => import("@components/CalendlyModal"), { ssr: false });

type SubmissionState = "idle" | "sending" | "success" | "error";

const EMAIL = "bsuvraneel@gmail.com";

export default function ContactPage() {
  const form = useRef<HTMLFormElement>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [playSnap, { stop: stopSnap }] = useSound("/sounds/snap.wav", { volume: 0.25 });
  const [playConfirm] = useSound("/sounds/confirm.wav", { volume: 0.25 });
  const [emailCopied, setEmailCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Clipboard blocked: fall back to the mail app.
      window.location.href = `mailto:${EMAIL}`;
      return;
    }
    playConfirm();
    setEmailCopied(true);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setEmailCopied(false), 1800);
  };

  const sendEmail = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.current || submissionState === "sending") return;

    setSubmissionState("sending");

    try {
      // Keep the EmailJS client out of the initial Contact route bundle.
      const emailjs = (await import("@emailjs/browser")).default;
      await emailjs.sendForm("service_7t4fz0c", "template_dzdjrce", form.current, "LD8juHpdDTXSbZCSv");
      form.current.reset();
      form.current.querySelectorAll("textarea").forEach((field) => {
        field.style.minHeight = "";
      });
      setSubmissionState("success");
      playConfirm();
    } catch {
      setSubmissionState("error");
    }
  };

  return (
    <main className="nav-gap min-h-[100dvh] overflow-x-hidden bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-28 sm:px-10 sm:pb-28 sm:pt-24 lg:px-14 lg:pb-12 lg:pt-[max(4rem,calc((100dvh-30rem)/2))] xl:px-20">
        {/* Editorial split: intro and direct options on the left, the form from the top on the right, so Send stays above the fold.
            Desktop top padding centres the ~30rem composition from the viewport height alone, so the growing textarea never shifts it. */}
        <div className="grid gap-12 lg:grid-cols-[minmax(17rem,0.95fr)_minmax(0,1.05fr)] lg:gap-0 min-[1440px]:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)]">
          <div className="min-w-0 lg:pr-8 min-[1440px]:pr-12">
            <header className="max-w-4xl">
              <h1 className={`animated-heading w-max text-4xl font-bold leading-none tracking-[-0.04em] sm:text-6xl lg:text-5xl min-[1440px]:text-6xl ${spaceBoards.className}`}>
                Contact
              </h1>
              <p className={`mt-6 max-w-3xl text-lg leading-8 text-white/70 sm:text-xl ${tasaOrbiter.className}`}>
                Let&apos;s make something useful. I&apos;m open to thoughtful product work, dependable engineering problems, and collaborations with people who care about the details.
              </p>
            </header>

            <section className="mt-12 min-w-0 border-t border-white/15 pt-8 sm:mt-14 sm:pt-10 lg:mt-10 lg:pt-6" aria-label="Direct contact options">
              <div className="flex min-h-16 items-center gap-2 border-b border-white/20 transition-[border-color] duration-300 hover:border-accent/70">
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={`Copy email address ${EMAIL}`}
                  className="group flex min-w-0 flex-1 items-center gap-4 py-4 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <FontAwesomeIcon icon={faEnvelope} aria-hidden="true" className="shrink-0 text-accent" />
                  <span className="min-w-0 break-all text-lg font-medium sm:text-xl">{EMAIL}</span>
                  <span
                    aria-hidden="true"
                    className={`ml-auto shrink-0 text-xs transition-[color,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      emailCopied ? "text-accent opacity-100" : "text-white/45 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                    }`}
                  >
                    {emailCopied ? "Copied" : "Copy"}
                  </span>
                </button>
                <a
                  href={`mailto:${EMAIL}`}
                  aria-label="Open in your mail app"
                  className="group flex size-10 shrink-0 items-center justify-end rounded-full text-white/45 transition-colors duration-300 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" className="text-xs transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <span className="sr-only" aria-live="polite">{emailCopied ? "Email address copied" : ""}</span>
              </div>
              <Link
                href="https://suvraneel.bio.link"
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-14 items-center justify-between gap-4 border-b border-white/10 py-3 text-sm text-white/60 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <span>More ways to connect</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" className="text-xs transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <PillButton
                onClick={() => {
                  setShowScheduler(true);
                  playConfirm();
                }}
                onMouseEnter={() => playSnap()}
                onMouseLeave={() => stopSnap()}
                icon={<FontAwesomeIcon icon={faCalendarDays} aria-hidden="true" className="text-white/55" />}
                className="mt-7 w-full sm:w-auto"
              >
                <span>Book a conversation</span>
                <span className="text-xs font-normal text-white/55">via Calendly</span>
              </PillButton>
            </section>
          </div>

          <section className="min-w-0 lg:flex lg:flex-col lg:border-l lg:border-white/15 lg:pl-8 min-[1440px]:pl-12" aria-labelledby="message-heading">
            <div className="border-b border-white/15 pb-5">
              <h2 id="message-heading" className={`text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl ${tasaOrbiter.className}`}>
                Start with the context.
              </h2>
            </div>

            <form ref={form} onSubmit={sendEmail} className={`mt-7 space-y-6 lg:flex lg:flex-1 lg:flex-col ${tasaOrbiter.className}`} aria-label="Send a message">
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
                <Field label="Your name" name="user_name" autoComplete="name" />
                <Field label="Email address" name="user_email" type="email" autoComplete="email" />
              </div>
              <Field label="What are you working on?" name="message" textarea className="lg:flex lg:flex-1 lg:flex-col" />

              <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
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

              {submissionState === "success" && <output className="block border-l border-accent pl-3 text-sm leading-6 text-white" aria-live="polite">Message sent. I&apos;ll get back to you soon.</output>}
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
  className: wrapperClassName = "",
}: Readonly<{
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  textarea?: boolean;
  className?: string;
}>) {
  // Underline fields: focus thickens the rule to 2px accent instead of drawing a box.
  const className = "mt-1 w-full rounded-none border-0 border-b border-white/25 bg-transparent px-0 py-2 text-base text-white outline-none transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-white/50 hover:border-white/50 focus:border-accent focus:shadow-[0_1px_0_0_rgb(var(--accent))]";

  // Grow with the message instead of exposing the browser's resize grip.
  const autoGrow = (event: FormEvent<HTMLTextAreaElement>) => {
    const field = event.currentTarget;
    field.style.minHeight = "";
    field.style.minHeight = `${Math.max(field.clientHeight, field.scrollHeight)}px`;
  };

  return (
    <label className={`block text-sm font-medium text-white/75 ${wrapperClassName}`}>
      {label}
      {textarea ? (
        <textarea name={name} required rows={4} onInput={autoGrow} className={`${className} max-h-[40vh] resize-none lg:flex-1`} placeholder="A few lines about the problem, scope, or idea…" />
      ) : (
        <input name={name} type={type} required autoComplete={autoComplete} className={className} />
      )}
    </label>
  );
}
