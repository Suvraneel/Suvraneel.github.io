import Link from "next/link";
import React from "react";
import { Socials } from "./Socials";
import ThemeToggler from "./ThemeToggler";
export const Navbar = () => {
  const menu = ["About", "Skills", "Work", "Projects", "Contact"];
  return (
    <>
      <div className="nav nav-dark h-screen flex flex-col gap-3">
        <div className="logo w-full h-36"></div>
        <ThemeToggler />
        <div className="gap-0">
        {menu.map((item, index) => {
          return (
            <div key={index} className="flex justify-center nav-link-dark">
              <Link href={item} target="_blank">
                <a className="text-white">{item}</a>
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
