import {
  faChartPie,
  faCode,
  faCubes,
  faHouseChimney,
  faPenFancy,
  faSignature,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { FontAwesomeObj } from "../FontAwesomeObj";
import Socials from "../Socials";
import MusicToggler from "@components/MusicToggler";

const Navbar = () => {
  const menu = [
    { name: "Home", href: "/", icon: faHouseChimney },
    { name: "About", href: "/about", icon: faSignature },
    { name: "Skills", href: "/skills", icon: faCode },
    { name: "Work", href: "/work", icon: faChartPie },
    { name: "Projects", href: "/projects", icon: faCubes },
    { name: "Contact", href: "/contact", icon: faPenFancy },
  ];
  return (
    <>
      <div className="h-full w-[50px] hover:w-[140px] group fixed hidden sm:flex flex-col gap-3 z-[4000] transition-all duration-600 backdrop-blur-md bg-gray-900 bg-opacity-25 shadow-xl shadow-black">
        <MusicToggler />
        <div className="logo w-full h-36"></div>
        <div className="gap-0">
          {menu.map((item) => {
            return (
              <div
                key={item.name}
                className="group-hover:flex justify-start p-[12px] overflow-clip"
              >
                <Link
                  href={item.href}
                  className="text-white flex flex-row gap-3 hover:text-cyan-300"
                >
                  <div className="flex justify-start">
                    <FontAwesomeObj
                      icon={item.icon}
                      brandColor="cyan"
                      title={item.name}
                      titleClassName="pl-2 font-semibold"
                      size="1x"
                      iconClassName="w-5 h-5"
                    />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        <div className="hidden group-hover:flex w-full justify-evenly">
          <Socials />
        </div>
        <div className="fixed bottom-2 text-xl pl-3 flex flex-row gap-2 items-center justify-between">
          &copy;
          <div className="hidden group-hover:flex flex-col">
            <div className="text-xs">Suvraneel</div>
            <div className="text-xs flex gap-1 items-end justify-start align-baseline">
              Bhuin <div className="text-xs">2024</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
