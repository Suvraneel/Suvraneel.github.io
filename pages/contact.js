import React, { useEffect } from "react";
import Script from "next/script";
import Head from "next/head";
import { Calendly } from "../components/Calendly";
import SplineObj from "../components/SplineObj";

const Contact = () => {
  useEffect(() => {
    setTimeout(() => {
      // Calendly();
      const CalendlyScript = document.createElement("script");
      CalendlyScript.async = true;
      CalendlyScript.src =
        "https://assets.calendly.com/assets/external/widget.js";
      document.body.appendChild(CalendlyScript);
    }, 3000);
  }, []);
  return (
    <div className="flex flex-row justify-center relative left-10 h-screen w-screen">
      <Head>
        <title>Portfolio</title>
      </Head>
      {/* <Script
        type="text/javascript"
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        async
      ></Script> */}
      <div className="h-full w-11/12 z-0">
        <SplineObj scene={"./spline/sceneMUSHROOM.splinecode"} />
      </div>
      <div className="w-3/4 h-full form-bg flex px-10 py-5 mx-15 my-10 gap-5 z-10 absolute left-48 top-0 h-5/6">
        <form className="flex flex-col gap-5 rounded w-1/2">
          <div className="text-3xl">Contact Me</div>
          <div className="text-xl gap-1 flex flex-col">
            <div className="flex gap-5 justify-start">
              <img
                src="./images/bi_phone.png"
                alt="contact_phone"
                className="h-5 w-5"
              />
              <div className="text-sm"> +91 7001967224</div>
            </div>
            <div className="flex gap-5 justify-start">
              <img
                src="./images/mailVector.png"
                alt="contact_mail"
                className="h-3 w-4"
              />
              <div className="text-sm"> bsuvraneel@gmail.com</div>
            </div>
          </div>
          <input
            type="text"
            className="w-full px-4 rounded"
            placeholder="Name*"
            required
          ></input>
          <input
            type="email"
            className="w-full px-4 rounded outline-white"
            placeholder="Email*"
            required
          ></input>
          <textarea
            className="w-full px-4 rounded outline-white"
            rows={5}
            cols={5}
            placeholder="Message"
          ></textarea>
          <button className="" type="submit">
            Submit
          </button>
        </form>
        <div
          className="calendly-inline-widget w-1/2 h-full opacity-90"
          data-url="https://calendly.com/suvraneel/meet"
        ></div>
      </div>

      {/* <div
        className="col-md-7 d-print-none"
        data-aos="zoom-in"
        data-aos-delay="100"
      >
        <iframe
          id="map"
          scrolling="no"
          src="https://maps.google.com/maps?width=100%25&amp;height=400&amp;hl=en&amp;q=Prabhuram%20Sarkar%20Lane,%20Kolkata,%20India+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
          width="500"
          height="400"
          loading="lazy"
        >
          <a href="https://www.gps.ie/car-satnav-gps/">car gps</a>
        </iframe>
      </div> */}
    </div>
  );
};

export default Contact;
