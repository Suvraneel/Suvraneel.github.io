import {
  faChartPie,
  faCode,
  faCubes,
  faHouseChimney,
  faPenFancy,
  faSignature,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";
import { FontAwesomeObj } from "./FontAwesomeObj";
import { Socials } from "./Socials";
import ThemeToggler from "./ThemeToggler";
export const Navbar = () => {
  const menu = [
    { name: "Home", href: "/", icon: faHouseChimney },
    { name: "About", href: "/about", icon: faSignature },
    { name: "Skills", href: "/skills", icon: faCode },
    { name: "Work", href: "/work", icon: faChartPie },
    { name: "Projects", href: "/projects", icon: faCubes },
    { name: "Contact", href: "/contact", icon: faPenFancy },
  ];
  const [isShownHoverContent, setIsShownHoverContent] = useState(false);
  return (
    <>
      <div
        className="h-screen flex flex-col gap-3 absolute sidebar-container z-[4000] backdrop-blur-sm"
        onMouseEnter={() => setIsShownHoverContent(true)}
        onMouseLeave={() => setIsShownHoverContent(false)}
      >
        <div className="logo w-full h-36"></div>
        {/* <ThemeToggler /> */}
        <div className="gap-0">
          {menu.map((item, index) => {
            return (
              <div key={index} className="sidebar-item flex justify-start">
                <Link href={item.href} target="_blank">
                  <a className="text-white flex flex-row gap-3 hover:text-cyan-300">
                    <div className="flex justify-start">
                      <FontAwesomeObj
                        icon={item.icon}
                        brandColor="cyan"
                        title={item.name}
                        titleClassName="sidebar-title pl-2"
                        size="xs"
                        className="sidebar-icon"
                      />
                    </div>
                  </a>
                </Link>
              </div>
            );
          })}
        </div>
        {isShownHoverContent && <Socials />}
        <div className="fixed bottom-2 text-2xl pl-3 flex flex-row gap-3 items-center justify-between">
          &copy;
          {isShownHoverContent && (
            <div className="flex flex-col">
              <div className="text-xs">Suvraneel</div>
              <div className="text-xs">Bhuin</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
