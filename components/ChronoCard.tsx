/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import useSound from "use-sound";
const ChronoCard = ({ curElem }) => {
  const [isShown, setIsShown] = useState<boolean>(false);
  const popSfx = "./sounds/pop.wav";
  const [playPop, { stop: stopPop }] = useSound(popSfx, { volume: 0.25 });

  return (
    <div
      className="flex md:contents"
      onMouseEnter={() => {
        setIsShown(true);
        playPop();
      }}
      onMouseLeave={() => {
        setIsShown(false);
        stopPop();
      }}
    >
      <div className="hidden sm:block col-start-2 col-end-3 md:mx-auto relative">
        <div className="h-full w-6 flex items-center justify-center">
          <div className="h-full w-1 bg-white pointer-events-none" />
        </div>
        <div
          className={
            "w-6 h-6 hidden sm:block absolute top-1/2 -mt-3 border-4 rounded-full bg-slate-700 shadow text-center " +
            (isShown ? "animate-ping" : "")
          }
        />
      </div>
      <div className="hidden sm:flex col-start-3 col-end-4 md:mx-auto justify-center items-center jello-horizontal">
        <img
          src={"/images/work-assets/" + curElem.image}
          alt={curElem.company + "Logo"}
          width={isShown ? 100 : 80}
          height={isShown ? 100 : 80}
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </div>
      <div
        className={
          "border-2 backdrop-blur-xl backdrop-contrast-100 text-white dark:text-white col-start-4 col-end-12 p-4 rounded-xl my-4 sm:ml-8 mr-auto w-full px-8 " +
          (isShown
            ? "border-cyan-400 backdrop-hue-rotate-15 backdrop-contrast-125 shadow-2xl  shadow-cyan-500/60"
            : "border-white")
        }
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

export default ChronoCard
