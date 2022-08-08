import React, { useState } from "react";
import Image from "next/image";
export default function ChronoCard({ curElem }) {
  const [isShown, setIsShown] = useState(false);
  return (
    <div className="flex md:contents">
      <div className="col-start-2 col-end-3 md:mx-auto relative">
        <div className="h-full w-6 flex items-center justify-center">
          <div className="h-full w-1 bg-white pointer-events-none" />
        </div>
        <div
          className={
            "w-6 h-6 absolute top-1/2 -mt-3 border-4 rounded-full bg-slate-700 shadow text-center " +
            (isShown ? "animate-ping" : "")
          }
          onMouseEnter={() => setIsShown(true)}
          onMouseLeave={() => setIsShown(false)}
        />
      </div>
      <div className="col-start-3 col-end-4 md:mx-auto flex justify-center items-center">
        <Image
          src={"/images/work-assets/" + curElem.image}
          alt={curElem.company + "Logo"}
          width={isShown?100:80}
          height={isShown?100:80}
          onMouseEnter={() => setIsShown(true)}
          onMouseLeave={() => setIsShown(false)}
        />
      </div>
      <div
        className={
          "border-4 text-white dark:text-white col-start-4 col-end-12 p-4 rounded-xl my-4 ml-8 mr-auto w-full px-8 " +
          (isShown ? "bg-cyan-900" : "")
        }
        onMouseEnter={() => setIsShown(true)}
        onMouseLeave={() => setIsShown(false)}
      >
        <div className="text-lg w-full">{curElem.role}</div>
        <div className="text-lg w-full">{curElem.company}</div>
        <div className="font-bold text-md mb-1">{curElem.duration}</div>
        <div className="text-sm w-full">
          <ul className="list-disc">
            {curElem.details.split("|").map((details) => (
              <li key={details}>{details}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
