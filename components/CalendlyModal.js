import React from "react";
import { InlineWidget } from "react-calendly";
import ReactDOM from "react-dom";

export default function CalendlyModal() {
  const portalDiv = document.getElementById("modal");
  return portalDiv ? ReactDOM.createPortal(portalContent(), portalDiv) : null;
}

function portalContent() {
  return (
    <div className="w-full absolute z-[1000]">
      <div className="justify-center w-full items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative h-full w-full mx-48 bg-transparent">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col h-full w-full bg-transparent outline-none focus:outline-none">
            <div className="relative h-full w-full flex flex-col justify-center items-center opacity-95">
              <InlineWidget url="https://calendly.com/suvraneel/meet" styles={{ display: 'flex', flexDirection: 'row', height:'100rem', width:'100rem'}}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
