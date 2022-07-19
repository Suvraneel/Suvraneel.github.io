import React, { useEffect } from "react";
import Script from "next/script";
import Head from "next/head";
import { Calendly } from "../components/Calendly";
import SplineObj from "../components/SplineObj";
import CalendlyModal from "../components/CalendlyModal";

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
      <div className="w-3/4 h-full form-bg flex px-10 py-5 mx-15 my-10 gap-5 z-10 h-5/6 rounded">
        <form
          id="form"
          className="flex flex-col gap-5 rounded w-1/2 h-full justify-evenly"
        >
          <div className="text-7xl animated-heading bold">Contact Me</div>
          <div className="text-xl text-white gap-1 flex flex-col">
            <div className="flex gap-5 justify-start">
              {/* <img
                src="./images/bi_phone.png"
                alt="contact_phone"
                className="h-5 w-5"
              /> */}
              <div className="text-sm"> +91 7001967224</div>
            </div>
            <div className="flex gap-5 justify-start">
              {/* <img
                src="./images/mailVector.png"
                alt="contact_mail"
                className="h-3 w-4"
              /> */}
              <div className="text-sm"> bsuvraneel@gmail.com</div>
            </div>
          </div>
          <input
            type="text"
            className="w-full px-4 py-0.5 rounded"
            placeholder="Name*"
            required
          ></input>
          <input
            type="email"
            className="w-full px-4 py-0.5 rounded"
            placeholder="Email*"
            required
          ></input>
          <textarea
            className="w-full px-4 rounded outline-white"
            rows={5}
            cols={5}
            placeholder="Message"
          ></textarea>
          <button className="bg-black w-full rounded p-3" type="submit">
            Submit
          </button>
          <div className="flex w-full gap-5 items-center">
            <div className="bg-white w-1/2 h-0.5 hr"></div>
            <div className="text-white">OR</div>
            <div className="bg-white w-1/2 h-0.5 hr"></div>
          </div>
          <CalendlyModal />
        </form>
        <div className="w-1/2 h-full">
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
  );
};

export default Contact;
