"use client";

import Link from "next/link";
import { FormEvent, Suspense, SyntheticEvent, lazy, useCallback, useEffect, useRef, useState } from "react";
import { preconnect, prefetchDNS } from "react-dom";
import { useSfx } from "@hooks/useSfx";
import { spaceBoards, tasaOrbiter } from "@font";
import LiftHeading from "@components/LiftHeading";
import LiquidMetalButton from "@components/LiquidMetalButton";
import PillButton from "@components/PillButton";
import { AnimateIcon } from "@components/animate-ui/icons/icon";
import { CalendarDaysIcon } from "@components/animate-ui/icons/calendar-days";
import { CheckIcon } from "@components/animate-ui/icons/check";
import { CopyIcon } from "@components/animate-ui/icons/copy";
import { SendIcon } from "@components/animate-ui/icons/send";
import { SquareArrowOutUpRightIcon } from "@components/animate-ui/icons/square-arrow-out-up-right";

// One loader for the click and the warm-up: next/dynamic would wrap its import() in a separate chunk.
const loadScheduler = () => import("@components/CalendlyModal");
const CalendlyModal = lazy(loadScheduler);

let schedulerWarmed = false;
/** Hover or focus on "Book a conversation" starts the scheduler's chunk and Calendly connections before the click. */
function warmScheduler() {
  if (schedulerWarmed) return;
  schedulerWarmed = true;
  // The same loader lazy() uses, so the click reuses this download. A failed load is retried on click.
  loadScheduler().catch(() => {});
  for (const origin of ["https://calendly.com", "https://assets.calendly.com"]) {
    preconnect(origin);
    prefetchDNS(origin);
  }
}

type SubmissionState = "idle" | "sending" | "success" | "error";
type FieldName = "user_name" | "user_email" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["user_name", "user_email", "message"];
// Hidden bait field: people never see it, form bots fill every input. Its name
// matches no autofill field (unlike "company" or "website"), so no browser or
// password manager fills it for a real visitor and drops their message.
const HONEYPOT = "_gotcha";
const SEND_TIMEOUT_MS = 15000;

/** Rejects once `ms` passes, so a request that never settles still ends in the error state. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error("Send timed out")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
}

/** Our own messages instead of the browser's validation bubble. */
function validateForm(formElement: HTMLFormElement): FieldErrors {
  const errors: FieldErrors = {};
  const value = (name: FieldName) => String(new FormData(formElement).get(name) ?? "").trim();
  if (!value("user_name")) errors.user_name = "Add your name.";
  const email = value("user_email");
  const emailInput = formElement.elements.namedItem("user_email") as HTMLInputElement | null;
  if (!email) errors.user_email = "Add your email address.";
  else if (emailInput?.validity.typeMismatch) errors.user_email = "That email address looks incomplete.";
  if (!value("message")) errors.message = "Tell me a little about what you're working on.";
  return errors;
}

const EMAIL = "bsuvraneel@gmail.com";

