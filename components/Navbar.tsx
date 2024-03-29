import {
  faChartPie,
  faCode,
  faCubes,
  faHouseChimney,
  faMusic,
  faPenFancy,
  faSignature,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";
import useSound from "use-sound";
import Equalizer from "./Equalizer";
import { FontAwesomeObj } from "./FontAwesomeObj";
import Socials from "./Socials";

const Navbar = () => {
  const menu = [
    { name: "Home", href: "/", icon: faHouseChimney },
    { name: "About", href: "/about", icon: faSignature },
    { name: "Skills", href: "/skills", icon: faCode },
    { name: "Work", href: "/work", icon: faChartPie },
    { name: "Projects", href: "/projects", icon: faCubes },
    { name: "Contact", href: "/contact", icon: faPenFancy },
  ];
  const bgMusicSfx = "./sounds/RoadsideFlowers.mp3";
  const [isShownHoverContent, setIsShownHoverContent] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playBGM, { stop: stopBGM }] = useSound(bgMusicSfx, { volume: 0.25 });
  return <>
    <div
      className="h-screen flex flex-col gap-3 absolute sidebar-container z-[4000] backdrop-blur-sm"
      onMouseEnter={() => setIsShownHoverContent(true)}
      onMouseLeave={() => setIsShownHoverContent(false)}
    >
      <button
        onClick={() => {
          isPlaying ? stopBGM() : playBGM();
          setIsPlaying(!isPlaying);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        id="music"
        aria-label="Music"
      >
        {isPlaying ? (
          isHovering ? (
            <FontAwesomeObj
              icon={faStop}
              brandColor="cyan"
              size="2x"
              className="sidebar-icon w-full flex items-center justify-center"
            />
          ) : (
            <Equalizer />
          )
        ) : (
          <FontAwesomeObj
            icon={faMusic}
            brandColor="cyan"
            size="2x"
            className="sidebar-icon w-full flex items-center justify-center"
          />
        )}
      </button>
      <div className="logo w-full h-36"></div>
      <div className="gap-0">
        {menu.map(item => {
          return (
            <div key={item.name} className="sidebar-item flex justify-start">
              <Link
                href={item.href}
                className="text-white flex flex-row gap-3 hover:text-cyan-300">
                <div className="flex justify-start">
                  <FontAwesomeObj
                    icon={item.icon}
                    brandColor="cyan"
                    title={item.name}
                    titleClassName="sidebar-title pl-2 font-semibold"
                    size="xs"
                    className="sidebar-icon"
                  />
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      {isShownHoverContent && <Socials />}
      <div className="fixed bottom-2 text-2xl pl-3 flex flex-row gap-2 items-center justify-between">
        &copy;
        {isShownHoverContent && (
          <div className="flex flex-col">
            <div className="text-xs">Suvraneel</div>
            <div className="text-xs flex gap-1 items-end justify-start align-baseline">Bhuin <div style={{ fontSize: "0.6rem" }}>2023</div></div>
          </div>
        )}
      </div>
    </div>
  </>;
};

export default Navbar;

