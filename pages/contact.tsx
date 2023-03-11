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
import { FontAwesomeObj } from "../components/FontAwesomeObj";
import SplineObj from "../components/SplineObject";
import useSound from "use-sound";
import { NextPage } from "next";

const CalendlyModal = dynamic(() => import("../components/CalendlyModal"), {
  loading: () => <p>Loading...</p>,
});

const Contact: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const form = useRef();
  const snapSfx = "./sounds/snap.wav";
  const confirmSfx = "./sounds/confirm.wav";
  const popSfx = "./sounds/pop.wav";
  const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.25 });
  const [playConfirm] = useSound(confirmSfx, { volume: 0.25 });
  const [playPop] = useSound(popSfx, { volume: 0.25 });
  const sendEmail = (e) => {
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
        <div className="w-full h-full flex flex-col md:flex-row">
          <form
            id="form"
            className="flex flex-col gap-5 rounded w-full md:w-1/2 h-full justify-evenly"
            // @ts-ignore
            ref={form}
            onSubmit={sendEmail}
          >
            <div className="ml-20 sm:ml-0 text-3xl md:text-4xl xl:text-7xl animated-heading bold mb-2 md:mb-10">
              Contact Me
            </div>
            <div className="user-box">
              <input
                type="text"
                name="user_name"
                className="w-full px-4 rounded"
                required
              ></input>
              <label>Name*</label>
            </div>
            <div className="user-box">
              <input
                type="email"
                name="user_email"
                className="w-full px-4 rounded"
                required
              ></input>
              <label>Email*</label>
            </div>
            <div className="user-box">
              <textarea
                name="message"
                className="w-full px-4 rounded"
                rows={4}
                cols={5}
                required
              ></textarea>
              <label>Message*</label>
            </div>
            <div className="w-full h-full flex flex-col gap-4">
              <a
                href="#"
                className="p-2 w-full hover:text-cyan-400"
                onMouseEnter={() => {
                  playSnap();
                }}
                onMouseLeave={() => {
                  stopSnap();
                }}
                onClick={() => playConfirm()}
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <input
                  type="submit"
                  value="Send"
                  className="w-full h-full text-xs md:text-md uppercase"
                />
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
      </div>
    </div>
  );
};

export default Contact;
