"use client";
import emailjs from "@emailjs/browser";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRef, useState } from "react";
import SplineObj from "@components/SplineObject";
import { NextPage } from "next";
import { spaceBoards, tasaOrbiter } from "@font";
import { useSoundEffects } from "@components/SoundEffectsContext";
import styles from "./contact.module.css";
import { LoaderSpinner } from "@components/LoaderSpinner";
import ContactInfo from "./ContactInfo";

const CalendlyModal = dynamic(() => import("@components/CalendlyModal"), {
  loading: () => <p>Loading...</p>,
});

const Contact: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const { playSnap, stopSnap, playPop, playConfirm } = useSoundEffects();
  const [sendingMsg, setSendingMsg] = useState(false);
  const resetInput = () => {
    if (form.current) {
      const formFields = form.current.elements;
      for (let i = 0; i < formFields.length; i++) {
        const field = formFields[i];
        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement
        ) {
          field.value = "";
        }
      }
      setSendingMsg(false);
    }
  };
  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_7t4fz0c",
        "template_dzdjrce",
        form.current || "",
        "LD8juHpdDTXSbZCSv"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      )
      .then(() => resetInput());
  };

  const closeBtn = (
    <button
      className="h-fit absolute top-0 right-0 z-[1001] text-md"
      type="button"
      onMouseEnter={() => {
        playSnap();
      }}
      onMouseLeave={() => {
        stopSnap();
      }}
      onClick={() => {
        setShowModal(false);
        playPop();
      }}
    >
      <div className="hidden md:block p-5 text-white hover:text-amber-400">
        Changed your mind? Close Scheduler...
      </div>
      <FontAwesomeIcon
        className="block md:hidden bg-black p-2 text-amber-400"
        icon={faClose}
        size="2x"
      ></FontAwesomeIcon>
    </button>
  );
  return (
    <div id="contact" className="h-screen w-screen">
      <Head>
        <title>Contact | Portfolio - Suvraneel</title>
        <meta
          name="description"
          content="Contact | Official Portfolio Website | Suvraneel Bhuin"
        />
      </Head>
      <div className="h-screen">
        {/* <SplineObj
          scene={"https://prod.spline.design/shTSpaHWL9CC-uJA/scene.splinecode"}
        /> */}
        <SplineObj scene={"./spline/sceneCONTACT.splinecode"} />
      </div>
      <div id="modal" className="h-fit w-full max-w-3xl"></div>
      {showModal && (
        <>
          {closeBtn}
          <CalendlyModal />
        </>
      )}
      <div
        className={`w-fit md:w-3/4 ${styles.formBg} ${styles.loginBox} px-10 py-5 sm:mx-15 my-10 gap-3 z-10 h-fit lg:h-5/6 rounded backdrop-blur-sm pointer-events-none`}
      >
        <div
          className={`w-full h-full flex flex-col md:flex-row ${tasaOrbiter.className}`}
        >
          <form
            id="form"
            className="flex flex-col gap-5 rounded w-full md:w-1/2 h-full justify-evenly pointer-events-auto"
            // @ts-ignore
            ref={form}
            onSubmit={sendEmail}
          >
            <div
              className={`ml-20 sm:ml-0 text-2xl md:text-3xl xl:text-5xl animated-heading bold mb-2 md:mb-10 ${spaceBoards.className}`}
            >
              Contact Me
            </div>
            <div className={styles.userBox}>
              <input
                type="text"
                title="name"
                id="user_name"
                name="user_name"
                className="w-full px-4 rounded"
                required
              ></input>
              <label htmlFor="user_name">Name*</label>
            </div>
            <div className={styles.userBox}>
              <input
                type="email"
                title="Email"
                id="user_email"
                name="user_email"
                className="w-full px-4 rounded"
                required
              ></input>
              <label htmlFor="user_email">Email*</label>
            </div>
            <div className={styles.userBox}>
              <textarea
                name="message"
                title="Message"
                id="message"
                className="w-full px-4 rounded"
                rows={4}
                cols={5}
                required
              ></textarea>
              <label htmlFor="message">Message*</label>
            </div>
            <div
              className={`w-full h-full flex flex-col gap-4 ${spaceBoards.className}`}
            >
              <a
                href="#"
                className="p-2 w-full bg-[#9200BA] hover:text-cyan-400"
                onMouseEnter={() => {
                  playSnap();
                }}
                onMouseLeave={() => {
                  stopSnap();
                }}
                onClick={() => {
                  setSendingMsg(true);
                  playConfirm();
                }}
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <button
                  type="submit"
                  value="Send"
                  className="w-full h-full text-xs md:text-md uppercase"
                >
                  {sendingMsg ? LoaderSpinner() : <>SEND</>}
                </button>
              </a>
              <div className="flex w-full gap-5 items-center">
                <div className={`bg - white w-1/2 h-0.5 ${styles.hr}`}></div>
                <div className="text-white">OR</div>
                <div className={`bg - white w-1/2 h-0.5 ${styles.hr}`}></div>
              </div>
              <a
                href="#"
                className="p-2 w-full hover:text-cyan-400 text-xs md:text-md uppercase"
                onMouseEnter={() => playSnap()}
                onMouseLeave={() => stopSnap()}
                onClick={() => {
                  setShowModal(true);
                  playConfirm();
                }}
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Schedule a Meet with me...
              </a>
            </div>
          </form>
          <ContactInfo />
        </div>
      </div>
    </div>
  );
};

export default Contact;
