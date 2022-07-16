import Link from "next/link";
import React from "react";
import { SocialHandle } from "./SocialHandle";
import { Socials } from "./Socials";
import ThemeToggler from "./ThemeToggler";
import {
  faHouseChimney,
  faSignature,
  faChartPie,
  faPenFancy,
  faCubes,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
export const Navbar = () => {
  // const menu = ["About", "Skills", "Work", "Projects", "Contact"];
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
      <div className="h-screen flex flex-col gap-3 absolute nav-dark w-10 md:w-28 justify-items-center items-center">
        <div className="logo w-full h-36"></div>
        <ThemeToggler />
        <div className="gap-0">
          {menu.map((item, index) => {
            return (
              <div key={index} className="flex justify-start nav-link-dark">
                <Link href={item.href} target="_blank">
                  <a className="text-white flex flex-row gap-3 hover:text-cyan-300">
                    <SocialHandle icon={item.icon} brandColor="cyan" size="xs"/>
                    <div className="hidden md:block">{item.name}</div>
                  </a>
                </Link>
              </div>
            );
          })}
        </div>
        <Socials />
      </div>
    </>
  );
};
