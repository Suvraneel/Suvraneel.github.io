import React from "react";
import { InlineWidget } from "react-calendly";

export default function CalendlyModal() {
  const [showModal, setShowModal] = React.useState(false);
  return (
    <div>
      <a href="#" className="animated-button1 p-2 w-full hover:text-cyan-400 text-xs md:text-md" onClick={() => setShowModal(true)}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        Schedule a Meet with me...
      </a>
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-1/2 my-6 mx-auto max-w-3xl bg-black">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-black outline-none focus:outline-none">
                <div className="relative w-full flex flex-col">
                  <div className="w-full flex flex-col items-end bg-transparent">
                    <button
                      className="p-5 bg-transparent h-fit"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                  <InlineWidget url="https://calendly.com/suvraneel/meet" />
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </div>
  );
}
