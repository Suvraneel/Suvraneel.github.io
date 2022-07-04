import Link from "next/link";
import React from "react";
import ThemeToggler from "./ThemeToggler";
export const Navbar = () => {
  const menu = ["About", "Skills", "Work", "Projects", "Contact"];
  return (
    <>
      <div className="nav-dark w-32 h-screen flex flex-col">
        <div className="logo w-32 h-32"></div>
        <br/>
        <ThemeToggler />
        <br/>
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
    </>
  );
};
