import type { Metadata } from "next";
import "@styles/globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "About | Official Portfolio | Suvraneel",
  description:
    "About | Official Portfolio Website | Suvraneel Bhuin | Full Stack Web3.0 Developer | NextJS/TypeScript/React/Spring Boot/NodeJS",
  metadataBase: new URL("https://suvraneel.github.io/about"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="h-[100vh] w-full"
      style={{
        background: "radial-gradient(50% 50% at 40% 50%,#B338FF20 0,#000 100%)",
      }}
    >
      {children}
    </div>
  );
}
