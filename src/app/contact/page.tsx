"use client"
import emailjs from "@emailjs/browser";
import {
  faClose,
  faEnvelopesBulk,
  faMobile,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRef, useState } from "react";
import { FontAwesomeObj } from "@components/FontAwesomeObj";
import SplineObj from "@components/SplineObject";
import useSound from "use-sound";
import { NextPage } from "next";
import { spaceBoards, tasaOrbiter } from "@fonts";

const Contact: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const snapSfx = "./sounds/snap.wav";
  const confirmSfx = "./sounds/confirm.wav";
  const popSfx = "./sounds/pop.wav";
  const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.25 });
  const [playConfirm] = useSound(confirmSfx, { volume: 0.25 });
  const [playPop] = useSound(popSfx, { volume: 0.25 });
  const [sendingMsg, setSendingMsg] = useState(false);
  const resetInput = () => {
    if (form.current) {
      const formFields = form.current.elements;
      for (let i = 0; i < formFields.length; i++) {
        const field = formFields[i];
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
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
        form.current ?? "",
        "LD8juHpdDTXSbZCSv"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      ).then(
        () => resetInput()
      );
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
        <meta name="description" content="Contact | Official Portfolio Website | Suvraneel Bhuin" />
      </Head>
      <div className="h-screen">
        {/* <SplineObj
          scene={"https://prod.spline.design/shTSpaHWL9CC-uJA/scene.splinecode"}
        /> */}
        <SplineObj scene={"./spline/sceneCONTACT.splinecode"} />
      </div>
      <div id="modal" className="h-fit w-full max-w-3xl"></div>
      {showModal &&
        <>
          {closeBtn}
          <CalendlyModal />
        </>
      }
      <div className="w-fit md:w-3/4 form-bg px-10 py-5 sm:mx-15 my-10 gap-3 z-10 h-fit lg:h-5/6 rounded login-box backdrop-blur-sm">
        <div className={`w-full h-full flex flex-col md:flex-row ${tasaOrbiter.className}`}>
          <form
            id="form"
            className="flex flex-col gap-5 rounded w-full md:w-1/2 h-full justify-evenly"
            // @ts-ignore
            ref={form}
            onSubmit={sendEmail}
          >
            <div className={`ml-20 sm:ml-0 text-2xl md:text-3xl xl:text-5xl animated-heading bold mb-2 md:mb-10 ${spaceBoards.className}`}>
              Contact Me
            </div>
            <div className="user-box">
              <input
                type="text"
                title="name"
                name="user_name"
                className="w-full px-4 rounded"
                required
              ></input>
              <label>Name*</label>
            </div>
            <div className="user-box">
              <input
                type="email"
                title="Email"
                name="user_email"
                className="w-full px-4 rounded"
                required
              ></input>
              <label>Email*</label>
            </div>
            <div className="user-box">
              <textarea
                name="message"
                title="Message"
                className="w-full px-4 rounded"
                rows={4}
                cols={5}
                required
              ></textarea>
              <label>Message*</label>
            </div>
            <div className={`w-full h-full flex flex-col gap-4 ${spaceBoards.className}`}>
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
                  {sendingMsg ? loaderSpinner() : <>SEND</>}
                </button>
              </a>
              <div className="flex w-full gap-5 items-center">
                <div className="bg-white w-1/2 h-0.5 hr"></div>
                <div className="text-white">OR</div>
                <div className="bg-white w-1/2 h-0.5 hr"></div>
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
          <div className="w-1/2 h-full p-10">
            <div className="text-xl text-white gap-1 flex flex-col">
              <div className="flex gap-5 justify-start">
                <div className="flex flex-col items-start gap-2">
                  <Link
                    target="_blank"
                    href={"https://suvraneel.bio.link"}
                    className="text-white flex flex-row gap-3 hover:text-cyan-300"
                    legacyBehavior
                  >
                    <div className="flex justify-start">
                      <FontAwesomeObj
                        icon={faMobile}
                        brandColor="cyan"
                        title="suvraneel.bio.link"
                        titleClassName="text-md"
                        size="xs"
                        className="sidebar-icon"
                      />
                    </div>
                  </Link>
                  <Link
                    href={"mailto:bsuvraneel@gmail.com"}
                    className="text-white flex flex-row gap-3 hover:text-cyan-300"
                    target="_blank"
                    legacyBehavior
                  >
                    <div className="flex justify-start">
                      <FontAwesomeObj
                        icon={faEnvelopesBulk}
                        brandColor="cyan"
                        title="bsuvraneel@gmail.com"
                        size="xs"
                        className="sidebar-icon"
                      />{" "}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full h-full py-10 hidden md:block">
              <iframe
                id="map"
                src="https://maps.google.com/maps?width=100%25&amp;height=400&amp;hl=en&amp;q=Prabhuram%20Sarkar%20Lane,%20Kolkata,%20India+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                loading="lazy"
                className="invert opacity-60 hover:opacity-100 w-full h-full"
              />
            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default Contact;

const CalendlyModal = dynamic(() => import("@components/CalendlyModal"), {
  loading: () => <p>Loading...</p>,

});

const loaderSpinner = () => {
  return (
    <svg aria-hidden="true" className="inline w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-accent" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
    </svg>
  )
}