export default function ContactPage() {
  const form = useRef<HTMLFormElement>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  // Stable, so a re-render while the scheduler is open does not re-run its open effect (and refocus it).
  const closeScheduler = useCallback(() => setShowScheduler(false), []);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [playSnap, { stop: stopSnap }] = useSfx("snap", { volume: 0.25 });
  const [playConfirm] = useSfx("confirm", { volume: 0.25 });
  const [emailCopied, setEmailCopied] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);
  const [bookHovered, setBookHovered] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const copiedTimer = useRef<number | null>(null);
  const schedulerOpener = useRef<HTMLElement | null>(null);
  const sentHeading = useRef<HTMLParagraphElement>(null);

  useEffect(() => () => {
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
  }, []);

  // The modal dialog leaves focus on <body> when it unmounts, so hand it back to
  // the button that opened it. Runs after the modal's own cleanup has closed it.
  useEffect(() => {
    if (showScheduler || !schedulerOpener.current) return;
    schedulerOpener.current.focus();
    schedulerOpener.current = null;
  }, [showScheduler]);

  // A send removes the form, and the focused Send button with it, which drops
  // focus to <body>: hand it to the confirmation, unless it was moved elsewhere meanwhile.
  useEffect(() => {
    if (submissionState !== "success") return;
    if (document.activeElement === null || document.activeElement === document.body) sentHeading.current?.focus();
  }, [submissionState]);

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
    const formElement = form.current;
    if (!formElement || submissionState === "sending") return;

    const found = validateForm(formElement);
    setAttempted(true);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      (formElement.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setSubmissionState("sending");

    try {
      // A filled honeypot means a bot: skip the send but let it see the usual success.
      if (!new FormData(formElement).get(HONEYPOT)) {
        // Keep the EmailJS client out of the initial Contact route bundle.
        const delivery = import("@emailjs/browser").then(({ default: emailjs }) =>
          emailjs.sendForm("service_7t4fz0c", "template_dzdjrce", formElement, "LD8juHpdDTXSbZCSv"),
        );
        await withTimeout(delivery, SEND_TIMEOUT_MS);
      }
      formElement.reset();
      setAttempted(false);
      setSubmissionState("success");
      playConfirm();
    } catch {
      setSubmissionState("error");
    }
  };

  return (
    <main className="nav-gap min-h-[100dvh] overflow-x-hidden bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-20 sm:px-10 sm:pb-28 sm:pt-24 lg:px-14 lg:pb-12 lg:pt-[max(4rem,calc((100dvh-30rem)/2))] xl:px-20">
        {/* Editorial split: intro and direct options on the left, the form from the top on the right, so Send stays above the fold.
            Desktop top padding centres the ~30rem composition from the viewport height alone, so the growing textarea never shifts it. */}
        <div className="grid gap-12 lg:grid-cols-[minmax(17rem,0.95fr)_minmax(0,1.05fr)] lg:gap-0 min-[1440px]:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)]">
          <div className="min-w-0 lg:pr-8 min-[1440px]:pr-12">
            <header className="max-w-4xl">
              <LiftHeading className={`w-max text-4xl font-bold leading-none tracking-[-0.04em] sm:text-6xl lg:text-5xl min-[1440px]:text-6xl ${spaceBoards.className}`}>
                Contact
              </LiftHeading>
              <p className={`mt-6 max-w-3xl text-lg leading-8 text-white/70 sm:text-xl ${tasaOrbiter.className}`}>
                Let&apos;s make something useful. I&apos;m open to thoughtful product work, dependable engineering problems, and collaborations with people who care about the details.
              </p>
            </header>

            <section className="mt-12 min-w-0 border-t border-white/15 pt-8 sm:mt-14 sm:pt-10 lg:mt-10 lg:pt-6" aria-label="Direct contact options">
              <div className="flex min-h-16 items-center gap-2 border-b border-white/20 transition-[border-color] duration-300 hover:border-accent/70">
                <AnimateIcon animateOnHover asChild>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={`Copy email address ${EMAIL}`}
                  className="group flex min-w-0 flex-1 items-center gap-4 py-4 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <span className="min-w-0 break-all text-base font-medium">{EMAIL}</span>
                  <span
                    aria-hidden="true"
                    className={`ml-auto flex size-10 shrink-0 items-center justify-end transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      emailCopied ? "text-accent" : "text-white/45 group-hover:text-accent group-focus-visible:text-accent [@media(hover:none)]:text-accent"
                    }`}
                  >
                    {emailCopied ? <CheckIcon size={16} animate /> : <CopyIcon size={16} />}
                  </span>
                </button>
                </AnimateIcon>
                <AnimateIcon animateOnHover asChild>
                <a
                  href={`mailto:${EMAIL}`}
                  aria-label="Open in your mail app"
                  className="group flex size-10 shrink-0 items-center justify-end rounded-full text-white/45 transition-colors duration-300 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <SquareArrowOutUpRightIcon aria-hidden="true" size={16} />
                </a>
                </AnimateIcon>
                <span className="sr-only" aria-live="polite">{emailCopied ? "Email address copied" : ""}</span>
              </div>
              <AnimateIcon animateOnHover asChild>
              <Link
                href="https://suvraneel.bio.link"
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-14 items-center justify-between gap-4 border-b border-white/10 py-3 text-sm font-normal text-white/60 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <span className="link-draw">More ways to connect</span>
                <SquareArrowOutUpRightIcon aria-hidden="true" size={16} />
              </Link>
              </AnimateIcon>

              {/* Box-less wrapper: PillButton forwards no pointer or focus handlers. */}
              <div className="contents" onPointerEnter={warmScheduler} onFocus={warmScheduler}>
              <PillButton
                onClick={(event) => {
                  schedulerOpener.current = event.currentTarget;
                  setShowScheduler(true);
                  playConfirm();
                }}
                onMouseEnter={() => {
                  setBookHovered(true);
                  playSnap();
                }}
                onMouseLeave={() => {
                  setBookHovered(false);
                  stopSnap();
                }}
                icon={<CalendarDaysIcon aria-hidden="true" size={16} animate={bookHovered} className="text-white/55" />}
                className="mt-7 w-full sm:w-auto"
              >
                <span>Book a conversation</span>
                <span className="text-xs font-normal text-white/55">via Calendly</span>
              </PillButton>
              </div>
            </section>
          </div>

          <section className="min-w-0 lg:flex lg:flex-col lg:border-l lg:border-white/15 lg:pl-8 min-[1440px]:pl-12" aria-labelledby="message-heading">
            <div className="border-b border-white/15 pb-5">
              <h2 id="message-heading" className={`text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl ${tasaOrbiter.className}`}>
                Start with the context.
              </h2>
            </div>

            {/* Mounted from the start: screen readers skip a live region that arrives with its text. */}
            <span className="sr-only" role="status">{submissionState === "success" ? "Message sent. I'll get back to you soon." : ""}</span>

            {submissionState === "success" ? (
              <div className={`mt-7 flex flex-col items-start gap-5 lg:flex-1 lg:justify-center ${tasaOrbiter.className}`}>
                <span className="grid size-12 place-items-center rounded-full border border-accent/40 text-accent">
                  <SendIcon aria-hidden="true" size={20} animate />
                </span>
                <p ref={sentHeading} tabIndex={-1} className="text-xl font-semibold tracking-[-0.02em] text-white outline-none sm:text-2xl">Message sent.</p>
                <p className="text-base leading-7 text-white/70">I&apos;ll get back to you soon.</p>
                <button
                  type="button"
                  onClick={() => setSubmissionState("idle")}
                  className="text-sm text-white/60 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <span className="link-draw">Send another message</span>
                </button>
              </div>
            ) : (
            <form
              ref={form}
              noValidate
              onSubmit={sendEmail}
              onInput={() => {
                if (attempted && form.current) setErrors(validateForm(form.current));
              }}
              className={`mt-7 space-y-6 lg:flex lg:flex-1 lg:flex-col ${tasaOrbiter.className}`}
              aria-label="Send a message"
            >
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
                <Field label="Your name" name="user_name" autoComplete="name" maxLength={100} error={errors.user_name} />
                <Field label="Email address" name="user_email" type="email" autoComplete="email" maxLength={254} error={errors.user_email} />
              </div>
              <Field label="What are you working on?" name="message" textarea maxLength={5000} className="lg:flex lg:flex-1 lg:flex-col" error={errors.message} />

              <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <LiquidMetalButton
                  type="submit"
                  disabled={submissionState === "sending"}
                  onMouseEnter={() => {
                    setSendHovered(true);
                    playSnap();
                  }}
                  onMouseLeave={() => {
                    setSendHovered(false);
                    stopSnap();
                  }}
                  className="min-w-[11rem] w-full sm:w-auto"
                >
                  {submissionState === "sending" && <span aria-hidden="true" className="block h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />}
                  {submissionState === "sending" ? "Sending" : "Send message"}
                  {submissionState !== "sending" && (
                    <SendIcon aria-hidden="true" size={16} animate={sendHovered} />
                  )}
                </LiquidMetalButton>
                <p className={`max-w-xs text-sm leading-5 text-white/60 ${tasaOrbiter.className}`}>A short note is enough. I&apos;ll reply by email.</p>
              </div>

              {submissionState === "error" && <p className={`border-l border-[#d58d8d] pl-3 text-sm leading-6 text-[#f0b6b6] ${tasaOrbiter.className}`} role="alert">Your message could not be sent. Please email me directly instead.</p>}

              {/* Last child so the space-y gaps above stay as they were. Off-screen rather than display:none, which bots skip. */}
              <div className="sr-only" aria-hidden="true">
                <label>
                  {"Leave this empty "}
                  <input name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
            </form>
            )}
          </section>
        </div>
      </div>

      {showScheduler && (
        <Suspense fallback={null}>
          <CalendlyModal onClose={closeScheduler} />
        </Suspense>
      )}
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  textarea = false,
  maxLength,
  className: wrapperClassName = "",
  error,
}: Readonly<{
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  textarea?: boolean;
  maxLength?: number;
  className?: string;
  error?: string;
}>) {
  // Underline fields: focus thickens the rule to 2px accent instead of drawing a box.
  // Resting rule at white/40, the lightest step with 3:1 on black (white/35 is 2.998:1).
  const className = "mt-1 w-full rounded-none border-0 border-b border-white/40 bg-transparent px-0 py-2 text-base text-white outline-none transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-white/50 hover:border-white/50 focus:border-accent focus:shadow-[0_1px_0_0_rgb(var(--accent))]";

  // Grow with the message instead of exposing the browser's resize grip.
  const autoGrow = (event: FormEvent<HTMLTextAreaElement>) => {
    const field = event.currentTarget;
    field.style.minHeight = "";
    field.style.minHeight = `${Math.max(field.clientHeight, field.scrollHeight)}px`;
  };

  const errorId = `${name}-error`;
  const invalid = Boolean(error);
  const fieldClassName = invalid
    ? `${className} border-[#f0b6b6]/70 hover:border-[#f0b6b6] focus:border-[#f0b6b6] focus:shadow-[0_1px_0_0_#f0b6b6]`
    : className;
  const a11y = { "aria-invalid": invalid || undefined, "aria-describedby": invalid ? errorId : undefined };

  return (
    <label className={`block text-sm font-medium text-white/75 ${wrapperClassName}`}>
      {label}
      {textarea ? (
        <textarea name={name} required rows={3} maxLength={maxLength} onInput={autoGrow} {...a11y} className={`${fieldClassName} max-h-[40vh] resize-none lg:flex-1`} placeholder="A few lines about the problem, scope, or idea…" />
      ) : (
        <input name={name} type={type} required autoComplete={autoComplete} maxLength={maxLength} {...a11y} className={fieldClassName} />
      )}
      {/* Always mounted at one line's fixed height, so an error fills it without moving anything below.
          A rare wrapped second line (long email error near 1024px) spills into the gap under the field. */}
      <span id={errorId} className="block h-[1.25rem] pt-1 text-xs font-normal text-[#f0b6b6]">
        {error}
      </span>
    </label>
  );
}
