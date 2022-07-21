import React, { useState } from "react";
export default function ChronoCard({ curElem }) {
  const [isShown, setIsShown] = useState(false);
  return (
    <div className="flex md:contents">
      <div className="col-start-1 col-end-4 md:mx-auto relative">
        <div className="h-full w-6 flex items-center justify-center">
          <div className="h-full w-1 bg-white pointer-events-none" />
        </div>
        <div
          className={"w-6 h-6 absolute top-1/2 -mt-3 border-4 rounded-full bg-slate-700 shadow text-center "+(isShown ? "animate-ping" : "")}
          onMouseEnter={() => setIsShown(true)}
          onMouseLeave={() => setIsShown(false)}
        />
      </div>
      <div
        className={"border-4 text-white dark:text-white col-start-4 col-end-12 p-4 rounded-xl my-4 mr-auto w-full "+(isShown?"bg-cyan-900":"")}
        onMouseEnter={() => setIsShown(true)}
        onMouseLeave={() => setIsShown(false)}
      >
        <h3 className="font-bold text-xl mb-1">{curElem.duration}</h3>
        <p className="text-lg w-full">{curElem.event}</p>
      </div>
    </div>
  );
}
