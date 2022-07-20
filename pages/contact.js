import React, { useEffect } from "react";
import Script from "next/script";
import Head from "next/head";
import { Calendly } from "../components/Calendly";
import SplineObj from "../components/SplineObj";
import CalendlyModal from "../components/CalendlyModal";
import { FontAwesomeObj } from "../components/FontAwesomeObj";
import { faEnvelopesBulk, faMobile } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const Contact = () => {
  // useEffect(() => {
  //   setTimeout(() => {
  //     // Calendly();
  //     const CalendlyScript = document.createElement("script");
  //     CalendlyScript.async = true;
  //     CalendlyScript.src =
  //       "https://assets.calendly.com/assets/external/widget.js";
  //     document.body.appendChild(CalendlyScript);
  //   }, 3000);
  // }, []);
  return (
    <div className="h-screen w-screen">
      <Head>
        <title>Portfolio</title>
      </Head>
      <div className="h-screen">
        {/* <SplineObj scene={"./spline/sceneMUSHROOM.splinecode"} /> */}
        <SplineObj
          scene={"https://prod.spline.design/shTSpaHWL9CC-uJA/scene.splinecode"}
        />
      </div>
      <div className="w-fit md:w-3/4 h-full form-bg px-10 py-5 mx-15 my-10 gap-3 z-10 h-fit lg:h-5/6 rounded login-box">
        <div className="w-full h-full flex flex-col md:flex-row">
          <form
            id="form"
            className="flex flex-col gap-5 rounded w-full md:w-1/2 h-full justify-evenly"
          >
            <div className="text-3xl md:text-4xl xl:text-7xl animated-heading bold mb-2 md:mb-10">
              Contact Me
            </div>
            <div className="user-box">
              <input
                type="text"
                className="w-full px-4 rounded"
                required
              ></input>
              <label>Name*</label>
            </div>
            <div className="user-box">
              <input
                type="email"
                className="w-full px-4 rounded"
                required
              ></input>
              <label>Email*</label>
            </div>
            <div className="user-box">
              <textarea
                className="w-full px-4 rounded"
                rows={4}
                cols={5}
                required
              ></textarea>
              <label>Message*</label>
            </div>
            {/* <button className="bg-black w-full rounded p-3 jello-vertical" type="submit">
            Submit
          </button> */}
            <div className="w-full h-full flex flex-col gap-4">
              <a
                href="#"
                className="animated-button1 p-2 w-full hover:text-cyan-400 text-xs md:text-md"
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Submit
              </a>
              <div className="flex w-full gap-5 items-center">
                <div className="bg-white w-1/2 h-0.5 hr"></div>
                <div className="text-white">OR</div>
                <div className="bg-white w-1/2 h-0.5 hr"></div>
              </div>
              <CalendlyModal />
            </div>
          </form>
          <div className="w-1/2 h-full p-10">
            <div className="text-xl text-white gap-1 flex flex-col">
              <div className="flex gap-5 justify-start">
                {/* <img
                src="./images/bi_phone.png"
                alt="contact_phone"
                className="h-5 w-5"
              /> */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={"https://api.whatsapp.com/send/?phone=917001967224&text=Hey+Suvraneel+!+👋"}>
                    <div className="text-sm flex w-full gap-2 items-center">
                      <FontAwesomeObj
                        icon={faMobile}
                        brandColor="cyan"
                        title="+91 7000167224"
                        titleClassName="text-md"
                        size="xs"
                        className="sidebar-icon"
                      />{" "}
                    </div>
                  </Link>
                  <Link href={"mailto:bsuvraneel@gmail.com"} target="_blank">
                    <div className="text-sm flex w-full gap-2 items-center">
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
            <div className="flex w-full h-full py-10 hidden md:block">
              <iframe
                id="map"
                scrolling="no"
                src="https://maps.google.com/maps?width=100%25&amp;height=400&amp;hl=en&amp;q=Prabhuram%20Sarkar%20Lane,%20Kolkata,%20India+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                // width="500"
                // height="500"
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
