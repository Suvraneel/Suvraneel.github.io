import Link from "next/link";
import React from "react";
import { Socials } from "./Socials";
import ThemeToggler from "./ThemeToggler";
export const Navbar = () => {
  // const menu = ["About", "Skills", "Work", "Projects", "Contact"];
  const menu = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Skills", href: "/skills" },
    { name: "Work", href: "/work" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
  ];
  return (
    <>
      <div className="h-screen flex flex-col gap-3 absolute nav nav-dark">
        <div className="logo w-full h-36"></div>
        <ThemeToggler />
        <div className="gap-0">
          {menu.map((item, index) => {
            return (
              <div key={index} className="flex justify-center nav-link-dark">
                <Link href={item.href} target="_blank">
                  <a className="text-white">{item.name}</a>
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
